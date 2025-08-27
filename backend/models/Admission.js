const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
    // Application Information
    applicationNumber: {
        type: String,
        unique: true,
        required: true
    },
    applicationDate: {
        type: Date,
        default: Date.now
    },
    academicYear: {
        type: String,
        required: [true, 'Academic year is required']
    },
    session: {
        type: String,
        enum: ['Morning', 'Afternoon', 'Evening', 'Full Day'],
        required: [true, 'Session is required']
    },

    // Student Information
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    studentUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Course and Institution Details
    course: {
        name: {
            type: String,
            required: [true, 'Course name is required']
        },
        level: {
            type: String,
            enum: ['Primary', 'Secondary', 'Higher Secondary', 'Graduate', 'Post Graduate', 'Diploma', 'Certificate'],
            required: true
        },
        duration: String,
        totalSeats: Number,
        availableSeats: Number
    },

    institution: {
        name: {
            type: String,
            required: [true, 'Institution name is required']
        },
        type: {
            type: String,
            enum: ['School', 'College', 'University', 'Institute'],
            required: true
        },
        location: String
    },

    // Agent Information (if applicable)
    agentReferral: {
        agent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        referralCode: String,
        commissionPercentage: Number,
        commissionAmount: Number,
        referralDate: Date
    },

    // Application Status and Workflow
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected', 'waitlisted', 'enrolled', 'cancelled'],
        default: 'pending'
    },

    currentStage: {
        type: String,
        enum: ['application_submitted', 'document_verification', 'interview_scheduled', 'interview_completed', 'final_review', 'decision_made'],
        default: 'application_submitted'
    },

    // Document Verification
    documents: {
        aadharCard: {
            uploaded: { type: Boolean, default: false },
            verified: { type: Boolean, default: false },
            remarks: String
        },
        birthCertificate: {
            uploaded: { type: Boolean, default: false },
            verified: { type: Boolean, default: false },
            remarks: String
        },
        transferCertificate: {
            uploaded: { type: Boolean, default: false },
            verified: { type: Boolean, default: false },
            remarks: String
        },
        characterCertificate: {
            uploaded: { type: Boolean, default: false },
            verified: { type: Boolean, default: false },
            remarks: String
        },
        incomeCertificate: {
            uploaded: { type: Boolean, default: false },
            verified: { type: Boolean, default: false },
            remarks: String
        },
        casteCertificate: {
            uploaded: { type: Boolean, default: false },
            verified: { type: Boolean, default: false },
            remarks: String
        },
        domicileCertificate: {
            uploaded: { type: Boolean, default: false },
            verified: { type: Boolean, default: false },
            remarks: String
        },
        migrationCertificate: {
            uploaded: { type: Boolean, default: false },
            verified: { type: Boolean, default: false },
            remarks: String
        },
        markSheet: {
            uploaded: { type: Boolean, default: false },
            verified: { type: Boolean, default: false },
            remarks: String
        },
        passportSizePhoto: {
            uploaded: { type: Boolean, default: false },
            verified: { type: Boolean, default: false },
            remarks: String
        },
        signature: {
            uploaded: { type: Boolean, default: false },
            verified: { type: Boolean, default: false },
            remarks: String
        }
    },

    // Interview and Assessment
    interview: {
        scheduledDate: Date,
        scheduledTime: String,
        interviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        location: String,
        status: {
            type: String,
            enum: ['not_scheduled', 'scheduled', 'completed', 'cancelled', 'rescheduled'],
            default: 'not_scheduled'
        },
        score: Number,
        maxScore: Number,
        remarks: String,
        feedback: String
    },

    // Academic Requirements
    academicRequirements: {
        minimumPercentage: Number,
        studentPercentage: Number,
        meetsRequirement: Boolean,
        remarks: String
    },

    // Financial Information
    feeStructure: {
        applicationFee: Number,
        tuitionFee: Number,
        otherFees: Number,
        totalFee: Number,
        discountPercentage: Number,
        discountAmount: Number,
        finalAmount: Number
    },

    paymentStatus: {
        applicationFee: {
            type: String,
            enum: ['pending', 'paid', 'waived'],
            default: 'pending'
        },
        firstInstallment: {
            type: String,
            enum: ['pending', 'paid', 'waived'],
            default: 'pending'
        },
        totalPaid: { type: Number, default: 0 }
    },

    // Timeline and Deadlines
    deadlines: {
        documentSubmission: Date,
        interview: Date,
        feePayment: Date,
        enrollment: Date
    },

    // Staff Assignment
    assignedStaff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedDate: Date,

    // Notes and Comments
    notes: [{
        content: String,
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        isInternal: {
            type: Boolean,
            default: false
        }
    }],

    // Rejection/Approval Details
    decision: {
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'waitlisted'],
            default: 'pending'
        },
        date: Date,
        madeBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: String,
        conditions: [String]
    },

    // Audit Fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for application status
admissionSchema.virtual('isComplete').get(function () {
    const requiredDocs = ['aadharCard', 'birthCertificate', 'markSheet', 'passportSizePhoto'];
    return requiredDocs.every(doc => this.documents[doc].verified === true);
});

// Virtual for days since application
admissionSchema.virtual('daysSinceApplication').get(function () {
    const now = new Date();
    const diffTime = Math.abs(now - this.applicationDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate application number
admissionSchema.pre('save', function (next) {
    if (!this.applicationNumber) {
        const year = new Date().getFullYear().toString().substr(-2);
        const random = Math.random().toString().substr(2, 6);
        this.applicationNumber = `APP${year}${random}`;
    }
    next();
});

// Indexes
admissionSchema.index({ applicationNumber: 1 });
admissionSchema.index({ student: 1 });
admissionSchema.index({ status: 1 });
admissionSchema.index({ currentStage: 1 });
admissionSchema.index({ academicYear: 1 });
admissionSchema.index({ 'agentReferral.agent': 1 });
admissionSchema.index({ assignedStaff: 1 });
admissionSchema.index({ applicationDate: 1 });

// Static methods
admissionSchema.statics.findByApplicationNumber = function (applicationNumber) {
    return this.findOne({ applicationNumber });
};

admissionSchema.statics.findByStatus = function (status) {
    return this.find({ status });
};

admissionSchema.statics.findByAgent = function (agentId) {
    return this.find({ 'agentReferral.agent': agentId });
};

admissionSchema.statics.findByStaff = function (staffId) {
    return this.find({ assignedStaff: staffId });
};

// Instance methods
admissionSchema.methods.updateStatus = function (newStatus, updatedBy, reason = '') {
    this.status = newStatus;
    this.updatedBy = updatedBy;

    if (reason) {
        this.notes.push({
            content: `Status changed to ${newStatus}: ${reason}`,
            author: updatedBy,
            isInternal: true
        });
    }

    return this.save();
};

admissionSchema.methods.assignStaff = function (staffId, assignedBy) {
    this.assignedStaff = staffId;
    this.assignedDate = new Date();
    this.updatedBy = assignedBy;

    this.notes.push({
        content: `Application assigned to staff member`,
        author: assignedBy,
        isInternal: true
    });

    return this.save();
};

admissionSchema.methods.addNote = function (content, author, isInternal = false) {
    this.notes.push({
        content,
        author,
        isInternal
    });

    return this.save();
};

admissionSchema.methods.scheduleInterview = function (date, time, interviewer, location, scheduledBy) {
    this.interview.scheduledDate = date;
    this.interview.scheduledTime = time;
    this.interview.interviewer = interviewer;
    this.interview.location = location;
    this.interview.status = 'scheduled';
    this.currentStage = 'interview_scheduled';
    this.updatedBy = scheduledBy;

    this.notes.push({
        content: `Interview scheduled for ${date} at ${time}`,
        author: scheduledBy,
        isInternal: false
    });

    return this.save();
};

module.exports = mongoose.model('Admission', admissionSchema);
