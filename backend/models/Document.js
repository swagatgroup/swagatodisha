const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['educational', 'identity', 'income', 'category', 'medical', 'other'],
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    originalName: {
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
    filePath: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        default: null
    },
    remarks: {
        type: String,
        default: null
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for better performance
documentSchema.index({ student: 1, status: 1 });
documentSchema.index({ category: 1, status: 1 });
documentSchema.index({ uploadedAt: -1 });
documentSchema.index({ reviewedAt: -1 });

// Instance methods
documentSchema.methods.approve = function (reviewedBy, remarks) {
    this.status = 'approved';
    this.reviewedBy = reviewedBy;
    this.reviewedAt = new Date();
    this.remarks = remarks;
    return this.save();
};

documentSchema.methods.reject = function (reviewedBy, reason, remarks) {
    this.status = 'rejected';
    this.rejectionReason = reason;
    this.reviewedBy = reviewedBy;
    this.reviewedAt = new Date();
    this.remarks = remarks;
    return this.save();
};

// Static methods
documentSchema.statics.getByStatus = function (status) {
    return this.find({ status }).populate('student', 'personalDetails.fullName studentId');
};

documentSchema.statics.getByStudent = function (studentId) {
    return this.find({ student: studentId }).sort({ uploadedAt: -1 });
};

documentSchema.statics.getByCategory = function (category) {
    return this.find({ category }).populate('student', 'personalDetails.fullName studentId');
};

documentSchema.statics.getPendingCount = function () {
    return this.countDocuments({ status: 'pending' });
};

documentSchema.statics.getApprovedCount = function () {
    return this.countDocuments({ status: 'approved' });
};

documentSchema.statics.getRejectedCount = function () {
    return this.countDocuments({ status: 'rejected' });
};

module.exports = mongoose.model('Document', documentSchema);