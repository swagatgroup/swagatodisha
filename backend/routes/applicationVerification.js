const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
    getPendingVerifications,
    getApplicationForVerification,
    approveApplication,
    rejectApplication,
    getRejectedApplications,
    resubmitApplication,
    getVerificationStats
} = require('../controllers/applicationVerificationController');

const router = express.Router();

// @desc    Get applications pending verification (Staff/Super Admin)
// @route   GET /api/verification/pending
// @access  Private - Staff/Super Admin only
router.get('/pending', protect, authorize(['staff', 'super_admin']), getPendingVerifications);

// @desc    Get application details for verification
// @route   GET /api/verification/:applicationId
// @access  Private - Staff/Super Admin only
router.get('/:applicationId', protect, authorize(['staff', 'super_admin']), getApplicationForVerification);

// @desc    Approve application
// @route   PUT /api/verification/:applicationId/approve
// @access  Private - Staff/Super Admin only
router.put('/:applicationId/approve', protect, authorize(['staff', 'super_admin']), approveApplication);

// @desc    Reject application with detailed message
// @route   PUT /api/verification/:applicationId/reject
// @access  Private - Staff/Super Admin only
router.put('/:applicationId/reject', protect, authorize(['staff', 'super_admin']), rejectApplication);

// @desc    Get rejected applications
// @route   GET /api/verification/rejected
// @access  Private - Staff/Super Admin only
router.get('/rejected/list', protect, authorize(['staff', 'super_admin']), getRejectedApplications);

// @desc    Get verification statistics
// @route   GET /api/verification/stats
// @access  Private - Staff/Super Admin only
router.get('/stats/overview', protect, authorize(['staff', 'super_admin']), getVerificationStats);

// @desc    Resubmit rejected application (Agent)
// @route   PUT /api/verification/:applicationId/resubmit
// @access  Private - Agent only
router.put('/:applicationId/resubmit', protect, authorize(['agent']), resubmitApplication);

module.exports = router;

