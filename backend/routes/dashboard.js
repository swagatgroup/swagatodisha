const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getStudentDashboard,
    getAgentDashboard,
    getStaffDashboard,
    getSuperAdminDashboard
} = require('../controllers/dashboardController');

// Student Dashboard
router.get('/student', protect, getStudentDashboard);

// Agent Dashboard
router.get('/agent', protect, getAgentDashboard);

// Staff Dashboard
router.get('/staff', protect, getStaffDashboard);

// Super Admin Dashboard
router.get('/super-admin', protect, getSuperAdminDashboard);

module.exports = router;
