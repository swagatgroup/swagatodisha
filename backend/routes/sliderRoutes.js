const express = require('express');
const router = express.Router();
const {
    getSliders,
    getSlider,
    createSlider,
    updateSlider,
    deleteSlider,
    reorderSliders
} = require('../controllers/sliderController');
const { protect, authorize } = require('../middleware/auth');
const { upload, optimizeSliderImage } = require('../middleware/sliderUpload');
const { asyncHandler } = require('../middleware/errorHandler');

// Public route - Get active sliders for homepage
router.get('/public', asyncHandler(async (req, res) => {
    const Slider = require('../models/Slider');

    // Only get active sliders
    const sliders = await Slider.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .select('-createdBy -updatedBy'); // Exclude populated fields for public access

    res.status(200).json({
        success: true,
        count: sliders.length,
        data: sliders
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
router.get('/', getSliders);
router.get('/:id', getSlider);
router.post(
    '/',
    isSuperAdminOrStaff,
    upload.single('image'),
    optimizeSliderImage,
    createSlider
);
router.put(
    '/:id',
    isSuperAdminOrStaff,
    upload.single('image'),
    optimizeSliderImage,
    updateSlider
);
router.delete('/:id', isSuperAdminOrStaff, deleteSlider);
router.put('/reorder', isSuperAdminOrStaff, reorderSliders);

module.exports = router;

