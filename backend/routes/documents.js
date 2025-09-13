const express = require('express');
const multer = require('multer');
const { protect, restrictTo } = require('../middleware/auth');
const {
    uploadDocument,
    getUserDocuments,
    getDocumentById,
    reviewDocument,
    deleteDocument,
    getStaffDocuments,
    getStudentDocuments
} = require('../controllers/documentController');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

// Document upload (universal - all user types can upload)
router.post('/upload', protect, upload.single('file'), uploadDocument);

// Get user's documents
router.get('/', protect, getUserDocuments);

// Get specific document
router.get('/:id', protect, getDocumentById);

// Get staff assigned documents
router.get('/staff/assigned', protect, restrictTo('staff', 'admin', 'super_admin'), getStaffDocuments);

// Get documents by student ID (for staff review)
router.get('/student/:studentId', protect, restrictTo('staff', 'admin', 'super_admin'), getStudentDocuments);

// Review document (staff and admin only)
router.put('/:id/review', protect, restrictTo('staff', 'admin', 'super_admin'), reviewDocument);

// Delete document
router.delete('/:id', protect, deleteDocument);

module.exports = router;
