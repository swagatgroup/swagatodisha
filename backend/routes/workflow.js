const express = require('express');
const router = express.Router();
const {
    getApplicationStages,
    advanceApplicationStage,
    revertApplicationStage,
    getPendingApplications,
    updateProfileCompletion
} = require('../controllers/workflowController');
const { protect, restrictTo } = require('../middleware/auth');

// Get application stages for a student
router.get('/stages/:studentId', protect, getApplicationStages);

// Advance application stage (staff only)
router.put('/advance/:studentId', protect, restrictTo('staff', 'super_admin'), advanceApplicationStage);

// Revert application stage (staff only)
router.put('/revert/:studentId', protect, restrictTo('staff', 'super_admin'), revertApplicationStage);

// Get pending applications for staff
router.get('/pending/:staffId', protect, restrictTo('staff', 'super_admin'), getPendingApplications);

// Update profile completion status
router.put('/profile-completion/:studentId', protect, updateProfileCompletion);

module.exports = router;
