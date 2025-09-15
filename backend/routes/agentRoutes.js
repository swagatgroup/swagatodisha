const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Student = require('../models/Student');
const User = require('../models/User');
const Payment = require('../models/Payment');

// All routes are protected
router.use(protect);

// Get students assigned to agent
router.get('/students', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;

        let query = { 'workflowStatus.assignedAgent': req.user._id };

        if (status && status !== 'all') {
            query['workflowStatus.currentStage'] = status;
        }

        if (search) {
            query.$or = [
                { 'personalDetails.fullName': { $regex: search, $options: 'i' } },
                { 'studentId': { $regex: search, $options: 'i' } },
                { 'personalDetails.aadharNumber': { $regex: search, $options: 'i' } }
            ];
        }

        const students = await Student.find(query)
            .populate('user', 'fullName email phoneNumber')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Student.countDocuments(query);

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
        console.error('Get agent students error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get students',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get agent commission data
router.get('/commission', async (req, res) => {
    try {
        // Calculate commission based on completed students
        const completedStudents = await Student.countDocuments({
            'workflowStatus.assignedAgent': req.user._id,
            'workflowStatus.currentStage': 'completed'
        });

        const totalCommission = completedStudents * 5000; // ₹5000 per completed student
        const advance = Math.floor(totalCommission * 0.3); // 30% advance
        const due = totalCommission - advance;

        // Mock recent payments
        const recentPayments = [
            {
                _id: '1',
                amount: 15000,
                description: 'Commission Payment - March 2024',
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            },
            {
                _id: '2',
                amount: 10000,
                description: 'Commission Payment - February 2024',
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
        ];

        res.status(200).json({
            success: true,
            data: {
                totalCommission,
                advance,
                due,
                recentPayments
            }
        });
    } catch (error) {
        console.error('Get agent commission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get commission data',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get agent statistics
router.get('/stats', async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments({
            'workflowStatus.assignedAgent': req.user._id
        });

        const pendingStudents = await Student.countDocuments({
            'workflowStatus.assignedAgent': req.user._id,
            'workflowStatus.currentStage': { $in: ['pending_review', 'under_review'] }
        });

        const completedStudents = await Student.countDocuments({
            'workflowStatus.assignedAgent': req.user._id,
            'workflowStatus.currentStage': 'completed'
        });

        const thisMonthRegistrations = await Student.countDocuments({
            'workflowStatus.assignedAgent': req.user._id,
            createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        });

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                pendingStudents,
                completedStudents,
                thisMonthRegistrations
            }
        });
    } catch (error) {
        console.error('Get agent stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Bulk import students
router.post('/bulk-import', async (req, res) => {
    try {
        // This would handle file upload and CSV parsing
        // For now, return a mock response
        res.status(200).json({
            success: true,
            data: {
                imported: 5,
                failed: 0,
                message: 'Students imported successfully'
            }
        });
    } catch (error) {
        console.error('Bulk import error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to import students',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
