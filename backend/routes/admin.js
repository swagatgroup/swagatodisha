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

// Student Management
router.get('/students', protect, authorize('staff', 'super_admin'), getAllStudents);
router.put('/students/:studentId', protect, authorize('staff', 'super_admin'), updateStudent);
router.delete('/students/:studentId', protect, authorize('super_admin'), deleteStudent);

// Agent Management
router.get('/agents', protect, authorize('staff', 'super_admin'), getAllAgents);
router.post('/agents', protect, authorize('super_admin'), createAgent);
router.put('/agents/:agentId', protect, authorize('staff', 'super_admin'), updateAgent);
router.delete('/agents/:agentId', protect, authorize('super_admin'), deleteAgent);

// Staff Management
router.get('/staff', protect, authorize('super_admin'), getAllStaff);
router.get('/staff/for-assignment', protect, authorize('staff', 'super_admin'), getStaffForAssignment);
router.post('/staff', protect, authorize('super_admin'), createStaff);
router.put('/staff/:staffId', protect, authorize('super_admin'), updateStaff);
router.delete('/staff/:staffId', protect, authorize('super_admin'), deleteStaff);

// Password Management
router.post('/reset-password', protect, authorize('super_admin'), resetPassword);

// Website Settings Management
router.get('/website-settings', protect, authorize('super_admin'), getWebsiteSettings);
router.put('/website-settings', protect, authorize('super_admin'), updateWebsiteSettings);
router.post('/upload-website-image', protect, authorize('super_admin'), upload.single('image'), uploadWebsiteImage);

module.exports = router;
