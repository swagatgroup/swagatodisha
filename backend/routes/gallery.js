const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
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
router.get('/', protect, getGalleryItems);
router.post('/', protect, createGalleryItem);
router.put('/:itemId', protect, updateGalleryItem);
router.delete('/:itemId', protect, deleteGalleryItem);

module.exports = router;
