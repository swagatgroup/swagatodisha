const User = require('../models/User');
const StudentApplication = require('../models/StudentApplication');
const Student = require('../models/Student');

// Generate referral code for user
const generateReferralCode = async (req, res) => {
    try {
        const userId = req.user._id;

        // Ensure user has a referralCode
        let user = await User.findById(userId);
        
        if (!user.referralCode) {
            // It will be auto-generated in the pre-save hook
            await user.save();
        }

        res.status(200).json({
            success: true,
            data: {
                referralCode: user.referralCode
            }
        });
    } catch (error) {
        console.error('Generate referral code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate referral code',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get referral data for any user (Student, Agent, Staff)
// Tier-based earnings calculation
const calculateEarnings = (successfulCount) => {
    if (successfulCount <= 0) return 0;
    let rate;
    if (successfulCount <= 10) rate = 2000;
    else if (successfulCount <= 25) rate = 3000;
    else if (successfulCount <= 50) rate = 4000;
    else if (successfulCount <= 100) rate = 5000;
    else rate = 5000; // 100+ gets prize (tracked separately)
    return successfulCount * rate;
};

const getReferralData = async (req, res) => {
    try {
        const Admin = require('../models/Admin');
        const userId = req.user._id;
        const userRole = req.user.role;

        let user = await User.findById(userId);
        let isAdmin = false;
        if (!user) {
            user = await Admin.findById(userId);
            isAdmin = true;
        }
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (!user.referralCode) {
            try {
                user.referralCode = user.generateReferralCode();
                user.isReferralActive = true;
                await user.save({ validateBeforeSave: false });
            } catch (e) { console.error('Error auto-generating referral code', e); }
        }

        const referralCode = user.referralCode;

        // Query 1: apps where this user is the referrer (referralInfo.referredBy = userId)
        // For students: exclude their own application (isOwnApplication: true) to avoid
        // showing the agent's referral on the student's dashboard.
        const referralQuery = { 'referralInfo.referredBy': userId };
        if (userRole === 'student') {
            referralQuery.isOwnApplication = { $ne: true }; // only apps they referred, not their own
        }
        const byReferralCode = await StudentApplication.find(referralQuery)
            .select('_id personalDetails.fullName courseDetails.selectedCourse status createdAt submitterRole')
            .sort({ createdAt: -1 });

        // Query 2: for agents/staff — apps they submitted FOR others (or fallbacks where user = agentId)
        let byDirectSubmission = [];
        if (userRole === 'agent' || userRole === 'staff' || isAdmin) {
            byDirectSubmission = await StudentApplication.find({
                submittedBy: userId
            }).select('_id personalDetails.fullName courseDetails.selectedCourse status createdAt submitterRole').sort({ createdAt: -1 });
        }
        // For students: also include apps they submitted via referral tab (submittedBy = student, isOwnApplication = false)
        if (userRole === 'student') {
            const studentReferralSubmissions = await StudentApplication.find({
                submittedBy: userId,
                isOwnApplication: false
            }).select('_id personalDetails.fullName courseDetails.selectedCourse status createdAt submitterRole').sort({ createdAt: -1 });
            byDirectSubmission = studentReferralSubmissions;
        }


        // Merge and deduplicate by _id
        const seen = new Set();
        const allReferrals = [];
        for (const ref of [...byReferralCode, ...byDirectSubmission]) {
            const id = ref._id.toString();
            if (!seen.has(id)) {
                seen.add(id);
                allReferrals.push(ref);
            }
        }
        allReferrals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        let successfulReferrals = 0;
        let pendingReferrals = 0;

        const formattedReferrals = allReferrals.map(ref => {
            let referralStatus = 'PENDING';
            if (ref.status === 'COMPLETE' || ref.status === 'APPROVED' || ref.status === 'ENROLLED') {
                referralStatus = 'SUCCESSFUL';
                successfulReferrals++;
            } else if (ref.status === 'REJECTED') {
                referralStatus = 'FAILED';
            } else {
                pendingReferrals++;
            }
            return {
                name: ref.personalDetails?.fullName || 'N/A',
                course: ref.courseDetails?.selectedCourse || 'N/A',
                status: referralStatus,
                date: ref.createdAt,
                source: ref.submitterRole === 'agent' ? 'Direct' : 'Referral Code'
            };
        });

        const totalReferrals = allReferrals.length;
        const totalEarnings = calculateEarnings(successfulReferrals);
        const isEligibleForPrize = successfulReferrals > 100;

        // Get financial details from whichever model
        const freshUser = isAdmin ? await Admin.findById(userId) : await User.findById(userId);

        res.status(200).json({
            success: true,
            data: {
                referralCode,
                totalReferrals,
                successfulReferrals,
                pendingReferrals,
                totalEarnings,
                isEligibleForPrize,
                recentReferrals: formattedReferrals.slice(0, 50),
                financialDetails: freshUser?.financialDetails || null
            }
        });
    } catch (error) {
        console.error('Get referral data error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get referral data',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Track referral (No-op now since we calculate dynamically on fetch)
const trackReferral = async (req, res) => {
    res.status(200).json({ success: true, message: 'Referral tracking is now dynamic.' });
};

// Update referral status (No-op now since we calculate dynamically on fetch)
const updateReferralStatus = async (req, res) => {
    res.status(200).json({ success: true, message: 'Referral status is now dynamic.' });
};

// Get referral statistics for admin
const getReferralStats = async (req, res) => {
    try {
        const stats = await StudentApplication.aggregate([
            {
                $match: { 'referralInfo.referredBy': { $exists: true, $ne: null } }
            },
            {
                $group: {
                    _id: '$referralInfo.referredBy',
                    total: { $sum: 1 },
                    successful: {
                        $sum: {
                            $cond: [{ $in: ['$status', ['COMPLETE', 'APPROVED', 'ENROLLED']] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        let totalReferrals = 0;
        let totalSuccessful = 0;
        let topReferrers = [];

        for (const stat of stats) {
            totalReferrals += stat.total;
            totalSuccessful += stat.successful;
            
            let user = await User.findById(stat._id).select('fullName email firstName lastName');
            if (!user) {
                const Admin = require('../models/Admin');
                user = await Admin.findById(stat._id).select('firstName lastName email');
            }
            if (user) {
                const fullName = user.fullName || `${user.firstName} ${user.lastName}`;
                const pAmount = stat.successful > 10 ? 1000 : 500;
                topReferrers.push({
                    studentId: { _id: user._id, fullName, email: user.email },
                    successfulReferrals: stat.successful,
                    totalReferrals: stat.total,
                    totalEarnings: stat.successful * pAmount
                });
            }
        }

        // Sort by successful referrals descending
        topReferrers.sort((a, b) => b.successfulReferrals - a.successfulReferrals);

        const globalPerAmount = totalSuccessful > 10 ? 1000 : 500;

        res.status(200).json({
            success: true,
            data: {
                totalReferrals,
                totalSuccessful,
                totalEarnings: totalSuccessful * globalPerAmount,
                topReferrers: topReferrers.slice(0, 10)
            }
        });
    } catch (error) {
        console.error('Get referral stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get referral statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Update student bank details for referral payment
// @route   PUT /api/referral/bank-details
// @access  Private (Student only)
const updateBankDetails = async (req, res) => {
    try {
        const { bankAccountNumber, ifscCode, accountHolderName, bankName } = req.body;
        
        let user = await User.findById(req.user._id);
        if (!user) {
            const Admin = require('../models/Admin');
            user = await Admin.findById(req.user._id);
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User profile not found' });
        }

        const currentFinancials = user.financialDetails || {};
        let resetToPending = false;
        
        if (
            currentFinancials.bankAccountNumber !== bankAccountNumber ||
            currentFinancials.ifscCode !== ifscCode ||
            currentFinancials.accountHolderName !== accountHolderName ||
            currentFinancials.bankName !== bankName
        ) {
            if (currentFinancials.verificationStatus === 'VERIFIED') {
                resetToPending = true;
            }
        }

        user.financialDetails = {
            ...currentFinancials,
            bankAccountNumber,
            ifscCode,
            accountHolderName,
            bankName,
            verificationStatus: resetToPending ? 'PENDING' : (currentFinancials.verificationStatus || 'PENDING'),
            verificationNotes: resetToPending ? '' : currentFinancials.verificationNotes
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Bank details updated successfully',
            data: user.financialDetails
        });
    } catch (error) {
        console.error('Update bank details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update bank details',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Verify a referral code and return the referrer's name
// @route   GET /api/referral/verify/:code
// @access  Public
const verifyReferralCode = async (req, res) => {
    try {
        const { code } = req.params;
        if (!code) {
            return res.status(400).json({ success: false, message: 'Referral code is required' });
        }

        const referrer = await User.findOne({
            $or: [
                { referralCode: code },
                { email: code.toLowerCase().trim() }
            ]
        }).select('firstName lastName fullName role');

        if (!referrer) {
            return res.status(404).json({ success: false, message: 'Invalid referral code' });
        }

        res.status(200).json({
            success: true,
            referrerName: referrer.fullName || `${referrer.firstName || ''} ${referrer.lastName || ''}`.trim(),
            role: referrer.role
        });

    } catch (error) {
        console.error('Error verifying referral code:', error);
        res.status(500).json({ success: false, message: 'Server error verifying referral code' });
    }
};

module.exports = {
    generateReferralCode,
    getReferralData,
    trackReferral,
    updateReferralStatus,
    getReferralStats,
    updateBankDetails,
    verifyReferralCode
};