const express = require('express');
const router = express.Router();
const {
    getQuickAccessDocs,
    getQuickAccessDoc,
    createQuickAccessDoc,
    updateQuickAccessDoc,
    deleteQuickAccessDoc
} = require('../controllers/quickAccessController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/quickAccessUpload');
const { asyncHandler } = require('../middleware/errorHandler');

// Public route - Get active documents for homepage
router.get('/public', asyncHandler(async (req, res) => {
    const QuickAccess = require('../models/QuickAccess');

    // Only get active documents
    const documents = await QuickAccess.find({ isActive: true })
        .sort({ type: 1, order: 1, createdAt: -1 })
        .select('-createdBy -updatedBy'); // Exclude populated fields for public access

    res.status(200).json({
        success: true,
        count: documents.length,
        data: documents
    });
}));

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

// Routes
router.get('/', getQuickAccessDocs);
router.get('/:id', getQuickAccessDoc);
router.post(
    '/',
    isSuperAdminOrStaff,
    upload.single('file'),
    createQuickAccessDoc
);
router.put(
    '/:id',
    isSuperAdminOrStaff,
    upload.single('file'),
    updateQuickAccessDoc
);
router.delete('/:id', isSuperAdminOrStaff, deleteQuickAccessDoc);

module.exports = router;

