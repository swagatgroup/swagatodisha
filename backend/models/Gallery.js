const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    // Basic information
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    alt: String,

    // Image details
    imageUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: String,
    originalFileName: String,
    fileSize: Number,
    mimeType: String,
    dimensions: {
        width: Number,
        height: Number
    },

    // Categorization
    category: {
        type: String,
        required: true,
        enum: ['Infrastructure', 'Classroom', 'Laboratory', 'Library', 'Sports', 'Events', 'Students', 'Teachers', 'Achievements', 'General']
    },
    subcategory: String,
    tags: [String],

    // Institution association
    institution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution'
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },

    // Display settings
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    showOnHomepage: {
        type: Boolean,
        default: false
    },

    // Album/Collection
    album: {
        name: String,
        description: String,
        coverImage: Boolean
    },

    // SEO
    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],

    // Analytics
    views: {
        type: Number,
        default: 0
    },
    downloads: {
        type: Number,
        default: 0
    },

    // Timestamps
    lastModified: {
        type: Date,
        default: Date.now
    },
    uploadedBy: {
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
gallerySchema.index({ category: 1, isActive: 1 });
gallerySchema.index({ institution: 1, isActive: 1 });
gallerySchema.index({ isFeatured: 1, isActive: 1 });
gallerySchema.index({ displayOrder: 1 });
gallerySchema.index({ 'album.name': 1 });

// Virtual for image dimensions ratio
gallerySchema.virtual('aspectRatio').get(function () {
    if (this.dimensions && this.dimensions.width && this.dimensions.height) {
        return this.dimensions.width / this.dimensions.height;
    }
    return null;
});

// Virtual for file size in human readable format
gallerySchema.virtual('fileSizeFormatted').get(function () {
    if (!this.fileSize) return null;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
    return Math.round(this.fileSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

module.exports = mongoose.model('Gallery', gallerySchema);
