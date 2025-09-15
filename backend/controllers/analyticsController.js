const Student = require('../models/Student');
const User = require('../models/User');
const Document = require('../models/Document');

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


