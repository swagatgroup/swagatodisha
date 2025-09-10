const express = require('express');
const router = express.Router();
const {
    generateReferralCode,
    toggleReferralStatus,
    getReferralStats,
    validateReferralCode,
    getAllReferralUsers
} = require('../controllers/referralController');
const { protect, restrictTo } = require('../middleware/auth');

// Generate referral code (admin only)
router.post('/generate', protect, restrictTo('admin', 'super_admin'), generateReferralCode);

// Toggle referral status (admin only)
router.put('/:userId/toggle', protect, restrictTo('admin', 'super_admin'), toggleReferralStatus);

// Get referral statistics
router.get('/stats/:userId', protect, getReferralStats);

// Validate referral code (public)
router.post('/validate', validateReferralCode);

// Get all users with referral codes (admin only)
router.get('/all', protect, restrictTo('admin', 'super_admin'), getAllReferralUsers);

module.exports = router;
