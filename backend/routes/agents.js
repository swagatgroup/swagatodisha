const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getMyStudents,
    getStudentStats,
    getStudentById,
    updateStudentStatus,
    getDashboardAnalytics
} = require('../controllers/agentController');

// All routes require authentication
router.use(protect);

// Get students under the agent
router.get('/my-students', getMyStudents);

// Get student statistics
router.get('/student-stats', getStudentStats);

// Get dashboard analytics
router.get('/dashboard-analytics', getDashboardAnalytics);

// Get specific student (agent's own students only)
router.get('/students/:studentId', getStudentById);

// Update student status
router.put('/students/:studentId/status', updateStudentStatus);

module.exports = router;
