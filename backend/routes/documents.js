const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, isStaff, isSuperAdmin, isStudent } = require('../middleware/auth');
const Document = require('../models/Document');
const pdfProcessor = require('../utils/pdfProcessor');
const path = require('path');
const fs = require('fs');

// Get socket manager instance
const getSocketManager = () => {
    const { socketManager } = require('../server');
    return socketManager;
};

const router = express.Router();

// Configure multer for file uploads
const upload = pdfProcessor.getMulterConfig();

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private (Students only)
router.post('/upload', [
    protect,
    isStudent,
    upload.single('document')
], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const { documentType, documentName } = req.body;

        if (!documentType || !documentName) {
            // Clean up uploaded file
            await fs.promises.unlink(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Document type and name are required'
            });
        }

        // Check if document of this type already exists for student
        const existingDoc = await Document.findOne({
            student: req.user._id,
            documentType,
            status: { $nin: ['rejected'] }
        });

        if (existingDoc) {
            // Clean up uploaded file
            await fs.promises.unlink(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Document of this type already exists. Please delete the existing one first.'
            });
        }

        // Create document record
        const document = new Document({
            student: req.user._id,
            documentType,
            documentName,
            fileName: req.file.filename,
            filePath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            uploadedBy: req.user._id,
            status: 'pending'
        });

        await document.save();

        // Emit real-time notification
        try {
            const socketManager = getSocketManager();
            if (socketManager) {
                socketManager.notifyDocumentUpload(req.user._id, {
                    documentId: document._id,
                    documentType: document.documentType,
                    documentName: document.documentName,
                    studentName: `${req.user.firstName} ${req.user.lastName}`,
                    studentId: req.user._id
                });
            }
        } catch (socketError) {
            console.error('Socket notification error:', socketError);
        }

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                document: {
                    id: document._id,
                    documentType: document.documentType,
                    documentName: document.documentName,
                    status: document.status,
                    uploadedAt: document.uploadedAt
                }
            }
        });

    } catch (error) {
        console.error('Document upload error:', error);

        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            await fs.promises.unlink(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Server error during document upload'
        });
    }
});

// @desc    Get student documents
// @route   GET /api/documents/student
// @access  Private (Students only)
router.get('/student', protect, isStudent, async (req, res) => {
    try {
        const documents = await Document.getByStudent(req.user._id);

        res.json({
            success: true,
            data: {
                documents: documents.map(doc => ({
                    id: doc._id,
                    documentType: doc.documentType,
                    documentName: doc.documentName,
                    status: doc.status,
                    staffRemarks: doc.staffRemarks,
                    rejectionReason: doc.rejectionReason,
                    uploadedAt: doc.uploadedAt,
                    reviewedAt: doc.reviewedAt,
                    version: doc.version
                }))
            }
        });
    } catch (error) {
        console.error('Get student documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching documents'
        });
    }
});

// @desc    Get all documents for staff review
// @route   GET /api/documents/review
// @access  Private (Staff and Super Admin only)
router.get('/review', [
    protect,
    isStaff
], async (req, res) => {
    try {
        const { status = 'pending', page = 1, limit = 10 } = req.query;

        const query = status === 'all' ? {} : { status };

        const documents = await Document.find(query)
            .populate('student', 'fullName email phoneNumber')
            .populate('reviewedBy', 'fullName')
            .sort({ uploadedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Document.countDocuments(query);

        res.json({
            success: true,
            data: {
                documents: documents.map(doc => ({
                    id: doc._id,
                    student: {
                        id: doc.student._id,
                        name: doc.student.fullName,
                        email: doc.student.email,
                        phone: doc.student.phoneNumber
                    },
                    documentType: doc.documentType,
                    documentName: doc.documentName,
                    status: doc.status,
                    staffRemarks: doc.staffRemarks,
                    rejectionReason: doc.rejectionReason,
                    uploadedAt: doc.uploadedAt,
                    reviewedAt: doc.reviewedAt,
                    reviewedBy: doc.reviewedBy ? {
                        id: doc.reviewedBy._id,
                        name: doc.reviewedBy.fullName
                    } : null
                })),
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get documents for review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching documents for review'
        });
    }
});

// @desc    Review document (approve/reject/request revision)
// @route   PUT /api/documents/:id/review
// @access  Private (Staff and Super Admin only)
router.put('/:id/review', [
    protect,
    isStaff,
    body('action').isIn(['approve', 'reject', 'request_revision']).withMessage('Invalid action'),
    body('remarks').optional().isLength({ max: 500 }).withMessage('Remarks cannot exceed 500 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { action, remarks = '' } = req.body;
        const documentId = req.params.id;

        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Update document based on action
        switch (action) {
            case 'approve':
                await document.approve(req.user._id, remarks);
                break;
            case 'reject':
                if (!remarks) {
                    return res.status(400).json({
                        success: false,
                        message: 'Rejection reason is required'
                    });
                }
                await document.reject(req.user._id, remarks);
                break;
            case 'request_revision':
                if (!remarks) {
                    return res.status(400).json({
                        success: false,
                        message: 'Revision remarks are required'
                    });
                }
                await document.requestRevision(req.user._id, remarks);
                break;
        }

        // Emit real-time notification
        try {
            const socketManager = getSocketManager();
            if (socketManager) {
                socketManager.handleDocumentStatusUpdate({
                    documentId: document._id,
                    studentId: document.student,
                    status: document.status,
                    remarks: remarks,
                    reviewedBy: req.user._id
                });
            }
        } catch (socketError) {
            console.error('Socket notification error:', socketError);
        }

        res.json({
            success: true,
            message: `Document ${action}d successfully`,
            data: {
                document: {
                    id: document._id,
                    status: document.status,
                    staffRemarks: document.staffRemarks,
                    rejectionReason: document.rejectionReason,
                    reviewedAt: document.reviewedAt
                }
            }
        });

    } catch (error) {
        console.error('Document review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during document review'
        });
    }
});

// @desc    Download document
// @route   GET /api/documents/:id/download
// @access  Private
router.get('/:id/download', protect, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Check access permissions
        const canAccess =
            req.user.role === 'super_admin' ||
            req.user.role === 'staff' ||
            (req.user.role === 'student' && document.student.equals(req.user._id));

        if (!canAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (!fs.existsSync(document.filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Document file not found'
            });
        }

        res.download(document.filePath, document.documentName);

    } catch (error) {
        console.error('Document download error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during document download'
        });
    }
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private (Students can delete their own, Staff can delete any)
router.delete('/:id', protect, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Check permissions
        const canDelete =
            req.user.role === 'super_admin' ||
            req.user.role === 'staff' ||
            (req.user.role === 'student' && document.student.equals(req.user._id));

        if (!canDelete) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Delete file from filesystem
        if (fs.existsSync(document.filePath)) {
            await fs.promises.unlink(document.filePath);
        }

        // Delete document record
        await Document.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });

    } catch (error) {
        console.error('Document delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during document deletion'
        });
    }
});

// @desc    Process student documents (generate merged PDF)
// @route   POST /api/documents/process/:studentId
// @access  Private (Staff and Super Admin only)
router.post('/process/:studentId', [
    protect,
    isStaff
], async (req, res) => {
    try {
        const { studentId } = req.params;

        // Get all approved documents for student
        const documents = await Document.getApprovedDocuments(studentId);

        if (documents.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No approved documents found for processing'
            });
        }

        // Process documents
        const result = await pdfProcessor.processStudentDocuments(studentId, documents);

        res.json({
            success: true,
            message: 'Documents processed successfully',
            data: {
                processedCount: result.processedDocs.length,
                mergedPdfPath: result.mergedPdfPath,
                studentDir: result.studentDir
            }
        });

    } catch (error) {
        console.error('Document processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during document processing'
        });
    }
});

// @desc    Get document statistics
// @route   GET /api/documents/stats
// @access  Private (Staff and Super Admin only)
router.get('/stats', [
    protect,
    isStaff
], async (req, res) => {
    try {
        const stats = await Document.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalDocuments = await Document.countDocuments();
        const pendingCount = stats.find(s => s._id === 'pending')?.count || 0;
        const approvedCount = stats.find(s => s._id === 'approved')?.count || 0;
        const rejectedCount = stats.find(s => s._id === 'rejected')?.count || 0;

        res.json({
            success: true,
            data: {
                totalDocuments,
                pendingCount,
                approvedCount,
                rejectedCount,
                stats
            }
        });

    } catch (error) {
        console.error('Document stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching document statistics'
        });
    }
});

module.exports = router;
