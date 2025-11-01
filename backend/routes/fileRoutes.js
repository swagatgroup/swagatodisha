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
// @access  Protected
// NOTE: This route must come before /:id to avoid route conflicts
router.get('/download/:fileName', protect, async (req, res) => {
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

        const filePath = path.join(__dirname, '../uploads/processed', fileName);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Set appropriate headers
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        // Determine content type
        if (fileName.endsWith('.pdf')) {
            res.setHeader('Content-Type', 'application/pdf');
        } else if (fileName.endsWith('.zip')) {
            res.setHeader('Content-Type', 'application/zip');
        } else {
            res.setHeader('Content-Type', 'application/octet-stream');
        }

        // Send file
        res.sendFile(path.resolve(filePath));
    } catch (error) {
        console.error('Download file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download file',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
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
