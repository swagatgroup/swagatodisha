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
 * Resizes images based on sliderType:
 * - Horizontal: 1920x1080 (full screen landscape for >1000px viewport)
 * - Vertical: 600x840 (vertical portrait for <1000px viewport)
 * Auto-compresses images using Cloudinary's optimization
 */
const optimizeSliderImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }

        console.log('🖼️ Processing slider image for Cloudinary upload...');

        // Get sliderType from request body (FormData sends as string)
        const sliderType = req.body.sliderType || 'horizontal';
        
        // Define dimensions based on slider type
        let width, height, transformation;
        if (sliderType === 'vertical') {
            // Vertical slider: 600x840 (portrait orientation for mobile/tablet)
            width = 600;
            height = 840;
            transformation = [
                { width: 600, height: 840, crop: 'fill' },
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
                { flags: 'progressive' }
            ];
            console.log('📱 Processing vertical slider image (600x840)');
        } else {
            // Horizontal slider: 1920x1080 (full HD landscape for desktop)
            width = 1920;
            height = 1080;
            transformation = [
                { width: 1920, height: 1080, crop: 'fill' },
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
                { flags: 'progressive' }
            ];
            console.log('🖥️ Processing horizontal slider image (1920x1080)');
        }

        // Resize and optimize image
        const optimizedBuffer = await sharp(req.file.buffer)
            .resize(width, height, {
                fit: 'cover', // Crop to fit
                position: 'center'
            })
            .webp({
                quality: 85, // High quality, good compression
                effort: 6 // Higher effort = better compression (0-6)
            })
            .toBuffer();

        console.log(`✅ Image resized to ${width}x${height} and optimized`);

        // Upload to Cloudinary
        const cloudinaryResult = await CloudinaryService.uploadImage(
            optimizedBuffer,
            `swagat-odisha/sliders/${sliderType}`,
            {
                public_id: `${sliderType}_slider_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                transformation: transformation
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

