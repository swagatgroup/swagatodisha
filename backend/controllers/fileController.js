const File = require('../models/File');
const cloudinary = require('cloudinary').v2;
const { generateUniqueFileName, getFileCategory } = require('../middleware/upload');
const { asyncHandler } = require('../middleware/errorHandler');
const StudentApplication = require('../models/StudentApplication');

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

        // Upload to Cloudinary with compression and optimization settings
        const cloudinaryResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    public_id: `swagat-odisha/${category}/${uniqueFileName}`,
                    folder: 'swagat-odisha',
                    use_filename: true,
                    unique_filename: true,
                    transformation: [
                        { quality: 'auto:good' }, // Cloudinary's auto quality optimization
                        { fetch_format: 'auto' },  // Auto-optimize format
                        { flags: 'progressive' }   // Progressive JPEG for images
                    ],
                    eager: [
                        { quality: 'auto:good', fetch_format: 'auto' }
                    ]
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
            fileUrl: cloudinaryResult.secure_url,
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
                cloudinaryHeight: cloudinaryResult.height
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
// @access  Protected
const uploadMultipleFiles = asyncHandler(async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files provided',
                error: 'NO_FILES'
            });
        }

        const incomingDocType = req.body?.documentType ? String(req.body.documentType) : undefined;
        const isCustom = req.body?.isCustom === 'true';
        const customLabel = req.body?.customLabel;

        // Process files in parallel for better performance
        const uploadPromises = req.files.map(async (uploadedFile) => {
            const { originalname, buffer, mimetype, size } = uploadedFile;
            const category = getFileCategory(mimetype);
            const uniqueFileName = generateUniqueFileName(originalname);

            // Upload to Cloudinary with compression and optimization settings
            const cloudinaryResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'auto',
                        public_id: `swagat-odisha/${category}/${uniqueFileName}`,
                        folder: 'swagat-odisha',
                        use_filename: true,
                        unique_filename: true,
                        transformation: [
                            { quality: 'auto:good' }, // Cloudinary's auto quality optimization
                            { fetch_format: 'auto' },  // Auto-optimize format
                            { flags: 'progressive' }   // Progressive JPEG for images
                        ],
                        eager: [
                            { quality: 'auto:good', fetch_format: 'auto' }
                        ]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer); // Use original buffer - Cloudinary will optimize
            });

            // Prepare file data
            const fileData = {
                originalName: originalname,
                fileName: uniqueFileName,
                filePath: cloudinaryResult.secure_url,
                fileUrl: cloudinaryResult.secure_url,
                fileSize: size, // Store original size
                mimeType: mimetype,
                category: category,
                storageType: 'cloudinary',
                cloudinaryPublicId: cloudinaryResult.public_id,
                uploadedBy: req.user?._id || null,
                metadata: {
                    documentType: incomingDocType,
                    isCustom: isCustom,
                    customLabel: customLabel,
                    cloudinaryId: cloudinaryResult.public_id,
                    cloudinaryUrl: cloudinaryResult.secure_url,
                    cloudinaryVersion: cloudinaryResult.version,
                    cloudinaryFormat: cloudinaryResult.format,
                    cloudinaryWidth: cloudinaryResult.width,
                    cloudinaryHeight: cloudinaryResult.height
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

// Backfill: Map existing Cloudinary assets to StudentApplication.documents
// Strategy: list resources under folder 'swagat-odisha', group by uploadedBy when possible (File docs),
// or attach to the most recent application for the authenticated user as a fallback.
const backfillCloudinaryToApplications = asyncHandler(async (req, res) => {
    try {
        const { simulate = 'false', limit = 200 } = req.query;
        const dryRun = simulate === 'true';

        // 1) Load File records from DB (preferable because they carry uploadedBy and metadata)
        const files = await File.find({ storageType: 'cloudinary', isActive: true })
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        let updated = 0;
        let scanned = 0;

        for (const f of files) {
            scanned += 1;
            // Determine target application: by uploadedBy → latest application
            let targetApp = null;
            if (f.uploadedBy) {
                targetApp = await StudentApplication.findOne({ user: f.uploadedBy })
                    .sort({ createdAt: -1 });
            }

            // Fallback: if request is authenticated and has an application, use that
            if (!targetApp && req.user?._id) {
                targetApp = await StudentApplication.findOne({ user: req.user._id })
                    .sort({ createdAt: -1 });
            }

            if (!targetApp) continue;

            // If already present (by cloudinaryPublicId or filePath), skip
            const exists = (targetApp.documents || []).some(d => (
                (d.cloudinaryPublicId && d.cloudinaryPublicId === f.cloudinaryPublicId) ||
                (d.filePath && d.filePath === f.filePath)
            ));
            if (exists) continue;

            const inferredType = (f.mimeType || '').includes('pdf') ? 'pdf_document' : 'uploaded_file';
            const doc = {
                documentType: inferredType,
                fileName: f.originalName || f.fileName,
                filePath: f.filePath || f.fileUrl,
                fileSize: f.fileSize,
                mimeType: f.mimeType,
                storageType: 'cloudinary',
                cloudinaryPublicId: f.cloudinaryPublicId,
                status: 'PENDING',
                uploadedAt: f.createdAt
            };

            if (!dryRun) {
                if (!Array.isArray(targetApp.documents)) targetApp.documents = [];
                targetApp.documents.push(doc);
                await targetApp.save();
            }
            updated += 1;
        }

        return res.json({
            success: true,
            message: dryRun ? 'Backfill simulation complete' : 'Backfill complete',
            data: { scanned, updated, dryRun }
        });
    } catch (error) {
        console.error('Backfill error:', error);
        return res.status(500).json({ success: false, message: 'Backfill failed', error: error.message });
    }
});

module.exports = {
    uploadSingleFile,
    uploadMultipleFiles,
    getFileById,
    deleteFile,
    getAllFiles,
    getStorageStats,
    backfillCloudinaryToApplications
};