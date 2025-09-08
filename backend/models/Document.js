const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    // Document Identification
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Document Details
    documentType: {
        type: String,
        required: true,
        enum: [
            'aadhar_card',
            'birth_certificate',
            'marksheet_10th',
            'marksheet_12th',
            'transfer_certificate',
            'migration_certificate',
            'character_certificate',
            'passport_photo',
            'guardian_id',
            'income_certificate',
            'caste_certificate',
            'medical_certificate',
            'other'
        ]
    },

    documentName: {
        type: String,
        required: true,
        maxlength: [200, 'Document name cannot exceed 200 characters']
    },

    // File Information
    fileName: {
        type: String,
        required: true
    },

    filePath: {
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

    // Document Status
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected', 'needs_revision'],
        default: 'pending'
    },

    // Review Information
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    reviewedAt: {
        type: Date,
        default: null
    },

    staffRemarks: {
        type: String,
        maxlength: [500, 'Staff remarks cannot exceed 500 characters'],
        default: ''
    },

    rejectionReason: {
        type: String,
        maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
        default: ''
    },

    // Document Processing
    isProcessed: {
        type: Boolean,
        default: false
    },

    processedAt: {
        type: Date,
        default: null
    },

    // PDF Processing
    pdfPath: {
        type: String,
        default: null
    },

    isPdfGenerated: {
        type: Boolean,
        default: false
    },

    // Version Control
    version: {
        type: Number,
        default: 1
    },

    previousVersions: [{
        fileName: String,
        filePath: String,
        uploadedAt: Date,
        status: String
    }],

    // Metadata
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    uploadedAt: {
        type: Date,
        default: Date.now
    },

    lastModified: {
        type: Date,
        default: Date.now
    },

    // Security
    isSecure: {
        type: Boolean,
        default: true
    },

    accessLevel: {
        type: String,
        enum: ['public', 'staff_only', 'admin_only'],
        default: 'staff_only'
    }
}, {
    timestamps: true
});

// Indexes for better performance
documentSchema.index({ student: 1, documentType: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ reviewedBy: 1 });
documentSchema.index({ uploadedAt: -1 });

// Virtual for document URL
documentSchema.virtual('documentUrl').get(function () {
    return `/api/documents/${this._id}/download`;
});

// Virtual for thumbnail URL
documentSchema.virtual('thumbnailUrl').get(function () {
    return `/api/documents/${this._id}/thumbnail`;
});

// Pre-save middleware
documentSchema.pre('save', function (next) {
    this.lastModified = new Date();
    next();
});

// Instance methods
documentSchema.methods.approve = function (reviewedBy, remarks = '') {
    this.status = 'approved';
    this.reviewedBy = reviewedBy;
    this.reviewedAt = new Date();
    this.staffRemarks = remarks;
    return this.save();
};

documentSchema.methods.reject = function (reviewedBy, reason) {
    this.status = 'rejected';
    this.reviewedBy = reviewedBy;
    this.reviewedAt = new Date();
    this.rejectionReason = reason;
    return this.save();
};

documentSchema.methods.requestRevision = function (reviewedBy, remarks) {
    this.status = 'needs_revision';
    this.reviewedBy = reviewedBy;
    this.reviewedAt = new Date();
    this.staffRemarks = remarks;
    return this.save();
};

documentSchema.methods.markAsProcessed = function () {
    this.isProcessed = true;
    this.processedAt = new Date();
    return this.save();
};

// Static methods
documentSchema.statics.getByStudent = function (studentId) {
    return this.find({ student: studentId }).sort({ uploadedAt: -1 });
};

documentSchema.statics.getByStatus = function (status) {
    return this.find({ status }).populate('student', 'fullName email');
};

documentSchema.statics.getPendingDocuments = function () {
    return this.find({ status: 'pending' }).populate('student', 'fullName email phoneNumber');
};

documentSchema.statics.getApprovedDocuments = function (studentId) {
    return this.find({
        student: studentId,
        status: 'approved'
    }).sort({ documentType: 1 });
};

// Ensure virtual fields are serialized
documentSchema.set('toJSON', { virtuals: true });
documentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Document', documentSchema);
