const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createApplication,
    getApplication,
    updateApplicationStage,
    saveDraft,
    submitApplication,
    generateApplicationPDF,
    downloadApplicationPDF,
    getApplicationsByStatus,
    approveApplication,
    rejectApplication,
    getWorkflowStats
} = require('../controllers/studentApplicationWorkflowController');

// Student routes
router.post('/create', protect, createApplication);
router.get('/my-application', protect, getApplication);
router.put('/:applicationId/stage', protect, updateApplicationStage);
router.put('/:applicationId/save-draft', protect, saveDraft);
router.put('/:applicationId/submit', protect, submitApplication);
router.post('/:applicationId/generate-pdf', protect, generateApplicationPDF);
router.get('/:applicationId/download-pdf', protect, downloadApplicationPDF);

// Staff/Admin routes
router.get('/applications', protect, getApplicationsByStatus);
router.put('/:applicationId/approve', protect, approveApplication);
router.put('/:applicationId/reject', protect, rejectApplication);
router.get('/stats', protect, getWorkflowStats);

module.exports = router;
