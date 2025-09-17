const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    // Basic Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },

    // Role and Access Control
    role: {
        type: String,
        enum: ['super_admin', 'staff'],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },

    // Profile Information
    profilePicture: {
        type: String,
        default: null
    },
    dateOfBirth: {
        type: Date,
        default: null
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: false
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: {
            type: String,
            default: 'India'
        }
    },

    // Staff Specific Fields
    department: {
        type: String,
        default: null
    },
    designation: {
        type: String,
        default: null
    },
    employeeId: {
        type: String,
        sparse: true,
        unique: true
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },

    // Universal Referral System (for all admin types)
    referralCode: {
        type: String,
        uppercase: false,
        trim: true,
        length: 8,
        validate: {
            validator: function (v) {
                if (!v) return true; // Allow empty for admins without referral codes
                return /^[a-z]{3}\d{2}[aost]\d{2}$/.test(v);
            },
            message: 'Invalid referral code format. Must be 8 characters: 3 letters + 2 digits + 1 role letter + 2 year digits'
        }
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    referralStats: {
        totalReferrals: {
            type: Number,
            default: 0
        },
        pendingReferrals: {
            type: Number,
            default: 0
        },
        approvedReferrals: {
            type: Number,
            default: 0
        },
        rejectedReferrals: {
            type: Number,
            default: 0
        },
        totalCommission: {
            type: Number,
            default: 0
        }
    },
    isReferralActive: {
        type: Boolean,
        default: false
    },

    // Agent Assignment
    assignedAgents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    // Security and Timestamps
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,

    // Audit Fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full name
adminSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for isLocked
adminSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Indexes
adminSchema.index({ email: 1 }, { unique: true });
adminSchema.index({ referralCode: 1 }, { unique: true, sparse: true });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });
// employeeId index is already defined in schema with unique: true

// Pre-save middleware to hash password
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-save middleware to generate referral code
adminSchema.pre('save', async function (next) {
    // Generate referral code if it doesn't exist
    if (!this.referralCode && this.isNew) {
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            const generatedCode = this.generateReferralCode();

            // Check if code already exists in both User and Admin collections
            const existingUser = await mongoose.model('User').findOne({ referralCode: generatedCode });
            const existingAdmin = await this.constructor.findOne({ referralCode: generatedCode });

            if (!existingUser && !existingAdmin) {
                this.referralCode = generatedCode;
                this.isReferralActive = true; // Auto-activate referral system
                break;
            }
            attempts++;
        }

        // If we couldn't generate a unique code, use a fallback
        if (!this.referralCode) {
            const timestamp = Date.now().toString().slice(-4);
            this.referralCode = `adm${timestamp}${this.role.charAt(0)}25`;
            this.isReferralActive = true;
        }
    }

    next();
});

// Pre-save middleware to generate employee ID for staff
adminSchema.pre('save', function (next) {
    if (this.role === 'staff' && !this.employeeId) {
        const year = new Date().getFullYear().toString().substr(-2);
        const random = Math.random().toString().substr(2, 4);
        this.employeeId = `STF${year}${random}`;
    }
    next();
});

// Instance methods
adminSchema.methods.generateReferralCode = function () {
    // Format: [3-letter-name][2-digit-phone][1-role-letter][2-digit-year]
    // Example: ram69o25 (Ram, phone ending 69, staff, year 2025)

    const namePrefix = this.firstName ?
        this.firstName.replace(/\s+/g, '').substring(0, 3).toLowerCase() : 'xxx';
    const phoneSuffix = this.phone ? this.phone.slice(-2) : '00';

    const roleMap = {
        'staff': 'o',    // office
        'super_admin': 't' // the admin
    };

    const roleLetter = roleMap[this.role] || 'a'; // a for admin
    const yearSuffix = new Date().getFullYear().toString().slice(-2);

    return `${namePrefix}${phoneSuffix}${roleLetter}${yearSuffix}`;
};

adminSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

adminSchema.methods.incrementLoginAttempts = function () {
    if (this.lockUntil && this.lockUntil > Date.now()) {
        return;
    }

    this.loginAttempts += 1;

    if (this.loginAttempts >= 5) {
        this.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
    }

    return this.save();
};

adminSchema.methods.resetLoginAttempts = function () {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    return this.save();
};

// Static methods
adminSchema.statics.findByReferralCode = function (referralCode) {
    return this.findOne({
        referralCode: referralCode.toLowerCase(),
        isActive: true,
        isReferralActive: true
    });
};

adminSchema.statics.findByEmail = function (email) {
    return this.findOne({
        email: email.toLowerCase(),
        isActive: true
    }).select('+password');
};

module.exports = mongoose.model('Admin', adminSchema);
