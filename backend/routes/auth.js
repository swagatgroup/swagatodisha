const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect, rateLimit } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token with 7-day expiration
const generateToken = (id, role = 'user') => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '7d' // 7-day auto-login
    });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
    return jwt.sign({ id, type: 'refresh' }, process.env.JWT_SECRET, {
        expiresIn: '30d' // 30-day refresh token
    });
};

// @desc    Register a new user (Student, Agent, Staff, Super Admin)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    console.log('=== REGISTRATION REQUEST START ===');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);

    try {
        const { fullName, email, password, phoneNumber, guardianName, role = 'student' } = req.body;

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

        // Validate role
        const validRoles = ['student', 'agent', 'staff', 'super_admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be one of: student, agent, staff, super_admin'
            });
        }

        // Create user data object (password will be hashed by User model pre-save hook)
        const userData = {
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password: password, // Will be hashed by User model pre-save hook
            phoneNumber: phoneNumber.trim(),
            guardianName: guardianName.trim(),
            role: role
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

        // Generate JWT token with 7-day expiration
        console.log('Generating JWT token...');
        const token = generateToken(savedUser._id, savedUser.role);
        const refreshToken = generateRefreshToken(savedUser._id);
        console.log('JWT token generated successfully');

        const response = {
            success: true,
            message: 'Registration successful',
            data: {
                token,
                refreshToken,
                user: {
                    id: savedUser._id,
                    email: savedUser.email,
                    fullName: savedUser.fullName,
                    role: savedUser.role
                },
                sessionExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
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
                success: false,
                message: 'Email and password are required for login'
            });
        }

        // First, try to find user in User model (students, agents, regular users)
        console.log('Looking for user in User model with email:', email.toLowerCase());
        let user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        let userType = 'user';

        // If not found in User model, try Admin model (staff, super_admin)
        if (!user) {
            console.log('User not found in User model, checking Admin model...');
            const Admin = require('../models/Admin');
            const adminUser = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

            if (adminUser) {
                console.log('✅ Admin user found:', adminUser._id);
                user = adminUser;
                userType = 'admin';
            }
        } else {
            console.log('✅ User found in User model:', user._id);
        }

        if (!user) {
            console.log('❌ User not found in any model for email:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is disabled. Please contact support.'
            });
        }

        // Check password
        console.log('Checking password...');
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            console.log('❌ Invalid password for user:', user._id);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        console.log('✅ Password valid for user:', user._id);

        // Update last login WITHOUT validation
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        // Generate JWT token with 7-day expiration
        console.log('Generating JWT token...');
        const token = generateToken(user._id, user.role || 'user');
        const refreshToken = generateRefreshToken(user._id);
        console.log('✅ JWT token generated, length:', token.length);

        // Get student data if user is a student
        let studentData = null;
        if (user.role === 'student') {
            const Student = require('../models/Student');
            const student = await Student.findOne({ user: user._id });
            if (student) {
                // Update last login in student profile too (without validation)
                student.lastLogin = new Date();
                await student.save({ validateBeforeSave: false });

                studentData = {
                    id: student._id,
                    studentId: student.studentId,
                    course: student.course,
                    isProfileComplete: student.isProfileComplete,
                    status: student.status
                };
            }
        }

        // Prepare user data for response
        let userData = {
            id: user._id,
            email: user.email,
            role: user.role || 'user'
        };

        // Add appropriate name field based on user type
        if (userType === 'admin') {
            userData.fullName = user.fullName || `${user.firstName} ${user.lastName}`;
        } else {
            userData.fullName = user.fullName;
        }

        // Add student data if applicable
        if (studentData) {
            userData = { ...userData, ...studentData };
        }

        console.log('✅ Login successful for user:', user._id);
        console.log('=== LOGIN REQUEST END ===');

        res.json({
            success: true,
            message: 'Login successful',
            token,
            refreshToken,
            user: userData,
            sessionExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
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

// @desc    Forgot password - Admin call functionality
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

        // Check both User and Admin models
        let user = await User.findOne({ email });
        let userType = 'user';

        if (!user) {
            const Admin = require('../models/Admin');
            user = await Admin.findOne({ email });
            userType = 'admin';
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email'
            });
        }

        // Set default passwords based on role
        const defaultPasswords = {
            'student': 'SG@99student',
            'agent': 'SG@99agent',
            'staff': 'SG@99staff',
            'super_admin': 'SG@99admin'
        };

        const defaultPassword = defaultPasswords[user.role] || 'SG@99user';

        // Update password to default
        user.password = defaultPassword;
        user.passwordChangedAt = new Date();
        await user.save();

        // Return admin contact information for password reset
        res.json({
            success: true,
            message: 'Password reset to default. Please contact admin to change your password.',
            data: {
                adminContact: {
                    phone: '+91-9876543210', // Placeholder - should be from environment
                    email: 'admin@swagatodisha.com',
                    message: 'Your password has been reset to default. Please contact admin to change it.'
                },
                defaultPassword: process.env.NODE_ENV === 'development' ? defaultPassword : undefined
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

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Get user
        let user;
        const userType = decoded.userType || 'user';

        if (userType === 'admin') {
            const Admin = require('../models/Admin');
            user = await Admin.findById(decoded.id).select('-password');
        } else {
            user = await User.findById(decoded.id).select('-password');
        }

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        // Generate new tokens
        const newToken = generateToken(user._id, user.role);
        const newRefreshToken = generateRefreshToken(user._id);

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            token: newToken,
            refreshToken: newRefreshToken,
            sessionExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
});

// @desc    Admin reset user password
// @route   POST /api/auth/admin-reset-password
// @access  Private (Super Admin only)
router.post('/admin-reset-password', [
    protect,
    body('userId').notEmpty().withMessage('User ID is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
    try {
        // Check if user is super admin
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Super Admin only.'
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { userId, newPassword } = req.body;

        // Find user in both models
        let user = await User.findById(userId);
        let userType = 'user';

        if (!user) {
            const Admin = require('../models/Admin');
            user = await Admin.findById(userId);
            userType = 'admin';
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update password
        user.password = newPassword;
        user.passwordChangedAt = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully',
            data: {
                userId: user._id,
                userType,
                resetBy: req.user._id,
                resetAt: new Date()
            }
        });

    } catch (error) {
        console.error('Admin password reset error:', error);
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
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id || decoded.userId;
        const userType = decoded.userType || 'user';
        console.log('JWT decoded:', decoded);
        console.log('Extracted userId:', userId, 'userType:', userType);

        let user;

        // Check appropriate model based on userType
        if (userType === 'admin') {
            const Admin = require('../models/Admin');
            user = await Admin.findById(userId).select('-password');
            console.log('Found admin user:', user ? user._id : 'NOT FOUND');
        } else {
            user = await User.findById(userId).select('-password');
            console.log('Found user:', user ? user._id : 'NOT FOUND');
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prepare user data
        let userData = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        // Add appropriate name field based on user type
        if (userType === 'admin') {
            userData.fullName = user.fullName || `${user.firstName} ${user.lastName}`;
        } else {
            userData.fullName = user.fullName;
        }

        res.json({
            success: true,
            data: {
                user: userData
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
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
