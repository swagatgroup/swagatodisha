const User = require('../models/User');
const StudentApplication = require('../models/StudentApplication');

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

        // 500 Rs per successful referral
        const totalEarnings = successfulReferrals * 500;

        res.status(200).json({
            success: true,
            data: {
                referralCode,
                totalReferrals,
                successfulReferrals,
                pendingReferrals,
                totalEarnings,
                // Only return top 10 recent
                recentReferrals: formattedReferrals.slice(0, 10)
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
                topReferrers.push({
                    studentId: { _id: user._id, fullName, email: user.email },
                    successfulReferrals: stat.successful,
                    totalReferrals: stat.total,
                    totalEarnings: stat.successful * 500
                });
            }
        }

        // Sort by successful referrals descending
        topReferrers.sort((a, b) => b.successfulReferrals - a.successfulReferrals);

        res.status(200).json({
            success: true,
            data: {
                totalReferrals,
                totalSuccessful,
                totalEarnings: totalSuccessful * 500,
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

module.exports = {
    generateReferralCode,
    getReferralData,
    trackReferral,
    updateReferralStatus,
    getReferralStats
};