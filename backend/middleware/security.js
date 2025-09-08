const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const { body, validationResult } = require('express-validator');

// Advanced rate limiting configurations
const createRateLimit = (windowMs, max, message, skipSuccessfulRequests = false) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message,
            retryAfter: Math.ceil(windowMs / 1000)
        },
        skipSuccessfulRequests,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                success: false,
                message,
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }
    });
};

// Specific rate limits for different endpoints
const authRateLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // 5 attempts
    'Too many authentication attempts, please try again later',
    true
);

const uploadRateLimit = createRateLimit(
    60 * 60 * 1000, // 1 hour
    20, // 20 uploads per hour
    'Upload limit exceeded, please try again later'
);

const apiRateLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per 15 minutes
    'Too many requests, please slow down'
);

const passwordResetRateLimit = createRateLimit(
    60 * 60 * 1000, // 1 hour
    3, // 3 password reset attempts per hour
    'Password reset limit exceeded, please try again later'
);

// Security headers configuration
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "ws:", "wss:"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    const sanitizeObject = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                // Remove potentially dangerous characters
                obj[key] = obj[key]
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/on\w+\s*=/gi, '')
                    .trim();
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitizeObject(obj[key]);
            }
        }
    };

    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);

    next();
};

// Advanced validation rules
const validationRules = {
    email: body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    password: body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

    phoneNumber: body('phoneNumber')
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),

    fullName: body('fullName')
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Full name can only contain letters and spaces'),

    documentType: body('documentType')
        .isIn([
            'Aadhar Card', 'PAN Card', '10th Marksheet', '12th Marksheet',
            'Graduation Certificate', 'Post-Graduation Certificate',
            'Transfer Certificate (TC)', 'Migration Certificate', 'Character Certificate',
            'Passport Size Photo', 'Signature', 'Other'
        ])
        .withMessage('Invalid document type'),

    remarks: body('remarks')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Remarks cannot exceed 500 characters')
        .escape()
        .withMessage('Remarks contain invalid characters')
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }
    next();
};

// File upload security validation
const validateFileUpload = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
    ];

    const maxFileSize = 10 * 1024 * 1024; // 10MB

    // Check file type
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid file type. Only PDF, JPEG, PNG, and WebP files are allowed'
        });
    }

    // Check file size
    if (req.file.size > maxFileSize) {
        return res.status(400).json({
            success: false,
            message: 'File size too large. Maximum size is 10MB'
        });
    }

    // Check file extension
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    const fileExtension = req.file.originalname.toLowerCase().substring(req.file.originalname.lastIndexOf('.'));

    if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid file extension'
        });
    }

    next();
};

// SQL injection prevention
const preventSQLInjection = (req, res, next) => {
    const sqlInjectionPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
        /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
        /(\b(OR|AND)\s+'.*?'\s*=\s*'.*?')/gi,
        /(\b(OR|AND)\s+".*?"\s*=\s*".*?")/gi,
        /(UNION\s+SELECT)/gi,
        /(DROP\s+TABLE)/gi,
        /(DELETE\s+FROM)/gi,
        /(INSERT\s+INTO)/gi,
        /(UPDATE\s+SET)/gi
    ];

    const checkForSQLInjection = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                for (const pattern of sqlInjectionPatterns) {
                    if (pattern.test(obj[key])) {
                        return true;
                    }
                }
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (checkForSQLInjection(obj[key])) {
                    return true;
                }
            }
        }
        return false;
    };

    if (req.body && checkForSQLInjection(req.body)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid input detected'
        });
    }

    if (req.query && checkForSQLInjection(req.query)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid input detected'
        });
    }

    next();
};

// XSS prevention
const preventXSS = (req, res, next) => {
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
        /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
        /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
        /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi
    ];

    const checkForXSS = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                for (const pattern of xssPatterns) {
                    if (pattern.test(obj[key])) {
                        return true;
                    }
                }
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (checkForXSS(obj[key])) {
                    return true;
                }
            }
        }
        return false;
    };

    if (req.body && checkForXSS(req.body)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid input detected'
        });
    }

    if (req.query && checkForXSS(req.query)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid input detected'
        });
    }

    next();
};

// Request logging for security monitoring
const securityLogger = (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logData = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user ? req.user._id : null
        };

        // Log suspicious activities
        if (res.statusCode >= 400) {
            console.warn('Security Warning:', logData);
        }

        // Log all requests in production
        if (process.env.NODE_ENV === 'production') {
            console.log('Request Log:', logData);
        }
    });

    next();
};

// IP whitelist middleware (for admin functions)
const ipWhitelist = (allowedIPs) => {
    return (req, res, next) => {
        const clientIP = req.ip || req.connection.remoteAddress;

        if (allowedIPs.includes(clientIP)) {
            next();
        } else {
            res.status(403).json({
                success: false,
                message: 'Access denied from this IP address'
            });
        }
    };
};

// Session security middleware
const sessionSecurity = (req, res, next) => {
    // Check for session hijacking indicators
    if (req.user) {
        const userAgent = req.get('User-Agent');
        const ip = req.ip || req.connection.remoteAddress;

        // Store session fingerprint for validation
        req.sessionFingerprint = {
            userAgent: userAgent,
            ip: ip,
            timestamp: Date.now()
        };
    }

    next();
};

module.exports = {
    // Rate limiting
    authRateLimit,
    uploadRateLimit,
    apiRateLimit,
    passwordResetRateLimit,

    // Security headers
    securityHeaders,

    // Input validation
    sanitizeInput,
    validationRules,
    handleValidationErrors,
    validateFileUpload,

    // Security prevention
    preventSQLInjection,
    preventXSS,

    // Monitoring
    securityLogger,

    // Access control
    ipWhitelist,
    sessionSecurity
};
