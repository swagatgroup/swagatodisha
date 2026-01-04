const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use memory storage for Cloudinary upload
const storage = multer.memoryStorage();

// File filter - allow PDFs and images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and image files (JPG, PNG, WebP) are allowed!'), false);
    }
};

// Multer upload configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

/**
 * Upload file to Cloudinary
 */
const uploadToCloudinary = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }

        console.log('📄 Uploading notification file to Cloudinary...');

        // Determine resource type based on file type
        const isPDF = req.file.mimetype === 'application/pdf';
        const resourceType = isPDF ? 'raw' : 'image';

        // Upload to Cloudinary
        const cloudinaryResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: resourceType,
                    folder: isPDF ? 'swagat-odisha/notifications/documents' : 'swagat-odisha/notifications/images',
                    public_id: `notification_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                    use_filename: true,
                    unique_filename: true
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        });

        // Store Cloudinary info in req.file for controller access
        req.file.cloudinaryUrl = cloudinaryResult.secure_url;
        req.file.cloudinaryPublicId = cloudinaryResult.public_id;
        req.file.isPDF = isPDF;

        console.log('✅ Notification file uploaded to Cloudinary:', cloudinaryResult.secure_url);
        next();
    } catch (error) {
        console.error('❌ Cloudinary upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading file to Cloudinary',
            error: error.message
        });
    }
};

module.exports = {
    upload,
    uploadToCloudinary
};

