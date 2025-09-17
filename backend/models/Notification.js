const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // Basic information
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        maxlength: 200
    },

    // Notification type
    type: {
        type: String,
        required: true,
        enum: ['General', 'Academic', 'Admission', 'Exam', 'Result', 'Holiday', 'Event', 'Emergency', 'Maintenance']
    },
    category: {
        type: String,
        enum: ['Timetable', 'Result', 'Notification', 'Announcement', 'Alert']
    },

    // Target audience
    targetAudience: {
        type: String,
        required: true,
        enum: ['All', 'Students', 'Parents', 'Teachers', 'Staff', 'Agents', 'Public']
    },
    targetInstitutions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution'
    }],
    targetCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],

    // Priority and importance
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    isUrgent: {
        type: Boolean,
        default: false
    },
    isImportant: {
        type: Boolean,
        default: false
    },

    // Media and attachments
    attachments: [{
        name: String,
        url: String,
        type: String,
        size: Number
    }],
    image: String,
    pdfDocument: String,

    // Dates
    publishDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: Date,
    eventDate: Date,

    // Status
    status: {
        type: String,
        enum: ['Draft', 'Published', 'Archived', 'Expired'],
        default: 'Draft'
    },
    isActive: {
        type: Boolean,
        default: true
    },

    // Display settings
    displayOrder: {
        type: Number,
        default: 0
    },
    showOnHomepage: {
        type: Boolean,
        default: false
    },
    showInQuickLinks: {
        type: Boolean,
        default: false
    },

    // Analytics
    views: {
        type: Number,
        default: 0
    },
    clicks: {
        type: Number,
        default: 0
    },

    // SEO
    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],

    // Timestamps
    lastModified: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Indexes
notificationSchema.index({ type: 1, status: 1, isActive: 1 });
notificationSchema.index({ targetAudience: 1, status: 1 });
notificationSchema.index({ publishDate: -1 });
notificationSchema.index({ priority: 1, isUrgent: 1 });

// Virtual for formatted publish date
notificationSchema.virtual('formattedPublishDate').get(function () {
    return this.publishDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Virtual for time until expiry
notificationSchema.virtual('timeUntilExpiry').get(function () {
    if (!this.expiryDate) return null;
    const now = new Date();
    const expiry = new Date(this.expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

module.exports = mongoose.model('Notification', notificationSchema);