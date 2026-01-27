const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
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
    getDocumentReviewStats,
    getSubmittedApplications,
    verifyDocuments,
    fixDocumentReviewStatus,
    generateCombinedPDF,
    generateDocumentsZIP,
    getApplicationReview,
    getDocumentRequirements,
    getDocumentUploadStatus,
    uploadApplicationPDF,
    getApplicationPDF,
    serveApplicationPDF
} = require('../controllers/studentApplicationWorkflowController');

const { fixApplicationDataIntegrity } = require('../scripts/fixApplicationDataIntegrity');

// Student routes
router.post('/create', protect, createApplication);
router.get('/my-application', protect, getApplication);
router.get('/my-applications', protect, getUserApplications);
router.put('/:applicationId/stage', protect, updateApplicationStage);
router.put('/:applicationId/save-draft', protect, saveDraft);
router.put('/:applicationId/submit', protect, submitApplication);
router.post('/:applicationId/generate-pdf', protect, generateApplicationPDF);
router.get('/:applicationId/download-pdf', protect, downloadApplicationPDF);
router.post('/:applicationId/upload-pdf', protect, require('../middleware/upload').uploadSingle('pdf'), uploadApplicationPDF);
router.get('/:applicationId/pdf', protect, getApplicationPDF);
router.get('/:applicationId/pdf-file', protect, serveApplicationPDF);

// Agent/Staff routes - get applications they submitted
router.get('/submitted-by-me', protect, getSubmittedApplications);

// Staff/Admin routes
router.get('/applications', protect, authorize('staff', 'super_admin'), getApplicationsByStatus);
router.get('/submitted', protect, getSubmittedApplications);
router.get('/:applicationId/review', protect, getApplicationReview);
router.put('/:applicationId/verify', protect, verifyDocuments);
router.put('/:applicationId/approve', protect, approveApplication);
router.put('/:applicationId/reject', protect, rejectApplication);
router.post('/:applicationId/combined-pdf', protect, generateCombinedPDF);
router.post('/:applicationId/documents-zip', protect, generateDocumentsZIP);
router.get('/stats', protect, getWorkflowStats);
router.get('/document-review-stats', protect, getDocumentReviewStats);
router.post('/fix-document-review-status', protect, fixDocumentReviewStatus);

// Document requirements routes
router.get('/document-requirements', protect, getDocumentRequirements);
router.get('/:applicationId/document-status', protect, getDocumentUploadStatus);
router.post('/fix-data-integrity', protect, authorize('super_admin'), async (req, res) => {
    try {
        await fixApplicationDataIntegrity();
        res.status(200).json({
            success: true,
            message: 'Application data integrity fix completed successfully'
        });
    } catch (error) {
        console.error('Data integrity fix error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fix data integrity',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
