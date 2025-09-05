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
        unique: true,
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
        default: null
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
        unique: true,
        sparse: true
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },

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
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });
adminSchema.index({ employeeId: 1 });

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
adminSchema.statics.findByEmail = function (email) {
    return this.findOne({
        email: email.toLowerCase(),
        isActive: true
    }).select('+password');
};

module.exports = mongoose.model('Admin', adminSchema);
