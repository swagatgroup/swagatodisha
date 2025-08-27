const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    // Content Identification
    section: {
        type: String,
        required: [true, 'Section name is required'],
        enum: [
            'hero',
            'about_us',
            'institutions',
            'programs',
            'management',
            'gallery',
            'contact',
            'footer',
            'announcements',
            'testimonials',
            'achievements',
            'facilities'
        ]
    },

    // Content Type
    contentType: {
        type: String,
        required: [true, 'Content type is required'],
        enum: ['text', 'image', 'video', 'document', 'link', 'mixed']
    },

    // Content Data
    title: {
        type: String,
        required: [true, 'Title is required'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },

    subtitle: {
        type: String,
        maxlength: [300, 'Subtitle cannot exceed 300 characters']
    },

    description: {
        type: String,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },

    content: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Content is required']
    },

    // Media Files
    media: {
        images: [{
            url: String,
            alt: String,
            caption: String,
            order: Number
        }],
        videos: [{
            url: String,
            title: String,
            description: String,
            thumbnail: String,
            duration: String
        }],
        documents: [{
            url: String,
            name: String,
            type: String,
            size: Number
        }]
    },

    // Styling and Layout
    styling: {
        backgroundColor: String,
        textColor: String,
        fontSize: String,
        fontWeight: String,
        alignment: {
            type: String,
            enum: ['left', 'center', 'right', 'justify'],
            default: 'left'
        },
        customCSS: String
    },

    // Display Settings
    isActive: {
        type: Boolean,
        default: true
    },

    displayOrder: {
        type: Number,
        default: 0
    },

    startDate: {
        type: Date,
        default: Date.now
    },

    endDate: {
        type: Date,
        default: null
    },

    // SEO and Meta
    seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String],
        canonicalUrl: String
    },

    // Links and Navigation
    links: [{
        text: String,
        url: String,
        target: {
            type: String,
            enum: ['_self', '_blank', '_parent', '_top'],
            default: '_self'
        },
        order: Number
    }],

    // Dynamic Content (for forms, lists, etc.)
    dynamicContent: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Version Control
    version: {
        type: Number,
        default: 1
    },

    previousVersions: [{
        content: mongoose.Schema.Types.Mixed,
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        changedAt: {
            type: Date,
            default: Date.now
        },
        changeReason: String
    }],

    // Audit Fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    lastPublished: {
        type: Date,
        default: null
    },

    publishedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for content status
contentSchema.virtual('isPublished').get(function () {
    return this.lastPublished !== null;
});

// Virtual for content age
contentSchema.virtual('contentAge').get(function () {
    const now = new Date();
    const diffTime = Math.abs(now - this.updatedAt);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to handle versioning
contentSchema.pre('save', function (next) {
    if (this.isModified('content') || this.isModified('title') || this.isModified('description')) {
        // Store previous version
        if (this.previousVersions.length >= 10) {
            this.previousVersions.shift(); // Remove oldest version
        }

        this.previousVersions.push({
            content: this.content,
            changedBy: this.updatedBy,
            changeReason: 'Content updated'
        });

        this.version += 1;
    }
    next();
});

// Indexes
contentSchema.index({ section: 1, isActive: 1 });
contentSchema.index({ contentType: 1 });
contentSchema.index({ displayOrder: 1 });
contentSchema.index({ startDate: 1, endDate: 1 });
contentSchema.index({ 'seo.keywords': 1 });

// Static methods
contentSchema.statics.findBySection = function (section, activeOnly = true) {
    const query = { section };
    if (activeOnly) {
        query.isActive = true;
        query.$or = [
            { endDate: null },
            { endDate: { $gt: new Date() } }
        ];
    }
    return this.find(query).sort({ displayOrder: 1, createdAt: -1 });
};

contentSchema.statics.findActiveContent = function () {
    const now = new Date();
    return this.find({
        isActive: true,
        $or: [
            { endDate: null },
            { endDate: { $gt: now } }
        ]
    }).sort({ section: 1, displayOrder: 1 });
};

contentSchema.statics.findByContentType = function (contentType) {
    return this.find({ contentType, isActive: true });
};

// Instance methods
contentSchema.methods.publish = function (publishedBy) {
    this.lastPublished = new Date();
    this.publishedBy = publishedBy;
    return this.save();
};

contentSchema.methods.duplicate = function (createdBy) {
    const duplicate = new this.constructor({
        ...this.toObject(),
        _id: undefined,
        version: 1,
        previousVersions: [],
        createdAt: undefined,
        updatedAt: undefined,
        lastPublished: undefined,
        publishedBy: undefined,
        createdBy,
        updatedBy: createdBy
    });

    duplicate.title = `${this.title} (Copy)`;
    return duplicate.save();
};

contentSchema.methods.revertToVersion = function (versionNumber, revertedBy) {
    const targetVersion = this.previousVersions.find(v => v.version === versionNumber);
    if (!targetVersion) {
        throw new Error('Version not found');
    }

    this.content = targetVersion.content;
    this.updatedBy = revertedBy;

    this.previousVersions.push({
        content: this.content,
        changedBy: revertedBy,
        changeReason: `Reverted to version ${versionNumber}`
    });

    return this.save();
};

module.exports = mongoose.model('Content', contentSchema);
