const express = require('express');
const router = express.Router();
const {
    getCampuses,
    getCampus,
    createCampus,
    updateCampus,
    deleteCampus,
    getPublicCampuses
} = require('../controllers/campusController');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Public route - Get active campuses for registration form
router.get('/public', getPublicCampuses);

// All other routes require authentication
router.use(protect);

// Apply role-based access control for write operations
const isSuperAdminOrStaff = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'User not authenticated'
        });
    }
    if (!['super_admin', 'staff'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Super Admin or Staff only.'
        });
    }
    next();
};

// Campus routes (can be filtered by college via query param)
router.get('/', getCampuses);
router.get('/:id', getCampus);

module.exports = router;

