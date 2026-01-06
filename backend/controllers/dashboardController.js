const User = require('../models/User');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

// Student Dashboard
const getStudentDashboard = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id })
            .populate('user', 'firstName lastName email phone profilePicture')
            .populate('agentReferral.agent', 'firstName lastName referralCode');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        // Get academic performance summary
        const academicSummary = {
            currentClass: student.currentClass,
            academicYear: student.academicYear,
            status: student.status,
            progress: student.progress,
            attendancePercentage: student.currentAttendancePercentage,
            feeStatus: student.feeStatus
        };

        // Get recent activities (if any)
        const recentActivities = [];

        res.json({
            success: true,
            data: {
                student: {
                    id: student._id,
                    studentId: student.studentId,
                    user: student.user,
                    academicSummary,
                    agentInfo: student.agentReferral,
                    recentActivities
                }
            }
        });
    } catch (error) {
        console.error('Error getting student dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching student dashboard',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Agent Dashboard
const getAgentDashboard = async (req, res) => {
    try {
        const agent = await User.findById(req.user._id).select('-password');

        if (!agent || agent.role !== 'agent') {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        // Get referral statistics
        const referralStats = await Student.aggregate([
            { $match: { 'agentReferral.agent': req.user._id } },
            {
                $group: {
                    _id: null,
                    totalReferrals: { $sum: 1 },
                    successfulReferrals: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
                    pendingReferrals: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
                }
            }
        ]);

        const stats = referralStats[0] || {
            totalReferrals: 0,
            successfulReferrals: 0,
            pendingReferrals: 0
        };

        // Get recent referrals
        const recentReferrals = await Student.find({ 'agentReferral.agent': req.user._id })
            .populate('user', 'firstName lastName email phone')
            .sort({ createdAt: -1 })
            .limit(10);

        // Calculate commission (assuming 5% of successful referrals)
        const commissionRate = 5; // 5%
        const totalCommission = stats.successfulReferrals * commissionRate;

        res.json({
            success: true,
            data: {
                agent: {
                    id: agent._id,
                    firstName: agent.firstName,
                    lastName: agent.lastName,
                    email: agent.email,
                    referralCode: agent.referralCode,
                    phone: agent.phone
                },
                stats: {
                    totalReferrals: stats.totalReferrals,
                    successfulReferrals: stats.successfulReferrals,
                    pendingReferrals: stats.pendingReferrals,
                    successRate: stats.totalReferrals > 0
                        ? Math.round((stats.successfulReferrals / stats.totalReferrals) * 100)
                        : 0,
                    totalCommission
                },
                recentReferrals
            }
        });
    } catch (error) {
        console.error('Error getting agent dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching agent dashboard',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Staff Dashboard
const getStaffDashboard = async (req, res) => {
    try {
        const staff = await Admin.findById(req.user._id).select('-password');

        if (!staff || !['staff', 'super_admin'].includes(staff.role)) {
            return res.status(404).json({
                success: false,
                message: 'Staff profile not found'
            });
        }

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Get statistics
        const [
            totalStudents,
            pendingApplications,
            approvedApplications,
            totalAgents,
            newStudents,
            recentApplications,
            agentPerformance
        ] = await Promise.all([
            // Total Students
            Student.countDocuments({ status: 'active' }),

            // Pending Applications
            Student.countDocuments({ status: 'pending' }),

            // Approved Applications
            Student.countDocuments({ status: 'approved' }),

            // Total Agents
            User.countDocuments({ role: 'agent', isActive: true }),

            // New Students in last 30 days
            Student.countDocuments({
                createdAt: { $gte: thirtyDaysAgo },
                status: 'active'
            }),

            // Recent Applications
            Student.find({ status: 'pending' })
                .populate('user', 'firstName lastName email phone')
                .populate('agentReferral.agent', 'firstName lastName referralCode')
                .sort({ createdAt: -1 })
                .limit(10),

            // Agent Performance
            User.aggregate([
                { $match: { role: 'agent', isActive: true } },
                {
                    $lookup: {
                        from: 'students',
                        localField: '_id',
                        foreignField: 'agentReferral.agent',
                        as: 'referrals'
                    }
                },
                {
                    $project: {
                        firstName: 1,
                        lastName: 1,
                        referralCode: 1,
                        totalReferrals: { $size: '$referrals' },
                        successfulReferrals: {
                            $size: {
                                $filter: {
                                    input: '$referrals',
                                    cond: { $eq: ['$$this.status', 'approved'] }
                                }
                            }
                        }
                    }
                },
                { $sort: { totalReferrals: -1 } },
                { $limit: 5 }
            ])
        ]);

        res.json({
            success: true,
            data: {
                staff: {
                    id: staff._id,
                    firstName: staff.firstName,
                    lastName: staff.lastName,
                    email: staff.email,
                    role: staff.role,
                    department: staff.department,
                    designation: staff.designation
                },
                stats: {
                    totalStudents,
                    pendingApplications,
                    approvedApplications,
                    totalAgents,
                    newStudents
                },
                recentApplications,
                agentPerformance
            }
        });
    } catch (error) {
        console.error('Error getting staff dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching staff dashboard',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Super Admin Dashboard
const getSuperAdminDashboard = async (req, res) => {
    try {
        const superAdmin = await Admin.findById(req.user._id).select('-password');

        if (!superAdmin || superAdmin.role !== 'super_admin') {
            return res.status(404).json({
                success: false,
                message: 'Super Admin profile not found'
            });
        }

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Get comprehensive statistics
        const [
            totalStudents,
            totalAgents,
            totalStaff,
            pendingApplications,
            approvedApplications,
            newStudents,
            newAgents,
            recentStudents,
            recentAgents,
            agentPerformance,
            systemStats
        ] = await Promise.all([
            // Total Students
            Student.countDocuments({ status: 'active' }),

            // Total Agents
            User.countDocuments({ role: 'agent', isActive: true }),

            // Total Staff
            Admin.countDocuments({ role: 'staff', isActive: true }),

            // Pending Applications
            Student.countDocuments({ status: 'pending' }),

            // Approved Applications
            Student.countDocuments({ status: 'approved' }),

            // New Students in last 30 days
            Student.countDocuments({
                createdAt: { $gte: thirtyDaysAgo },
                status: 'active'
            }),

            // New Agents in last 30 days
            User.countDocuments({
                role: 'agent',
                isActive: true,
                createdAt: { $gte: thirtyDaysAgo }
            }),

            // Recent Students
            Student.find({ status: 'active' })
                .populate('user', 'firstName lastName email phone')
                .populate('agentReferral.agent', 'firstName lastName referralCode')
                .sort({ createdAt: -1 })
                .limit(10),

            // Recent Agents
            User.find({ role: 'agent', isActive: true })
                .select('firstName lastName email phone referralCode referralStats createdAt')
                .sort({ createdAt: -1 })
                .limit(10),

            // Agent Performance
            User.aggregate([
                { $match: { role: 'agent', isActive: true } },
                {
                    $lookup: {
                        from: 'students',
                        localField: '_id',
                        foreignField: 'agentReferral.agent',
                        as: 'referrals'
                    }
                },
                {
                    $project: {
                        firstName: 1,
                        lastName: 1,
                        referralCode: 1,
                        totalReferrals: { $size: '$referrals' },
                        successfulReferrals: {
                            $size: {
                                $filter: {
                                    input: '$referrals',
                                    cond: { $eq: ['$$this.status', 'approved'] }
                                }
                            }
                        }
                    }
                },
                { $sort: { totalReferrals: -1 } },
                { $limit: 10 }
            ]),

            // System Statistics
            {
                totalUsers: await User.countDocuments(),
                totalAdmins: await Admin.countDocuments(),
                totalStudents: await Student.countDocuments()
            }
        ]);

        res.json({
            success: true,
            data: {
                superAdmin: {
                    id: superAdmin._id,
                    firstName: superAdmin.firstName,
                    lastName: superAdmin.lastName,
                    email: superAdmin.email,
                    role: superAdmin.role
                },
                overview: {
                    totalStudents,
                    totalAgents,
                    totalStaff,
                    pendingApplications,
                    approvedApplications,
                    newStudents,
                    newAgents
                },
                recentStudents,
                recentAgents,
                agentPerformance,
                systemStats
            }
        });
    } catch (error) {
        console.error('Error getting super admin dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching super admin dashboard',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Enhanced Workflow Functions
// Register a new student with enhanced classification
const registerStudent = async (req, res) => {
    try {
        const {
            personalDetails,
            contactDetails,
            courseDetails,
            guardianDetails,
            registrationSource = 'direct'
        } = req.body;

        // Determine registration category based on source
        let registrationCategory = 'A'; // Direct registration
        if (registrationSource === 'agent_dashboard') {
            registrationCategory = 'B1'; // Agent-assisted registration
        } else if (registrationSource === 'referral') {
            registrationCategory = 'B2'; // Referral-based registration
        }

        // Create user account
        const user = new User({
            fullName: personalDetails.fullName,
            email: contactDetails.email,
            phoneNumber: contactDetails.primaryPhone,
            role: 'student',
            password: 'temp123', // Will be changed on first login
            guardianName: guardianDetails.guardianName,
            guardianPhone: guardianDetails.guardianPhone,
            isActive: true
        });

        await user.save();

        // Create student record
        const student = new Student({
            user: user._id,
            studentId: `STU${Date.now()}`,
            personalDetails,
            contactDetails,
            courseDetails,
            guardianDetails,
            registrationCategory,
            workflowStatus: {
                currentStage: 'registration_complete',
                stageHistory: [{
                    stage: 'registration_complete',
                    timestamp: new Date(),
                    updatedBy: req.user._id,
                    notes: 'Student registration completed'
                }],
                assignedAgent: req.user.role === 'agent' ? req.user._id : null,
                assignedStaff: null,
                priority: 'normal'
            },
            profileCompletionStatus: {
                completionPercentage: 0,
                lastUpdated: new Date(),
                requiredFields: [
                    'personalDetails.fullName',
                    'personalDetails.fathersName',
                    'personalDetails.mothersName',
                    'personalDetails.dateOfBirth',
                    'personalDetails.gender',
                    'personalDetails.aadharNumber',
                    'contactDetails.primaryPhone',
                    'contactDetails.email',
                    'contactDetails.permanentAddress.street',
                    'contactDetails.permanentAddress.city',
                    'contactDetails.permanentAddress.state',
                    'contactDetails.permanentAddress.pincode',
                    'courseDetails.selectedCourse',
                    'guardianDetails.guardianName',
                    'guardianDetails.relationship',
                    'guardianDetails.guardianPhone'
                ],
                missingFields: []
            }
        });

        // Calculate initial profile completion
        await student.calculateProfileCompletion();

        await student.save();

        res.status(201).json({
            success: true,
            message: 'Student registered successfully',
            data: {
                student: await Student.findById(student._id).populate('user', 'fullName email phoneNumber'),
                user
            }
        });

    } catch (error) {
        console.error('Register student error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register student',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update workflow stage
const updateWorkflowStage = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { stage, notes, assignedTo } = req.body;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        await student.updateWorkflowStage(stage, req.user._id, notes);

        // Update assignments if provided
        if (assignedTo) {
            if (assignedTo.agent) {
                await student.assignToAgent(assignedTo.agent);
            }
            if (assignedTo.staff) {
                await student.assignToStaff(assignedTo.staff);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Workflow stage updated successfully',
            data: { student: await Student.findById(studentId).populate('user', 'fullName email phoneNumber') }
        });

    } catch (error) {
        console.error('Update workflow stage error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update workflow stage',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get students by workflow stage
const getStudentsByStage = async (req, res) => {
    try {
        const { stage } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const students = await Student.getByWorkflowStage(stage)
            .populate('user', 'fullName email phoneNumber')
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Student.countDocuments({ 'workflowStatus.currentStage': stage });

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
        console.error('Get students by stage error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get students by stage',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get dashboard analytics
const getDashboardAnalytics = async (req, res) => {
    try {
        const userRole = req.user.role;
        let analytics = {};

        if (userRole === 'agent') {
            // Agent-specific analytics
            const totalStudents = await Student.countDocuments({ 'workflowStatus.assignedAgent': req.user._id });
            const pendingStudents = await Student.countDocuments({
                'workflowStatus.assignedAgent': req.user._id,
                'workflowStatus.currentStage': { $in: ['pending_review', 'under_review'] }
            });
            const completedStudents = await Student.countDocuments({
                'workflowStatus.assignedAgent': req.user._id,
                'workflowStatus.currentStage': 'completed'
            });

            analytics = {
                totalStudents,
                pendingStudents,
                completedStudents,
                thisMonthRegistrations: await Student.countDocuments({
                    'workflowStatus.assignedAgent': req.user._id,
                    createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
                })
            };

        } else if (userRole === 'staff') {
            // Staff-specific analytics
            const totalStudents = await Student.countDocuments();
            const pendingVerification = await Student.countDocuments({
                'workflowStatus.currentStage': 'pending_verification'
            });
            const approvedToday = await Student.countDocuments({
                'workflowStatus.currentStage': 'approved',
                'workflowStatus.stageHistory.0.timestamp': {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            });
            const rejectedToday = await Student.countDocuments({
                'workflowStatus.currentStage': 'rejected',
                'workflowStatus.stageHistory.0.timestamp': {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            });

            analytics = {
                totalStudents,
                pendingVerification,
                approvedToday,
                rejectedToday,
                averageProcessingTime: 24 // This would be calculated from actual data
            };

        } else {
            // Super admin analytics
            const totalStudents = await Student.countDocuments();
            const byStage = await Student.aggregate([
                {
                    $group: {
                        _id: '$workflowStatus.currentStage',
                        count: { $sum: 1 }
                    }
                }
            ]);

            analytics = {
                totalStudents,
                byStage: byStage.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            };
        }

        res.status(200).json({
            success: true,
            data: analytics
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
    getStudentDashboard,
    getAgentDashboard,
    getStaffDashboard,
    getSuperAdminDashboard,
    registerStudent,
    updateWorkflowStage,
    getStudentsByStage,
    getDashboardAnalytics
};