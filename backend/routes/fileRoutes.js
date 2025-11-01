const express = require('express');
const router = express.Router();
const {
    uploadSingleFile,
    uploadMultipleFiles,
    getFileById,
    getAllFiles,
    deleteFile,
    getStorageStats
} = require('../controllers/fileController');

const { uploadMultipleFilesSimple } = require('../controllers/fileControllerSimple');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const { asyncHandler } = require('../middleware/errorHandler');
const { protect } = require('../middleware/auth');

// @route   POST /api/files/upload
// @desc    Upload single file
// @access  Protected
router.post('/upload', protect, uploadSingle('file'), uploadSingleFile);

// @route   POST /api/files/upload-multiple
// @desc    Upload multiple files
// @access  Protected
router.post('/upload-multiple', protect, uploadMultiple('files', 10), uploadMultipleFiles);

// @route   POST /api/files/upload-multiple-simple
// @desc    Upload multiple files (simple version for speed)
// @access  Protected
router.post('/upload-multiple-simple', protect, uploadMultiple('files', 10), uploadMultipleFilesSimple);

// @route   GET /api/files
// @desc    Get all files with pagination and filtering
// @access  Public
router.get('/', getAllFiles);

// @route   GET /api/files/stats
// @desc    Get file statistics
// @access  Public
router.get('/stats', getStorageStats);

// @route   GET /api/files/health
// @desc    Health check for file routes
// @access  Public
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'File routes are working',
        timestamp: new Date().toISOString(),
        endpoints: {
            upload: 'POST /api/files/upload',
            uploadMultiple: 'POST /api/files/upload-multiple',
            getFile: 'GET /api/files/:id',
            getAllFiles: 'GET /api/files',
            deleteFile: 'DELETE /api/files/:id'
        }
    });
});

// @route   GET /api/files/download/:fileName
// @desc    Download file by filename (from processed directory)
// @desc    Robust: Checks database for application, regenerates if needed, handles production ephemeral filesystem
// @access  Protected (but can work without auth if file exists)
// NOTE: This route must come before /:id to avoid route conflicts
router.get('/download/:fileName', async (req, res) => {
    try {
        const { fileName } = req.params;
        const fs = require('fs');
        const path = require('path');

        // Security: prevent path traversal
        if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid filename'
            });
        }

        // Extract applicationId from filename if it's a combined PDF or ZIP
        // Format: application_APP25114337_combined_1762009731872.pdf
        // Format: application_APP25114337_documents_1762009731872.zip
        let applicationId = null;
        const appIdMatch = fileName.match(/application_([A-Z0-9]+)_(combined|documents)/);
        if (appIdMatch) {
            applicationId = appIdMatch[1];
        }

        // Try multiple possible file locations
        const possiblePaths = [
            path.join(__dirname, '../uploads/processed', fileName),
            path.join(__dirname, '../uploads', fileName),
            path.join(process.cwd(), 'uploads/processed', fileName),
            path.join(process.cwd(), 'uploads', fileName)
        ];

        let filePath = null;
        for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
                filePath = possiblePath;
                break;
            }
        }

        // If file doesn't exist and we have an applicationId, try to regenerate
        if (!filePath && applicationId) {
            try {
                const StudentApplication = require('../models/StudentApplication');
                const pdfGenerator = require('../utils/pdfGenerator');

                const application = await StudentApplication.findOne({ applicationId })
                    .populate('user', 'fullName email phoneNumber');

                if (application) {
                    console.log(`📄 File not found, attempting to regenerate for ${applicationId}`);

                    let result;

                    // Check if it's a ZIP or PDF request
                    if (fileName.includes('_documents_') && fileName.endsWith('.zip')) {
                        // Regenerate ZIP
                        const selectedDocuments = application.documents || [];
                        result = await pdfGenerator.generateDocumentsZIP(application, selectedDocuments);
                        console.log(`✅ ZIP regenerated: ${result.filePath}`);
                    } else if (fileName.includes('_combined_') && fileName.endsWith('.pdf')) {
                        // Regenerate combined PDF
                        result = await pdfGenerator.generateCombinedPDF(application);

                        // Update application with new path
                        application.combinedPdfUrl = `/uploads/processed/${result.fileName}`;
                        application.progress.applicationPdfGenerated = true;
                        await application.save();

                        console.log(`✅ PDF regenerated: ${result.filePath}`);
                    }

                    if (result && result.filePath) {
                        filePath = result.filePath;
                    }
                }
            } catch (regenerateError) {
                console.error('Error regenerating file:', regenerateError);
                // Continue to 404 if regeneration fails
            }
        }

        // If still no file found, return 404
        if (!filePath || !fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${fileName}`);
            console.error(`Checked paths:`, possiblePaths);

            return res.status(404).json({
                success: false,
                message: 'File not found. The file may have been deleted or the server was restarted.',
                suggestion: applicationId ? 'Try regenerating the PDF/ZIP from the application page.' : 'Please contact support.'
            });
        }

        // Set appropriate headers
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Cache-Control', 'no-cache');

        // Determine content type
        if (fileName.endsWith('.pdf')) {
            res.setHeader('Content-Type', 'application/pdf');
        } else if (fileName.endsWith('.zip')) {
            res.setHeader('Content-Type', 'application/zip');
        } else {
            res.setHeader('Content-Type', 'application/octet-stream');
        }

        // Send file
        res.sendFile(path.resolve(filePath), (err) => {
            if (err) {
                console.error('Error sending file:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Failed to send file',
                        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
                    });
                }
            }
        });
    } catch (error) {
        console.error('Download file error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Failed to download file',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
});

// @route   GET /api/files/:id
// @desc    Get file by ID
// @access  Public
router.get('/:id', getFileById);

// Removed download and update routes - not implemented in simplified controller

// @route   DELETE /api/files/:id
// @desc    Delete file
// @access  Public
router.delete('/:id', deleteFile);

// @route   POST /api/files/backfill
// @desc    Backfill Cloudinary files to applications
// @access  Protected (admin/staff preferred)
router.post('/backfill', protect, require('../controllers/fileController').backfillCloudinaryToApplications);

module.exports = router;
