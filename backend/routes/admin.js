const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const {
    getDashboardStats,
    getAllStudents,
    updateStudent,
    deleteStudent,
    getAllAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    getAllStaff,
    getStaffForAssignment,
    createStaff,
    updateStaff,
    deleteStaff,
    resetPassword,
    getWebsiteSettings,
    updateWebsiteSettings,
    uploadWebsiteImage
} = require('../controllers/adminController');

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Dashboard Statistics
router.get('/dashboard/stats', protect, authorize('staff', 'super_admin'), getDashboardStats);

// Student Management - moved to dedicated adminStudents.js file
// router.get('/students', protect, authorize('staff', 'super_admin'), getAllStudents);
router.put('/students/:studentId', protect, authorize('staff', 'super_admin'), updateStudent);
router.delete('/students/:studentId', protect, authorize('staff', 'super_admin'), deleteStudent); // Staff can now delete

// Agent Management
router.get('/agents', protect, authorize('staff', 'super_admin'), getAllAgents);
router.post('/agents', protect, authorize('super_admin'), createAgent); // Only super_admin can create
router.put('/agents/:agentId', protect, authorize('staff', 'super_admin'), updateAgent);
router.delete('/agents/:agentId', protect, authorize('staff', 'super_admin'), deleteAgent); // Staff can now delete

// Staff Management
router.get('/staff', protect, authorize('staff', 'super_admin'), getAllStaff); // Staff can now view
router.get('/staff/for-assignment', protect, authorize('staff', 'super_admin'), getStaffForAssignment);
router.post('/staff', protect, authorize('super_admin'), createStaff); // Only super_admin can create
router.put('/staff/:staffId', protect, authorize('staff', 'super_admin'), updateStaff); // Staff can now update
router.delete('/staff/:staffId', protect, authorize('staff', 'super_admin'), deleteStaff); // Staff can now delete

// Password Management
router.post('/reset-password', protect, authorize('staff', 'super_admin'), resetPassword); // Staff can now reset passwords

// Website Settings Management
router.get('/website-settings', protect, authorize('staff', 'super_admin'), getWebsiteSettings); // Staff can now view
router.put('/website-settings', protect, authorize('staff', 'super_admin'), updateWebsiteSettings); // Staff can now update
router.post('/upload-website-image', protect, authorize('staff', 'super_admin'), upload.single('image'), uploadWebsiteImage); // Staff can now upload

// Submit application for a student (admin can submit multiple applications)
router.post('/submit-application', protect, authorize('staff', 'super_admin'), async (req, res) => {
    try {
        const {
            studentId,
            personalDetails,
            contactDetails,
            courseDetails,
            guardianDetails,
            financialDetails = {},
            referralCode,
        } = req.body;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: "Student ID is required",
            });
        }

        // Check if student exists
        const User = require('../models/User');
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        // Handle referral code if provided
        let referralInfo = {};
        if (referralCode) {
            const referrer = await User.findOne({ referralCode });
            if (referrer) {
                referralInfo = {
                    referredBy: referrer._id,
                    referralCode,
                    referralType: referrer.role,
                };
            }
        }

        // Convert date string to Date object for personalDetails.dateOfBirth
        if (personalDetails && personalDetails.dateOfBirth) {
            personalDetails.dateOfBirth = new Date(personalDetails.dateOfBirth);
        }

        // Create application data
        const StudentApplication = require('../models/StudentApplication');
        const applicationData = {
            user: studentId, // Student for whom application is being submitted
            personalDetails,
            contactDetails,
            courseDetails,
            guardianDetails,
            financialDetails,
            referralInfo,
            submittedBy: req.user._id, // Admin who is submitting
            submitterRole: req.user.role,
            status: "SUBMITTED",
            currentStage: "SUBMITTED",
            progress: {
                registrationComplete: true,
                documentsComplete: true,
                applicationPdfGenerated: false,
                termsAccepted: true,
                submissionComplete: true,
            },
            submittedAt: new Date(),
            termsAccepted: true,
            termsAcceptedAt: new Date(),
        };

        const application = new StudentApplication(applicationData);
        await application.save();
        await application.populate("user", "fullName email phoneNumber");
        await application.populate("submittedBy", "fullName email");

        res.status(201).json({
            success: true,
            message: "Application submitted successfully for student",
            data: application,
        });
    } catch (error) {
        console.error("Submit application error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit application",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Internal server error",
        });
    }
});

// Get applications submitted by this admin
router.get('/my-submitted-applications', protect, authorize('staff', 'super_admin'), async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const adminId = req.user._id;

        let query = { submittedBy: adminId };
        if (status && status !== "all") {
            query.status = status.toUpperCase();
        }

        const StudentApplication = require('../models/StudentApplication');
        const applications = await StudentApplication.find(query)
            .populate("user", "fullName email phoneNumber")
            .populate("submittedBy", "fullName email")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await StudentApplication.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                applications,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total: total,
                },
            },
        });
    } catch (error) {
        console.error("Get submitted applications error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get submitted applications",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Internal server error",
        });
    }
});

module.exports = router;
