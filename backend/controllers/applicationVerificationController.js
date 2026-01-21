const StudentApplication = require('../models/StudentApplication');
const User = require('../models/User');
const { sendApplicationStatusNotification } = require('../utils/notificationService');

// Get applications pending verification
const getPendingVerifications = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status = 'SUBMITTED',
            submitterRole,
            course,
            search 
        } = req.query;
        
        // Build filter query
        const filter = {};
        
        // Filter by status
        if (status && status !== 'all') {
            filter.status = status;
        }
        
        // Filter by submitter role
        if (submitterRole && submitterRole !== 'all') {
            filter.submitterRole = submitterRole;
        }
        
        // Filter by course
        if (course && course !== 'all') {
            filter['courseDetails.selectedCourse'] = course;
        }
        
        // Search functionality
        if (search) {
            filter.$or = [
                { 'personalDetails.fullName': { $regex: search, $options: 'i' } },
                { 'personalDetails.aadharNumber': { $regex: search, $options: 'i' } },
                { 'contactDetails.primaryPhone': { $regex: search, $options: 'i' } },
                { 'contactDetails.email': { $regex: search, $options: 'i' } },
                { applicationId: { $regex: search, $options: 'i' } }
            ];
        }
        
        const applications = await StudentApplication.find(filter)
        .populate('user', 'fullName email phoneNumber')
        .populate('submittedBy', 'fullName email')
        .populate('assignedAgent', 'fullName email')
        .populate('reviewInfo.reviewedBy', 'fullName email')
        .sort({ submittedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const total = await StudentApplication.countDocuments(filter);
        
        // Get filter options
        const submitterRoles = await StudentApplication.distinct('submitterRole');
        const courses = await StudentApplication.distinct('courseDetails.selectedCourse');
        const statuses = ['UNDER_REVIEW', 'APPROVED', 'REJECTED'];

        res.json({
            success: true,
            data: {
                applications,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                },
                filters: {
                    submitterRoles,
                    courses,
                    statuses
                }
            }
        });
    } catch (error) {
        console.error('Get pending verifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending verifications',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get application details for verification
const getApplicationForVerification = async (req, res) => {
    try {
        const { applicationId } = req.params;
        
        const application = await StudentApplication.findOne({ applicationId })
        .populate('user', 'fullName email phoneNumber')
        .populate('submittedBy', 'fullName email')
        .populate('assignedAgent', 'fullName email')
        .populate('reviewInfo.reviewedBy', 'fullName email');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.json({
            success: true,
            data: application
        });
    } catch (error) {
        console.error('Get application for verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch application details',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Approve application
const approveApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { remarks = 'Application approved by staff' } = req.body;

        const application = await StudentApplication.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        if (application.status !== 'UNDER_REVIEW') {
            return res.status(400).json({
                success: false,
                message: 'Application is not in a state that can be approved. Only applications with status UNDER_REVIEW can be approved.'
            });
        }

        await application.approveApplication(req.user._id, remarks);

        // Send notification to agent
        await sendApplicationStatusNotification(application, 'APPROVED', remarks);

        res.json({
            success: true,
            message: 'Application approved successfully',
            data: {
                status: application.status,
                currentStage: application.currentStage,
                approvedAt: application.reviewInfo.reviewedAt
            }
        });
    } catch (error) {
        console.error('Approve application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Reject application with detailed message
const rejectApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { 
            rejectionReason, 
            rejectionMessage, 
            rejectionDetails = [],
            remarks = '' 
        } = req.body;

        if (!rejectionReason || !rejectionMessage) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason and message are required'
            });
        }

        const application = await StudentApplication.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        if (application.status !== 'UNDER_REVIEW') {
            return res.status(400).json({
                success: false,
                message: 'Application is not in a state that can be rejected. Only applications with status UNDER_REVIEW can be rejected.'
            });
        }

        await application.rejectApplication(
            req.user._id, 
            rejectionReason, 
            remarks, 
            rejectionMessage, 
            rejectionDetails
        );

        // Send notification to agent with rejection details
        await sendApplicationStatusNotification(application, 'REJECTED', rejectionMessage);

        res.json({
            success: true,
            message: 'Application rejected successfully',
            data: {
                status: application.status,
                currentStage: application.currentStage,
                rejectedAt: application.reviewInfo.reviewedAt,
                rejectionMessage,
                rejectionDetails
            }
        });
    } catch (error) {
        console.error('Reject application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get rejected applications for resubmission
const getRejectedApplications = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        
        const applications = await StudentApplication.find({ 
            status: 'REJECTED',
            submitterRole: 'agent'
        })
        .populate('user', 'fullName email phoneNumber')
        .populate('submittedBy', 'fullName email')
        .populate('assignedAgent', 'fullName email')
        .populate('reviewInfo.reviewedBy', 'fullName email')
        .sort({ 'reviewInfo.reviewedAt': -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const total = await StudentApplication.countDocuments({ 
            status: 'REJECTED',
            submitterRole: 'agent'
        });

        res.json({
            success: true,
            data: {
                applications,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get rejected applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch rejected applications',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Allow agent to resubmit rejected application
const resubmitApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { resubmissionReason = 'Application resubmitted after addressing rejection issues' } = req.body;

        const application = await StudentApplication.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        if (application.status !== 'REJECTED') {
            return res.status(400).json({
                success: false,
                message: 'Only rejected applications can be resubmitted'
            });
        }

        // Check if the current user is the agent who submitted this application
        if (application.submittedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the agent who submitted this application can resubmit it'
            });
        }

        await application.resubmitApplication(req.user._id, resubmissionReason);

        res.json({
            success: true,
            message: 'Application resubmitted successfully',
            data: {
                status: application.status,
                currentStage: application.currentStage,
                resubmittedAt: application.resubmissionInfo.resubmittedAt,
                resubmissionCount: application.resubmissionInfo.resubmissionCount
            }
        });
    } catch (error) {
        console.error('Resubmit application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resubmit application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get verification statistics
const getVerificationStats = async (req, res) => {
    try {
        // Overall statistics for all students
        const stats = await StudentApplication.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Statistics by submitter role
        const submitterRoleStats = await StudentApplication.aggregate([
            {
                $group: {
                    _id: '$submitterRole',
                    count: { $sum: 1 },
                    statuses: {
                        $push: '$status'
                    }
                }
            }
        ]);

        // Resubmission statistics
        const resubmissionStats = await StudentApplication.aggregate([
            {
                $match: { 
                    'resubmissionInfo.isResubmission': true
                }
            },
            {
                $group: {
                    _id: '$resubmissionInfo.resubmissionCount',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Monthly statistics
        const monthlyStats = await StudentApplication.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        // Course statistics
        const courseStats = await StudentApplication.aggregate([
            {
                $group: {
                    _id: '$courseDetails.selectedCourse',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                statusStats: stats,
                submitterRoleStats,
                resubmissionStats,
                monthlyStats,
                courseStats,
                totalApplications: await StudentApplication.countDocuments(),
                pendingVerification: await StudentApplication.countDocuments({ 
                    status: 'UNDER_REVIEW'
                }),
                approved: await StudentApplication.countDocuments({ 
                    status: 'APPROVED'
                }),
                rejected: await StudentApplication.countDocuments({ 
                    status: 'REJECTED'
                }),
                agentApplications: await StudentApplication.countDocuments({ submitterRole: 'agent' }),
                studentApplications: await StudentApplication.countDocuments({ submitterRole: 'student' })
            }
        });
    } catch (error) {
        console.error('Get verification stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch verification statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    getPendingVerifications,
    getApplicationForVerification,
    approveApplication,
    rejectApplication,
    getRejectedApplications,
    resubmitApplication,
    getVerificationStats
};
