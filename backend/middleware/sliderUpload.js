const multer = require('multer');
const sharp = require('sharp');
const CloudinaryService = require('../utils/cloudinary');

// Use memory storage for Cloudinary upload
const storage = multer.memoryStorage();

// File filter - only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed for sliders!'), false);
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
 * Image Optimization and Cloudinary Upload Middleware
 * Resizes images to 1920x600 dimensions and uploads to Cloudinary
 * Auto-compresses images using Cloudinary's optimization
 */
const optimizeSliderImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }

        console.log('🖼️ Processing slider image for Cloudinary upload...');

        // Resize and optimize image to 1920x600 (as per requirements)
        const optimizedBuffer = await sharp(req.file.buffer)
            .resize(1920, 600, {
                fit: 'cover', // Crop to fit
                position: 'center'
            })
            .webp({
                quality: 85, // High quality, good compression
                effort: 6 // Higher effort = better compression (0-6)
            })
            .toBuffer();

        console.log('✅ Image resized to 1920x600 and optimized');

        // Upload to Cloudinary
        const cloudinaryResult = await CloudinaryService.uploadImage(
            optimizedBuffer,
            'swagat-odisha/sliders',
            {
                public_id: `slider_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                transformation: [
                    { width: 1920, height: 600, crop: 'fill' },
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' },
                    { flags: 'progressive' }
                ]
            }
        );

        // Store Cloudinary info in req.file for controller access
        req.file.cloudinaryUrl = cloudinaryResult.url;
        req.file.cloudinaryPublicId = cloudinaryResult.public_id;

        console.log('✅ Slider image uploaded to Cloudinary:', cloudinaryResult.url);
        next();
    } catch (error) {
        console.error('❌ Image processing/upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing and uploading image to Cloudinary',
            error: error.message
        });
    }
};

module.exports = {
    upload,
    optimizeSliderImage
};

