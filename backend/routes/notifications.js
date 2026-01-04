const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    deleteNotification,
    updateNotificationStatus,
    getPublicNotifications,
    getNotificationStats,
    incrementClickCount
} = require('../controllers/notificationController');
const { upload, uploadToCloudinary } = require('../middleware/notificationUpload');

// Public routes
router.get('/public', getPublicNotifications);
router.get('/stats', getNotificationStats);
router.get('/:notificationId', getNotificationById);
router.post('/:notificationId/click', incrementClickCount);

// Protected routes (Admin only)
router.get('/', protect, getNotifications);
router.post('/', protect, upload.single('file'), uploadToCloudinary, createNotification);
router.put('/:notificationId', protect, upload.single('file'), uploadToCloudinary, updateNotification);
router.delete('/:notificationId', protect, deleteNotification);
router.put('/:notificationId/status', protect, updateNotificationStatus);

module.exports = router;