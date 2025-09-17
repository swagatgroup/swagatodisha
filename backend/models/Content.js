const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    // Basic Content Information
    title: {
        type: String,
        required: [true, 'Content title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        required: [true, 'Content slug is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    type: {
        type: String,
        required: [true, 'Content type is required'],
        enum: {
            values: ['page', 'section', 'announcement', 'news', 'event', 'gallery', 'course', 'institution', 'testimonial', 'faq', 'custom'],
            message: 'Invalid content type'
        }
    },
    category: {
        type: String,
        required: [true, 'Content category is required'],
        enum: {
            values: ['home', 'about', 'admissions', 'academics', 'institutions', 'gallery', 'news', 'events', 'contact', 'general'],
            message: 'Invalid content category'
        }
    },

    // Content Data
    content: {
        type: String,
        required: [true, 'Content body is required']
    },
    excerpt: {
        type: String,
        maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    featuredImage: {
        url: String,
        alt: String,
        caption: String
    },
    images: [{
        url: String,
        alt: String,
        caption: String,
        order: { type: Number, default: 0 }
    }],

    // SEO and Meta
    metaTitle: {
        type: String,
        maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
        type: String,
        maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [String],

    // Display Settings
    isPublished: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isSticky: {
        type: Boolean,
        default: false
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'draft'],
        default: 'draft'
    },

    // Publishing
    publishedAt: Date,
    scheduledAt: Date,
    expiresAt: Date,

    // Content Structure
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content',
        default: null
    },
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
    }],

    // Custom Fields
    customFields: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },

    // Content Settings
    allowComments: {
        type: Boolean,
        default: true
    },
    template: {
        type: String,
        default: 'default'
    },
    layout: {
        type: String,
        default: 'standard'
    },

    // Versioning
    version: {
        type: Number,
        default: 1
    },
    previousVersion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
    },
    changeLog: [{
        version: Number,
        changes: String,
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        changedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Analytics
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    shares: {
        type: Number,
        default: 0
    },

    // Author and Management
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
contentSchema.index({ slug: 1 });
contentSchema.index({ type: 1, category: 1 });
contentSchema.index({ isPublished: 1, visibility: 1 });
contentSchema.index({ publishedAt: -1 });
contentSchema.index({ displayOrder: 1 });
contentSchema.index({ author: 1 });
contentSchema.index({ createdAt: -1 });

// Virtual for URL
contentSchema.virtual('url').get(function () {
    return `/${this.slug}`;
});

// Virtual for full content with images
contentSchema.virtual('fullContent').get(function () {
    let fullContent = this.content;

    // Replace image placeholders with actual image URLs
    if (this.images && this.images.length > 0) {
        this.images.forEach((image, index) => {
            const placeholder = `{{image_${index}}}`;
            const imageTag = `<img src="${image.url}" alt="${image.alt || ''}" class="content-image" />`;
            fullContent = fullContent.replace(placeholder, imageTag);
        });
    }

    return fullContent;
});

// Pre-save middleware
contentSchema.pre('save', function (next) {
    // Update version if content changed
    if (this.isModified('content') || this.isModified('title')) {
        this.version += 1;
        this.updatedAt = new Date();
    }

    // Generate slug if not provided
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }

    // Set published date when publishing
    if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
        this.publishedAt = new Date();
    }

    next();
});

// Instance methods
contentSchema.methods.publish = function () {
    this.isPublished = true;
    this.visibility = 'public';
    this.publishedAt = new Date();
    return this.save();
};

contentSchema.methods.unpublish = function () {
    this.isPublished = false;
    this.visibility = 'draft';
    return this.save();
};

contentSchema.methods.addChangeLog = function (changes, changedBy) {
    this.changeLog.push({
        version: this.version,
        changes,
        changedBy,
        changedAt: new Date()
    });
    return this.save();
};

// Static methods
contentSchema.statics.findPublished = function (query = {}) {
    return this.find({
        ...query,
        isPublished: true,
        visibility: 'public'
    }).sort({ publishedAt: -1 });
};

contentSchema.statics.findByCategory = function (category) {
    return this.findPublished({ category });
};

contentSchema.statics.findByType = function (type) {
    return this.findPublished({ type });
};

contentSchema.statics.getFeatured = function (limit = 5) {
    return this.findPublished({ isFeatured: true }).limit(limit);
};

contentSchema.statics.search = function (searchTerm) {
    return this.findPublished({
        $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { content: { $regex: searchTerm, $options: 'i' } },
            { excerpt: { $regex: searchTerm, $options: 'i' } },
            { keywords: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
    });
};

module.exports = mongoose.model('Content', contentSchema);