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

// Public route - Get active documents for homepage
router.get('/public', async (req, res) => {
    // Override query to only get active documents
    req.query.isActive = 'true';
    return getQuickAccessDocs(req, res);
});

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

