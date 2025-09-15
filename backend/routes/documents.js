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
    getStudentDocuments,
    getDocumentTypes
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

// Get master document types
router.get('/types', protect, getDocumentTypes);

// Get user's documents
router.get('/', protect, getUserDocuments);
router.get('/my-documents', protect, getUserDocuments);

// Get specific document
router.get('/:id', protect, getDocumentById);

// Get staff assigned documents
router.get('/staff/assigned', protect, restrictTo('staff', 'admin', 'super_admin'), getStaffDocuments);

// Get documents by student ID (for staff review)
router.get('/student/:studentId', protect, restrictTo('staff', 'admin', 'super_admin'), getStudentDocuments);

// Review document (staff and admin only)
router.put('/:id/review', protect, restrictTo('staff', 'admin', 'super_admin'), reviewDocument);

// Validation: check expiry by issue_date + validity rules
router.get('/validation/check-expiry', protect, async (req, res) => {
    try {
        const { issueDate, validityPeriod } = req.query;
        if (!issueDate || !validityPeriod) {
            return res.status(400).json({ success: false, message: 'issueDate and validityPeriod are required' });
        }

        const issue = new Date(issueDate);
        if (isNaN(issue.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid issueDate' });
        }

        const addPeriod = (date, period) => {
            const d = new Date(date);
            if (period === '1_YEAR') d.setFullYear(d.getFullYear() + 1);
            else if (period === '5_YEARS') d.setFullYear(d.getFullYear() + 5);
            else return null;
            return d;
        };

        const expiry = addPeriod(issue, validityPeriod);
        if (!expiry) {
            return res.status(400).json({ success: false, message: 'Unsupported validityPeriod' });
        }

        const now = new Date();
        const isExpired = now > expiry;
        res.json({ success: true, data: { expiryDate: expiry.toISOString(), isExpired } });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to check expiry' });
    }
});

// Delete document
router.delete('/:id', protect, deleteDocument);

module.exports = router;
