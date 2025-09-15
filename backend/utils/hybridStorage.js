const { r2Client } = require('../config/r2');
const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { generateUniqueFileName } = require('../middleware/upload');

// Storage configuration
const STORAGE_CONFIG = {
    // File size thresholds (in bytes) - can be overridden by environment variables
    MONGODB_MAX_SIZE: parseInt(process.env.MONGODB_MAX_SIZE) || 5 * 1024 * 1024, // 5MB - store in MongoDB
    R2_MIN_SIZE: parseInt(process.env.R2_MIN_SIZE) || 1 * 1024 * 1024, // 1MB - store in R2 for files larger than this

    // File types that should always go to R2 regardless of size
    R2_PRIORITY_TYPES: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed'
    ],

    // File types that can stay in MongoDB (light files)
    MONGODB_TYPES: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'text/plain',
        'text/csv',
        'application/json'
    ]
};

/**
 * Determine storage strategy for a file
 * @param {Object} file - File object with mimetype and size
 * @returns {Object} - Storage strategy with type and metadata
 */
const determineStorageStrategy = (file) => {
    const { mimetype, size } = file;

    // Always use R2 for priority file types
    if (STORAGE_CONFIG.R2_PRIORITY_TYPES.includes(mimetype)) {
        return {
            type: 'r2',
            reason: 'priority_type',
            maxSize: null // No size limit for R2
        };
    }

    // Use R2 for large files
    if (size > STORAGE_CONFIG.R2_MIN_SIZE) {
        return {
            type: 'r2',
            reason: 'large_file',
            maxSize: null
        };
    }

    // Use MongoDB for light files
    if (STORAGE_CONFIG.MONGODB_TYPES.includes(mimetype) && size <= STORAGE_CONFIG.MONGODB_MAX_SIZE) {
        return {
            type: 'mongodb',
            reason: 'light_file',
            maxSize: STORAGE_CONFIG.MONGODB_MAX_SIZE
        };
    }

    // Default to R2 for unknown types or edge cases
    return {
        type: 'r2',
        reason: 'default',
        maxSize: null
    };
};

/**
 * Upload file to R2
 * @param {Object} file - File object
 * @param {Object} metadata - Additional metadata
 * @returns {Object} - Upload result with URL and file info
 */
const uploadToR2 = async (file, metadata = {}) => {
    try {
        const { originalname, mimetype, buffer, size } = file;
        const fileName = generateUniqueFileName(originalname);

        const uploadCommand = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: mimetype,
            Metadata: {
                originalName: originalname,
                uploadedBy: metadata.uploadedBy || 'anonymous',
                category: metadata.category || 'document',
                storageType: 'r2',
                ...metadata
            }
        });

        await r2Client.send(uploadCommand);

        // Generate file URL
        const fileUrl = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET_NAME}/${fileName}`;

        return {
            success: true,
            fileName,
            fileUrl,
            storageType: 'r2',
            size,
            mimeType: mimetype
        };
    } catch (error) {
        console.error('R2 upload error:', error);
        throw new Error(`Failed to upload to R2: ${error.message}`);
    }
};

/**
 * Upload file to MongoDB (as base64)
 * @param {Object} file - File object
 * @param {Object} metadata - Additional metadata
 * @returns {Object} - Upload result with URL and file info
 */
const uploadToMongoDB = async (file, metadata = {}) => {
    try {
        const { originalname, mimetype, buffer, size } = file;
        const fileName = generateUniqueFileName(originalname);

        // Convert buffer to base64
        const base64Data = buffer.toString('base64');
        const dataUrl = `data:${mimetype};base64,${base64Data}`;

        return {
            success: true,
            fileName,
            fileUrl: dataUrl,
            storageType: 'mongodb',
            size,
            mimeType: mimetype,
            base64Data // Include for direct storage in MongoDB
        };
    } catch (error) {
        console.error('MongoDB upload error:', error);
        throw new Error(`Failed to upload to MongoDB: ${error.message}`);
    }
};

/**
 * Main upload function that chooses storage strategy
 * @param {Object} file - File object
 * @param {Object} metadata - Additional metadata
 * @returns {Object} - Upload result
 */
const uploadFile = async (file, metadata = {}) => {
    const strategy = determineStorageStrategy(file);

    console.log(`Storage strategy for ${file.originalname}: ${strategy.type} (${strategy.reason})`);

    if (strategy.type === 'r2') {
        return await uploadToR2(file, metadata);
    } else {
        return await uploadToMongoDB(file, metadata);
    }
};

/**
 * Generate signed URL for R2 files
 * @param {String} fileName - File name in R2
 * @param {Number} expiresIn - Expiration time in seconds (default: 3600)
 * @returns {String} - Signed URL
 */
const generateSignedUrl = async (fileName, expiresIn = 3600) => {
    try {
        const getObjectCommand = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName
        });

        return await getSignedUrl(r2Client, getObjectCommand, { expiresIn });
    } catch (error) {
        console.error('Error generating signed URL:', error);
        throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
};

/**
 * Delete file from R2
 * @param {String} fileName - File name in R2
 * @returns {Boolean} - Success status
 */
const deleteFromR2 = async (fileName) => {
    try {
        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName
        });

        await r2Client.send(deleteCommand);
        return true;
    } catch (error) {
        console.error('Error deleting from R2:', error);
        return false;
    }
};

/**
 * Get file download URL (handles both storage types)
 * @param {Object} fileRecord - File record from database
 * @param {Boolean} isPublic - Whether file is public
 * @returns {String} - Download URL
 */
const getDownloadUrl = async (fileRecord, isPublic = false) => {
    if (fileRecord.storageType === 'r2') {
        if (isPublic) {
            return fileRecord.fileUrl;
        } else {
            return await generateSignedUrl(fileRecord.fileName);
        }
    } else {
        // MongoDB stored files are always accessible via data URL
        return fileRecord.fileUrl;
    }
};

/**
 * Delete file from appropriate storage
 * @param {Object} fileRecord - File record from database
 * @returns {Boolean} - Success status
 */
const deleteFile = async (fileRecord) => {
    if (fileRecord.storageType === 'r2') {
        return await deleteFromR2(fileRecord.fileName);
    } else {
        // MongoDB files are deleted by removing the record
        return true;
    }
};

/**
 * Get storage statistics
 * @param {Object} fileRecords - Array of file records
 * @returns {Object} - Storage statistics
 */
const getStorageStats = (fileRecords) => {
    const stats = {
        totalFiles: fileRecords.length,
        mongodbFiles: 0,
        r2Files: 0,
        mongodbSize: 0,
        r2Size: 0,
        totalSize: 0
    };

    fileRecords.forEach(file => {
        if (file.storageType === 'mongodb') {
            stats.mongodbFiles++;
            stats.mongodbSize += file.fileSize || 0;
        } else if (file.storageType === 'r2') {
            stats.r2Files++;
            stats.r2Size += file.fileSize || 0;
        }
        stats.totalSize += file.fileSize || 0;
    });

    return stats;
};

module.exports = {
    determineStorageStrategy,
    uploadFile,
    uploadToR2,
    uploadToMongoDB,
    generateSignedUrl,
    deleteFromR2,
    getDownloadUrl,
    deleteFile,
    getStorageStats,
    STORAGE_CONFIG
};
