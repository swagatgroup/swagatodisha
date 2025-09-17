const Notification = require('../models/Notification');

// Get all notifications
const getNotifications = async (req, res) => {
    try {
        const { type, category, status, targetAudience, search, page = 1, limit = 20 } = req.query;

        let query = {};

        if (type) {
            query.type = type;
        }

        if (category) {
            query.category = category;
        }

        if (status) {
            query.status = status;
        }

        if (targetAudience) {
            query.targetAudience = targetAudience;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } }
            ];
        }

        const notifications = await Notification.find(query)
            .populate('targetInstitutions', 'name type')
            .populate('targetCourses', 'name code')
            .populate('createdBy', 'name email')
            .sort({ publishDate: -1, priority: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Notification.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                notifications,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notifications',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get notification by ID
const getNotificationById = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findById(notificationId)
            .populate('targetInstitutions', 'name type')
            .populate('targetCourses', 'name code')
            .populate('createdBy', 'name email');

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Increment view count
        notification.views += 1;
        await notification.save();

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Get notification by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notification',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Create new notification
const createNotification = async (req, res) => {
    try {
        const notificationData = {
            ...req.body,
            createdBy: req.user._id,
            lastModified: new Date(),
            modifiedBy: req.user._id
        };

        const notification = new Notification(notificationData);
        await notification.save();

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
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update notification
const updateNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const updateData = {
            ...req.body,
            lastModified: new Date(),
            modifiedBy: req.user._id
        };

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification updated successfully',
            data: notification
        });
    } catch (error) {
        console.error('Update notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update notification',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndDelete(notificationId);

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
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update notification status
const updateNotificationStatus = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { status } = req.body;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            {
                status,
                lastModified: new Date(),
                modifiedBy: req.user._id
            },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification status updated successfully',
            data: notification
        });
    } catch (error) {
        console.error('Update notification status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update notification status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get public notifications (for website display)
const getPublicNotifications = async (req, res) => {
    try {
        const { limit = 10, category } = req.query;

        let query = {
            status: 'Published',
            isActive: true,
            $or: [
                { publishDate: { $lte: new Date() } },
                { publishDate: { $exists: false } }
            ]
        };

        if (category) {
            query.category = category;
        }

        const notifications = await Notification.find(query)
            .select('title shortDescription content type category priority isUrgent isImportant publishDate eventDate attachments image')
            .sort({ priority: -1, publishDate: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Get public notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get public notifications',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
    try {
        const totalNotifications = await Notification.countDocuments();
        const publishedNotifications = await Notification.countDocuments({ status: 'Published' });
        const draftNotifications = await Notification.countDocuments({ status: 'Draft' });
        const urgentNotifications = await Notification.countDocuments({ isUrgent: true });

        const byType = await Notification.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        const byCategory = await Notification.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        const byPriority = await Notification.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalNotifications,
                publishedNotifications,
                draftNotifications,
                urgentNotifications,
                byType,
                byCategory,
                byPriority
            }
        });
    } catch (error) {
        console.error('Get notification stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notification statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Increment click count
const incrementClickCount = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { $inc: { clicks: 1 } },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Click count incremented',
            data: { clicks: notification.clicks }
        });
    } catch (error) {
        console.error('Increment click count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to increment click count',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    getNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    deleteNotification,
    updateNotificationStatus,
    getPublicNotifications,
    getNotificationStats,
    incrementClickCount
};