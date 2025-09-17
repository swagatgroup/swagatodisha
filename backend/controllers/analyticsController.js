const Student = require('../models/Student');
const User = require('../models/User');
const Document = require('../models/Document');
const Admin = require('../models/Admin');
const Payment = require('../models/Payment');

// Helper to build pie dataset [{ name, value, total }]
const buildPie = (entries) => {
    const total = entries.reduce((s, e) => s + e.value, 0) || 0;
    return entries.map(e => ({ ...e, total: total || e.value || 0 }));
};

// GET /api/analytics/dashboard/student
exports.getStudentDashboard = async (req, res) => {
    try {
        const userId = req.user?._id;

        // Derive simple stats; fall back safely if collections differ
        const [pendingDocs, approvedDocs, rejectedDocs] = await Promise.all([
            Document.countDocuments({ uploadedBy: userId, status: 'PENDING' }).catch(() => 0),
            Document.countDocuments({ uploadedBy: userId, status: 'APPROVED' }).catch(() => 0),
            Document.countDocuments({ uploadedBy: userId, status: 'REJECTED' }).catch(() => 0)
        ]);

        // Application progress approximation
        const applicationProgress = buildPie([
            { name: 'Profile', value: 1 },
            { name: 'Documents', value: pendingDocs + approvedDocs + rejectedDocs > 0 ? 1 : 0 },
            { name: 'Review', value: pendingDocs > 0 ? 1 : 0 },
            { name: 'Approval', value: approvedDocs > 0 ? 1 : 0 }
        ]);

        const documentStatus = buildPie([
            { name: 'Approved', value: approvedDocs },
            { name: 'Pending', value: pendingDocs },
            { name: 'Rejected', value: rejectedDocs }
        ]);

        res.json({ success: true, data: { applicationProgress, documentStatus } });
    } catch (error) {
        res.json({ success: true, data: { applicationProgress: buildPie([{ name: 'Profile', value: 1 }]), documentStatus: buildPie([{ name: 'Pending', value: 0 }]) } });
    }
};

// GET /api/analytics/dashboard/agent
exports.getAgentDashboard = async (req, res) => {
    try {
        const agentId = req.user?._id;
        const agent = await User.findById(agentId).lean().catch(() => null);
        const stats = agent?.referralStats || { totalReferrals: 0, approvedReferrals: 0, rejectedReferrals: 0 };

        const studentStatus = buildPie([
            { name: 'Draft', value: 0 },
            { name: 'Submitted', value: stats.totalReferrals || 0 },
            { name: 'Approved', value: stats.approvedReferrals || 0 }
        ]);

        const commissionStatus = buildPie([
            { name: 'Pending', value: Math.max(0, (stats.totalCommission || 0) - (stats.paidCommission || 0)) },
            { name: 'Paid', value: stats.paidCommission || 0 }
        ]);

        const documentVerification = buildPie([
            { name: 'Approved', value: stats.approvedReferrals || 0 },
            { name: 'Pending', value: Math.max(0, (stats.totalReferrals || 0) - (stats.approvedReferrals || 0) - (stats.rejectedReferrals || 0)) },
            { name: 'Rejected', value: stats.rejectedReferrals || 0 }
        ]);

        const monthlyPerformance = buildPie([
            { name: 'Current Month', value: stats.thisMonthReferrals || 0 },
            { name: 'Target', value: 10 }
        ]);

        res.json({ success: true, data: { studentStatus, commissionStatus, documentVerification, monthlyPerformance } });
    } catch (error) {
        res.json({ success: true, data: { studentStatus: buildPie([{ name: 'Draft', value: 0 }]), commissionStatus: buildPie([{ name: 'Pending', value: 0 }]), documentVerification: buildPie([{ name: 'Pending', value: 0 }]), monthlyPerformance: buildPie([{ name: 'Current Month', value: 0 }]) } });
    }
};

// GET /api/analytics/dashboard/staff
exports.getStaffDashboard = async (req, res) => {
    try {
        const [pending, underReview, approved, rejected] = await Promise.all([
            Document.countDocuments({ status: 'PENDING' }).catch(() => 0),
            Document.countDocuments({ status: 'UNDER_REVIEW' }).catch(() => 0),
            Document.countDocuments({ status: 'APPROVED' }).catch(() => 0),
            Document.countDocuments({ status: 'REJECTED' }).catch(() => 0)
        ]);

        const verificationQueue = buildPie([
            { name: 'Pending', value: pending },
            { name: 'Under Review', value: underReview }
        ]);

        const documentCategories = buildPie([
            { name: 'Academic Certificates', value: approved },
            { name: 'Identity Proof', value: pending },
            { name: 'Other', value: rejected }
        ]);

        res.json({ success: true, data: { verificationQueue, documentCategories } });
    } catch (error) {
        res.json({ success: true, data: { verificationQueue: buildPie([{ name: 'Pending', value: 0 }]), documentCategories: buildPie([{ name: 'Other', value: 0 }]) } });
    }
};

// GET /api/analytics/overview
exports.getOverviewAnalytics = async (req, res) => {
    try {
        // Get overall statistics
        const [
            totalStudents,
            totalAgents,
            totalStaff,
            totalAdmins,
            totalDocuments,
            totalPayments
        ] = await Promise.all([
            User.countDocuments({ role: { $in: ['student', 'user'] } }).catch(() => 0),
            User.countDocuments({ role: 'agent' }).catch(() => 0),
            User.countDocuments({ role: 'staff' }).catch(() => 0),
            Admin.countDocuments({ role: 'super_admin' }).catch(() => 0),
            Document.countDocuments().catch(() => 0),
            Payment.countDocuments().catch(() => 0)
        ]);

        // Get recent activity
        const recentStudents = await User.find({ role: { $in: ['student', 'user'] } })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('fullName email createdAt')
            .catch(() => []);

        // Get document status distribution
        const documentStatus = await Document.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).catch(() => []);

        const documentStatusData = buildPie(
            documentStatus.map(item => ({
                name: item._id || 'Unknown',
                value: item.count
            }))
        );

        // Get user role distribution
        const userRoles = buildPie([
            { name: 'Students', value: totalStudents },
            { name: 'Agents', value: totalAgents },
            { name: 'Staff', value: totalStaff },
            { name: 'Admins', value: totalAdmins }
        ]);

        res.json({
            success: true,
            data: {
                overview: {
                    totalStudents,
                    totalAgents,
                    totalStaff,
                    totalAdmins,
                    totalDocuments,
                    totalPayments
                },
                recentActivity: {
                    students: recentStudents
                },
                charts: {
                    documentStatus: documentStatusData,
                    userRoles: userRoles
                }
            }
        });
    } catch (error) {
        console.error('Analytics overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get analytics overview',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};


