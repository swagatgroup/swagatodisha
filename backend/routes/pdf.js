const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    generateApplicationPDF,
    generatePreviewPDF,
    getPDFDownloadLink,
    downloadPDF,
    getTermsAndConditions
} = require('../controllers/pdfController');

// Generate PDF for application
router.post('/generate/:applicationId', protect, generateApplicationPDF);

// Generate PDF preview
router.post('/preview', protect, generatePreviewPDF);

// Get PDF download link
router.get('/download-link/:applicationId', protect, getPDFDownloadLink);

// Download PDF
router.get('/download/:applicationId', protect, downloadPDF);

// Get terms and conditions
router.get('/terms', getTermsAndConditions);

module.exports = router;
