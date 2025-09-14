const File = require('../models/File');
const { r2Client } = require('../config/r2');
const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { generateUniqueFileName, getFileCategory } = require('../middleware/upload');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Upload single file
// @route   POST /api/files/upload
// @access  Public
const uploadFile = asyncHandler(async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file provided',
                error: 'NO_FILE'
            });
        }

        const { originalname, mimetype, size, buffer } = req.file;
        const { uploadedBy, tags, isPublic } = req.body;

        // Generate unique filename
        const fileName = generateUniqueFileName(originalname);
        const fileCategory = getFileCategory(mimetype);

        // Upload to R2
        const uploadCommand = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: mimetype,
            Metadata: {
                originalName: originalname,
                uploadedBy: uploadedBy || 'anonymous',
                category: fileCategory
            }
        });

        await r2Client.send(uploadCommand);

        // Generate file URL
        const fileUrl = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET_NAME}/${fileName}`;

        // Save to MongoDB
        const fileData = {
            fileName,
            originalName: originalname,
            fileUrl,
            fileSize: size,
            mimeType: mimetype,
            uploadedBy: uploadedBy || 'anonymous',
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            isPublic: isPublic === 'true' || false,
            metadata: {
                category: fileCategory
            }
        };

        const file = await File.create(fileData);

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                file: {
                    id: file._id,
                    fileName: file.fileName,
                    originalName: file.originalName,
                    fileUrl: file.fileUrl,
                    fileSize: file.fileSize,
                    formattedFileSize: file.formattedFileSize,
                    mimeType: file.mimeType,
                    fileCategory: file.fileCategory,
                    fileExtension: file.fileExtension,
                    uploadedBy: file.uploadedBy,
                    tags: file.tags,
                    isPublic: file.isPublic,
                    downloadCount: file.downloadCount,
                    createdAt: file.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'File upload failed',
            error: 'UPLOAD_FAILED',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
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

        const { uploadedBy, tags, isPublic } = req.body;
        const uploadedFiles = [];
        const errors = [];

        for (const file of req.files) {
            try {
                const { originalname, mimetype, size, buffer } = file;

                // Generate unique filename
                const fileName = generateUniqueFileName(originalname);
                const fileCategory = getFileCategory(mimetype);

                // Upload to R2
                const uploadCommand = new PutObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: fileName,
                    Body: buffer,
                    ContentType: mimetype,
                    Metadata: {
                        originalName: originalname,
                        uploadedBy: uploadedBy || 'anonymous',
                        category: fileCategory
                    }
                });

                await r2Client.send(uploadCommand);

                // Generate file URL
                const fileUrl = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET_NAME}/${fileName}`;

                // Save to MongoDB
                const fileData = {
                    fileName,
                    originalName: originalname,
                    fileUrl,
                    fileSize: size,
                    mimeType: mimetype,
                    uploadedBy: uploadedBy || 'anonymous',
                    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                    isPublic: isPublic === 'true' || false,
                    metadata: {
                        category: fileCategory
                    }
                };

                const savedFile = await File.create(fileData);
                uploadedFiles.push(savedFile);

            } catch (fileError) {
                console.error(`Error uploading file ${file.originalname}:`, fileError);
                errors.push({
                    fileName: file.originalname,
                    error: fileError.message
                });
            }
        }

        res.status(201).json({
            success: true,
            message: `Successfully uploaded ${uploadedFiles.length} files`,
            data: {
                files: uploadedFiles.map(file => ({
                    id: file._id,
                    fileName: file.fileName,
                    originalName: file.originalName,
                    fileUrl: file.fileUrl,
                    fileSize: file.fileSize,
                    formattedFileSize: file.formattedFileSize,
                    mimeType: file.mimeType,
                    fileCategory: file.fileCategory,
                    fileExtension: file.fileExtension,
                    uploadedBy: file.uploadedBy,
                    tags: file.tags,
                    isPublic: file.isPublic,
                    downloadCount: file.downloadCount,
                    createdAt: file.createdAt
                })),
                errors: errors.length > 0 ? errors : undefined
            }
        });

    } catch (error) {
        console.error('Multiple upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Multiple file upload failed',
            error: 'UPLOAD_FAILED',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Get file by ID
// @route   GET /api/files/:id
// @access  Public
const getFile = asyncHandler(async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file || !file.isActive) {
            return res.status(404).json({
                success: false,
                message: 'File not found',
                error: 'FILE_NOT_FOUND'
            });
        }

        // Generate signed URL for private files
        let downloadUrl = file.fileUrl;
        if (!file.isPublic) {
            try {
                const getObjectCommand = new GetObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: file.fileName
                });

                downloadUrl = await getSignedUrl(r2Client, getObjectCommand, { expiresIn: 3600 }); // 1 hour
            } catch (urlError) {
                console.error('Error generating signed URL:', urlError);
                // Fallback to public URL if signed URL generation fails
            }
        }

        res.json({
            success: true,
            data: {
                file: {
                    id: file._id,
                    fileName: file.fileName,
                    originalName: file.originalName,
                    fileUrl: file.fileUrl,
                    downloadUrl,
                    fileSize: file.fileSize,
                    formattedFileSize: file.formattedFileSize,
                    mimeType: file.mimeType,
                    fileCategory: file.fileCategory,
                    fileExtension: file.fileExtension,
                    uploadedBy: file.uploadedBy,
                    tags: file.tags,
                    isPublic: file.isPublic,
                    downloadCount: file.downloadCount,
                    metadata: file.metadata,
                    createdAt: file.createdAt,
                    updatedAt: file.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Get file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve file',
            error: 'RETRIEVE_FAILED',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Get all files with pagination and filtering
// @route   GET /api/files
// @access  Public
const getFiles = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const uploadedBy = req.query.uploadedBy;
        const mimeType = req.query.mimeType;
        const isPublic = req.query.isPublic;
        const search = req.query.search;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        // Build query
        let query = { isActive: true };

        if (uploadedBy) {
            query.uploadedBy = uploadedBy;
        }

        if (mimeType) {
            query.mimeType = mimeType;
        }

        if (isPublic !== undefined) {
            query.isPublic = isPublic === 'true';
        }

        if (search) {
            query.$or = [
                { originalName: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder;

        // Execute query
        const files = await File.find(query)
            .sort(sort)
            .limit(limit)
            .skip(skip)
            .select('-__v');

        const total = await File.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                files: files.map(file => ({
                    id: file._id,
                    fileName: file.fileName,
                    originalName: file.originalName,
                    fileUrl: file.fileUrl,
                    fileSize: file.fileSize,
                    formattedFileSize: file.formattedFileSize,
                    mimeType: file.mimeType,
                    fileCategory: file.fileCategory,
                    fileExtension: file.fileExtension,
                    uploadedBy: file.uploadedBy,
                    tags: file.tags,
                    isPublic: file.isPublic,
                    downloadCount: file.downloadCount,
                    createdAt: file.createdAt,
                    updatedAt: file.updatedAt
                })),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalFiles: total,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                    limit
                }
            }
        });

    } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve files',
            error: 'RETRIEVE_FAILED',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Update file metadata
// @route   PUT /api/files/:id
// @access  Public
const updateFile = asyncHandler(async (req, res) => {
    try {
        const { tags, isPublic, metadata } = req.body;

        const file = await File.findById(req.params.id);

        if (!file || !file.isActive) {
            return res.status(404).json({
                success: false,
                message: 'File not found',
                error: 'FILE_NOT_FOUND'
            });
        }

        // Update fields
        if (tags !== undefined) {
            file.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
        }

        if (isPublic !== undefined) {
            file.isPublic = isPublic;
        }

        if (metadata) {
            file.metadata = { ...file.metadata, ...metadata };
        }

        await file.save();

        res.json({
            success: true,
            message: 'File updated successfully',
            data: {
                file: {
                    id: file._id,
                    fileName: file.fileName,
                    originalName: file.originalName,
                    fileUrl: file.fileUrl,
                    fileSize: file.fileSize,
                    formattedFileSize: file.formattedFileSize,
                    mimeType: file.mimeType,
                    fileCategory: file.fileCategory,
                    fileExtension: file.fileExtension,
                    uploadedBy: file.uploadedBy,
                    tags: file.tags,
                    isPublic: file.isPublic,
                    downloadCount: file.downloadCount,
                    metadata: file.metadata,
                    createdAt: file.createdAt,
                    updatedAt: file.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Update file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update file',
            error: 'UPDATE_FAILED',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Public
const deleteFile = asyncHandler(async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file || !file.isActive) {
            return res.status(404).json({
                success: false,
                message: 'File not found',
                error: 'FILE_NOT_FOUND'
            });
        }

        // Delete from R2
        try {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: file.fileName
            });

            await r2Client.send(deleteCommand);
        } catch (r2Error) {
            console.error('Error deleting from R2:', r2Error);
            // Continue with database deletion even if R2 deletion fails
        }

        // Soft delete from MongoDB
        file.isActive = false;
        await file.save();

        res.json({
            success: true,
            message: 'File deleted successfully',
            data: {
                deletedFile: {
                    id: file._id,
                    fileName: file.fileName,
                    originalName: file.originalName
                }
            }
        });

    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete file',
            error: 'DELETE_FAILED',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Download file (increment download count)
// @route   GET /api/files/:id/download
// @access  Public
const downloadFile = asyncHandler(async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file || !file.isActive) {
            return res.status(404).json({
                success: false,
                message: 'File not found',
                error: 'FILE_NOT_FOUND'
            });
        }

        // Increment download count
        await file.incrementDownloadCount();

        // Generate signed URL for private files
        let downloadUrl = file.fileUrl;
        if (!file.isPublic) {
            try {
                const getObjectCommand = new GetObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: file.fileName
                });

                downloadUrl = await getSignedUrl(r2Client, getObjectCommand, { expiresIn: 3600 }); // 1 hour
            } catch (urlError) {
                console.error('Error generating signed URL:', urlError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to generate download URL',
                    error: 'URL_GENERATION_FAILED'
                });
            }
        }

        res.json({
            success: true,
            data: {
                downloadUrl,
                file: {
                    id: file._id,
                    originalName: file.originalName,
                    fileSize: file.fileSize,
                    mimeType: file.mimeType,
                    downloadCount: file.downloadCount + 1
                }
            }
        });

    } catch (error) {
        console.error('Download file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to prepare file download',
            error: 'DOWNLOAD_FAILED',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Get file statistics
// @route   GET /api/files/stats
// @access  Public
const getFileStats = asyncHandler(async (req, res) => {
    try {
        const stats = await File.getStorageStats();
        const totalFiles = await File.countDocuments({ isActive: true });
        const publicFiles = await File.countDocuments({ isActive: true, isPublic: true });
        const privateFiles = totalFiles - publicFiles;

        // Get files by category
        const categoryStats = await File.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$mimeType',
                    count: { $sum: 1 },
                    totalSize: { $sum: '$fileSize' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                totalFiles,
                publicFiles,
                privateFiles,
                totalSize: stats[0]?.totalSize || 0,
                averageSize: stats[0]?.averageSize || 0,
                categoryBreakdown: categoryStats.map(cat => ({
                    mimeType: cat._id,
                    count: cat.count,
                    totalSize: cat.totalSize,
                    category: getFileCategory(cat._id)
                }))
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve file statistics',
            error: 'STATS_FAILED',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = {
    uploadFile,
    uploadMultipleFiles,
    getFile,
    getFiles,
    updateFile,
    deleteFile,
    downloadFile,
    getFileStats
};
