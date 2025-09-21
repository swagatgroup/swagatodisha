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
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const { asyncHandler } = require('../middleware/errorHandler');

// @route   POST /api/files/upload
// @desc    Upload single file
// @access  Public
router.post('/upload', uploadSingle('file'), uploadSingleFile);

// @route   POST /api/files/upload-multiple
// @desc    Upload multiple files
// @access  Public
router.post('/upload-multiple', uploadMultiple('files', 10), uploadMultipleFiles);

// @route   GET /api/files
// @desc    Get all files with pagination and filtering
// @access  Public
router.get('/', getAllFiles);

// @route   GET /api/files/stats
// @desc    Get file statistics
// @access  Public
router.get('/stats', getStorageStats);

// @route   GET /api/files/:id
// @desc    Get file by ID
// @access  Public
router.get('/:id', getFileById);

// Removed download and update routes - not implemented in simplified controller

// @route   DELETE /api/files/:id
// @desc    Delete file
// @access  Public
router.delete('/:id', deleteFile);

module.exports = router;
