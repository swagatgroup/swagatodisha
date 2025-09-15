const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const File = require('../models/File');
const Document = require('../models/Document');
const { uploadToR2, uploadToMongoDB, determineStorageStrategy } = require('../utils/hybridStorage');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected for migration');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

// Migration configuration
const MIGRATION_CONFIG = {
    dryRun: true, // Set to false to actually perform migration
    batchSize: 10, // Process files in batches
    maxFileSize: 50 * 1024 * 1024, // 50MB max file size for migration
    skipExisting: true, // Skip files that already have storageType
};

/**
 * Migrate files to hybrid storage
 */
const migrateFiles = async () => {
    console.log('🔄 Starting file migration to hybrid storage...');

    try {
        // Find files without storageType (legacy files)
        const query = MIGRATION_CONFIG.skipExisting
            ? { storageType: { $exists: false } }
            : {};

        const totalFiles = await File.countDocuments(query);
        console.log(`📊 Found ${totalFiles} files to migrate`);

        if (totalFiles === 0) {
            console.log('✅ No files need migration');
            return;
        }

        let processed = 0;
        let migrated = 0;
        let errors = 0;
        const errorsList = [];

        // Process files in batches
        for (let skip = 0; skip < totalFiles; skip += MIGRATION_CONFIG.batchSize) {
            const files = await File.find(query)
                .skip(skip)
                .limit(MIGRATION_CONFIG.batchSize);

            console.log(`📦 Processing batch ${Math.floor(skip / MIGRATION_CONFIG.batchSize) + 1}/${Math.ceil(totalFiles / MIGRATION_CONFIG.batchSize)}`);

            for (const file of files) {
                try {
                    processed++;

                    // Determine storage strategy
                    const strategy = determineStorageStrategy({
                        mimetype: file.mimeType,
                        size: file.fileSize
                    });

                    console.log(`📄 File ${processed}/${totalFiles}: ${file.originalName} -> ${strategy.type} (${strategy.reason})`);

                    if (MIGRATION_CONFIG.dryRun) {
                        console.log(`   [DRY RUN] Would migrate to ${strategy.type}`);
                        continue;
                    }

                    // Skip if file is too large
                    if (file.fileSize > MIGRATION_CONFIG.maxFileSize) {
                        console.log(`   ⚠️  Skipping large file: ${file.fileSize} bytes`);
                        continue;
                    }

                    // For R2 migration, we need to download the file first
                    if (strategy.type === 'r2') {
                        // Check if file exists locally or can be downloaded
                        const localPath = path.join(__dirname, '../uploads', file.fileName);

                        if (fs.existsSync(localPath)) {
                            const fileBuffer = fs.readFileSync(localPath);
                            const fileObj = {
                                originalname: file.originalName,
                                mimetype: file.mimeType,
                                size: file.fileSize,
                                buffer: fileBuffer
                            };

                            const uploadResult = await uploadToR2(fileObj, {
                                uploadedBy: file.uploadedBy,
                                category: 'migrated'
                            });

                            // Update file record
                            file.storageType = 'r2';
                            file.fileName = uploadResult.fileName;
                            file.fileUrl = uploadResult.fileUrl;
                            await file.save();

                            // Clean up local file
                            fs.unlinkSync(localPath);

                            migrated++;
                            console.log(`   ✅ Migrated to R2: ${uploadResult.fileName}`);
                        } else {
                            console.log(`   ⚠️  Local file not found: ${localPath}`);
                            errors++;
                            errorsList.push({
                                fileId: file._id,
                                fileName: file.originalName,
                                error: 'Local file not found'
                            });
                        }
                    } else {
                        // For MongoDB migration, convert existing URL to base64 if needed
                        if (file.fileUrl.startsWith('data:')) {
                            // Already in base64 format
                            file.storageType = 'mongodb';
                            await file.save();
                            migrated++;
                            console.log(`   ✅ Already in MongoDB format`);
                        } else {
                            console.log(`   ⚠️  Cannot convert to MongoDB format without file data`);
                            errors++;
                            errorsList.push({
                                fileId: file._id,
                                fileName: file.originalName,
                                error: 'Cannot convert to MongoDB format'
                            });
                        }
                    }

                } catch (error) {
                    errors++;
                    errorsList.push({
                        fileId: file._id,
                        fileName: file.originalName,
                        error: error.message
                    });
                    console.error(`   ❌ Error migrating file ${file.originalName}:`, error.message);
                }
            }
        }

        console.log('\n📊 Migration Summary:');
        console.log(`   Total files: ${totalFiles}`);
        console.log(`   Processed: ${processed}`);
        console.log(`   Migrated: ${migrated}`);
        console.log(`   Errors: ${errors}`);

        if (errorsList.length > 0) {
            console.log('\n❌ Errors:');
            errorsList.forEach(error => {
                console.log(`   - ${error.fileName}: ${error.error}`);
            });
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
};

/**
 * Migrate documents to hybrid storage
 */
const migrateDocuments = async () => {
    console.log('🔄 Starting document migration to hybrid storage...');

    try {
        // Find documents without storageType (legacy documents)
        const query = MIGRATION_CONFIG.skipExisting
            ? { storageType: { $exists: false } }
            : {};

        const totalDocuments = await Document.countDocuments(query);
        console.log(`📊 Found ${totalDocuments} documents to migrate`);

        if (totalDocuments === 0) {
            console.log('✅ No documents need migration');
            return;
        }

        let processed = 0;
        let migrated = 0;
        let errors = 0;
        const errorsList = [];

        // Process documents in batches
        for (let skip = 0; skip < totalDocuments; skip += MIGRATION_CONFIG.batchSize) {
            const documents = await Document.find(query)
                .skip(skip)
                .limit(MIGRATION_CONFIG.batchSize);

            console.log(`📦 Processing batch ${Math.floor(skip / MIGRATION_CONFIG.batchSize) + 1}/${Math.ceil(totalDocuments / MIGRATION_CONFIG.batchSize)}`);

            for (const document of documents) {
                try {
                    processed++;

                    // Determine storage strategy
                    const strategy = determineStorageStrategy({
                        mimetype: document.mimeType,
                        size: document.fileSize
                    });

                    console.log(`📄 Document ${processed}/${totalDocuments}: ${document.originalName} -> ${strategy.type} (${strategy.reason})`);

                    if (MIGRATION_CONFIG.dryRun) {
                        console.log(`   [DRY RUN] Would migrate to ${strategy.type}`);
                        continue;
                    }

                    // Skip if file is too large
                    if (document.fileSize > MIGRATION_CONFIG.maxFileSize) {
                        console.log(`   ⚠️  Skipping large document: ${document.fileSize} bytes`);
                        continue;
                    }

                    // For R2 migration, we need to download the file first
                    if (strategy.type === 'r2') {
                        // Check if document exists locally or can be downloaded
                        const localPath = path.join(__dirname, '../uploads/documents', document.fileName);

                        if (fs.existsSync(localPath)) {
                            const fileBuffer = fs.readFileSync(localPath);
                            const fileObj = {
                                originalname: document.originalName,
                                mimetype: document.mimeType,
                                size: document.fileSize,
                                buffer: fileBuffer
                            };

                            const uploadResult = await uploadToR2(fileObj, {
                                uploadedBy: document.uploadedBy,
                                category: 'document',
                                documentType: document.documentType
                            });

                            // Update document record
                            document.storageType = 'r2';
                            document.fileName = uploadResult.fileName;
                            document.fileUrl = uploadResult.fileUrl;
                            await document.save();

                            // Clean up local file
                            fs.unlinkSync(localPath);

                            migrated++;
                            console.log(`   ✅ Migrated to R2: ${uploadResult.fileName}`);
                        } else {
                            console.log(`   ⚠️  Local document not found: ${localPath}`);
                            errors++;
                            errorsList.push({
                                documentId: document._id,
                                fileName: document.originalName,
                                error: 'Local document not found'
                            });
                        }
                    } else {
                        // For MongoDB migration, convert existing URL to base64 if needed
                        if (document.fileUrl.startsWith('data:')) {
                            // Already in base64 format
                            document.storageType = 'mongodb';
                            await document.save();
                            migrated++;
                            console.log(`   ✅ Already in MongoDB format`);
                        } else {
                            console.log(`   ⚠️  Cannot convert to MongoDB format without file data`);
                            errors++;
                            errorsList.push({
                                documentId: document._id,
                                fileName: document.originalName,
                                error: 'Cannot convert to MongoDB format'
                            });
                        }
                    }

                } catch (error) {
                    errors++;
                    errorsList.push({
                        documentId: document._id,
                        fileName: document.originalName,
                        error: error.message
                    });
                    console.error(`   ❌ Error migrating document ${document.originalName}:`, error.message);
                }
            }
        }

        console.log('\n📊 Document Migration Summary:');
        console.log(`   Total documents: ${totalDocuments}`);
        console.log(`   Processed: ${processed}`);
        console.log(`   Migrated: ${migrated}`);
        console.log(`   Errors: ${errors}`);

        if (errorsList.length > 0) {
            console.log('\n❌ Errors:');
            errorsList.forEach(error => {
                console.log(`   - ${error.fileName}: ${error.error}`);
            });
        }

    } catch (error) {
        console.error('❌ Document migration failed:', error);
    }
};

/**
 * Get migration statistics
 */
const getMigrationStats = async () => {
    console.log('📊 Migration Statistics:');

    try {
        // File statistics
        const fileStats = await File.aggregate([
            {
                $group: {
                    _id: '$storageType',
                    count: { $sum: 1 },
                    totalSize: { $sum: '$fileSize' }
                }
            }
        ]);

        console.log('\n📁 Files:');
        fileStats.forEach(stat => {
            const storageType = stat._id || 'legacy';
            const sizeInMB = (stat.totalSize / (1024 * 1024)).toFixed(2);
            console.log(`   ${storageType}: ${stat.count} files (${sizeInMB} MB)`);
        });

        // Document statistics
        const documentStats = await Document.aggregate([
            {
                $group: {
                    _id: '$storageType',
                    count: { $sum: 1 },
                    totalSize: { $sum: '$fileSize' }
                }
            }
        ]);

        console.log('\n📄 Documents:');
        documentStats.forEach(stat => {
            const storageType = stat._id || 'legacy';
            const sizeInMB = (stat.totalSize / (1024 * 1024)).toFixed(2);
            console.log(`   ${storageType}: ${stat.count} documents (${sizeInMB} MB)`);
        });

    } catch (error) {
        console.error('❌ Error getting migration stats:', error);
    }
};

/**
 * Main migration function
 */
const runMigration = async () => {
    console.log('🚀 Starting Hybrid Storage Migration');
    console.log(`Mode: ${MIGRATION_CONFIG.dryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`);
    console.log(`Batch size: ${MIGRATION_CONFIG.batchSize}`);
    console.log(`Skip existing: ${MIGRATION_CONFIG.skipExisting}`);
    console.log('');

    await connectDB();

    // Show current stats
    await getMigrationStats();

    // Run migrations
    await migrateFiles();
    await migrateDocuments();

    // Show final stats
    console.log('\n📊 Final Statistics:');
    await getMigrationStats();

    console.log('\n✅ Migration completed');
    process.exit(0);
};

// Handle command line arguments
if (process.argv.includes('--live')) {
    MIGRATION_CONFIG.dryRun = false;
    console.log('⚠️  LIVE MIGRATION MODE ENABLED');
}

if (process.argv.includes('--stats-only')) {
    connectDB().then(() => {
        getMigrationStats().then(() => process.exit(0));
    });
} else {
    runMigration();
}

module.exports = {
    migrateFiles,
    migrateDocuments,
    getMigrationStats,
    MIGRATION_CONFIG
};
