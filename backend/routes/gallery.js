const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { acceptGalleryImages, processGalleryImages } = require('../middleware/galleryUpload');

// Only staff and super admins manage the website gallery
const canManageGallery = authorize('super_admin', 'staff');
const {
    getGalleryItems,
    getGalleryItemById,
    createGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    getPublicGalleryItems,
    getGalleryItemsByCategory,
    getFeaturedGalleryItems,
    getGalleryStats,
    approveGalleryItem,
    incrementDownloadCount
} = require('../controllers/galleryController');

// Public routes
router.get('/public', getPublicGalleryItems);
router.get('/featured', getFeaturedGalleryItems);
router.get('/category/:category', getGalleryItemsByCategory);
router.get('/stats', getGalleryStats);
router.get('/:itemId', getGalleryItemById);
router.post('/:itemId/download', incrementDownloadCount);

// Protected routes (Admin only)
router.get('/', protect, canManageGallery, getGalleryItems);
router.post('/', protect, canManageGallery, acceptGalleryImages, processGalleryImages, createGalleryItem);
router.put('/:itemId', protect, canManageGallery, acceptGalleryImages, processGalleryImages, updateGalleryItem);
router.delete('/:itemId', protect, canManageGallery, deleteGalleryItem);


// Super Admin approval route
router.patch('/:itemId/approve', protect, authorize('super_admin'), approveGalleryItem);

module.exports = router;
