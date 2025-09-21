const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createApplication,
    getApplication,
    getUserApplications,
    updateApplicationStage,
    saveDraft,
    submitApplication,
    generateApplicationPDF,
    downloadApplicationPDF,
    getApplicationsByStatus,
    approveApplication,
    rejectApplication,
    getWorkflowStats,
    getSubmittedApplications,
    verifyDocuments,
    generateCombinedPDF,
    generateDocumentsZIP,
    getApplicationReview
} = require('../controllers/studentApplicationWorkflowController');

// Student routes
router.post('/create', protect, createApplication);
router.get('/my-application', protect, getApplication);
router.get('/my-applications', protect, getUserApplications);
router.put('/:applicationId/stage', protect, updateApplicationStage);
router.put('/:applicationId/save-draft', protect, saveDraft);
router.put('/:applicationId/submit', protect, submitApplication);
router.post('/:applicationId/generate-pdf', protect, generateApplicationPDF);
router.get('/:applicationId/download-pdf', protect, downloadApplicationPDF);

// Agent/Staff routes - get applications they submitted
router.get('/submitted-by-me', protect, getSubmittedApplications);

// Staff/Admin routes
router.get('/applications', protect, getApplicationsByStatus);
router.get('/submitted', protect, getSubmittedApplications);
router.get('/:applicationId/review', protect, getApplicationReview);
router.put('/:applicationId/verify', protect, verifyDocuments);
router.put('/:applicationId/approve', protect, approveApplication);
router.put('/:applicationId/reject', protect, rejectApplication);
router.post('/:applicationId/combined-pdf', protect, generateCombinedPDF);
router.post('/:applicationId/documents-zip', protect, generateDocumentsZIP);
router.get('/stats', protect, getWorkflowStats);

module.exports = router;
