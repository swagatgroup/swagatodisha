const Notification = require('../models/Notification');

// Get user notifications
const getUserNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        const userId = req.user._id;

        let query = { recipient: userId };

        if (unreadOnly === 'true') {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .populate('sender', 'fullName email role')
            .populate('relatedDocument', 'originalName documentType status')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.getUnreadCount(userId);

        res.status(200).json({
            success: true,
            data: {
                notifications,
                unreadCount,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get user notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notifications',
            error: error.message
        });
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;

        const notification = await Notification.markAsRead(notificationId, userId);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: notification
        });
    } catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.markAllAsRead(userId);

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark all notifications as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read',
            error: error.message
        });
    }
};

// Get unread count
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;

        const unreadCount = await Notification.getUnreadCount(userId);

        res.status(200).json({
            success: true,
            data: { unreadCount }
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count',
            error: error.message
        });
    }
};

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            recipient: userId
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
            error: error.message
        });
    }
};

// Create notification (admin only)
const createNotification = async (req, res) => {
    try {
        const { recipient, type, title, message, priority = 'medium', actionUrl, metadata } = req.body;

        // Validate admin permissions
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can create notifications'
            });
        }

        const notification = await Notification.createNotification({
            recipient,
            sender: req.user._id,
            type,
            title,
            message,
            priority,
            actionUrl,
            metadata
        });

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: notification
        });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification',
            error: error.message
        });
    }
};

module.exports = {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification,
    createNotification
};
