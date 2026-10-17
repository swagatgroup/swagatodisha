const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const StudentApplication = require('../models/StudentApplication');
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
    uploadInstallmentReceipt,
    advanceWorkflowStep
    // PDF upload/storage functions removed
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
router.put('/:applicationId/upload-installment-receipt', protect, uploadInstallmentReceipt);

// PDF upload/storage endpoints removed - return 404 for any requests to removed endpoints
router.post('/:applicationId/upload-pdf', protect, (req, res) => {
    res.status(404).json({
        success: false,
        message: 'PDF upload endpoint has been removed. PDFs are generated client-side only and not stored on the server.'
    });
});

router.get('/:applicationId/pdf', protect, (req, res) => {
    res.status(404).json({
        success: false,
        message: 'PDF retrieval endpoint has been removed. PDFs are generated client-side only and not stored on the server.'
    });
});

router.get('/:applicationId/pdf-file', protect, (req, res) => {
    res.status(404).json({
        success: false,
        message: 'PDF file endpoint has been removed. PDFs are generated client-side only and not stored on the server.'
    });
});

// Agent/Staff routes - get applications they submitted
router.get('/submitted-by-me', protect, getSubmittedApplications);

// Staff/Admin routes
router.get('/applications', protect, authorize('staff', 'super_admin'), getApplicationsByStatus);
router.get('/submitted', protect, getSubmittedApplications);
router.get('/:applicationId/review', protect, getApplicationReview);
router.put('/:applicationId/verify', protect, verifyDocuments);
router.put('/:applicationId/approve', protect, approveApplication);
router.put('/:applicationId/reject', protect, rejectApplication);
router.put('/:applicationId/workflow-step', protect, advanceWorkflowStep);
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

// Student rejection details & resubmit routes
// @route   GET /api/student-application/:applicationId/rejection-details
// @desc    Get rejection details for a student's application
// @access  Private - Student only
router.get('/:applicationId/rejection-details', protect, async (req, res) => {
    try {
        const isObjectId = mongoose.Types.ObjectId.isValid(req.params.applicationId);
        const application = await StudentApplication.findOne({
            $or: [
                { applicationId: req.params.applicationId },
                ...(isObjectId ? [{ _id: req.params.applicationId }] : [])
            ],
            $and: [
                {
                    $or: [
                        { user: req.user._id },
                        { submittedBy: req.user._id }
                    ]
                }
            ]
        });

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (application.status !== 'REJECTED') {
            return res.status(400).json({ success: false, message: 'Application is not in rejected status' });
        }

        res.json({
            success: true,
            data: {
                rejectionReason: application.reviewInfo?.rejectionReason || '',
                rejectionMessage: application.reviewInfo?.rejectionMessage || 'Application was rejected',
                rejectionDetails: application.reviewInfo?.rejectionDetails || [],
                rejectedAt: application.reviewInfo?.reviewedAt,
                rejectedBy: application.reviewInfo?.reviewedBy
            }
        });
    } catch (error) {
        console.error('Error fetching rejection details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch rejection details' });
    }
});

// @route   POST /api/student-application/:applicationId/resubmit
// @desc    Resubmit a rejected application
// @access  Private - Student only
router.post('/:applicationId/resubmit', protect, async (req, res) => {
    try {
        const isObjectId = mongoose.Types.ObjectId.isValid(req.params.applicationId);
        // Staff/super admins can resubmit any rejected application (after uploading corrected
        // documents from Application Review); students/agents only their own.
        const isReviewer = ['staff', 'super_admin'].includes(req.user.role);
        const application = await StudentApplication.findOne({
            $or: [
                { applicationId: req.params.applicationId },
                ...(isObjectId ? [{ _id: req.params.applicationId }] : [])
            ],
            ...(isReviewer ? {} : {
                $and: [
                    {
                        $or: [
                            { user: req.user._id },
                            { submittedBy: req.user._id }
                        ]
                    }
                ]
            })
        });

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (application.status !== 'REJECTED') {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot resubmit. Application status is ${application.status}, must be REJECTED.` 
            });
        }

        // Staff must replace every rejected document before sending it back for review
        if (isReviewer) {
            const stillRejected = (application.documents || []).filter(doc => doc.status === 'REJECTED');
            if (stillRejected.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Upload corrected files for all rejected documents first (${stillRejected.map(d => d.documentType).join(', ')})`
                });
            }
        }

        const defaultReason = isReviewer
            ? `Corrected documents uploaded by ${req.user.role === 'super_admin' ? 'super admin' : 'staff'}`
            : 'Student resubmission after corrections';

        // Use the model method if available, otherwise do it manually
        if (typeof application.resubmitApplication === 'function') {
            await application.resubmitApplication(req.user._id, req.body.reason || defaultReason);
        } else {
            application.status = 'SUBMITTED';
            application.currentStage = 'SUBMITTED';
            application.submittedAt = new Date();
            
            // Clear review info
            application.reviewInfo = {};
            if (application.reviewStatus) {
                application.reviewStatus.documentsVerified = false;
                application.reviewStatus.overallApproved = false;
            }
            
            // Track resubmission
            if (!application.resubmissionInfo) application.resubmissionInfo = {};
            application.resubmissionInfo.isResubmission = true;
            application.resubmissionInfo.resubmissionCount = (application.resubmissionInfo.resubmissionCount || 0) + 1;
            application.resubmissionInfo.resubmittedAt = new Date();
            application.resubmissionInfo.resubmittedBy = req.user._id;
            application.resubmissionInfo.resubmissionReason = req.body.reason || defaultReason;
            
            // Add to workflow history
            if (!application.workflowHistory) application.workflowHistory = [];
            application.workflowHistory.push({
                action: 'RESUBMIT',
                performedBy: req.user._id,
                timestamp: new Date(),
                details: 'Student resubmitted application after rejection'
            });
            
            // Add admin note
            if (!application.adminNotes) application.adminNotes = [];
            application.adminNotes.push({
                type: 'RESUBMISSION',
                message: 'Application resubmitted by student after making corrections',
                addedBy: req.user._id,
                addedAt: new Date()
            });
            
            await application.save();
        }

        res.json({
            success: true,
            message: 'Application resubmitted successfully. It will be reviewed again.',
            data: { status: application.status, applicationId: application.applicationId }
        });
    } catch (error) {
        console.error('Error resubmitting application:', error);
        res.status(500).json({ success: false, message: 'Failed to resubmit application' });
    }
});

module.exports = router;
