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
    guardianName: {
        type: String,
        required: [true, 'Guardian name is required'],
        trim: true,
        minlength: [2, 'Guardian name must be at least 2 characters'],
        maxlength: [100, 'Guardian name cannot exceed 100 characters'],
        validate: {
            validator: function (v) {
                return /^[a-zA-Z\s]+$/.test(v);
            },
            message: 'Guardian name can only contain alphabets and spaces'
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        validate: {
            validator: function (v) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v);
            },
            message: 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character'
        },
        select: false
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        validate: {
            validator: function (v) {
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

    // Agent Specific Fields
    referralCode: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true
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
        successfulReferrals: {
            type: Number,
            default: 0
        },
        pendingReferrals: {
            type: Number,
            default: 0
        },
        totalCommission: {
            type: Number,
            default: 0
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
userSchema.index({ email: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

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

// Pre-save middleware to generate referral code for agents
userSchema.pre('save', function (next) {
    if (this.role === 'agent' && !this.referralCode) {
        this.referralCode = this.generateReferralCode();
    }
    next();
});

// Instance methods
userSchema.methods.generateReferralCode = function () {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `AG${timestamp}${random}`.toUpperCase();
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
        role: 'agent',
        isActive: true
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
