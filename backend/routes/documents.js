const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    upload,
    uploadDocument,
    getDocumentsByUser,
    getDocumentById,
    downloadDocument,
    deleteDocument,
    updateDocumentStatus,
    getAllDocuments
} = require('../controllers/documentController');

// Student routes
router.post('/upload', protect, upload.single('file'), uploadDocument);
router.get('/my-documents', protect, getDocumentsByUser);
router.get('/:documentId', protect, getDocumentById);
router.get('/:documentId/download', protect, downloadDocument);
router.delete('/:documentId', protect, deleteDocument);

// Staff/Admin routes
router.get('/', protect, getAllDocuments);
router.put('/:documentId/status', protect, updateDocumentStatus);

module.exports = router;