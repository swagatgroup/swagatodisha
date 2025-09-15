const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getStudentDashboard,
    getAgentDashboard,
    getStaffDashboard
} = require('../controllers/analyticsController');

// Role-specific dashboard analytics
router.get('/dashboard/student', protect, getStudentDashboard);
router.get('/dashboard/agent', protect, getAgentDashboard);
router.get('/dashboard/staff', protect, getStaffDashboard);

module.exports = router;


