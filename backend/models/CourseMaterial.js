const mongoose = require('mongoose');

const courseMaterialSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    type: {
        type: String,
        required: true,
        enum: [
            'lecture_notes',
            'textbook',
            'video',
            'audio',
            'presentation',
            'assignment',
            'exam_paper',
            'reference_material',
            'other'
        ]
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true,
        maxlength: [100, 'Subject cannot exceed 100 characters']
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    tags: [String],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better performance
courseMaterialSchema.index({ student: 1, type: 1 });
courseMaterialSchema.index({ subject: 1 });
courseMaterialSchema.index({ uploadDate: -1 });
courseMaterialSchema.index({ tags: 1 });

// Virtual for formatted file size
courseMaterialSchema.virtual('formattedFileSize').get(function () {
    const bytes = this.fileSize;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for file icon
courseMaterialSchema.virtual('fileIcon').get(function () {
    const iconMap = {
        'lecture_notes': '📝',
        'textbook': '📚',
        'video': '🎥',
        'audio': '🎵',
        'presentation': '📊',
        'assignment': '📋',
        'exam_paper': '📄',
        'reference_material': '📖',
        'other': '📎'
    };
    return iconMap[this.type] || '📎';
});

// Instance methods
courseMaterialSchema.methods.incrementDownload = function () {
    this.downloadCount += 1;
    return this.save();
};

// Static methods
courseMaterialSchema.statics.getByStudent = function (studentId) {
    return this.find({ student: studentId, isActive: true }).sort({ uploadDate: -1 });
};

courseMaterialSchema.statics.getByType = function (type) {
    return this.find({ type, isActive: true })
        .populate('student', 'fullName email')
        .populate('uploadedBy', 'fullName')
        .sort({ uploadDate: -1 });
};

courseMaterialSchema.statics.getBySubject = function (subject) {
    return this.find({ subject, isActive: true })
        .populate('student', 'fullName email')
        .populate('uploadedBy', 'fullName')
        .sort({ uploadDate: -1 });
};

courseMaterialSchema.statics.getPublicMaterials = function () {
    return this.find({ isPublic: true, isActive: true })
        .populate('uploadedBy', 'fullName')
        .sort({ uploadDate: -1 });
};

// Ensure virtual fields are serialized
courseMaterialSchema.set('toJSON', { virtuals: true });
courseMaterialSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CourseMaterial', courseMaterialSchema);
