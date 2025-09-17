const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    generateReferralCode,
    getReferralData,
    trackReferral,
    updateReferralStatus,
    getReferralStats
} = require('../controllers/referralController');

// Student routes (protected)
router.get('/code', protect, generateReferralCode);
router.get('/data', protect, getReferralData);

// Public routes for tracking referrals
router.post('/track', trackReferral);

// Admin routes (protected)
router.put('/update-status', protect, updateReferralStatus);
router.get('/stats', protect, getReferralStats);

module.exports = router;
