const mongoose = require('mongoose');

const studentApplicationSchema = new mongoose.Schema({
    // Reference to User
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Application ID
    applicationId: {
        type: String,
        required: true,
        unique: true
    },

    // Application Status
    status: {
        type: String,
        enum: [
            'DRAFT',
            'SUBMITTED',
            'UNDER_REVIEW',
            'APPROVED',
            'REJECTED',
            'CANCELLED'
        ],
        default: 'DRAFT'
    },

    // Current Stage in Workflow
    currentStage: {
        type: String,
        enum: [
            'REGISTRATION',
            'DOCUMENTS',
            'APPLICATION_PDF',
            'TERMS_CONDITIONS',
            'SUBMITTED',
            'UNDER_REVIEW',
            'APPROVED',
            'REJECTED'
        ],
        default: 'REGISTRATION'
    },

    // Personal Information
    personalDetails: {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        fathersName: {
            type: String,
            required: true,
            trim: true
        },
        mothersName: {
            type: String,
            required: true,
            trim: true
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
            required: true
        },
        aadharNumber: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: function (v) { return /^\d{12}$/.test(v); },
                message: 'Aadhar number must be 12 digits'
            }
        }
    },

    // Contact Details
    contactDetails: {
        primaryPhone: {
            type: String,
            required: true,
            validate: {
                validator: function (v) { return /^[6-9]\d{9}$/.test(v); },
                message: 'Phone number must be a valid 10-digit Indian mobile number'
            }
        },
        whatsappNumber: {
            type: String,
            validate: {
                validator: function (v) {
                    if (!v) return true;
                    return /^[6-9]\d{9}$/.test(v);
                },
                message: 'WhatsApp number must be a valid 10-digit Indian mobile number'
            }
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        permanentAddress: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: {
                type: String,
                required: true,
                validate: {
                    validator: function (v) { return /^\d{6}$/.test(v); },
                    message: 'Pincode must be 6 digits'
                }
            },
            country: { type: String, default: 'India' }
        },
        currentAddress: {
            street: String,
            city: String,
            state: String,
            pincode: {
                type: String,
                validate: {
                    validator: function (v) {
                        if (!v) return true;
                        return /^\d{6}$/.test(v);
                    },
                    message: 'Pincode must be 6 digits'
                }
            },
            country: { type: String, default: 'India' }
        }
    },

    // Course Details
    courseDetails: {
        selectedCourse: {
            type: String,
            required: true
        },
        customCourse: String,
        stream: String,
        campus: {
            type: String,
            enum: ['Sargiguda', 'Ghantiguda', 'Online'],
            default: 'Sargiguda'
        }
    },

    // Guardian Details
    guardianDetails: {
        guardianName: {
            type: String,
            required: true,
            trim: true
        },
        relationship: {
            type: String,
            enum: ['Father', 'Mother', 'Brother', 'Sister', 'Uncle', 'Aunt', 'Grandfather', 'Grandmother', 'Other'],
            required: true
        },
        guardianPhone: {
            type: String,
            required: true,
            validate: {
                validator: function (v) { return /^[6-9]\d{9}$/.test(v); },
                message: 'Guardian phone must be a valid 10-digit Indian mobile number'
            }
        },
        guardianEmail: {
            type: String,
            lowercase: true,
            trim: true
        }
    },

    // Financial Details
    financialDetails: {
        bankAccountNumber: String,
        ifscCode: String,
        accountHolderName: String,
        bankName: String
    },

    // Documents
    documents: [{
        documentType: {
            type: String,
            required: true
        },
        fileName: {
            type: String,
            required: true
        },
        filePath: {
            type: String,
            required: true
        },
        fileSize: Number,
        mimeType: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING'
        },
        remarks: String
    }],

    // Application PDF
    applicationPdf: {
        filePath: String,
        generatedAt: Date,
        version: String
    },

    // Terms and Conditions
    termsAccepted: {
        type: Boolean,
        default: false
    },
    termsAcceptedAt: Date,

    // Workflow History
    workflowHistory: [{
        stage: String,
        status: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        remarks: String,
        action: {
            type: String,
            enum: ['SAVE_DRAFT', 'SUBMIT', 'APPROVE', 'REJECT', 'REQUEST_MODIFICATION']
        }
    }],

    // Assignment Information
    assignedAgent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    assignedStaff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },

    // Referral Information
    referralInfo: {
        referredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        referralCode: String,
        referralType: {
            type: String,
            enum: ['student', 'agent', 'staff', 'super_admin', null],
            default: null
        }
    },

    // Review Information
    reviewInfo: {
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reviewedAt: Date,
        remarks: String,
        rejectionReason: String
    },

    // Progress Tracking
    progress: {
        registrationComplete: { type: Boolean, default: false },
        documentsComplete: { type: Boolean, default: false },
        applicationPdfGenerated: { type: Boolean, default: false },
        termsAccepted: { type: Boolean, default: false },
        submitted: { type: Boolean, default: false }
    },

    // Timestamps
    submittedAt: Date,
    lastModified: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Pre-save middleware to generate application ID
studentApplicationSchema.pre('save', async function (next) {
    if (this.isNew && !this.applicationId) {
        let applicationId;
        let isUnique = false;

        while (!isUnique) {
            const year = new Date().getFullYear().toString().substr(-2);
            const random = Math.random().toString().substr(2, 6).toUpperCase();
            applicationId = `APP${year}${random}`;

            const existingApp = await this.constructor.findOne({ applicationId });
            if (!existingApp) {
                isUnique = true;
            }
        }

        this.applicationId = applicationId;
    }
    next();
});

// Instance Methods
studentApplicationSchema.methods.updateStage = function (stage, updatedBy, remarks = '', action = 'SAVE_DRAFT') {
    this.currentStage = stage;
    this.workflowHistory.push({
        stage,
        status: this.status,
        updatedBy,
        remarks,
        action,
        timestamp: new Date()
    });
    this.lastModified = new Date();
    return this.save();
};

studentApplicationSchema.methods.saveDraft = function (updatedBy) {
    this.status = 'DRAFT';
    this.workflowHistory.push({
        stage: this.currentStage,
        status: 'DRAFT',
        updatedBy,
        action: 'SAVE_DRAFT',
        timestamp: new Date()
    });
    this.lastModified = new Date();
    return this.save();
};

studentApplicationSchema.methods.submitApplication = function (updatedBy) {
    this.status = 'SUBMITTED';
    this.currentStage = 'SUBMITTED';
    this.submittedAt = new Date();
    this.progress.submitted = true;

    this.workflowHistory.push({
        stage: 'SUBMITTED',
        status: 'SUBMITTED',
        updatedBy,
        action: 'SUBMIT',
        timestamp: new Date()
    });
    this.lastModified = new Date();
    return this.save();
};

studentApplicationSchema.methods.approveApplication = function (reviewedBy, remarks = '') {
    this.status = 'APPROVED';
    this.currentStage = 'APPROVED';
    this.reviewInfo = {
        reviewedBy,
        reviewedAt: new Date(),
        remarks
    };

    this.workflowHistory.push({
        stage: 'APPROVED',
        status: 'APPROVED',
        updatedBy: reviewedBy,
        action: 'APPROVE',
        remarks,
        timestamp: new Date()
    });
    this.lastModified = new Date();
    return this.save();
};

studentApplicationSchema.methods.rejectApplication = function (reviewedBy, rejectionReason, remarks = '') {
    this.status = 'REJECTED';
    this.currentStage = 'REJECTED';
    this.reviewInfo = {
        reviewedBy,
        reviewedAt: new Date(),
        remarks,
        rejectionReason
    };

    this.workflowHistory.push({
        stage: 'REJECTED',
        status: 'REJECTED',
        updatedBy: reviewedBy,
        action: 'REJECT',
        remarks,
        timestamp: new Date()
    });
    this.lastModified = new Date();
    return this.save();
};

studentApplicationSchema.methods.assignToAgent = function (agentId) {
    this.assignedAgent = agentId;
    return this.save();
};

studentApplicationSchema.methods.assignToStaff = function (staffId) {
    this.assignedStaff = staffId;
    return this.save();
};

// Static Methods
studentApplicationSchema.statics.getByStatus = function (status) {
    return this.find({ status }).populate('user', 'fullName email phoneNumber');
};

studentApplicationSchema.statics.getByStage = function (stage) {
    return this.find({ currentStage: stage }).populate('user', 'fullName email phoneNumber');
};

studentApplicationSchema.statics.getByAgent = function (agentId) {
    return this.find({ assignedAgent: agentId }).populate('user', 'fullName email phoneNumber');
};

studentApplicationSchema.statics.getByStaff = function (staffId) {
    return this.find({ assignedStaff: staffId }).populate('user', 'fullName email phoneNumber');
};

// Indexes
studentApplicationSchema.index({ user: 1 });
studentApplicationSchema.index({ applicationId: 1 }, { unique: true });
studentApplicationSchema.index({ status: 1 });
studentApplicationSchema.index({ currentStage: 1 });
studentApplicationSchema.index({ assignedAgent: 1 });
studentApplicationSchema.index({ assignedStaff: 1 });
studentApplicationSchema.index({ createdAt: -1 });
studentApplicationSchema.index({ lastModified: -1 });

module.exports = mongoose.model('StudentApplication', studentApplicationSchema);
