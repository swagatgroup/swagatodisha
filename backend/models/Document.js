const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    // Universal Document Upload (all user types can upload)
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uploadedByRole: {
        type: String,
        enum: ['student', 'agent', 'staff', 'admin', 'user'],
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Staff member assigned for verification
    },

    // Document Details
    documentType: {
        type: String,
        required: true,
        enum: [
            'Academic Certificates',
            'Identity Proof (Aadhar Card)',
            'Address Proof',
            'Income Certificate',
            'Caste Certificate',
            'Medical Certificate',
            'Transfer Certificate',
            'Character Certificate',
            'Passport Size Photos',
            'Bank Details',
            'Guardian Documents',
            'Other Certificates'
        ]
    },

    originalName: {
        type: String,
        required: true,
        maxlength: [200, 'Document name cannot exceed 200 characters']
    },

    // File Information
    fileName: {
        type: String,
        required: true
    },

    fileUrl: {
        type: String,
        required: true
    },
    storageType: {
        type: String,
        enum: ['mongodb', 'r2'],
        default: 'r2', // Documents are typically heavy, default to R2
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

    // Enhanced Document Status
    status: {
        type: String,
        enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMITTED'],
        default: 'PENDING'
    },

    // Enhanced Review System
    verificationHistory: [{
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reviewedByName: String,
        action: {
            type: String,
            enum: ['submitted', 'reviewed', 'approved', 'rejected', 'resubmission_requested']
        },
        remarks: String,
        timestamp: { type: Date, default: Date.now }
    }],

    currentRemarks: {
        type: String,
        maxlength: [1000, 'Current remarks cannot exceed 1000 characters'],
        default: ''
    },

    remarks: {
        message: String,
        isCustom: { type: Boolean, default: false },
        reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },

    submissionStage: {
        type: String,
        enum: ['DRAFT', 'SUBMITTED', 'FINAL'],
        default: 'DRAFT'
    },

    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },

    isActive: {
        type: Boolean,
        default: true
    },

    submissionDeadline: Date,

    resubmissionCount: {
        type: Number,
        default: 0
    },

    tags: [String],

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
        fileUrl: String,
        uploadedAt: Date,
        status: String
    }],

    // Metadata
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
documentSchema.index({ uploadedBy: 1, status: 1 });
documentSchema.index({ assignedTo: 1, uploadedAt: -1 });
documentSchema.index({ documentType: 1, status: 1 });
documentSchema.index({ submissionStage: 1, status: 1 });
documentSchema.index({ uploadedBy: 1, submissionStage: 1, status: 1 });

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
documentSchema.methods.approve = function (reviewedBy, reviewedByName, remarks = '') {
    this.status = 'approved';
    this.currentRemarks = remarks;
    this.verificationHistory.push({
        reviewedBy,
        reviewedByName,
        action: 'approved',
        remarks,
        timestamp: new Date()
    });
    return this.save();
};

documentSchema.methods.reject = function (reviewedBy, reviewedByName, reason) {
    this.status = 'rejected';
    this.currentRemarks = reason;
    this.verificationHistory.push({
        reviewedBy,
        reviewedByName,
        action: 'rejected',
        remarks: reason,
        timestamp: new Date()
    });
    return this.save();
};

documentSchema.methods.requestResubmission = function (reviewedBy, reviewedByName, remarks) {
    this.status = 'resubmission_required';
    this.currentRemarks = remarks;
    this.resubmissionCount += 1;
    this.verificationHistory.push({
        reviewedBy,
        reviewedByName,
        action: 'resubmission_requested',
        remarks,
        timestamp: new Date()
    });
    return this.save();
};

documentSchema.methods.markAsProcessed = function () {
    this.isProcessed = true;
    this.processedAt = new Date();
    return this.save();
};

// Static methods
documentSchema.statics.getByUser = function (userId) {
    return this.find({ uploadedBy: userId, isActive: true }).sort({ uploadedAt: -1 });
};

documentSchema.statics.getByStatus = function (status) {
    return this.find({ status, isActive: true }).populate('uploadedBy', 'fullName email');
};

documentSchema.statics.getPendingDocuments = function () {
    return this.find({ status: 'pending', isActive: true }).populate('uploadedBy', 'fullName email phoneNumber');
};

documentSchema.statics.getApprovedDocuments = function (userId) {
    return this.find({
        uploadedBy: userId,
        status: 'approved',
        isActive: true
    }).sort({ documentType: 1 });
};

documentSchema.statics.getAssignedToStaff = function (staffId) {
    return this.find({
        assignedTo: staffId,
        isActive: true
    }).populate('uploadedBy', 'fullName email role').sort({ createdAt: -1 });
};

documentSchema.statics.getHybridStorageStats = function () {
    return this.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: '$storageType',
                count: { $sum: 1 },
                totalSize: { $sum: '$fileSize' },
                averageSize: { $avg: '$fileSize' }
            }
        },
        {
            $group: {
                _id: null,
                storageBreakdown: {
                    $push: {
                        storageType: '$_id',
                        count: '$count',
                        totalSize: '$totalSize',
                        averageSize: '$averageSize'
                    }
                },
                totalFiles: { $sum: '$count' },
                totalSize: { $sum: '$totalSize' }
            }
        }
    ]);
};

// Ensure virtual fields are serialized
documentSchema.set('toJSON', { virtuals: true });
documentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Document', documentSchema);
