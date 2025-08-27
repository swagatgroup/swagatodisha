const express = require('express');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const User = require('../models/User');
const {
    protect,
    authorize,
    isStudent,
    isStaff,
    isSuperAdmin,
    checkOwnership,
    canModifySensitiveFields,
    canDelete
} = require('../middleware/auth');

const router = express.Router();

// @desc    Get all students (Staff/Admin only)
// @route   GET /api/students
// @access  Private - Staff/Admin
router.get('/', protect, authorize('staff', 'super_admin'), async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            currentClass,
            academicYear,
            hasAgent,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter query
        const filter = {};

        if (search) {
            filter.$or = [
                { 'user.firstName': { $regex: search, $options: 'i' } },
                { 'user.lastName': { $regex: search, $options: 'i' } },
                { studentId: { $regex: search, $options: 'i' } },
                { aadharNumber: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) filter.status = status;
        if (currentClass) filter.currentClass = currentClass;
        if (academicYear) filter.academicYear = academicYear;

        if (hasAgent === 'true') {
            filter['agentReferral.agent'] = { $exists: true, $ne: null };
        } else if (hasAgent === 'false') {
            filter['agentReferral.agent'] = { $exists: false };
        }

        // Build sort query
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const students = await Student.find(filter)
            .populate('user', 'firstName lastName email phone')
            .populate('agentReferral.agent', 'firstName lastName referralCode')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        // Get total count for pagination
        const total = await Student.countDocuments(filter);

        res.json({
            success: true,
            data: students,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching students'
        });
    }
});

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private - Student (own profile) or Staff/Admin
router.get('/:id', protect, checkOwnership('Student'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('user', 'firstName lastName email phone profilePicture')
            .populate('agentReferral.agent', 'firstName lastName referralCode')
            .populate('createdBy', 'firstName lastName')
            .populate('updatedBy', 'firstName lastName');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            data: student
        });

    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching student'
        });
    }
});

// @desc    Update student profile
// @route   PUT /api/students/:id
// @access  Private - Student (own profile) or Staff/Admin
router.put('/:id', [
    protect,
    checkOwnership('Student'),
    canModifySensitiveFields,
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
    body('phone').optional().matches(/^[0-9]{10}$/),
    body('currentClass').optional().trim().notEmpty(),
    body('stream').optional().isIn(['Science', 'Commerce', 'Arts', 'Engineering', 'Medical', 'Other']),
    body('academicYear').optional().trim().notEmpty(),
    body('fatherName').optional().trim().notEmpty(),
    body('motherName').optional().trim().notEmpty(),
    body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    body('panNumber').optional().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
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

        const student = req.resource;
        const updateData = req.body;

        // Update student fields
        Object.keys(updateData).forEach(key => {
            if (key !== 'aadharNumber' || req.user.role === 'super_admin') {
                student[key] = updateData[key];
            }
        });

        // Update user fields if provided
        if (updateData.firstName || updateData.lastName || updateData.phone) {
            const userUpdate = {};
            if (updateData.firstName) userUpdate.firstName = updateData.firstName;
            if (updateData.lastName) userUpdate.lastName = updateData.lastName;
            if (updateData.phone) userUpdate.phone = updateData.phone;

            await User.findByIdAndUpdate(student.user, userUpdate);
        }

        student.updatedBy = req.user._id;
        await student.save();

        // Populate updated data
        const updatedStudent = await Student.findById(student._id)
            .populate('user', 'firstName lastName email phone profilePicture')
            .populate('agentReferral.agent', 'firstName lastName referralCode');

        res.json({
            success: true,
            message: 'Student updated successfully',
            data: updatedStudent
        });

    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating student'
        });
    }
});

// @desc    Delete student (Super Admin only)
// @route   DELETE /api/students/:id
// @access  Private - Super Admin only
router.delete('/:id', protect, isSuperAdmin, canDelete, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Delete associated user
        await User.findByIdAndDelete(student.user);

        // Delete student
        await Student.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });

    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting student'
        });
    }
});

// @desc    Get student statistics
// @route   GET /api/students/stats/overview
// @access  Private - Staff/Admin
router.get('/stats/overview', protect, authorize('staff', 'super_admin'), async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const activeStudents = await Student.countDocuments({ status: 'active' });
        const studentsWithAgent = await Student.countDocuments({ 'agentReferral.agent': { $exists: true, $ne: null } });
        const studentsWithoutAgent = totalStudents - studentsWithAgent;

        // Class-wise distribution
        const classDistribution = await Student.aggregate([
            { $group: { _id: '$currentClass', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // Stream-wise distribution
        const streamDistribution = await Student.aggregate([
            { $match: { stream: { $exists: true, $ne: null } } },
            { $group: { _id: '$stream', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // Recent enrollments (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentEnrollments = await Student.countDocuments({
            enrollmentDate: { $gte: thirtyDaysAgo }
        });

        res.json({
            success: true,
            data: {
                totalStudents,
                activeStudents,
                studentsWithAgent,
                studentsWithoutAgent,
                classDistribution,
                streamDistribution,
                recentEnrollments
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching statistics'
        });
    }
});

// @desc    Get students by agent
// @route   GET /api/students/agent/:agentId
// @access  Private - Staff/Admin or Agent (own referrals)
router.get('/agent/:agentId', protect, async (req, res) => {
    try {
        const { agentId } = req.params;

        // Check if user is the agent or staff/admin
        if (req.user.role === 'agent' && req.user._id.toString() !== agentId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own referrals.'
            });
        }

        if (!['agent', 'staff', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const students = await Student.find({ 'agentReferral.agent': agentId })
            .populate('user', 'firstName lastName email phone')
            .populate('agentReferral.agent', 'firstName lastName referralCode')
            .sort({ enrollmentDate: -1 });

        res.json({
            success: true,
            data: students
        });

    } catch (error) {
        console.error('Get students by agent error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching students by agent'
        });
    }
});

// @desc    Update student attendance
// @route   PUT /api/students/:id/attendance
// @access  Private - Staff/Admin
router.put('/:id/attendance', [
    protect,
    authorize('staff', 'super_admin'),
    body('month').notEmpty().withMessage('Month is required'),
    body('year').notEmpty().withMessage('Year is required'),
    body('totalDays').isInt({ min: 1 }).withMessage('Total days must be a positive integer'),
    body('presentDays').isInt({ min: 0 }).withMessage('Present days must be a non-negative integer')
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

        const { month, year, totalDays, presentDays } = req.body;

        if (presentDays > totalDays) {
            return res.status(400).json({
                success: false,
                message: 'Present days cannot exceed total days'
            });
        }

        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        await student.updateAttendance(month, year, presentDays, totalDays);
        student.updatedBy = req.user._id;
        await student.save();

        res.json({
            success: true,
            message: 'Attendance updated successfully',
            data: student
        });

    } catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating attendance'
        });
    }
});

// @desc    Update student academic performance
// @route   PUT /api/students/:id/academic
// @access  Private - Staff/Admin
router.put('/:id/academic', [
    protect,
    authorize('staff', 'super_admin'),
    body('semester').notEmpty().withMessage('Semester is required'),
    body('subjects').isArray().withMessage('Subjects must be an array'),
    body('subjects.*.name').notEmpty().withMessage('Subject name is required'),
    body('subjects.*.marks').isFloat({ min: 0 }).withMessage('Subject marks must be a positive number'),
    body('subjects.*.maxMarks').isFloat({ min: 1 }).withMessage('Max marks must be a positive number')
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

        const { semester, subjects, remarks } = req.body;

        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Calculate totals and percentages
        let totalMarks = 0;
        let maxTotalMarks = 0;

        subjects.forEach(subject => {
            totalMarks += subject.marks;
            maxTotalMarks += subject.maxMarks;
            subject.percentage = Math.round((subject.marks / subject.maxMarks) * 100);
        });

        const overallPercentage = Math.round((totalMarks / maxTotalMarks) * 100);

        // Determine grade
        let grade = 'F';
        if (overallPercentage >= 90) grade = 'A+';
        else if (overallPercentage >= 80) grade = 'A';
        else if (overallPercentage >= 70) grade = 'B+';
        else if (overallPercentage >= 60) grade = 'B';
        else if (overallPercentage >= 50) grade = 'C';
        else if (overallPercentage >= 40) grade = 'D';

        const academicRecord = {
            semester,
            subjects,
            totalMarks,
            maxTotalMarks,
            percentage: overallPercentage,
            grade,
            remarks: remarks || ''
        };

        // Update or add academic record
        const existingIndex = student.academicPerformance.findIndex(
            record => record.semester === semester
        );

        if (existingIndex >= 0) {
            student.academicPerformance[existingIndex] = academicRecord;
        } else {
            student.academicPerformance.push(academicRecord);
        }

        student.updatedBy = req.user._id;
        await student.save();

        res.json({
            success: true,
            message: 'Academic performance updated successfully',
            data: student
        });

    } catch (error) {
        console.error('Update academic performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating academic performance'
        });
    }
});

module.exports = router;
