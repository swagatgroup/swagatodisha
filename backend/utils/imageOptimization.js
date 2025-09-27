const sharp = require('sharp');

// Image optimization utility
const optimizeImage = async (buffer, options = {}) => {
    try {
        const {
            maxWidth = 1920,
            maxHeight = 1080,
            quality = 85,
            format = 'jpeg'
        } = options;

        const image = sharp(buffer);
        const metadata = await image.metadata();

        // Only optimize if image is larger than specified dimensions
        if (metadata.width > maxWidth || metadata.height > maxHeight) {
            return await image
                .resize(maxWidth, maxHeight, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality })
                .toBuffer();
        }

        // If image is already small enough, just optimize quality
        return await image
            .jpeg({ quality })
            .toBuffer();
    } catch (error) {
        console.error('Image optimization error:', error);
        // Return original buffer if optimization fails
        return buffer;
    }
};

// Check if file is an image
const isImage = (mimetype) => {
    return mimetype.startsWith('image/');
};

// Get optimized file buffer
const getOptimizedBuffer = async (buffer, mimetype, options = {}) => {
    if (isImage(mimetype)) {
        return await optimizeImage(buffer, options);
    }
    return buffer;
};

module.exports = {
    optimizeImage,
    isImage,
    getOptimizedBuffer
};
