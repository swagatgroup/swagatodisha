const Assignment = require('../models/Assignment');
const Grade = require('../models/Grade');
const CourseMaterial = require('../models/CourseMaterial');
const User = require('../models/User');

// Get student course
const getStudentCourse = async (req, res) => {
    try {
        console.log('Getting course for student:', req.user._id);

        const student = await User.findById(req.user._id).select('course');
        if (!student || !student.course) {
            return res.status(200).json({
                success: true,
                data: {
                    course: null
                }
            });
        }

        // For now, return mock course data
        const course = {
            _id: 'course123',
            name: student.course || 'DMLT (Diploma in Medical Laboratory Technology)',
            description: 'Comprehensive diploma program in medical laboratory technology',
            duration: '2 Years',
            credits: 120,
            instructor: 'Dr. John Smith',
            progress: 45
        };

        res.status(200).json({
            success: true,
            data: { course }
        });
    } catch (error) {
        console.error('Get student course error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get course information',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get student assignments
const getStudentAssignments = async (req, res) => {
    try {
        console.log('Getting assignments for student:', req.user._id);

        const { status, page = 1, limit = 20 } = req.query;
        const studentId = req.user._id;

        let query = { student: studentId };

        if (status) {
            query.status = status;
        }

        const assignments = await Assignment.find(query)
            .populate('student', 'fullName email')
            .sort({ dueDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Assignment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                assignments,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get student assignments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get assignments',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Submit assignment
const submitAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { submissionData, files } = req.body;
        const studentId = req.user._id;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        // Check if assignment is still open
        if (new Date() > assignment.dueDate) {
            assignment.status = 'late';
        } else {
            assignment.status = 'submitted';
        }

        assignment.submissionData = submissionData;
        assignment.submittedFiles = files || [];
        assignment.submittedDate = new Date();
        assignment.submittedBy = studentId;

        await assignment.save();
        await assignment.populate('student', 'fullName email');

        res.status(200).json({
            success: true,
            message: 'Assignment submitted successfully',
            data: assignment
        });
    } catch (error) {
        console.error('Submit assignment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit assignment',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get student grades
const getStudentGrades = async (req, res) => {
    try {
        console.log('Getting grades for student:', req.user._id);

        const { subject, page = 1, limit = 20 } = req.query;
        const studentId = req.user._id;

        let query = { student: studentId };

        if (subject) {
            query.subject = subject;
        }

        const grades = await Grade.find(query)
            .populate('student', 'fullName email')
            .populate('assignment', 'title subject')
            .sort({ gradedDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Grade.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                grades,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get student grades error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get grades',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get course materials
const getCourseMaterials = async (req, res) => {
    try {
        console.log('Getting course materials for student:', req.user._id);

        const { type, page = 1, limit = 20 } = req.query;
        const studentId = req.user._id;

        let query = { student: studentId };

        if (type) {
            query.type = type;
        }

        const materials = await CourseMaterial.find(query)
            .populate('student', 'fullName email')
            .sort({ uploadDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await CourseMaterial.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                materials,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get course materials error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get course materials',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get academic schedule
const getAcademicSchedule = async (req, res) => {
    try {
        console.log('Getting academic schedule for student:', req.user._id);

        const { startDate, endDate } = req.query;
        const studentId = req.user._id;

        let query = { student: studentId };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // For now, return mock schedule data
        const schedule = [
            {
                _id: 'schedule1',
                title: 'Lecture: Anatomy & Physiology',
                type: 'lecture',
                date: new Date(Date.now() + 24 * 60 * 60 * 1000),
                time: '09:00 AM',
                location: 'Room 101',
                instructor: 'Dr. Smith'
            },
            {
                _id: 'schedule2',
                title: 'Lab: Blood Analysis',
                type: 'lab',
                date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                time: '02:00 PM',
                location: 'Lab 3',
                instructor: 'Dr. Johnson'
            }
        ];

        res.status(200).json({
            success: true,
            data: { schedule }
        });
    } catch (error) {
        console.error('Get academic schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get academic schedule',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    getStudentCourse,
    getStudentAssignments,
    submitAssignment,
    getStudentGrades,
    getCourseMaterials,
    getAcademicSchedule
};
