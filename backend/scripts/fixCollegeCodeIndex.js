const mongoose = require('mongoose');
require('dotenv').config();

// Import the College model
const College = require('../models/College');

const fixCollegeCodeIndex = async () => {
    try {
        console.log('🔧 Starting College code index fix...');

        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swagat_odisha';
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // Get the collection
        const collection = College.collection;
        
        // Get existing indexes
        const existingIndexes = await collection.indexes();
        console.log('📋 Existing indexes:', existingIndexes.map(idx => ({
            name: idx.name,
            key: idx.key,
            unique: idx.unique,
            sparse: idx.sparse
        })));

        // Check if code_1 index exists
        const codeIndex = existingIndexes.find(idx => idx.name === 'code_1' || (idx.key && idx.key.code === 1));
        
        if (codeIndex) {
            console.log('🔍 Found existing code index:', {
                name: codeIndex.name,
                unique: codeIndex.unique,
                sparse: codeIndex.sparse
            });

            // If it's not sparse or not unique, we need to drop and recreate
            if (!codeIndex.sparse || !codeIndex.unique) {
                console.log('⚠️ Existing index is not sparse/unique. Dropping and recreating...');
                
                // Drop the existing index
                try {
                    await collection.dropIndex(codeIndex.name);
                    console.log(`✅ Dropped index: ${codeIndex.name}`);
                } catch (dropError) {
                    console.log(`⚠️ Error dropping index (may not exist): ${dropError.message}`);
                }

                // Create new sparse unique index
                await collection.createIndex({ code: 1 }, { unique: true, sparse: true, name: 'code_1' });
                console.log('✅ Created new sparse unique index on code field');
            } else {
                console.log('✅ Index is already correctly configured (unique and sparse)');
            }
        } else {
            console.log('📝 No existing code index found. Creating new sparse unique index...');
            // Create new sparse unique index
            await collection.createIndex({ code: 1 }, { unique: true, sparse: true, name: 'code_1' });
            console.log('✅ Created new sparse unique index on code field');
        }

        // Verify the index
        const finalIndexes = await collection.indexes();
        const finalCodeIndex = finalIndexes.find(idx => idx.name === 'code_1' || (idx.key && idx.key.code === 1));
        if (finalCodeIndex) {
            console.log('✅ Verified index:', {
                name: finalCodeIndex.name,
                unique: finalCodeIndex.unique,
                sparse: finalCodeIndex.sparse
            });
        }

        console.log('✅ College code index fix completed successfully');
        
    } catch (error) {
        console.error('❌ Error fixing College code index:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('📴 MongoDB connection closed');
    }
};

// Run the migration
if (require.main === module) {
    fixCollegeCodeIndex()
        .then(() => {
            console.log('🎉 Migration completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Migration failed:', error);
            process.exit(1);
        });
}

module.exports = fixCollegeCodeIndex;

