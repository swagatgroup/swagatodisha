const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Delete existing model if it exists (for development)
if (mongoose.models.User) {
    delete mongoose.models.User;
}

const userSchema = new mongoose.Schema({
    // Basic Information (updated to match student registration requirements)
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Full name must be at least 2 characters'],
        maxlength: [100, 'Full name cannot exceed 100 characters'],
        validate: {
            validator: function (v) {
                return /^[a-zA-Z\s]+$/.test(v);
            },
            message: 'Full name can only contain alphabets and spaces'
        }
    },
    // guardianName removed from initial registration requirements
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        validate: {
            validator: function (v) {
                // For agents, use less strict validation
                if (this.role === 'agent') {
                    return v.length >= 8;
                }
                // For other roles, use strict validation
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v);
            },
            message: function () {
                if (this.role === 'agent') {
                    return 'Password must be at least 8 characters long';
                }
                return 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character';
            }
        },
        select: false
    },
    phoneNumber: {
        type: String,
        required: function () {
            // Required for students and agents, not for other roles
            return this.isNew && (this.role === 'student' || this.role === 'agent');
        },
        validate: {
            validator: function (v) {
                // Skip validation if empty and not required
                if (!v && !(this.isNew && (this.role === 'student' || this.role === 'agent'))) return true;
                return /^[6-9]\d{9}$/.test(v);
            },
            message: 'Phone number must be a valid 10-digit Indian mobile number'
        }
    },

    // Role and Access Control
    role: {
        type: String,
        enum: ['user', 'student', 'agent', 'staff', 'super_admin'],
        default: 'user',
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
    isPhoneVerified: {
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

    // Universal Referral System (for all user types)
    referralCode: {
        type: String,
        uppercase: false,
        trim: true,
        length: 8,
        validate: {
            validator: function (v) {
                if (!v) return true; // Allow empty for users without referral codes
                return /^[a-z]{3}\d{2}[aost]\d{2}$/.test(v);
            },
            message: 'Invalid referral code format. Must be 8 characters: 3 letters + 2 digits + 1 role letter + 2 year digits'
        }
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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

    // Staff Specific Fields
    department: {
        type: String,
        default: null
    },
    designation: {
        type: String,
        default: null
    },

    // Agent-Staff Assignment
    assignedStaff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },

    // Security and Timestamps
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    lastLogin: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,

    // Audit Fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for display name
userSchema.virtual('displayName').get(function () {
    return this.fullName;
});

// Virtual for isLocked
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ referralCode: 1 }, { unique: true, sparse: true });
userSchema.index({ phoneNumber: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ role: 1, isActive: 1 });

// Pre-save middleware to generate referral code
userSchema.pre('save', async function (next) {
    // Generate referral code if it doesn't exist
    if (!this.referralCode && this.isNew) {
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            const generatedCode = this.generateReferralCode();

            // Check if code already exists
            const existingUser = await this.constructor.findOne({ referralCode: generatedCode });
            if (!existingUser) {
                this.referralCode = generatedCode;
                this.isReferralActive = true; // Auto-activate referral system
                break;
            }
            attempts++;
        }

        // If we couldn't generate a unique code, use a fallback
        if (!this.referralCode) {
            const timestamp = Date.now().toString().slice(-4);
            this.referralCode = `usr${timestamp}${this.role.charAt(0)}25`;
            this.isReferralActive = true;
        }
    }

    next();
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance methods
userSchema.methods.generateReferralCode = function () {
    // Format: [3-letter-name][2-digit-phone][1-role-letter][2-digit-year]
    // Example: raj69a25 (Rajesh, phone ending 69, agent, year 2025)

    const namePrefix = this.fullName ?
        this.fullName.replace(/\s+/g, '').substring(0, 3).toLowerCase() : 'xxx';
    const phoneSuffix = this.phoneNumber ? this.phoneNumber.slice(-2) : '00';

    const roleMap = {
        'student': 's',
        'agent': 'a',
        'staff': 'o',    // office
        'super_admin': 't' // the admin
    };

    const roleLetter = roleMap[this.role] || 'u'; // u for user
    const yearSuffix = new Date().getFullYear().toString().slice(-2);

    return `${namePrefix}${phoneSuffix}${roleLetter}${yearSuffix}`;
};

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

userSchema.methods.incrementLoginAttempts = function () {
    if (this.lockUntil && this.lockUntil > Date.now()) {
        return;
    }

    this.loginAttempts += 1;

    if (this.loginAttempts >= 5) {
        this.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
    }

    return this.save({ validateBeforeSave: false });
};

userSchema.methods.resetLoginAttempts = function () {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    return this.save({ validateBeforeSave: false });
};

// Static methods
userSchema.statics.findByReferralCode = function (referralCode) {
    return this.findOne({
        referralCode: referralCode.toUpperCase(),
        isActive: true,
        isReferralActive: true
    });
};

userSchema.statics.findByEmail = function (email) {
    return this.findOne({
        email: email.toLowerCase(),
        isActive: true
    }).select('+password');
};

const User = mongoose.model('User', userSchema);

module.exports = User;