const User = require('../models/User');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

// Student Dashboard
exports.getStudentDashboard = async (req, res) => {
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
exports.getAgentDashboard = async (req, res) => {
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
exports.getStaffDashboard = async (req, res) => {
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
exports.getSuperAdminDashboard = async (req, res) => {
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
