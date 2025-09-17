const Student = require('../models/Student');
const StudentApplication = require('../models/StudentApplication');
const Referral = require('../models/Referral');

// Generate referral code for student
const generateReferralCode = async (req, res) => {
    try {
        const studentId = req.user._id;

        // Check if student already has a referral code
        let referral = await Referral.findOne({ studentId });

        if (!referral) {
            // Generate unique referral code
            const referralCode = generateUniqueCode();

            referral = new Referral({
                studentId,
                referralCode,
                totalReferrals: 0,
                successfulReferrals: 0,
                pendingReferrals: 0,
                totalEarnings: 0
            });

            await referral.save();
        }

        res.status(200).json({
            success: true,
            data: {
                referralCode: referral.referralCode,
                totalReferrals: referral.totalReferrals,
                successfulReferrals: referral.successfulReferrals,
                pendingReferrals: referral.pendingReferrals,
                totalEarnings: referral.totalEarnings
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

// Get referral data for student
const getReferralData = async (req, res) => {
    try {
        const studentId = req.user._id;

        let referral = await Referral.findOne({ studentId });

        if (!referral) {
            // Create referral if doesn't exist
            const referralCode = generateUniqueCode();

            referral = new Referral({
                studentId,
                referralCode,
                totalReferrals: 0,
                successfulReferrals: 0,
                pendingReferrals: 0,
                totalEarnings: 0
            });

            await referral.save();
        }

        // Get recent referrals
        const recentReferrals = await StudentApplication.find({
            referredBy: referral.referralCode,
            status: { $in: ['PENDING', 'APPROVED', 'ENROLLED'] }
        })
            .select('personalDetails.fullName courseDetails.selectedCourse status createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        const formattedReferrals = recentReferrals.map(ref => ({
            name: ref.personalDetails?.fullName || 'N/A',
            course: ref.courseDetails?.selectedCourse || 'N/A',
            status: ref.status === 'ENROLLED' ? 'SUCCESSFUL' :
                ref.status === 'APPROVED' ? 'PENDING' : 'PENDING',
            date: ref.createdAt
        }));

        res.status(200).json({
            success: true,
            data: {
                referralCode: referral.referralCode,
                totalReferrals: referral.totalReferrals,
                successfulReferrals: referral.successfulReferrals,
                pendingReferrals: referral.pendingReferrals,
                totalEarnings: referral.totalEarnings,
                recentReferrals: formattedReferrals
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

// Track referral when someone uses a referral code
const trackReferral = async (req, res) => {
    try {
        const { referralCode, applicationId } = req.body;

        if (!referralCode || !applicationId) {
            return res.status(400).json({
                success: false,
                message: 'Referral code and application ID are required'
            });
        }

        // Find the referral record
        const referral = await Referral.findOne({ referralCode });

        if (!referral) {
            return res.status(404).json({
                success: false,
                message: 'Invalid referral code'
            });
        }

        // Update the application with referral info
        const application = await StudentApplication.findByIdAndUpdate(
            applicationId,
            {
                referredBy: referralCode,
                referralStatus: 'PENDING'
            },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Update referral counts
        referral.totalReferrals += 1;
        referral.pendingReferrals += 1;
        await referral.save();

        res.status(200).json({
            success: true,
            message: 'Referral tracked successfully',
            data: {
                referralCode,
                applicationId
            }
        });
    } catch (error) {
        console.error('Track referral error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track referral',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update referral status when application status changes
const updateReferralStatus = async (req, res) => {
    try {
        const { applicationId, newStatus } = req.body;

        const application = await StudentApplication.findById(applicationId);

        if (!application || !application.referredBy) {
            return res.status(404).json({
                success: false,
                message: 'Application not found or not referred'
            });
        }

        const referral = await Referral.findOne({ referralCode: application.referredBy });

        if (!referral) {
            return res.status(404).json({
                success: false,
                message: 'Referral record not found'
            });
        }

        // Update referral status based on application status
        if (newStatus === 'ENROLLED' && application.referralStatus !== 'SUCCESSFUL') {
            referral.successfulReferrals += 1;
            referral.pendingReferrals -= 1;
            referral.totalEarnings += 500; // ₹500 per successful referral
            application.referralStatus = 'SUCCESSFUL';
        } else if (newStatus === 'REJECTED' && application.referralStatus === 'PENDING') {
            referral.pendingReferrals -= 1;
            application.referralStatus = 'FAILED';
        }

        await referral.save();
        await application.save();

        res.status(200).json({
            success: true,
            message: 'Referral status updated successfully',
            data: {
                referralCode: referral.referralCode,
                newStatus: application.referralStatus,
                totalEarnings: referral.totalEarnings
            }
        });
    } catch (error) {
        console.error('Update referral status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update referral status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get referral statistics for admin
const getReferralStats = async (req, res) => {
    try {
        const totalReferrals = await Referral.countDocuments();
        const totalSuccessful = await Referral.aggregate([
            { $group: { _id: null, total: { $sum: '$successfulReferrals' } } }
        ]);
        const totalEarnings = await Referral.aggregate([
            { $group: { _id: null, total: { $sum: '$totalEarnings' } } }
        ]);

        const topReferrers = await Referral.find()
            .populate('studentId', 'fullName email')
            .sort({ successfulReferrals: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                totalReferrals,
                totalSuccessful: totalSuccessful[0]?.total || 0,
                totalEarnings: totalEarnings[0]?.total || 0,
                topReferrers
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

// Helper function to generate unique referral code
const generateUniqueCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

module.exports = {
    generateReferralCode,
    getReferralData,
    trackReferral,
    updateReferralStatus,
    getReferralStats
};