const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
        trim: true,
        maxlength: [255, 'File name cannot exceed 255 characters']
    },
    originalName: {
        type: String,
        required: true,
        trim: true,
        maxlength: [255, 'Original name cannot exceed 255 characters']
    },
    fileUrl: {
        type: String,
        required: true,
        trim: true
    },
    fileSize: {
        type: Number,
        required: true,
        min: [0, 'File size cannot be negative']
    },
    mimeType: {
        type: String,
        required: true,
        trim: true
    },
    uploadedBy: {
        type: String,
        trim: true,
        maxlength: [100, 'Uploaded by cannot exceed 100 characters']
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [50, 'Each tag cannot exceed 50 characters']
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    downloadCount: {
        type: Number,
        default: 0,
        min: [0, 'Download count cannot be negative']
    },
    metadata: {
        width: Number,
        height: Number,
        duration: Number, // for video/audio files
        pages: Number, // for PDF files
        author: String,
        title: String,
        description: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Add indexes for better performance
fileSchema.index({ uploadedBy: 1 });
fileSchema.index({ createdAt: -1 });
fileSchema.index({ mimeType: 1 });
fileSchema.index({ isPublic: 1 });
fileSchema.index({ isActive: 1 });
fileSchema.index({ tags: 1 });

// Compound indexes for common queries
fileSchema.index({ uploadedBy: 1, isActive: 1 });
fileSchema.index({ isPublic: 1, isActive: 1 });
fileSchema.index({ mimeType: 1, isActive: 1 });

// Virtual for formatted file size
fileSchema.virtual('formattedFileSize').get(function () {
    const bytes = this.fileSize;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for file extension
fileSchema.virtual('fileExtension').get(function () {
    return this.originalName.split('.').pop().toLowerCase();
});

// Virtual for file type category
fileSchema.virtual('fileCategory').get(function () {
    const mimeType = this.mimeType.toLowerCase();

    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'document';
    if (mimeType.startsWith('text/')) return 'text';
    if (mimeType.includes('word') || mimeType.includes('excel') || mimeType.includes('powerpoint')) return 'office';

    return 'other';
});

// Instance methods
fileSchema.methods.incrementDownloadCount = function () {
    this.downloadCount += 1;
    return this.save();
};

fileSchema.methods.togglePublic = function () {
    this.isPublic = !this.isPublic;
    return this.save();
};

fileSchema.methods.addTag = function (tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
        return this.save();
    }
    return Promise.resolve(this);
};

fileSchema.methods.removeTag = function (tag) {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
};

// Static methods
fileSchema.statics.getByUploader = function (uploadedBy, options = {}) {
    const query = { uploadedBy, isActive: true };
    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 50)
        .skip(options.skip || 0);
};

fileSchema.statics.getByMimeType = function (mimeType, options = {}) {
    const query = { mimeType, isActive: true };
    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 50)
        .skip(options.skip || 0);
};

fileSchema.statics.getPublicFiles = function (options = {}) {
    const query = { isPublic: true, isActive: true };
    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 50)
        .skip(options.skip || 0);
};

fileSchema.statics.searchFiles = function (searchTerm, options = {}) {
    const query = {
        isActive: true,
        $or: [
            { originalName: { $regex: searchTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
    };

    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 50)
        .skip(options.skip || 0);
};

fileSchema.statics.getStorageStats = function () {
    return this.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: null,
                totalFiles: { $sum: 1 },
                totalSize: { $sum: '$fileSize' },
                averageSize: { $avg: '$fileSize' }
            }
        }
    ]);
};

// Ensure virtual fields are serialized
fileSchema.set('toJSON', { virtuals: true });
fileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('File', fileSchema);
