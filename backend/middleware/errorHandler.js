// Global error handling middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging
    console.error('Error:', err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = {
            message,
            statusCode: 404,
            error: 'NOT_FOUND'
        };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = {
            message,
            statusCode: 400,
            error: 'DUPLICATE_FIELD'
        };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = {
            message,
            statusCode: 400,
            error: 'VALIDATION_ERROR'
        };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = {
            message,
            statusCode: 401,
            error: 'INVALID_TOKEN'
        };
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = {
            message,
            statusCode: 401,
            error: 'TOKEN_EXPIRED'
        };
    }

    // AWS S3/R2 errors
    if (err.name === 'NoSuchBucket') {
        const message = 'Storage bucket not found';
        error = {
            message,
            statusCode: 500,
            error: 'STORAGE_ERROR'
        };
    }

    if (err.name === 'NoSuchKey') {
        const message = 'File not found in storage';
        error = {
            message,
            statusCode: 404,
            error: 'FILE_NOT_FOUND'
        };
    }

    if (err.name === 'AccessDenied') {
        const message = 'Access denied to storage resource';
        error = {
            message,
            statusCode: 403,
            error: 'ACCESS_DENIED'
        };
    }

    // Rate limiting errors
    if (err.statusCode === 429) {
        const message = 'Too many requests, please try again later';
        error = {
            message,
            statusCode: 429,
            error: 'RATE_LIMIT_EXCEEDED'
        };
    }

    // File upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        const message = 'File too large';
        error = {
            message,
            statusCode: 400,
            error: 'FILE_TOO_LARGE'
        };
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        const message = 'Too many files';
        error = {
            message,
            statusCode: 400,
            error: 'TOO_MANY_FILES'
        };
    }

    if (err.code === 'INVALID_FILE_TYPE') {
        const message = 'Invalid file type';
        error = {
            message,
            statusCode: 400,
            error: 'INVALID_FILE_TYPE'
        };
    }

    // Default error response
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    const errorCode = error.error || 'INTERNAL_ERROR';

    // Don't send error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(statusCode).json({
        success: false,
        message,
        error: errorCode,
        ...(isDevelopment && { stack: err.stack, details: err })
    });
};

// 404 handler for undefined routes
const notFound = (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    error.error = 'ROUTE_NOT_FOUND';
    next(error);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    errorHandler,
    notFound,
    asyncHandler
};
