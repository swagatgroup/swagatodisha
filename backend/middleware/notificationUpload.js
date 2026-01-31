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
    try {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        
        console.log('📄 [FILE FILTER] Checking file:', {
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
        
        if (allowedTypes.includes(file.mimetype)) {
            console.log('✅ [FILE FILTER] File type allowed');
            cb(null, true);
        } else {
            console.error('❌ [FILE FILTER] File type not allowed:', {
                mimetype: file.mimetype,
                allowedTypes: allowedTypes
            });
            cb(new Error('Only PDF and image files (JPG, PNG, WebP) are allowed!'), false);
        }
    } catch (error) {
        console.error('❌ [FILE FILTER] Error in file filter:', {
            error: error.message,
            fileName: file?.originalname
        });
        cb(error, false);
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
 * Upload file to Cloudinary with timeout handling
 */
const uploadToCloudinary = async (req, res, next) => {
    const uploadStartTime = Date.now();
    
    try {
        if (!req.file) {
            console.log('📄 [CLOUDINARY UPLOAD] No file provided, skipping upload');
            return next();
        }

        console.log('📄 [CLOUDINARY UPLOAD] Starting file upload to Cloudinary:', {
            fileName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: `${(req.file.buffer.length / 1024 / 1024).toFixed(2)} MB`,
            bufferLength: req.file.buffer.length
        });

        // Determine resource type based on file type
        const isPDF = req.file.mimetype === 'application/pdf';
        const resourceType = isPDF ? 'raw' : 'image';
        
        // Extract file extension from original filename
        const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase() || '';
        const hasValidExtension = fileExtension && ['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(fileExtension);
        
        // Generate public_id with extension for PDFs
        const basePublicId = `notification_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const publicId = isPDF && hasValidExtension 
            ? `${basePublicId}.${fileExtension}`
            : (isPDF ? `${basePublicId}.pdf` : basePublicId);
        
        console.log('📄 [CLOUDINARY UPLOAD] File type determined:', {
            isPDF: isPDF,
            resourceType: resourceType,
            mimetype: req.file.mimetype,
            originalName: req.file.originalname,
            fileExtension: fileExtension,
            publicId: publicId
        });

        // Set timeout (60 seconds for large files)
        const UPLOAD_TIMEOUT = 60000;
        let timeoutId;
        
        console.log('📄 [CLOUDINARY UPLOAD] Upload configuration:', {
            timeout: `${UPLOAD_TIMEOUT / 1000}s`,
            folder: isPDF ? 'swagat-odisha/notifications/documents' : 'swagat-odisha/notifications/images',
            publicId: publicId
        });

        // Upload to Cloudinary with timeout
        const uploadPromise = new Promise((resolve, reject) => {
            let streamEnded = false;
            
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: resourceType,
                    folder: isPDF ? 'swagat-odisha/notifications/documents' : 'swagat-odisha/notifications/images',
                    public_id: publicId,
                    use_filename: false, // We're setting public_id manually
                    unique_filename: false, // We're setting public_id manually
                    timeout: 60000 // Cloudinary timeout
                },
                (error, result) => {
                    streamEnded = true;
                    if (timeoutId) clearTimeout(timeoutId);
                    if (error) {
                        console.error('❌ [CLOUDINARY UPLOAD] Upload callback error:', {
                            error: error.message,
                            http_code: error.http_code,
                            name: error.name,
                            fileName: req.file.originalname
                        });
                        reject(error);
                    } else {
                        const uploadDuration = Date.now() - uploadStartTime;
                        console.log('✅ [CLOUDINARY UPLOAD] Upload successful:', {
                            publicId: result.public_id,
                            url: result.secure_url,
                            bytes: result.bytes,
                            format: result.format,
                            duration: `${uploadDuration}ms`
                        });
                        resolve(result);
                    }
                }
            );

            // Handle stream errors
            uploadStream.on('error', (error) => {
                if (!streamEnded) {
                    streamEnded = true;
                    if (timeoutId) clearTimeout(timeoutId);
                    console.error('❌ [CLOUDINARY UPLOAD] Upload stream error:', {
                        error: error.message,
                        name: error.name,
                        fileName: req.file.originalname
                    });
                    reject(error);
                }
            });

            // Handle pipe errors
            const readStream = streamifier.createReadStream(req.file.buffer);
            readStream.on('error', (error) => {
                if (!streamEnded) {
                    streamEnded = true;
                    if (timeoutId) clearTimeout(timeoutId);
                    console.error('❌ [CLOUDINARY UPLOAD] Read stream error:', {
                        error: error.message,
                        name: error.name,
                        fileName: req.file.originalname
                    });
                    reject(error);
                }
            });
            
            console.log('📄 [CLOUDINARY UPLOAD] Starting stream pipe...');

            readStream.pipe(uploadStream);
        });

        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
                const elapsed = Date.now() - uploadStartTime;
                console.error('❌ [CLOUDINARY UPLOAD] Upload timeout:', {
                    timeout: `${UPLOAD_TIMEOUT / 1000}s`,
                    elapsed: `${elapsed}ms`,
                    fileName: req.file.originalname,
                    fileSize: `${(req.file.buffer.length / 1024 / 1024).toFixed(2)} MB`
                });
                reject(new Error('Cloudinary upload timeout - file upload took too long. Please try again with a smaller file.'));
            }, UPLOAD_TIMEOUT);
        });

        // Race between upload and timeout, with cleanup
        let uploadCompleted = false;
        const cloudinaryResult = await Promise.race([
            uploadPromise.then(result => {
                uploadCompleted = true;
                if (timeoutId) clearTimeout(timeoutId);
                return result;
            }).catch(error => {
                uploadCompleted = true;
                if (timeoutId) clearTimeout(timeoutId);
                throw error;
            }),
            timeoutPromise.catch(error => {
                // If timeout wins, the upload promise might still be pending
                // This is okay - Promise.race will handle it
                throw error;
            })
        ]);

        // Store Cloudinary info in req.file for controller access
        req.file.cloudinaryUrl = cloudinaryResult.secure_url;
        req.file.cloudinaryPublicId = cloudinaryResult.public_id;
        req.file.isPDF = isPDF;

        const totalDuration = Date.now() - uploadStartTime;
        console.log('✅ [CLOUDINARY UPLOAD] File upload completed successfully:', {
            fileName: req.file.originalname,
            url: cloudinaryResult.secure_url,
            publicId: cloudinaryResult.public_id,
            totalDuration: `${totalDuration}ms`
        });
        
        next();
    } catch (error) {
        const totalDuration = Date.now() - uploadStartTime;
        
        console.error('❌ [CLOUDINARY UPLOAD] Upload failed:', {
            error: error.message,
            name: error.name,
            http_code: error.http_code,
            stack: error.stack,
            fileName: req.file?.originalname,
            fileSize: req.file ? `${(req.file.buffer.length / 1024 / 1024).toFixed(2)} MB` : 'N/A',
            duration: `${totalDuration}ms`,
            isTimeout: error.message?.includes('timeout') || error.http_code === 499 || error.name === 'TimeoutError'
        });
        
        // Provide more specific error messages
        let errorMessage = 'Error uploading file to Cloudinary';
        let statusCode = 500;
        
        if (error.message && error.message.includes('timeout')) {
            errorMessage = 'Upload timeout - the file is too large or connection is slow. Please try again with a smaller file.';
            statusCode = 408; // Request Timeout
        } else if (error.http_code === 499 || error.name === 'TimeoutError') {
            errorMessage = 'Upload timeout - Cloudinary request timed out. Please try again.';
            statusCode = 408;
        } else if (error.http_code === 401) {
            errorMessage = 'Cloudinary authentication failed. Please check your API credentials.';
            statusCode = 500;
        } else if (error.http_code === 400) {
            errorMessage = 'Invalid file format or file too large.';
            statusCode = 400;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return res.status(statusCode).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : 'Upload failed',
            details: process.env.NODE_ENV === 'development' ? {
                http_code: error.http_code,
                name: error.name,
                fileName: req.file?.originalname
            } : undefined
        });
    }
};

module.exports = {
    upload,
    uploadToCloudinary
};

