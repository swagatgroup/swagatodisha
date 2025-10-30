const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Compress image to optimal size (500KB - 1MB) while maintaining quality
 * @param {Buffer} buffer - Image buffer
 * @param {string} mimetype - MIME type of the image
 * @returns {Promise<Buffer>} Compressed image buffer
 */
const compressImage = async (buffer, mimetype) => {
    try {
        // Get metadata first
        const metadata = await sharp(buffer).metadata();

        console.log(`📊 Original image: ${(buffer.length / 1024 / 1024).toFixed(2)}MB, ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

        // If image is already small (less than 500KB), no need to compress
        if (buffer.length < 500 * 1024) {
            console.log('✅ Image already small, skipping compression');
            return buffer;
        }

        // Determine target size (aim for 800KB)
        const targetSize = 800 * 1024; // 800KB
        const currentSize = buffer.length;

        // Calculate quality based on current size
        let quality = 85; // Start with good quality

        if (currentSize > 2 * 1024 * 1024) { // > 2MB
            quality = 70;
        } else if (currentSize > 1024 * 1024) { // > 1MB
            quality = 80;
        }

        let compressedBuffer;

        // Compress in single pass - avoid iterative loops that can cause timeouts
        // Use aggressive compression on first pass for best speed
        const inputImage = sharp(buffer);

        // Resize if image is very large (reduce dimensions)
        let pipeline = inputImage;
        if (metadata.width > 2000 || metadata.height > 2000) {
            const maxDimension = 2000;
            pipeline = pipeline.resize(maxDimension, maxDimension, {
                fit: 'inside',
                withoutEnlargement: true
            });
            console.log(`🔄 Resizing from ${metadata.width}x${metadata.height} to max ${maxDimension}px`);
        }

        // Compress based on format with optimized settings
        if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
            compressedBuffer = await pipeline
                .jpeg({
                    quality: Math.min(quality, 80), // Cap at 80 for speed
                    progressive: true,
                    mozjpeg: false // Disable mozjpeg for faster processing
                })
                .toBuffer();
        } else if (metadata.format === 'png') {
            compressedBuffer = await pipeline
                .png({
                    quality: Math.min(quality, 80),
                    compressionLevel: 6 // Lower compression for speed
                })
                .toBuffer();
        } else if (metadata.format === 'webp') {
            compressedBuffer = await pipeline
                .webp({
                    quality: Math.min(quality, 80),
                    effort: 3 // Lower effort for speed
                })
                .toBuffer();
        } else {
            // For other formats, try converting to JPEG
            compressedBuffer = await pipeline
                .jpeg({
                    quality: Math.min(quality, 80),
                    progressive: true,
                    mozjpeg: false
                })
                .toBuffer();
        }

        console.log(`✅ Final compressed size: ${(compressedBuffer.length / 1024).toFixed(2)}KB`);
        return compressedBuffer;

    } catch (error) {
        console.error('❌ Image compression error:', error.message);
        // If compression fails, return original buffer
        console.log('⚠️ Returning original image due to compression error');
        return buffer;
    }
};

/**
 * Optimize file based on type
 * Images are compressed, PDFs are left as-is
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - MIME type
 * @returns {Promise<{buffer: Buffer, optimized: boolean, originalSize: number, compressedSize: number}>}
 */
const optimizeFile = async (buffer, mimetype) => {
    const originalSize = buffer.length;
    let optimizedBuffer;
    let optimized = false;

    // Only compress images
    if (mimetype && mimetype.startsWith('image/')) {
        optimizedBuffer = await compressImage(buffer, mimetype);
        optimized = optimizedBuffer.length < originalSize;
    } else {
        // For PDFs and other files, return as-is
        optimizedBuffer = buffer;
        optimized = false;
    }

    const compressedSize = optimizedBuffer.length;
    const savings = originalSize - compressedSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

    if (optimized) {
        console.log(`💾 File optimized: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(compressedSize / 1024 / 1024).toFixed(2)}MB (saved ${savingsPercent}%)`);
    } else if (mimetype && mimetype.startsWith('image/')) {
        console.log(`📄 File not compressed: ${(compressedSize / 1024 / 1024).toFixed(2)}MB (no size reduction possible)`);
    } else {
        console.log(`📄 Non-image file: ${(compressedSize / 1024 / 1024).toFixed(2)}MB (PDF or other)`);
    }

    return {
        buffer: optimizedBuffer,
        optimized,
        originalSize,
        compressedSize,
        savings,
        savingsPercent
    };
};

module.exports = {
    compressImage,
    optimizeFile
};
