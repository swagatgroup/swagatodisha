const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: String,
        required: true,
        maxlength: [200, 'Course name cannot exceed 200 characters']
    },
    institution: {
        type: String,
        required: true,
        maxlength: [200, 'Institution name cannot exceed 200 characters']
    },
    preferredStartDate: {
        type: Date
    },
    applicationDate: {
        type: Date,
        default: Date.now
    },
    applicationId: {
        type: String,
        unique: true,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected', 'withdrawn'],
        default: 'pending'
    },
    reviewNotes: {
        type: String,
        maxlength: [1000, 'Review notes cannot exceed 1000 characters']
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedDate: {
        type: Date
    },
    withdrawnDate: {
        type: Date
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better performance
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ applicationId: 1 });
applicationSchema.index({ applicationDate: -1 });
applicationSchema.index({ status: 1 });

// Virtual for status color
applicationSchema.virtual('statusColor').get(function () {
    const colors = {
        pending: 'yellow',
        under_review: 'blue',
        approved: 'green',
        rejected: 'red',
        withdrawn: 'gray'
    };
    return colors[this.status] || 'gray';
});

// Virtual for formatted application date
applicationSchema.virtual('formattedApplicationDate').get(function () {
    return this.applicationDate.toLocaleDateString('en-IN');
});

// Pre-save middleware
applicationSchema.pre('save', function (next) {
    if (this.status === 'approved' || this.status === 'rejected') {
        this.reviewedDate = new Date();
    }
    next();
});

// Instance methods
applicationSchema.methods.approve = function (reviewedBy, reviewNotes = '') {
    this.status = 'approved';
    this.reviewedBy = reviewedBy;
    this.reviewedDate = new Date();
    if (reviewNotes) {
        this.reviewNotes = reviewNotes;
    }
    return this.save();
};

applicationSchema.methods.reject = function (reviewedBy, reviewNotes = '') {
    this.status = 'rejected';
    this.reviewedBy = reviewedBy;
    this.reviewedDate = new Date();
    if (reviewNotes) {
        this.reviewNotes = reviewNotes;
    }
    return this.save();
};

applicationSchema.methods.withdraw = function () {
    this.status = 'withdrawn';
    this.withdrawnDate = new Date();
    return this.save();
};

// Static methods
applicationSchema.statics.getByStudent = function (studentId) {
    return this.find({ student: studentId, isActive: true }).sort({ applicationDate: -1 });
};

applicationSchema.statics.getByStatus = function (status) {
    return this.find({ status, isActive: true }).populate('student', 'fullName email phoneNumber');
};

applicationSchema.statics.getPendingApplications = function () {
    return this.find({ status: 'pending', isActive: true }).populate('student', 'fullName email phoneNumber');
};

// Ensure virtual fields are serialized
applicationSchema.set('toJSON', { virtuals: true });
applicationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Application', applicationSchema);
