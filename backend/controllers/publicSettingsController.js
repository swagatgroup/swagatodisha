const WebsiteSettings = require('../models/WebsiteSettings');

// @desc    Get public website settings
// @route   GET /api/public-settings
// @access  Public
exports.getPublicSettings = async (req, res) => {
    try {
        const settings = await WebsiteSettings.findOne();

        if (!settings) {
            return res.status(200).json({
                success: true,
                data: {
                    allowRegistration: true,
                    showReferralRewardTier: true,
                    referralRewardWhitelist: []
                }
            });
        }

        res.status(200).json({
            success: true,
            data: {
                allowRegistration: settings.systemSettings?.allowRegistration ?? true,
                showReferralRewardTier: settings.systemSettings?.showReferralRewardTier ?? true,
                referralRewardWhitelist: settings.systemSettings?.referralRewardWhitelist || []
            }
        });
    } catch (error) {
        console.error('Error in getPublicSettings:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
