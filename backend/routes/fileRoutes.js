const express = require('express');
const router = express.Router();
const {
    uploadFile,
    uploadMultipleFiles,
    getFile,
    getFiles,
    updateFile,
    deleteFile,
    downloadFile,
    getFileStats
} = require('../controllers/fileController');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const { asyncHandler } = require('../middleware/errorHandler');

// @route   POST /api/files/upload
// @desc    Upload single file
// @access  Public
router.post('/upload', uploadSingle('file'), uploadFile);

// @route   POST /api/files/upload-multiple
// @desc    Upload multiple files
// @access  Public
router.post('/upload-multiple', uploadMultiple('files', 10), uploadMultipleFiles);

// @route   GET /api/files
// @desc    Get all files with pagination and filtering
// @access  Public
router.get('/', getFiles);

// @route   GET /api/files/stats
// @desc    Get file statistics
// @access  Public
router.get('/stats', getFileStats);

// @route   GET /api/files/:id
// @desc    Get file by ID
// @access  Public
router.get('/:id', getFile);

// @route   GET /api/files/:id/download
// @desc    Download file (increment download count)
// @access  Public
router.get('/:id/download', downloadFile);

// @route   PUT /api/files/:id
// @desc    Update file metadata
// @access  Public
router.put('/:id', updateFile);

// @route   DELETE /api/files/:id
// @desc    Delete file
// @access  Public
router.delete('/:id', deleteFile);

module.exports = router;
