const express = require('express');
const router = express.Router();
const { protect, isStaff } = require('../middleware/auth');
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

// Protected routes (Admin/Staff only)
router.get('/', protect, isStaff, getNotifications);
router.post('/', protect, isStaff, upload.single('file'), uploadToCloudinary, createNotification);
router.put('/:notificationId', protect, isStaff, upload.single('file'), uploadToCloudinary, updateNotification);
router.delete('/:notificationId', protect, isStaff, deleteNotification);
router.put('/:notificationId/status', protect, isStaff, updateNotificationStatus);

module.exports = router;