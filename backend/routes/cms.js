const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllContent,
    getContent,
    createContent,
    updateContent,
    deleteContent,
    publishContent,
    unpublishContent,
    getContentStats,
    bulkAction,
    getPublicContent
} = require('../controllers/cmsController');

// Public routes (no authentication required)
router.get('/public', getPublicContent);

// Protected routes (require authentication)
router.use(protect);

// Content management routes
router.get('/', authorize('staff', 'super_admin'), getAllContent);
router.get('/stats', authorize('staff', 'super_admin'), getContentStats);
router.get('/:id', authorize('staff', 'super_admin'), getContent);
router.post('/', authorize('staff', 'super_admin'), createContent);
router.put('/:id', authorize('staff', 'super_admin'), updateContent);
router.delete('/:id', authorize('staff', 'super_admin'), deleteContent);

// Publishing routes
router.post('/:id/publish', authorize('staff', 'super_admin'), publishContent);
router.post('/:id/unpublish', authorize('staff', 'super_admin'), unpublishContent);

// Bulk operations
router.post('/bulk-action', authorize('staff', 'super_admin'), bulkAction);

module.exports = router;
