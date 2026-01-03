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

// File filter - only PDFs
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed for quick access documents!'), false);
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
 * Upload PDF to Cloudinary
 */
const uploadToCloudinary = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }

        console.log('📄 Uploading quick access PDF to Cloudinary...');

        // Upload PDF to Cloudinary
        const cloudinaryResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'raw', // PDF files use 'raw' resource type
                    folder: 'swagat-odisha/quick-access',
                    public_id: `quickaccess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
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

        console.log('✅ Quick access PDF uploaded to Cloudinary:', cloudinaryResult.secure_url);
        next();
    } catch (error) {
        console.error('❌ Cloudinary upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading PDF to Cloudinary',
            error: error.message
        });
    }
};

module.exports = {
    upload,
    uploadToCloudinary
};

