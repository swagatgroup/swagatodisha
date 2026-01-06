const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    // Reference to User
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Basic Academic Information
    studentId: {
        type: String,
        sparse: true, // Allow multiple null values during creation
        required: false, // Will be auto-generated
        unique: true
    },
    course: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                const validCourses = [
                    "B.Tech Computer Science",
                    "B.Tech Mechanical Engineering",
                    "B.Tech Electrical Engineering",
                    "B.Tech Civil Engineering",
                    "MBA",
                    "BCA",
                    "MCA",
                    "B.Com",
                    "M.Com",
                    "BA",
                    "MA English",
                    "BSc Mathematics",
                    "MSc Physics"
                ];
                return validCourses.includes(v);
            },
            message: 'Please select a valid course from the dropdown'
        }
    },

    // Enhanced Personal Information (Optimized Order)
    personalDetails: {
        fullName: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: function (v) { return /^[a-zA-Z\s]+$/.test(v); },
                message: 'Full name can only contain alphabets and spaces'
            }
        },
        fathersName: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: function (v) { return /^[a-zA-Z\s]+$/.test(v); },
                message: 'Father\'s name can only contain alphabets and spaces'
            }
        },
        mothersName: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: function (v) { return /^[a-zA-Z\s]+$/.test(v); },
                message: 'Mother\'s name can only contain alphabets and spaces'
            }
        },
        dateOfBirth: {
            type: Date,
            required: true,
            validate: {
                validator: function (v) {
                    const age = Math.floor((Date.now() - v.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                    return age >= 16 && age <= 100;
                },
                message: 'Age must be between 16 and 100 years'
            }
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

    // Enhanced Contact Details
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
                    if (!v) return true; // Optional field
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
                        if (!v) return true; // Optional field
                        return /^\d{6}$/.test(v);
                    },
                    message: 'Pincode must be 6 digits'
                }
            },
            country: { type: String, default: 'India' }
        }
    },

    // Financial Information (Optional Section)
    financialDetails: {
        bankAccountNumber: {
            type: String,
            validate: {
                validator: function (v) {
                    if (!v) return true; // Optional field
                    return /^\d{9,18}$/.test(v);
                },
                message: 'Bank account number must be 9-18 digits'
            }
        },
        ifscCode: {
            type: String,
            validate: {
                validator: function (v) {
                    if (!v) return true; // Optional field
                    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v);
                },
                message: 'IFSC code must be valid format (e.g., SBIN0001234)'
            }
        },
        accountHolderName: {
            type: String,
            validate: {
                validator: function (v) {
                    if (!v) return true; // Optional field
                    return /^[a-zA-Z\s]+$/.test(v);
                },
                message: 'Account holder name can only contain alphabets and spaces'
            }
        },
        bankName: String
    },

    // Guardian/Emergency Contact (Enhanced)
    guardianDetails: {
        guardianName: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: function (v) { return /^[a-zA-Z\s]+$/.test(v); },
                message: 'Guardian name can only contain alphabets and spaces'
            }
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
        },
        alternativeContact: {
            name: String,
            phone: {
                type: String,
                validate: {
                    validator: function (v) {
                        if (!v) return true; // Optional field
                        return /^[6-9]\d{9}$/.test(v);
                    },
                    message: 'Alternative contact phone must be a valid 10-digit Indian mobile number'
                }
            },
            relationship: String
        },
        guardianAddress: {
            street: String,
            city: String,
            state: String,
            pincode: {
                type: String,
                validate: {
                    validator: function (v) {
                        if (!v) return true; // Optional field
                        return /^\d{6}$/.test(v);
                    },
                    message: 'Guardian address pincode must be 6 digits'
                }
            },
            country: { type: String, default: 'India' }
        }
    },

    // Course Selection (Streamlined)
    courseDetails: {
        selectedCourse: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    const validCourses = [
                        "B.Tech Computer Science", "B.Tech Mechanical Engineering", "B.Tech Electrical Engineering",
                        "B.Tech Civil Engineering", "B.Tech Electronics & Communication", "B.Tech Information Technology",
                        "MBA", "BCA", "MCA", "B.Com", "M.Com", "BA", "MA English", "BSc Mathematics", "MSc Physics",
                        "BSc Chemistry", "MSc Chemistry", "BSc Biology", "MSc Biology", "BBA", "BHM", "BPT", "MPT",
                        "B.Pharm", "M.Pharm", "BDS", "MDS", "MBBS", "MD", "B.Sc Nursing", "M.Sc Nursing",
                        "Diploma in Engineering", "Diploma in Pharmacy", "Certificate Courses", "Other"
                    ];
                    return validCourses.includes(v);
                },
                message: 'Please select a valid course from the dropdown'
            }
        },
        customCourse: String, // For "Other" option
        stream: String, // Dynamic based on course selection
        campus: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Campus'
        }
    },

    // Enhanced Profile Completion Status
    profileCompletionStatus: {
        isProfileComplete: { type: Boolean, default: false },
        completedSteps: [String],
        currentStep: { type: Number, default: 1 },
        completionPercentage: { type: Number, default: 0 },
        lastUpdated: { type: Date, default: Date.now },
        requiredFields: [String], // Track which fields are required for completion
        missingFields: [String]   // Track which fields are still missing
    },

    // Profile Status
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },

    // Enhanced Student Classification System
    registrationCategory: {
        type: String,
        enum: [
            'A',    // Direct Registration (No Referral)
            'B1',   // Student Referral Code
            'B2',   // Agent Referral Code
            'B3',   // Staff Referral Code
            'B4',   // Super Admin Referral Code
            'C1',   // Agent Dashboard Registration
            'C2',   // Staff Dashboard Registration
            'C3'    // Super Admin Dashboard Registration
        ],
        required: true,
        default: 'A'
    },

    // Referral Information (Enhanced)
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
        },
        commissionPercentage: {
            type: Number,
            default: 0
        },
        referralBonus: {
            type: Number,
            default: 0
        }
    },

    // Workflow Hierarchy & Status Tracking
    workflowStatus: {
        currentStage: {
            type: String,
            enum: [
                'PROFILE_COMPLETION',
                'DOCUMENT_UPLOAD',
                'AGENT_REVIEW',
                'STAFF_REVIEW',
                'SUPER_ADMIN_OVERSIGHT',
                'APPROVED',
                'REJECTED'
            ],
            default: 'PROFILE_COMPLETION'
        },
        stageHistory: [{
            stage: String,
            timestamp: Date,
            reviewedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            remarks: String,
            action: {
                type: String,
                enum: ['approve', 'reject', 'request_modification', 'escalate']
            }
        }],
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
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium'
        }
    },

    // Aadhar Number (optional, for profile completion)
    aadharNumber: {
        type: String,
        sparse: true, // Allow multiple null values
        required: false
    },

    // Audit Fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Pre-save middleware to generate student ID
studentSchema.pre('save', async function (next) {
    if (this.isNew && !this.studentId) {
        let studentId;
        let isUnique = false;

        // Keep generating until we get a unique ID
        while (!isUnique) {
            const year = new Date().getFullYear().toString().substr(-2);
            const random = Math.random().toString().substr(2, 4);
            studentId = `ST${year}${random}`;

            // Check if this ID already exists
            const existingStudent = await this.constructor.findOne({ studentId });
            if (!existingStudent) {
                isUnique = true;
            }
        }

        this.studentId = studentId;
    }
    next();
});

// Enhanced Instance Methods
studentSchema.methods.calculateProfileCompletion = function () {
    const requiredFields = [
        'personalDetails.fullName',
        'personalDetails.fathersName',
        'personalDetails.mothersName',
        'personalDetails.dateOfBirth',
        'personalDetails.gender',
        'personalDetails.aadharNumber',
        'contactDetails.primaryPhone',
        'contactDetails.email',
        'contactDetails.permanentAddress.street',
        'contactDetails.permanentAddress.city',
        'contactDetails.permanentAddress.state',
        'contactDetails.permanentAddress.pincode',
        'guardianDetails.guardianName',
        'guardianDetails.relationship',
        'guardianDetails.guardianPhone',
        'courseDetails.selectedCourse'
    ];

    let completedFields = 0;
    const missingFields = [];

    requiredFields.forEach(field => {
        const value = this.get(field);
        if (value && value.toString().trim() !== '') {
            completedFields++;
        } else {
            missingFields.push(field);
        }
    });

    const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);

    this.profileCompletionStatus.completionPercentage = completionPercentage;
    this.profileCompletionStatus.missingFields = missingFields;
    this.profileCompletionStatus.isProfileComplete = completionPercentage === 100;
    this.profileCompletionStatus.lastUpdated = new Date();

    return {
        completionPercentage,
        missingFields,
        isComplete: completionPercentage === 100
    };
};

studentSchema.methods.updateWorkflowStage = function (stage, reviewedBy, remarks = '', action = 'approve') {
    this.workflowStatus.currentStage = stage;
    this.workflowStatus.stageHistory.push({
        stage,
        timestamp: new Date(),
        reviewedBy,
        remarks,
        action
    });
    return this.save();
};

studentSchema.methods.assignToAgent = function (agentId) {
    this.workflowStatus.assignedAgent = agentId;
    return this.save();
};

studentSchema.methods.assignToStaff = function (staffId) {
    this.workflowStatus.assignedStaff = staffId;
    return this.save();
};

studentSchema.methods.setPriority = function (priority) {
    this.workflowStatus.priority = priority;
    return this.save();
};

// Static Methods
studentSchema.statics.getByCategory = function (category) {
    return this.find({ registrationCategory: category }).populate('user', 'fullName email phoneNumber');
};

studentSchema.statics.getByWorkflowStage = function (stage) {
    return this.find({ 'workflowStatus.currentStage': stage }).populate('user', 'fullName email phoneNumber');
};

studentSchema.statics.getByAgent = function (agentId) {
    return this.find({ 'workflowStatus.assignedAgent': agentId }).populate('user', 'fullName email phoneNumber');
};

studentSchema.statics.getByStaff = function (staffId) {
    return this.find({ 'workflowStatus.assignedStaff': staffId }).populate('user', 'fullName email phoneNumber');
};

studentSchema.statics.getIncompleteProfiles = function () {
    return this.find({
        'profileCompletionStatus.completionPercentage': { $lt: 100 },
        status: 'active'
    }).populate('user', 'fullName email phoneNumber');
};

// Enhanced Indexes for Performance
studentSchema.index({ user: 1 }, { unique: true });
// studentId index is already defined in schema with unique: true
// personalDetails.aadharNumber index is already defined in schema with unique: true
studentSchema.index({ 'workflowStatus.currentStage': 1 });
studentSchema.index({ 'registrationCategory': 1 });
studentSchema.index({ 'referralInfo.referredBy': 1 });
studentSchema.index({ 'workflowStatus.assignedAgent': 1 });
studentSchema.index({ 'workflowStatus.assignedStaff': 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ 'courseDetails.campus': 1 });
studentSchema.index({ 'profileCompletionStatus.completionPercentage': 1 });
studentSchema.index({ createdAt: -1 });
studentSchema.index({ 'workflowStatus.priority': 1 });

module.exports = mongoose.model('Student', studentSchema);