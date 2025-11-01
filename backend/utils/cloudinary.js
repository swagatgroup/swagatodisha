const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

class CloudinaryService {
    /**
     * Test Cloudinary connection
     * @returns {Promise<boolean>} True if connection is successful
     */
    static async testConnection() {
        try {
            // Testing Cloudinary connection

            // Try to upload a simple test image
            const testBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

            const result = await this.uploadImage(testBuffer, 'swagat-odisha/test', {
                public_id: `test_${Date.now()}`,
                transformation: [
                    { width: 1, height: 1, crop: 'fill' }
                ]
            });

            // Cloudinary connection successful
            return true;
        } catch (error) {
            console.error('❌ Cloudinary connection failed:', error);
            return false;
        }
    }

    /**
     * Upload image to Cloudinary
     * @param {Buffer} imageBuffer - Image buffer
     * @param {string} folder - Cloudinary folder name
     * @param {Object} options - Upload options
     * @returns {Promise<Object>} Upload result
     */
    static async uploadImage(imageBuffer, folder = 'swagat-odisha', options = {}) {
        try {
            const uploadOptions = {
                folder: folder,
                resource_type: 'image',
                type: 'upload', // Public upload type for direct access
                transformation: [
                    { quality: 'auto:low' },
                    { fetch_format: 'auto' },
                    { flags: 'progressive' }
                ],
                ...options
            };

            // If imageBuffer is a Buffer, use upload_stream
            if (Buffer.isBuffer(imageBuffer)) {
                return await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload_stream error:', error);
                            reject(new Error('Failed to upload image to Cloudinary'));
                        } else {
                            resolve({
                                public_id: result.public_id,
                                url: result.secure_url,
                                width: result.width,
                                height: result.height,
                                format: result.format,
                                size: result.bytes,
                                created_at: result.created_at
                            });
                        }
                    });
                    streamifier.createReadStream(imageBuffer).pipe(stream);
                });
            } else {
                // If not a buffer, assume it's a base64 string or file path
                const result = await cloudinary.uploader.upload(imageBuffer, uploadOptions);
                return {
                    public_id: result.public_id,
                    url: result.secure_url,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    size: result.bytes,
                    created_at: result.created_at
                };
            }
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new Error('Failed to upload image to Cloudinary');
        }
    }

    /**
     * Upload multiple images
     * @param {Array} images - Array of image buffers
     * @param {string} folder - Cloudinary folder name
     * @returns {Promise<Array>} Array of upload results
     */
    static async uploadMultipleImages(images, folder = 'swagat-odisha') {
        try {
            const uploadPromises = images.map((image, index) => {
                return this.uploadImage(image.buffer, folder, {
                    public_id: `${folder}_${Date.now()}_${index}`
                });
            });

            const results = await Promise.all(uploadPromises);
            return results;
        } catch (error) {
            console.error('Multiple images upload error:', error);
            throw new Error('Failed to upload multiple images');
        }
    }

    /**
     * Delete image from Cloudinary
     * @param {string} publicId - Cloudinary public ID
     * @returns {Promise<Object>} Deletion result
     */
    static async deleteImage(publicId) {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result;
        } catch (error) {
            console.error('Cloudinary delete error:', error);
            throw new Error('Failed to delete image from Cloudinary');
        }
    }

    /**
     * Generate optimized URL with transformations
     * @param {string} publicId - Cloudinary public ID
     * @param {Object} transformations - Image transformations
     * @returns {string} Optimized URL
     */
    static getOptimizedUrl(publicId, transformations = {}) {
        const defaultTransformations = {
            quality: 'auto:low',
            fetch_format: 'auto',
            flags: 'progressive',
            ...transformations
        };

        return cloudinary.url(publicId, defaultTransformations);
    }

    /**
     * Generate thumbnail URL
     * @param {string} publicId - Cloudinary public ID
     * @param {number} width - Thumbnail width
     * @param {number} height - Thumbnail height
     * @returns {string} Thumbnail URL
     */
    static getThumbnailUrl(publicId, width = 300, height = 200) {
        return cloudinary.url(publicId, {
            width: width,
            height: height,
            crop: 'limit',
            quality: 'auto:low',
            fetch_format: 'auto',
            flags: 'progressive'
        });
    }

    /**
     * Process student documents with specific transformations
     * @param {Object} documents - Object with document types and buffers
     * @returns {Promise<Object>} Processed documents with URLs
     */
    static async processStudentDocuments(documents) {
        const processedDocuments = {};
        const documentTypes = ['aadharCard', 'birthCertificate', 'transferCertificate', 'characterCertificate', 'incomeCertificate', 'casteCertificate', 'domicileCertificate', 'migrationCertificate', 'markSheet', 'passportSizePhoto', 'signature'];

        // Processing student documents

        for (const type of documentTypes) {
            if (documents[type]) {
                try {
                    // Processing document
                    const result = await this.uploadImage(
                        documents[type].buffer,
                        'swagat-odisha/student-documents',
                        {
                            public_id: `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                            transformation: [
                                { quality: 'auto:good' },
                                { fetch_format: 'auto' }
                            ]
                        }
                    );

                    processedDocuments[type] = {
                        url: result.url,
                        public_id: result.public_id,
                        thumbnail: this.getThumbnailUrl(result.public_id, 200, 150)
                    };

                    // Document uploaded successfully
                } catch (error) {
                    console.error(`Error uploading ${type} document:`, error);
                    processedDocuments[type] = null;
                }
            } else {
                // No document provided
            }
        }

        // Final processed documents
        return processedDocuments;
    }
}

module.exports = CloudinaryService;
