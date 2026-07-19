const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    generateReferralCode,
    getReferralData,
    trackReferral,
    updateReferralStatus,
    getReferralStats,
    updateBankDetails
} = require('../controllers/referralController');

// Student routes (protected)
router.get('/code', protect, generateReferralCode);
router.get('/data', protect, getReferralData);
router.put('/bank-details', protect, updateBankDetails);

// Public routes for tracking referrals
router.post('/track', trackReferral);

// Admin routes (protected)
router.put('/update-status', protect, updateReferralStatus);
router.get('/stats', protect, getReferralStats);

module.exports = router;
