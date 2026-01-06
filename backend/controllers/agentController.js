const StudentApplication = require('../models/StudentApplication');
const Student = require('../models/Student');

// Get students under an agent
const getMyStudents = async (req, res) => {
    try {
        const { search, status, course, page = 1, limit = 20 } = req.query;
        const agentId = req.user._id;

        let query = { agentId };

        if (search) {
            query.$or = [
                { 'personalDetails.fullName': { $regex: search, $options: 'i' } },
                { 'personalDetails.aadharNumber': { $regex: search, $options: 'i' } },
                { 'contactDetails.primaryPhone': { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            query.status = status;
        }

        if (course) {
            query['courseDetails.selectedCourse'] = course;
        }

        const students = await StudentApplication.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await StudentApplication.countDocuments(query);

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
        console.error('Get my students error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get students',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get student statistics for agent
const getStudentStats = async (req, res) => {
    try {
        const agentId = req.user._id;

        const total = await StudentApplication.countDocuments({ agentId });
        const pending = await StudentApplication.countDocuments({ agentId, status: 'PENDING' });
        const completed = await StudentApplication.countDocuments({ agentId, status: 'COMPLETED' });

        // This month's registrations
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const thisMonth = await StudentApplication.countDocuments({
            agentId,
            createdAt: { $gte: startOfMonth }
        });

        res.status(200).json({
            success: true,
            data: {
                total,
                pending,
                completed,
                thisMonth
            }
        });
    } catch (error) {
        console.error('Get student stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get student statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get student by ID (agent's own students only)
const getStudentById = async (req, res) => {
    try {
        const { studentId } = req.params;
        const agentId = req.user._id;

        const student = await StudentApplication.findOne({
            _id: studentId,
            agentId
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found or not under your management'
            });
        }

        res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        console.error('Get student by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get student',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update student status (agent can update their own students)
const updateStudentStatus = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { status, notes } = req.body;
        const agentId = req.user._id;

        const student = await StudentApplication.findOneAndUpdate(
            { _id: studentId, agentId },
            {
                status,
                notes: notes || '',
                lastModified: new Date(),
                modifiedBy: agentId
            },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found or not under your management'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Student status updated successfully',
            data: student
        });
    } catch (error) {
        console.error('Update student status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update student status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get agent dashboard analytics
const getDashboardAnalytics = async (req, res) => {
    try {
        const agentId = req.user._id;

        // Basic stats
        const totalStudents = await StudentApplication.countDocuments({ agentId });
        const pendingStudents = await StudentApplication.countDocuments({ agentId, status: 'PENDING' });
        const completedStudents = await StudentApplication.countDocuments({ agentId, status: 'COMPLETED' });

        // This month's registrations
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const thisMonthRegistrations = await StudentApplication.countDocuments({
            agentId,
            createdAt: { $gte: startOfMonth }
        });

        // Recent students
        const recentStudents = await StudentApplication.find({ agentId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('personalDetails.fullName personalDetails.aadharNumber courseDetails.selectedCourse status createdAt');

        // Course distribution
        const courseDistribution = await StudentApplication.aggregate([
            { $match: { agentId } },
            { $group: { _id: '$courseDetails.selectedCourse', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Status distribution
        const statusDistribution = await StudentApplication.aggregate([
            { $match: { agentId } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalStudents,
                    pendingStudents,
                    completedStudents,
                    thisMonthRegistrations
                },
                recentStudents,
                courseDistribution,
                statusDistribution
            }
        });
    } catch (error) {
        console.error('Get dashboard analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    getMyStudents,
    getStudentStats,
    getStudentById,
    updateStudentStatus,
    getDashboardAnalytics
};
