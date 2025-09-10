const User = require('../models/User');
const Notification = require('../models/Notification');

// Generate referral code for any user
const generateReferralCode = async (req, res) => {
    try {
        const { userId, customCode } = req.body;

        // Validate admin permissions
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can manage referral codes'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let referralCode;

        if (customCode) {
            // Check if custom code already exists
            const existingCode = await User.findOne({
                referralCode: customCode.toUpperCase(),
                _id: { $ne: userId }
            });

            if (existingCode) {
                return res.status(400).json({
                    success: false,
                    message: 'Referral code already exists'
                });
            }

            referralCode = customCode.toUpperCase();
        } else {
            // Generate unique code
            referralCode = await generateUniqueReferralCode(user.fullName, user.role);
        }

        user.referralCode = referralCode;
        user.isReferralActive = true;
        await user.save();

        // Create notification
        await Notification.createNotification({
            recipient: userId,
            sender: req.user._id,
            type: 'system_update',
            title: 'Referral Code Generated',
            message: `Your referral code ${referralCode} has been generated successfully.`,
            priority: 'medium'
        });

        res.status(200).json({
            success: true,
            message: 'Referral code generated successfully',
            data: {
                referralCode,
                user: {
                    id: user._id,
                    name: user.fullName,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error('Generate referral code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate referral code',
            error: error.message
        });
    }
};

// Generate unique referral code
const generateUniqueReferralCode = async (fullName, role) => {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        const rolePrefix = role.substring(0, 2).toUpperCase();
        const namePrefix = fullName ? fullName.substring(0, 2).toUpperCase() : 'XX';
        const timestamp = Date.now().toString(36).substring(-4);
        const random = Math.random().toString(36).substring(2, 4).toUpperCase();
        const referralCode = `${rolePrefix}${namePrefix}${timestamp}${random}`;

        const existingCode = await User.findOne({ referralCode });
        if (!existingCode) {
            return referralCode;
        }

        attempts++;
    }

    throw new Error('Unable to generate unique referral code');
};

// Toggle referral status
const toggleReferralStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate admin permissions
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can manage referral status'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.referralCode) {
            return res.status(400).json({
                success: false,
                message: 'User does not have a referral code'
            });
        }

        user.isReferralActive = !user.isReferralActive;
        await user.save();

        // Create notification
        await Notification.createNotification({
            recipient: userId,
            sender: req.user._id,
            type: 'system_update',
            title: 'Referral Status Updated',
            message: `Your referral code has been ${user.isReferralActive ? 'activated' : 'deactivated'}.`,
            priority: 'medium'
        });

        res.status(200).json({
            success: true,
            message: `Referral code ${user.isReferralActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                isReferralActive: user.isReferralActive,
                referralCode: user.referralCode
            }
        });
    } catch (error) {
        console.error('Toggle referral status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle referral status',
            error: error.message
        });
    }
};

// Get referral statistics
const getReferralStats = async (req, res) => {
    try {
        const { userId } = req.params;

        // Users can only view their own stats unless admin
        if (req.user._id.toString() !== userId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const user = await User.findById(userId).select('referralStats referralCode isReferralActive');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get detailed referral data
        const referredUsers = await User.find({ referredBy: userId }).select('fullName email role createdAt');

        res.status(200).json({
            success: true,
            data: {
                referralCode: user.referralCode,
                isReferralActive: user.isReferralActive,
                stats: user.referralStats,
                referredUsers: referredUsers.map(user => ({
                    id: user._id,
                    name: user.fullName,
                    email: user.email,
                    role: user.role,
                    joinedAt: user.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('Get referral stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get referral statistics',
            error: error.message
        });
    }
};

// Validate referral code
const validateReferralCode = async (req, res) => {
    try {
        const { referralCode } = req.body;

        if (!referralCode) {
            return res.status(400).json({
                success: false,
                message: 'Referral code is required'
            });
        }

        const user = await User.findByReferralCode(referralCode);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Invalid referral code'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Valid referral code',
            data: {
                referrerName: user.fullName,
                referrerRole: user.role,
                referralCode: user.referralCode
            }
        });
    } catch (error) {
        console.error('Validate referral code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate referral code',
            error: error.message
        });
    }
};

// Get all users with referral codes (admin only)
const getAllReferralUsers = async (req, res) => {
    try {
        // Validate admin permissions
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can view all referral users'
            });
        }

        const users = await User.find({
            referralCode: { $exists: true, $ne: null }
        }).select('fullName email role referralCode isReferralActive referralStats createdAt');

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get all referral users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get referral users',
            error: error.message
        });
    }
};

module.exports = {
    generateReferralCode,
    toggleReferralStatus,
    getReferralStats,
    validateReferralCode,
    getAllReferralUsers
};
