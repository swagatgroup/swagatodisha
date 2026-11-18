const multer = require('multer');
const sharp = require('sharp');
const CloudinaryService = require('../utils/cloudinary');

const MAX_FILES = 20;

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed in the gallery'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per photo
        files: MAX_FILES
    }
});

// Cloudinary serves a smaller copy of the same upload for the grid, so only one file is stored
const thumbnailFrom = (url) => (url && url.includes('/upload/')
    ? url.replace('/upload/', '/upload/c_limit,w_720,q_auto,f_auto/')
    : url);

// Accepts one or many photos under the field name "images" (or "image" for a single replacement)
const acceptGalleryImages = (req, res, next) => {
    upload.fields([{ name: 'images', maxCount: MAX_FILES }, { name: 'image', maxCount: 1 }])(req, res, (err) => {
        if (err) {
            const messages = {
                LIMIT_FILE_SIZE: 'Each photo must be smaller than 10MB',
                LIMIT_FILE_COUNT: `You can upload up to ${MAX_FILES} photos at a time`,
                LIMIT_UNEXPECTED_FILE: `You can upload up to ${MAX_FILES} photos at a time`
            };
            const message = messages[err.code] || err.message;
            return res.status(400).json({ success: false, message });
        }
        req.galleryFiles = [...(req.files?.images || []), ...(req.files?.image || [])];
        next();
    });
};

// Keeps the photo's own shape (no forced crop), fixes phone rotation, caps the long side at 1800px
const processGalleryImages = async (req, res, next) => {
    try {
        if (!req.galleryFiles || req.galleryFiles.length === 0) {
            return next();
        }

        req.galleryUploads = [];
        for (const file of req.galleryFiles) {
            const { data, info } = await sharp(file.buffer)
                .rotate()
                .resize(1800, 1800, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 82, effort: 5 })
                .toBuffer({ resolveWithObject: true });

            const result = await CloudinaryService.uploadImage(data, 'swagat-odisha/gallery', {
                public_id: `gallery_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }]
            });

            req.galleryUploads.push({
                imageUrl: result.url,
                thumbnailUrl: thumbnailFrom(result.url),
                cloudinaryPublicId: result.public_id,
                originalFileName: file.originalname,
                fileSize: data.length,
                mimeType: 'image/webp',
                dimensions: { width: info.width, height: info.height }
            });
        }

        next();
    } catch (error) {
        console.error('Gallery image processing/upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Could not process or upload the photo. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { acceptGalleryImages, processGalleryImages };
