const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
const slidersDir = path.join(uploadsDir, 'sliders');

[uploadsDir, slidersDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, slidersDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'slider-' + uniqueSuffix + path.extname(file.originalname));
    }
});

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
 * Image Optimization Middleware
 * Converts images to WebP format and compresses them
 * Recommended dimensions for slider: 1920x1080 (Full HD)
 */
const optimizeSliderImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }

        const inputPath = req.file.path;
        const outputFilename = req.file.filename.replace(path.extname(req.file.filename), '.webp');
        const outputPath = path.join(path.dirname(inputPath), outputFilename);

        console.log('🖼️ Optimizing slider image:', inputPath);

        // Convert to WebP and optimize
        await sharp(inputPath)
            .resize(1920, 1080, {
                fit: 'cover', // Crop to fit
                position: 'center'
            })
            .webp({
                quality: 85, // High quality, good compression
                effort: 6 // Higher effort = better compression (0-6)
            })
            .toFile(outputPath);

        // Delete original file
        await fs.unlink(inputPath);

        // Update req.file with new path
        req.file.path = outputPath;
        req.file.filename = outputFilename;
        req.file.mimetype = 'image/webp';

        console.log('✅ Slider image optimized:', outputPath);
        next();
    } catch (error) {
        console.error('❌ Image optimization error:', error);
        // Clean up uploaded file if optimization fails
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }
        res.status(500).json({
            success: false,
            message: 'Error optimizing image',
            error: error.message
        });
    }
};

module.exports = {
    upload,
    optimizeSliderImage
};

