const Document = require('../models/Document');
const DocumentType = require('../models/DocumentType');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/documents');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${crypto.randomUUID()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only PDF, JPG, PNG, DOC, and DOCX files are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

// Upload document
const uploadDocument = async (req, res) => {
    try {
        const { documentType, studentId } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        if (!documentType) {
            return res.status(400).json({
                success: false,
                message: 'Document type is required'
            });
        }

        // If studentId is provided, attach to StudentApplication
        if (studentId) {
            console.log('📄 Uploading document to application:', studentId);
            console.log('📝 Document type:', documentType);
            console.log('👤 Uploader role:', req.user.role);
            console.log('👤 Uploader ID:', req.user._id);
            
            const StudentApplication = require('../models/StudentApplication');
            const application = await StudentApplication.findById(studentId);
            
            if (!application) {
                console.log('❌ Application not found:', studentId);
                return res.status(404).json({
                    success: false,
                    message: 'Student application not found'
                });
            }
            
            console.log('✅ Application found:', application._id);
            console.log('📋 Current documents count:', application.documents?.length || 0);

            // Check if user has permission to upload for this application
            if (req.user.role === 'agent') {
                const agentId = req.user._id.toString();
                const isAssignedAgent = application.assignedAgent && 
                    application.assignedAgent.toString() === agentId;
                const isSubmitter = application.submittedBy && 
                    application.submittedBy.toString() === agentId;
                const isReferrer = application.referralInfo?.referredBy && 
                    application.referralInfo.referredBy.toString() === agentId;

                if (!isAssignedAgent && !isSubmitter && !isReferrer) {
                    return res.status(403).json({
                        success: false,
                        message: 'You do not have permission to upload documents for this application'
                    });
                }
            }

            // Generate public URL (relative path)
            const publicUrl = `/uploads/documents/${file.filename}`;

            // Add document to application
            const documentData = {
                documentType: documentType,
                fileName: file.originalname,
                filePath: publicUrl,
                storageType: 'local',
                fileSize: file.size,
                mimeType: file.mimetype,
                status: 'PENDING',
                uploadedAt: new Date()
            };

            // Remove existing document of same type if exists
            application.documents = application.documents || [];
            const beforeCount = application.documents.length;
            application.documents = application.documents.filter(
                doc => doc.documentType !== documentType
            );
            
            application.documents.push(documentData);
            await application.save();
            
            console.log('✅ Document saved! Before:', beforeCount, 'After:', application.documents.length);
            console.log('📄 Document data:', documentData);

            return res.status(201).json({
                success: true,
                message: 'Document uploaded successfully',
                data: {
                    url: publicUrl,
                    fileName: file.originalname,
                    documentType: documentType
                }
            });
        }

        // Otherwise, create standalone document record
        const document = new Document({
            fileName: file.originalname,
            filePath: file.path,
            fileSize: file.size,
            mimeType: file.mimetype,
            documentType: documentType,
            uploadedBy: req.user._id,
            status: 'PENDING'
        });

        await document.save();

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: document
        });

    } catch (error) {
        console.error('Upload document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload document',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get documents by user
const getDocumentsByUser = async (req, res) => {
    try {
        const documents = await Document.find({ uploadedBy: req.user._id })
            .sort({ uploadedAt: -1 });

        res.status(200).json({
            success: true,
            data: documents
        });

    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get documents',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get document by ID
const getDocumentById = async (req, res) => {
    try {
        const { documentId } = req.params;
        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Check if user has access to this document
        if (document.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.status(200).json({
            success: true,
            data: document
        });

    } catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get document',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Download document
const downloadDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Check if user has access to this document
        if (document.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (!fs.existsSync(document.filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server'
            });
        }

        res.download(document.filePath, document.fileName);

    } catch (error) {
        console.error('Download document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download document',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Delete document
const deleteDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Check if user has access to this document
        if (document.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Delete file from filesystem
        if (fs.existsSync(document.filePath)) {
            fs.unlinkSync(document.filePath);
        }

        // Delete document record
        await Document.findByIdAndDelete(documentId);

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });

    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete document',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update document status (for staff/admin)
const updateDocumentStatus = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { status, remarks } = req.body;

        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        document.status = status;
        if (remarks) {
            document.remarks = remarks;
        }
        document.reviewedBy = req.user._id;
        document.reviewedAt = new Date();

        await document.save();

        res.status(200).json({
            success: true,
            message: 'Document status updated successfully',
            data: document
        });

    } catch (error) {
        console.error('Update document status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update document status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get all documents (for staff/admin)
const getAllDocuments = async (req, res) => {
    try {
        const { status, documentType, page = 1, limit = 20 } = req.query;

        let query = {};

        if (status) {
            query.status = status;
        }

        if (documentType) {
            query.documentType = documentType;
        }

        const documents = await Document.find(query)
            .populate('uploadedBy', 'fullName email')
            .populate('reviewedBy', 'fullName email')
            .sort({ uploadedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Document.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                documents,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get all documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get documents',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    upload,
    uploadDocument,
    getDocumentsByUser,
    getDocumentById,
    downloadDocument,
    deleteDocument,
    updateDocumentStatus,
    getAllDocuments
};