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

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    console.log('=== REGISTRATION REQUEST START ===');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);

    try {
        const { fullName, email, password, phoneNumber, guardianName } = req.body;

        // Log extracted fields
        console.log('Extracted fields:', {
            fullName,
            email: email ? email.toLowerCase() : undefined,
            password: password ? '[PRESENT]' : '[MISSING]',
            phoneNumber,
            guardianName
        });

        // Validate required fields
        const missingFields = [];
        if (!fullName) missingFields.push('fullName');
        if (!email) missingFields.push('email');
        if (!password) missingFields.push('password');
        if (!phoneNumber) missingFields.push('phoneNumber');
        if (!guardianName) missingFields.push('guardianName');

        if (missingFields.length > 0) {
            console.log('Missing fields:', missingFields);
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`,
                missingFields
            });
        }

        // Check if user already exists
        console.log('Checking for existing user...');
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { phoneNumber: phoneNumber }
            ]
        });

        if (existingUser) {
            console.log('Existing user found:', {
                email: existingUser.email,
                phone: existingUser.phoneNumber
            });

            let conflictMessage = 'User already exists';
            if (existingUser.email === email.toLowerCase()) {
                conflictMessage = 'User already exists with this email';
            } else if (existingUser.phoneNumber === phoneNumber) {
                conflictMessage = 'User already exists with this phone number';
            }

            return res.status(409).json({ message: conflictMessage });
        }

        console.log('No existing user found, proceeding with registration...');

        // Create user data object (password will be hashed by User model pre-save hook)
        const userData = {
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password: password, // Will be hashed by User model pre-save hook
            phoneNumber: phoneNumber.trim(),
            guardianName: guardianName.trim(),
            role: 'user'
        };

        console.log('User data prepared:', {
            ...userData,
            password: '[WILL_BE_HASHED_BY_MODEL]'
        });

        // Create new user
        console.log('Creating new user...');
        const newUser = new User(userData);

        console.log('User object created, attempting to save...');
        const savedUser = await newUser.save();
        console.log('User saved successfully:', {
            id: savedUser._id,
            email: savedUser.email,
            fullName: savedUser.fullName
        });

        // Generate JWT token
        console.log('Generating JWT token...');
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            {
                id: savedUser._id,
                email: savedUser.email,
                role: savedUser.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        console.log('JWT token generated successfully');

        const response = {
            message: 'Registration successful',
            token,
            user: {
                id: savedUser._id,
                email: savedUser.email,
                fullName: savedUser.fullName,
                role: savedUser.role
            }
        };

        console.log('Sending success response:', {
            ...response,
            token: '[TOKEN_PRESENT]'
        });

        res.status(201).json(response);
        console.log('=== REGISTRATION REQUEST SUCCESS ===');

    } catch (error) {
        console.error('=== REGISTRATION ERROR ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Full error:', error);

        // Mongoose validation error
        if (error.name === 'ValidationError') {
            console.log('Mongoose validation error detected');
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message,
                value: err.value
            }));
            console.log('Validation errors:', errors);

            return res.status(400).json({
                message: 'Validation failed',
                errors,
                type: 'ValidationError'
            });
        }

        // MongoDB duplicate key error
        if (error.code === 11000) {
            console.log('MongoDB duplicate key error detected');
            console.log('Duplicate key info:', error.keyValue);

            return res.status(409).json({
                message: 'User already exists with this email or phone number',
                type: 'DuplicateKey'
            });
        }

        // JWT Secret missing error
        if (error.message.includes('secretOrPrivateKey')) {
            console.error('JWT_SECRET is missing or invalid');
            return res.status(500).json({
                message: 'Server configuration error',
                type: 'ConfigError'
            });
        }

        console.log('Sending generic server error response');
        res.status(500).json({
            message: 'Server error during registration',
            type: 'ServerError',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
        console.log('=== REGISTRATION REQUEST ERROR END ===');
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    console.log('=== LOGIN REQUEST START ===');
    console.log('Request body:', req.body);

    try {
        const { email, password } = req.body;

        // Log what we received
        console.log('Login attempt for:', { email, password: password ? '[PRESENT]' : '[MISSING]' });

        // Validate required fields for LOGIN only
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required for login'
            });
        }

        // Find user by email
        console.log('Looking for user with email:', email.toLowerCase());
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            console.log('❌ User not found for email:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log('✅ User found:', user._id);

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                message: 'Account is disabled. Please contact support.'
            });
        }

        // Check password
        console.log('Checking password...');
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            console.log('❌ Invalid password for user:', user._id);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log('✅ Password valid for user:', user._id);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        console.log('Generating JWT token...');
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role || 'user'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        console.log('✅ JWT token generated, length:', token.length);

        // Get student data if user is a student
        let studentData = null;
        if (user.role === 'student') {
            const Student = require('../models/Student');
            const student = await Student.findOne({ user: user._id });
            if (student) {
                // Update last login in student profile too
                student.lastLogin = new Date();
                await student.save();

                studentData = {
                    id: student._id,
                    studentId: student.studentId,
                    course: student.course,
                    isProfileComplete: student.isProfileComplete,
                    status: student.status
                };
            }
        }

        console.log('✅ Login successful for user:', user._id);
        console.log('=== LOGIN REQUEST END ===');

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role || 'user',
                ...studentData
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
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

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id || decoded.userId;
        console.log('JWT decoded:', decoded);
        console.log('Extracted userId:', userId);

        const user = await User.findById(userId).select('-password');
        console.log('Found user:', user ? user._id : 'NOT FOUND');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        res.json({
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
});

// DEBUG ROUTE - Add this temporarily
router.get('/debug', (req, res) => {
    console.log('Environment check:', {
        NODE_ENV: process.env.NODE_ENV,
        JWT_SECRET: process.env.JWT_SECRET ? 'PRESENT' : 'MISSING',
        MONGODB_URI: process.env.MONGODB_URI ? 'PRESENT' : 'MISSING',
        PORT: process.env.PORT
    });

    res.json({
        environment: process.env.NODE_ENV,
        jwtSecret: process.env.JWT_SECRET ? 'PRESENT' : 'MISSING',
        mongoUri: process.env.MONGODB_URI ? 'PRESENT' : 'MISSING',
        port: process.env.PORT || 5000,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
