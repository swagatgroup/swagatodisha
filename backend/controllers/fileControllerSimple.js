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

// @desc    Upload multiple files - SIMPLE VERSION FOR SPEED
// @route   POST /api/files/upload-multiple-simple
// @access  Protected
const uploadMultipleFilesSimple = asyncHandler(async (req, res) => {
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

        // Process files in parallel - NO OPTIMIZATION
        const uploadPromises = req.files.map(async (uploadedFile) => {
            const { originalname, buffer, mimetype, size } = uploadedFile;
            const category = getFileCategory(mimetype);
            const uniqueFileName = generateUniqueFileName(originalname);

            // Upload to Cloudinary - MINIMAL SETTINGS
            const cloudinaryResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'auto',
                        type: 'upload', // Public upload type for direct access
                        public_id: `swagat-odisha/${category}/${uniqueFileName}`,
                        folder: 'swagat-odisha',
                        use_filename: true,
                        unique_filename: true
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer); // Use original buffer directly
            });

            // Prepare file data
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
                    documentType: incomingDocType,
                    isCustom: isCustom,
                    customLabel: customLabel,
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
        console.error('Simple upload error:', error);
        res.status(500).json({
            success: false,
            message: 'File upload failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = {
    uploadMultipleFilesSimple
};
