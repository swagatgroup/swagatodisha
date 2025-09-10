const express = require('express');
const router = express.Router();
const {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification,
    createNotification
} = require('../controllers/notificationController');
const { protect, restrictTo } = require('../middleware/auth');

// Get user notifications
router.get('/', protect, getUserNotifications);

// Mark notification as read
router.put('/:notificationId/read', protect, markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', protect, markAllAsRead);

// Get unread count
router.get('/unread-count', protect, getUnreadCount);

// Delete notification
router.delete('/:notificationId', protect, deleteNotification);

// Create notification (admin only)
router.post('/create', protect, restrictTo('admin', 'super_admin'), createNotification);

module.exports = router;
