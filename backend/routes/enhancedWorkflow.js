const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    registerStudent,
    updateWorkflowStage,
    getStudentsByStage,
    getDashboardAnalytics
} = require('../controllers/enhancedWorkflowController');

// Student registration with enhanced classification
router.post('/register', protect, registerStudent);

// Workflow management
router.put('/workflow/:studentId', protect, updateWorkflowStage);

// Get students by workflow stage
router.get('/students/stage/:stage', protect, getStudentsByStage);

// Dashboard analytics
router.get('/analytics/dashboard', protect, getDashboardAnalytics);

// Get students by category
router.get('/students/category/:category', protect, async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const Student = require('../models/Student');
        const students = await Student.getByCategory(category)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Student.countDocuments({ registrationCategory: category });

        res.status(200).json({
            success: true,
            data: {
                students,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get students by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get students by category',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get students by agent
router.get('/students/agent/:agentId', protect, async (req, res) => {
    try {
        const { agentId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const Student = require('../models/Student');
        const students = await Student.getByAgent(agentId)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Student.countDocuments({ 'workflowStatus.assignedAgent': agentId });

        res.status(200).json({
            success: true,
            data: {
                students,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get students by agent error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get students by agent',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get students by staff
router.get('/students/staff/:staffId', protect, async (req, res) => {
    try {
        const { staffId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const Student = require('../models/Student');
        const students = await Student.getByStaff(staffId)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Student.countDocuments({ 'workflowStatus.assignedStaff': staffId });

        res.status(200).json({
            success: true,
            data: {
                students,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get students by staff error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get students by staff',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get incomplete profiles
router.get('/students/incomplete', protect, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const Student = require('../models/Student');
        const students = await Student.getIncompleteProfiles()
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Student.countDocuments({
            'profileCompletionStatus.completionPercentage': { $lt: 100 },
            status: 'active'
        });

        res.status(200).json({
            success: true,
            data: {
                students,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get incomplete profiles error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get incomplete profiles',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Assign student to agent
router.put('/assign/agent/:studentId', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { agentId } = req.body;

        const Student = require('../models/Student');
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        await student.assignToAgent(agentId);

        res.status(200).json({
            success: true,
            message: 'Student assigned to agent successfully',
            data: { student: await Student.findById(studentId).populate('user', 'fullName email phoneNumber') }
        });
    } catch (error) {
        console.error('Assign student to agent error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign student to agent',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Assign student to staff
router.put('/assign/staff/:studentId', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { staffId } = req.body;

        const Student = require('../models/Student');
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        await student.assignToStaff(staffId);

        res.status(200).json({
            success: true,
            message: 'Student assigned to staff successfully',
            data: { student: await Student.findById(studentId).populate('user', 'fullName email phoneNumber') }
        });
    } catch (error) {
        console.error('Assign student to staff error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign student to staff',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Set student priority
router.put('/priority/:studentId', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { priority } = req.body;

        const Student = require('../models/Student');
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        await student.setPriority(priority);

        res.status(200).json({
            success: true,
            message: 'Student priority updated successfully',
            data: { student: await Student.findById(studentId).populate('user', 'fullName email phoneNumber') }
        });
    } catch (error) {
        console.error('Set student priority error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to set student priority',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get workflow statistics
router.get('/stats', protect, async (req, res) => {
    try {
        const Student = require('../models/Student');

        const totalStudents = await Student.countDocuments();
        const byStage = await Student.aggregate([
            {
                $group: {
                    _id: '$workflowStatus.currentStage',
                    count: { $sum: 1 }
                }
            }
        ]);

        const byCategory = await Student.aggregate([
            {
                $group: {
                    _id: '$registrationCategory',
                    count: { $sum: 1 }
                }
            }
        ]);

        const byPriority = await Student.aggregate([
            {
                $group: {
                    _id: '$workflowStatus.priority',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                byStage: byStage.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                byCategory: byCategory.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                byPriority: byPriority.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            }
        });
    } catch (error) {
        console.error('Get workflow stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get workflow statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
