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
const getReferralData = async (req, res) => {
    try {
        const userId = req.user._id;

        // Ensure user has a referralCode
        let user = await User.findById(userId);
        if (!user) {
            const Admin = require('../models/Admin');
            user = await Admin.findById(userId);
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.referralCode) {
            // It will be auto-generated in the pre-save hook or generate method
            try {
                user.referralCode = user.generateReferralCode();
                user.isReferralActive = true;
                await user.save({ validateBeforeSave: false });
            } catch (e) { console.error('Error auto-generating referral code', e); }
        }

        const referralCode = user.referralCode;

        // Get all referrals made by this user dynamically
        const allReferrals = await StudentApplication.find({
            'referralInfo.referredBy': userId
        }).select('personalDetails.fullName courseDetails.selectedCourse status createdAt').sort({ createdAt: -1 });

        let successfulReferrals = 0;
        let pendingReferrals = 0;
        const totalReferrals = allReferrals.length;

        const formattedReferrals = allReferrals.map(ref => {
            let referralStatus = 'PENDING';
            if (ref.status === 'COMPLETE' || ref.status === 'APPROVED' || ref.status === 'ENROLLED') {
                referralStatus = 'SUCCESSFUL';
                successfulReferrals++;
            } else if (ref.status === 'REJECTED') {
                referralStatus = 'FAILED';
            } else {
                referralStatus = 'PENDING';
                pendingReferrals++;
            }

            return {
                name: ref.personalDetails?.fullName || 'N/A',
                course: ref.courseDetails?.selectedCourse || 'N/A',
                status: referralStatus,
                date: ref.createdAt
            };
        });

        // Bracket logic for earnings: 
        // 1-10 referrals = 500 Rs per referral
        // >10 referrals = 1000 Rs per referral for ALL successful referrals
        const perReferralAmount = successfulReferrals > 10 ? 1000 : 500;
        const totalEarnings = successfulReferrals * perReferralAmount;

        // Also fetch user to get financial details
        const currentUser = await User.findById(userId);

        res.status(200).json({
            success: true,
            data: {
                referralCode,
                totalReferrals,
                successfulReferrals,
                pendingReferrals,
                totalEarnings,
                // Only return top 10 recent
                recentReferrals: formattedReferrals.slice(0, 10),
                financialDetails: currentUser?.financialDetails || null
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
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User profile not found' });
        }

        let resetToPending = false;
        if (
            user.financialDetails.bankAccountNumber !== req.body.bankAccountNumber ||
            user.financialDetails.ifscCode !== req.body.ifscCode ||
            user.financialDetails.accountHolderName !== req.body.accountHolderName ||
            user.financialDetails.bankName !== req.body.bankName
        ) {
            if (user.financialDetails.verificationStatus === 'VERIFIED') {
                resetToPending = true;
            }
        }

        user.financialDetails = {
            ...user.financialDetails,
            bankAccountNumber,
            ifscCode,
            accountHolderName,
            bankName,
            verificationStatus: resetToPending ? 'PENDING' : (user.financialDetails.verificationStatus || 'PENDING'),
            verificationNotes: resetToPending ? '' : user.financialDetails.verificationNotes
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

module.exports = {
    generateReferralCode,
    getReferralData,
    trackReferral,
    updateReferralStatus,
    getReferralStats,
    updateBankDetails
};