const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    // Reference to User
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    // Academic Information
    studentId: {
        type: String,
        unique: true,
        required: true
    },
    currentClass: {
        type: String,
        required: [true, 'Current class is required']
    },
    stream: {
        type: String,
        enum: ['Science', 'Commerce', 'Arts', 'Engineering', 'Medical', 'Other'],
        default: null
    },
    academicYear: {
        type: String,
        required: [true, 'Academic year is required']
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    },

    // Personal Information (Extended)
    aadharNumber: {
        type: String,
        required: [true, 'Aadhar number is required'],
        unique: true,
        match: [/^[0-9]{12}$/, 'Aadhar number must be 12 digits'],
        immutable: true // Cannot be changed by staff
    },
    panNumber: {
        type: String,
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number'],
        default: null
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        default: null
    },
    nationality: {
        type: String,
        default: 'Indian'
    },

    // Family Information
    fatherName: {
        type: String,
        required: [true, 'Father\'s name is required']
    },
    fatherOccupation: String,
    fatherPhone: String,
    fatherEmail: String,

    motherName: {
        type: String,
        required: [true, 'Mother\'s name is required']
    },
    motherOccupation: String,
    motherPhone: String,
    motherEmail: String,

    guardianName: String,
    guardianRelation: String,
    guardianPhone: String,
    guardianEmail: String,

    // Previous Academic Details
    previousSchool: String,
    previousClass: String,
    previousBoard: String,
    previousPercentage: Number,
    previousYear: String,

    // Documents
    documents: {
        aadharCard: {
            type: String,
            required: [true, 'Aadhar card is required']
        },
        birthCertificate: String,
        transferCertificate: String,
        characterCertificate: String,
        incomeCertificate: String,
        casteCertificate: String,
        domicileCertificate: String,
        migrationCertificate: String,
        markSheet: String,
        passportSizePhoto: String,
        signature: String
    },

    // Agent Information (if applicable)
    agentReferral: {
        agent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        referralCode: String,
        commissionPercentage: {
            type: Number,
            default: 0
        },
        commissionAmount: {
            type: Number,
            default: 0
        }
    },

    // Academic Performance
    academicPerformance: [{
        semester: String,
        subjects: [{
            name: String,
            marks: Number,
            maxMarks: Number,
            percentage: Number
        }],
        totalMarks: Number,
        maxTotalMarks: Number,
        percentage: Number,
        grade: String,
        remarks: String
    }],

    // Attendance
    attendance: [{
        month: String,
        year: String,
        totalDays: Number,
        presentDays: Number,
        percentage: Number
    }],

    // Fees and Payments
    feeStructure: {
        tuitionFee: Number,
        libraryFee: Number,
        laboratoryFee: Number,
        examinationFee: Number,
        otherFees: Number,
        totalFee: Number
    },
    payments: [{
        amount: Number,
        paymentDate: Date,
        paymentMethod: String,
        transactionId: String,
        receiptNumber: String,
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        },
        remarks: String
    }],

    // Status and Progress
    status: {
        type: String,
        enum: ['active', 'inactive', 'graduated', 'transferred', 'suspended'],
        default: 'active'
    },
    progress: {
        type: String,
        enum: ['excellent', 'good', 'average', 'below_average', 'needs_improvement'],
        default: 'average'
    },

    // Additional Information
    achievements: [String],
    extracurricularActivities: [String],
    specialNeeds: String,
    medicalConditions: String,
    emergencyContact: {
        name: String,
        relation: String,
        phone: String
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

// Virtual for full name
studentSchema.virtual('fullName').get(function () {
    return this.user ? this.user.fullName : '';
});

// Virtual for current fee status
studentSchema.virtual('feeStatus').get(function () {
    if (!this.payments || this.payments.length === 0) return 'unpaid';

    const totalPaid = this.payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

    const totalFee = this.feeStructure.totalFee || 0;

    if (totalPaid >= totalFee) return 'paid';
    if (totalPaid > 0) return 'partial';
    return 'unpaid';
});

// Virtual for attendance percentage
studentSchema.virtual('currentAttendancePercentage').get(function () {
    if (!this.attendance || this.attendance.length === 0) return 0;

    const latest = this.attendance[this.attendance.length - 1];
    return latest.percentage || 0;
});

// Pre-save middleware to generate student ID
studentSchema.pre('save', function (next) {
    if (!this.studentId) {
        const year = new Date().getFullYear().toString().substr(-2);
        const random = Math.random().toString().substr(2, 4);
        this.studentId = `ST${year}${random}`;
    }
    next();
});

// Indexes
studentSchema.index({ studentId: 1 });
studentSchema.index({ aadharNumber: 1 });
studentSchema.index({ 'agentReferral.agent': 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ currentClass: 1 });
studentSchema.index({ academicYear: 1 });

// Static methods
studentSchema.statics.findByAadhar = function (aadharNumber) {
    return this.findOne({ aadharNumber });
};

studentSchema.statics.findByStudentId = function (studentId) {
    return this.findOne({ studentId });
};

studentSchema.statics.findByAgent = function (agentId) {
    return this.find({ 'agentReferral.agent': agentId });
};

// Instance methods
studentSchema.methods.calculateFeeBalance = function () {
    const totalPaid = this.payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

    const totalFee = this.feeStructure.totalFee || 0;
    return Math.max(0, totalFee - totalPaid);
};

studentSchema.methods.updateAttendance = function (month, year, presentDays, totalDays) {
    const percentage = Math.round((presentDays / totalDays) * 100);

    const existingIndex = this.attendance.findIndex(
        a => a.month === month && a.year === year
    );

    if (existingIndex >= 0) {
        this.attendance[existingIndex] = {
            month,
            year,
            totalDays,
            presentDays,
            percentage
        };
    } else {
        this.attendance.push({
            month,
            year,
            totalDays,
            presentDays,
            percentage
        });
    }

    return this.save();
};

module.exports = mongoose.model('Student', studentSchema);
