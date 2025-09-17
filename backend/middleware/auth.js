const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'swagat_odisha_jwt_secret_key_2024_development');

            // Get user from token - check both User and Admin models
            const userId = decoded.userId || decoded.id; // Support both userId and id
            let user = await User.findById(userId).select('-password');
            let userType = 'user';

            if (!user) {
                // Try Admin model
                const Admin = require('../models/Admin');
                user = await Admin.findById(userId).select('-password');
                userType = 'admin';
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'User account is deactivated'
                });
            }

            if (user.isLocked) {
                return res.status(401).json({
                    success: false,
                    message: 'User account is locked due to multiple failed login attempts'
                });
            }

            // Check if password was changed after token was issued
            if (user.changedPasswordAfter(decoded.iat)) {
                return res.status(401).json({
                    success: false,
                    message: 'User recently changed password! Please log in again'
                });
            }

            req.user = user;
            req.userType = userType;
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }
};

// Role-based access control
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }

        next();
    };
};

// Alias for restrictTo to maintain compatibility
const restrictTo = authorize;

// Specific role checks
const isStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Students only.'
        });
    }
    next();
};

const isAgent = (req, res, next) => {
    if (req.user.role !== 'agent') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Agents only.'
        });
    }
    next();
};

const isStaff = (req, res, next) => {
    if (!['staff', 'super_admin'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Staff and Super Admin only.'
        });
    }
    next();
};

const isSuperAdmin = (req, res, next) => {
    if (req.user.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Super Admin only.'
        });
    }
    next();
};

// Resource ownership check
const checkOwnership = (modelName) => {
    return async (req, res, next) => {
        try {
            const Model = require(`../models/${modelName}`);
            const resource = await Model.findById(req.params.id);

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }

            // Super admin can access everything
            if (req.user.role === 'super_admin') {
                req.resource = resource;
                return next();
            }

            // Staff can access resources they're assigned to or created
            if (req.user.role === 'staff') {
                if (resource.assignedStaff && resource.assignedStaff.equals(req.user._id)) {
                    req.resource = resource;
                    return next();
                }
                if (resource.createdBy && resource.createdBy.equals(req.user._id)) {
                    req.resource = resource;
                    return next();
                }
            }

            // Users can only access their own resources
            if (resource.user && resource.user.equals(req.user._id)) {
                req.resource = resource;
                return next();
            }

            if (resource.student && resource.student.equals(req.user._id)) {
                req.resource = resource;
                return next();
            }

            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only access your own resources.'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error checking resource ownership'
            });
        }
    };
};

// Rate limiting for specific actions
const rateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
    const attempts = new Map();

    return (req, res, next) => {
        const key = req.user ? req.user._id.toString() : req.ip;
        const now = Date.now();
        const userAttempts = attempts.get(key) || [];

        // Remove old attempts outside the window
        const recentAttempts = userAttempts.filter(timestamp => now - timestamp < windowMs);

        if (recentAttempts.length >= maxAttempts) {
            return res.status(429).json({
                success: false,
                message: 'Too many attempts. Please try again later.'
            });
        }

        recentAttempts.push(now);
        attempts.set(key, recentAttempts);

        next();
    };
};

// Check if user can modify sensitive fields
const canModifySensitiveFields = (req, res, next) => {
    const sensitiveFields = ['aadharNumber'];
    const hasSensitiveChanges = Object.keys(req.body).some(field =>
        sensitiveFields.includes(field)
    );

    if (hasSensitiveChanges && req.user.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Only Super Admin can modify sensitive fields like Aadhar number'
        });
    }

    next();
};

// Check if user can delete resources
const canDelete = (req, res, next) => {
    if (req.user.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Only Super Admin can delete resources'
        });
    }

    next();
};

module.exports = {
    protect,
    authorize,
    restrictTo,
    isStudent,
    isAgent,
    isStaff,
    isSuperAdmin,
    checkOwnership,
    rateLimit,
    canModifySensitiveFields,
    canDelete
};
