const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect, rateLimit } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Register a new student (simplified registration)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
    body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
    body('guardianName').trim().isLength({ min: 2, max: 100 }).withMessage('Guardian\'s name must be between 2 and 100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    }),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
    body('course').trim().notEmpty().withMessage('Course selection is required'),
    body('referralCode').optional().isString().withMessage('Referral code must be a string')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const {
            fullName,
            guardianName,
            email,
            password,
            phone,
            course,
            referralCode,
            ...otherFields
        } = req.body;

        // Split full name into first and last name
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // No Aadhar check needed for simplified registration

        // Validate referral code if provided
        let agentUser = null;
        if (referralCode) {
            agentUser = await User.findByReferralCode(referralCode);
            if (!agentUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid referral code'
                });
            }
        }

        // Create user
        const userData = {
            firstName,
            lastName,
            email,
            password,
            phone,
            role: 'student',
            referredBy: agentUser ? agentUser._id : null
        };

        const user = await User.create(userData);

        // Create basic student profile (incomplete - needs profile completion)
        const Student = require('../models/Student');
        const studentData = {
            user: user._id,
            course: course,
            guardianName: guardianName,
            status: 'incomplete', // Mark as incomplete profile
            agentReferral: agentUser ? {
                agent: agentUser._id,
                referralCode: agentUser.referralCode,
                commissionPercentage: 5, // Default 5% commission
                referralDate: new Date()
            } : null,
            createdBy: user._id
        };

        const student = await Student.create(studentData);

        // Generate token
        const token = generateToken(user._id);

        // Update user's last login
        user.lastLogin = new Date();
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please complete your profile to continue.',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    referralCode: user.referredBy ? agentUser.referralCode : null
                },
                student: {
                    id: student._id,
                    studentId: student.studentId,
                    course: student.course,
                    status: student.status
                },
                token,
                requiresProfileCompletion: true,
                profileCompletionMessage: 'Please complete your student profile with additional details like Aadhar number, academic information, and documents.'
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], rateLimit(50, 15 * 60 * 1000), async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is locked
        if (user.isLocked) {
            return res.status(423).json({
                success: false,
                message: 'Account is locked due to multiple failed login attempts. Please try again later.'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            // Increment failed login attempts
            await user.incrementLoginAttempts();

            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Reset login attempts on successful login
        if (user.loginAttempts > 0) {
            await user.resetLoginAttempts();
        }

        // Update last login
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() }, { runValidators: false });

        // Generate token
        const token = generateToken(user._id);

        // Get additional user data based on role
        let additionalData = {};

        if (user.role === 'student') {
            const Student = require('../models/Student');
            const student = await Student.findOne({ user: user._id });
            if (student) {
                additionalData.student = {
                    id: student._id,
                    studentId: student.studentId,
                    currentClass: student.currentClass
                };
            }
        } else if (user.role === 'agent') {
            additionalData.referralCode = user.referralCode;
        }

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture
                },
                ...additionalData,
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        // Get additional data based on role
        let additionalData = {};

        if (user.role === 'student') {
            const Student = require('../models/Student');
            const student = await Student.findOne({ user: user._id });
            if (student) {
                additionalData.student = student;
            }
        } else if (user.role === 'agent') {
            const Student = require('../models/Student');
            const referredStudents = await Student.findByAgent(user._id);
            additionalData.referredStudents = referredStudents.length;
        }

        res.json({
            success: true,
            data: {
                user,
                ...additionalData
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile'
        });
    }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', [
    protect,
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');

        // Check current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        user.passwordChangedAt = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while changing password'
        });
    }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        // TODO: Send email with reset token
        // For now, just return the token (in production, send via email)
        res.json({
            success: true,
            message: 'Password reset token sent to email',
            data: {
                resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
            }
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while processing forgot password request'
        });
    }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
router.put('/reset-password/:resetToken', [
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { resetToken } = req.params;
        const { newPassword } = req.body;

        // Hash the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Find user with valid reset token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.passwordChangedAt = Date.now();

        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while resetting password'
        });
    }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
    // In JWT-based auth, logout is handled client-side by removing the token
    // But we can add any server-side cleanup here if needed
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// @desc    Register a new agent
// @route   POST /api/auth/register-agent
// @access  Public
router.post('/register-agent', [
    body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const {
            firstName,
            lastName,
            email,
            password,
            phone,
            ...otherFields
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create user with agent role
        const userData = {
            firstName,
            lastName,
            email,
            password,
            phone,
            role: 'agent'
        };

        const user = await User.create(userData);

        // Generate token
        const token = generateToken(user._id);

        // Update user's last login
        user.lastLogin = new Date();
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Agent registered successfully',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    referralCode: user.referralCode
                },
                token
            }
        });

    } catch (error) {
        console.error('Agent registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Complete student profile
// @route   POST /api/auth/complete-profile
// @access  Private
router.post('/complete-profile', [
    protect,
    body('aadharNumber').matches(/^[0-9]{12}$/).withMessage('Aadhar number must be 12 digits'),
    body('fatherName').trim().notEmpty().withMessage('Father\'s name is required'),
    body('motherName').trim().notEmpty().withMessage('Mother\'s name is required'),
    body('currentClass').trim().notEmpty().withMessage('Current class is required'),
    body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
    body('dateOfBirth').isISO8601().withMessage('Please provide a valid date of birth'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Please select a valid gender'),
    body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Please select a valid blood group'),
    body('address.street').trim().notEmpty().withMessage('Street address is required'),
    body('address.city').trim().notEmpty().withMessage('City is required'),
    body('address.state').trim().notEmpty().withMessage('State is required'),
    body('address.pincode').matches(/^[0-9]{6}$/).withMessage('Pincode must be 6 digits')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const {
            aadharNumber,
            fatherName,
            motherName,
            currentClass,
            academicYear,
            dateOfBirth,
            gender,
            bloodGroup,
            address,
            previousSchool,
            previousClass,
            previousBoard,
            previousPercentage,
            previousYear,
            specialNeeds,
            medicalConditions,
            emergencyContact
        } = req.body;

        // Check if Aadhar number already exists
        const existingAadhar = await Student.findOne({ aadharNumber });
        if (existingAadhar) {
            return res.status(400).json({
                success: false,
                message: 'Student with this Aadhar number already exists'
            });
        }

        // Find the student profile
        const Student = require('../models/Student');
        const student = await Student.findOne({ user: req.user._id });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        // Update student profile with complete information
        const updatedStudent = await Student.findByIdAndUpdate(
            student._id,
            {
                aadharNumber,
                fatherName,
                motherName,
                currentClass,
                academicYear,
                dateOfBirth: new Date(dateOfBirth),
                gender,
                bloodGroup,
                address,
                previousSchool,
                previousClass,
                previousBoard,
                previousPercentage,
                previousYear,
                specialNeeds,
                medicalConditions,
                emergencyContact,
                status: 'active', // Mark as active after profile completion
                updatedBy: req.user._id
            },
            { new: true, runValidators: true }
        ).populate('user', 'firstName lastName email phone')
            .populate('agentReferral.agent', 'firstName lastName referralCode');

        res.json({
            success: true,
            message: 'Profile completed successfully!',
            data: {
                student: updatedStudent,
                requiresProfileCompletion: false
            }
        });

    } catch (error) {
        console.error('Profile completion error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile completion',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Get profile completion status
// @route   GET /api/auth/profile-status
// @access  Private
router.get('/profile-status', protect, async (req, res) => {
    try {
        const Student = require('../models/Student');
        const student = await Student.findOne({ user: req.user._id })
            .populate('user', 'firstName lastName email phone')
            .populate('agentReferral.agent', 'firstName lastName referralCode');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        const isProfileComplete = student.status === 'active' &&
            student.aadharNumber &&
            student.fatherName &&
            student.motherName &&
            student.currentClass &&
            student.academicYear;

        res.json({
            success: true,
            data: {
                student: {
                    id: student._id,
                    studentId: student.studentId,
                    course: student.course,
                    status: student.status,
                    isProfileComplete,
                    guardianName: student.guardianName
                },
                requiresProfileCompletion: !isProfileComplete,
                profileCompletionMessage: isProfileComplete
                    ? 'Profile is complete!'
                    : 'Please complete your student profile with additional details.'
            }
        });

    } catch (error) {
        console.error('Profile status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while checking profile status'
        });
    }
});

module.exports = router;
