const File = require('../models/File');
const cloudinary = require('cloudinary').v2;
const { generateUniqueFileName, getFileCategory } = require('../middleware/upload');
const { asyncHandler } = require('../middleware/errorHandler');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Upload single file
// @route   POST /api/files/upload
// @access  Public
const uploadSingleFile = asyncHandler(async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file provided',
                error: 'NO_FILE'
            });
        }

        const { originalname, buffer, mimetype, size } = req.file;
        const category = getFileCategory(mimetype);
        const uniqueFileName = generateUniqueFileName(originalname);

        // Upload to Cloudinary
        const cloudinaryResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    public_id: `swagat-odisha/${category}/${uniqueFileName}`,
                    folder: 'swagat-odisha',
                    use_filename: true,
                    unique_filename: true,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        // Save file metadata to MongoDB
        const fileData = {
            originalName: originalname,
            fileName: uniqueFileName,
            filePath: cloudinaryResult.secure_url,
            fileSize: size,
            mimeType: mimetype,
            category: category,
            storageType: 'cloudinary',
            cloudinaryPublicId: cloudinaryResult.public_id,
            uploadedBy: req.user?._id || null,
            metadata: {
                cloudinaryId: cloudinaryResult.public_id,
                cloudinaryUrl: cloudinaryResult.secure_url,
                cloudinaryVersion: cloudinaryResult.version,
                cloudinaryFormat: cloudinaryResult.format,
                cloudinaryWidth: cloudinaryResult.width,
                cloudinaryHeight: cloudinaryResult.height,
            }
        };

        const file = new File(fileData);
        await file.save();

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                fileId: file._id,
                fileName: file.fileName,
                originalName: file.originalName,
                filePath: file.filePath,
                fileSize: file.fileSize,
                mimeType: file.mimeType,
                category: file.category,
                storageType: file.storageType,
                uploadedAt: file.uploadedAt,
                downloadUrl: file.filePath, // Cloudinary URLs are already public
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'File upload failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Upload multiple files
// @route   POST /api/files/upload-multiple
// @access  Public
const uploadMultipleFiles = asyncHandler(async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files provided',
                error: 'NO_FILES'
            });
        }

        const uploadPromises = req.files.map(async (uploadedFile) => {
            const { originalname, buffer, mimetype, size } = uploadedFile;
            const category = getFileCategory(mimetype);
            const uniqueFileName = generateUniqueFileName(originalname);

            // Upload to Cloudinary
            const cloudinaryResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'auto',
                        public_id: `swagat-odisha/${category}/${uniqueFileName}`,
                        folder: 'swagat-odisha',
                        use_filename: true,
                        unique_filename: true,
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer);
            });

            // Save file metadata to MongoDB
            const fileData = {
                originalName: originalname,
                fileName: uniqueFileName,
                filePath: cloudinaryResult.secure_url,
                fileSize: size,
                mimeType: mimetype,
                category: category,
                storageType: 'cloudinary',
                cloudinaryPublicId: cloudinaryResult.public_id,
                uploadedBy: req.user?._id || null,
                metadata: {
                    cloudinaryId: cloudinaryResult.public_id,
                    cloudinaryUrl: cloudinaryResult.secure_url,
                    cloudinaryVersion: cloudinaryResult.version,
                    cloudinaryFormat: cloudinaryResult.format,
                    cloudinaryWidth: cloudinaryResult.width,
                    cloudinaryHeight: cloudinaryResult.height,
                }
            };

            const fileRecord = new File(fileData);
            await fileRecord.save();
            return fileRecord;
        });

        const uploadedFiles = await Promise.all(uploadPromises);

        res.status(201).json({
            success: true,
            message: `${uploadedFiles.length} files uploaded successfully`,
            data: uploadedFiles.map(file => ({
                fileId: file._id,
                fileName: file.fileName,
                originalName: file.originalName,
                filePath: file.filePath,
                fileSize: file.fileSize,
                mimeType: file.mimeType,
                category: file.category,
                storageType: file.storageType,
                uploadedAt: file.uploadedAt,
                downloadUrl: file.filePath,
            }))
        });

    } catch (error) {
        console.error('Multiple upload error:', error);
        res.status(500).json({
            success: false,
            message: 'File upload failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Get file by ID
// @route   GET /api/files/:id
// @access  Public
const getFileById = asyncHandler(async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        res.json({
            success: true,
            data: {
                fileId: file._id,
                fileName: file.fileName,
                originalName: file.originalName,
                filePath: file.filePath,
                fileSize: file.fileSize,
                mimeType: file.mimeType,
                category: file.category,
                storageType: file.storageType,
                uploadedAt: file.uploadedAt,
                downloadUrl: file.filePath, // Cloudinary URLs are already public
            }
        });

    } catch (error) {
        console.error('Get file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get file',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Public
const deleteFile = asyncHandler(async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Delete from Cloudinary
        if (file.cloudinaryPublicId) {
            try {
                await cloudinary.uploader.destroy(file.cloudinaryPublicId);
            } catch (cloudinaryError) {
                console.warn('Cloudinary deletion failed:', cloudinaryError.message);
                // Continue with database deletion even if Cloudinary fails
            }
        }

        // Delete from database
        await File.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'File deleted successfully'
        });

    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete file',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Get all files
// @route   GET /api/files
// @access  Public
const getAllFiles = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, category, storageType } = req.query;
        const query = {};

        if (category) query.category = category;
        if (storageType) query.storageType = storageType;

        const files = await File.find(query)
            .sort({ uploadedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await File.countDocuments(query);

        res.json({
            success: true,
            data: files.map(file => ({
                fileId: file._id,
                fileName: file.fileName,
                originalName: file.originalName,
                filePath: file.filePath,
                fileSize: file.fileSize,
                mimeType: file.mimeType,
                category: file.category,
                storageType: file.storageType,
                uploadedAt: file.uploadedAt,
                downloadUrl: file.filePath,
            })),
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('Get all files error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get files',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Get storage statistics
// @route   GET /api/files/stats
// @access  Public
const getStorageStats = asyncHandler(async (req, res) => {
    try {
        const stats = await File.aggregate([
            {
                $group: {
                    _id: '$storageType',
                    count: { $sum: 1 },
                    totalSize: { $sum: '$fileSize' }
                }
            }
        ]);

        const totalFiles = await File.countDocuments();
        const totalSize = await File.aggregate([
            { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
        ]);

        res.json({
            success: true,
            data: {
                totalFiles,
                totalSize: totalSize[0]?.totalSize || 0,
                storageBreakdown: stats.map(stat => ({
                    storageType: stat._id,
                    count: stat.count,
                    totalSize: stat.totalSize
                }))
            }
        });

    } catch (error) {
        console.error('Get storage stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get storage statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = {
    uploadSingleFile,
    uploadMultipleFiles,
    getFileById,
    deleteFile,
    getAllFiles,
    getStorageStats
};