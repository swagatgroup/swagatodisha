const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    type: {
        type: String,
        enum: [
            'document_upload',
            'document_approved',
            'document_rejected',
            'document_resubmission_required',
            'referral_new',
            'referral_approved',
            'system_update',
            'general'
        ],
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
        type: String,
        required: true,
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    relatedDocument: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    actionUrl: {
        type: String,
        default: null
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for better performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ priority: 1 });

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function () {
    const now = new Date();
    const diffInSeconds = Math.floor((now - this.createdAt) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return this.createdAt.toLocaleDateString();
});

// Static methods
notificationSchema.statics.createNotification = async function (notificationData) {
    try {
        const notification = new this(notificationData);
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

notificationSchema.statics.getUserNotifications = function (userId, limit = 50, skip = 0) {
    return this.find({ recipient: userId })
        .populate('sender', 'fullName email role')
        .populate('relatedDocument', 'originalName documentType status')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
};

notificationSchema.statics.markAsRead = function (notificationId, userId) {
    return this.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isRead: true },
        { new: true }
    );
};

notificationSchema.statics.markAllAsRead = function (userId) {
    return this.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
    );
};

notificationSchema.statics.getUnreadCount = function (userId) {
    return this.countDocuments({ recipient: userId, isRead: false });
};

// Instance methods
notificationSchema.methods.markAsRead = function () {
    this.isRead = true;
    return this.save();
};

// Ensure virtual fields are serialized
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);
