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
        cb(new Error('Only PDF and image files (JPG, PNG, WebP) are allowed for quick access documents!'), false);
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

        console.log('📄 Uploading quick access file to Cloudinary...', {
            fileName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: `${(req.file.buffer.length / 1024 / 1024).toFixed(2)} MB`
        });

        // Determine resource type based on file type
        const isPDF = req.file.mimetype === 'application/pdf';
        const resourceType = isPDF ? 'raw' : 'image';
        
        // Extract file extension from original filename
        const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase() || '';
        const hasValidExtension = fileExtension && ['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(fileExtension);
        
        // Generate public_id with extension for PDFs
        const basePublicId = `quickaccess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const publicId = isPDF && hasValidExtension 
            ? `${basePublicId}.${fileExtension}`
            : (isPDF ? `${basePublicId}.pdf` : basePublicId);

        console.log('📄 [QUICK ACCESS UPLOAD] File type determined:', {
            isPDF: isPDF,
            resourceType: resourceType,
            mimetype: req.file.mimetype,
            originalName: req.file.originalname,
            fileExtension: fileExtension,
            publicId: publicId
        });

        // Upload to Cloudinary
        const cloudinaryResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: resourceType,
                    folder: 'swagat-odisha/quick-access',
                    public_id: publicId,
                    use_filename: false, // We're setting public_id manually
                    unique_filename: false, // We're setting public_id manually
                    timeout: 60000 // Cloudinary timeout
                },
                (error, result) => {
                    if (error) {
                        console.error('❌ Cloudinary upload error:', error);
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

        console.log('✅ Quick access file uploaded to Cloudinary:', cloudinaryResult.secure_url);
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

