const Document = require('../models/Document');
const User = require('../models/User');
const Notification = require('../models/Notification');
const cloudinary = require('cloudinary').v2;
const { promisify } = require('util');
const { uploadFile, getDownloadUrl, deleteFile } = require('../utils/hybridStorage');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = promisify(cloudinary.uploader.upload);

// Upload document (universal - all user types can upload)
const uploadDocument = async (req, res) => {
    try {
        const { documentType, priority = 'medium', tags = [] } = req.body;
        const uploadedFile = req.file;

        if (!uploadedFile) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Validate file type and size
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(uploadedFile.mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Only PDF, JPEG, PNG, and WebP files are allowed'
            });
        }

        if (uploadedFile.size > maxSize) {
            return res.status(400).json({
                success: false,
                message: 'File size exceeds 10MB limit'
            });
        }

        // Use hybrid storage for document upload
        let uploadResult;
        try {
            uploadResult = await uploadFile(uploadedFile, {
                uploadedBy: req.user._id,
                category: 'document',
                documentType: documentType
            });
        } catch (uploadError) {
            console.error('Hybrid storage upload failed:', uploadError);
            return res.status(500).json({
                success: false,
                message: 'Failed to upload document',
                error: uploadError.message
            });
        }

        // Assign to staff member (for student uploads)
        let assignedTo = null;
        if (req.user.role === 'student' || req.user.role === 'user') {
            assignedTo = await assignToAvailableStaff();
        }

        const document = new Document({
            uploadedBy: req.user._id,
            uploadedByRole: req.user.role,
            assignedTo,
            documentType,
            originalName: uploadedFile.originalname,
            fileName: uploadResult.fileName,
            fileUrl: uploadResult.fileUrl,
            fileSize: uploadedFile.size,
            mimeType: uploadedFile.mimetype,
            storageType: uploadResult.storageType,
            priority,
            tags: Array.isArray(tags) ? tags : [],
            verificationHistory: [{
                reviewedBy: req.user._id,
                reviewedByName: req.user.fullName,
                action: 'submitted',
                remarks: 'Document uploaded successfully',
                timestamp: new Date()
            }]
        });

        await document.save();
        await document.populate('uploadedBy', 'fullName email role');

        // Create notification for assigned staff
        if (assignedTo) {
            await Notification.createNotification({
                recipient: assignedTo,
                sender: req.user._id,
                type: 'document_upload',
                title: 'New Document for Review',
                message: `${req.user.fullName} uploaded a ${documentType.replace('_', ' ')} for verification`,
                relatedDocument: document._id,
                priority: priority === 'urgent' ? 'high' : 'medium'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: document
        });
    } catch (error) {
        console.error('Document upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload document',
            error: error.message
        });
    }
};

// Assign document to available staff member
const assignToAvailableStaff = async () => {
    try {
        const Admin = require('../models/Admin');
        const staff = await Admin.find({
            role: 'staff',
            isActive: true
        }).select('_id');

        if (staff.length === 0) {
            return null;
        }

        // Simple round-robin assignment (can be enhanced with workload balancing)
        const randomStaff = staff[Math.floor(Math.random() * staff.length)];
        return randomStaff._id;
    } catch (error) {
        console.error('Staff assignment error:', error);
        return null;
    }
};

// Get user's documents
const getUserDocuments = async (req, res) => {
    try {
        console.log('Getting documents for user:', req.user._id, 'Role:', req.user.role);

        const { status, documentType, page = 1, limit = 20 } = req.query;
        const userId = req.user._id;

        let query = { uploadedBy: userId, isActive: true };

        if (status) {
            query.status = status;
        }

        if (documentType) {
            query.documentType = documentType;
        }

        console.log('Query:', query);

        const documents = await Document.find(query)
            .populate('assignedTo', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Document.countDocuments(query);

        console.log('Found documents:', documents.length);

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
        console.error('Get user documents error:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to get documents',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get specific document
const getDocumentById = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await Document.findById(id)
            .populate('uploadedBy', 'fullName email role')
            .populate('assignedTo', 'fullName email');

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Check access permissions
        if (document.uploadedBy._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'staff' &&
            req.user.role !== 'admin' &&
            req.user.role !== 'super_admin') {
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
            error: error.message
        });
    }
};

// Review document (staff and admin only)
const reviewDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { action, remarks, isCustomRemarks = false, remarkType } = req.body;

        // Validate staff permissions
        if (req.user.role !== 'staff' && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Only staff members can review documents'
            });
        }

        const document = await Document.findById(documentId)
            .populate('uploadedBy', 'fullName email role');

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Validate action
        const validActions = ['approved', 'rejected', 'resubmission_required'];
        if (!validActions.includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action'
            });
        }

        let finalRemarks = remarks;

        // Use predefined remarks if not custom
        if (!isCustomRemarks && action !== 'approved') {
            finalRemarks = getPredefinedRemarks(action, remarkType);
        } else if (action === 'approved') {
            finalRemarks = getApprovalMessage(document.documentType);
        }

        // Update document status and add verification history
        document.status = action === 'resubmission_required' ? 'resubmission_required' : action;
        document.currentRemarks = finalRemarks;
        document.verificationHistory.push({
            reviewedBy: req.user._id,
            reviewedByName: req.user.fullName,
            action,
            remarks: finalRemarks,
            timestamp: new Date()
        });

        if (action === 'resubmission_required') {
            document.resubmissionCount += 1;
        }

        await document.save();

        // Create notification for student
        const notificationType = action === 'approved' ? 'document_approved' :
            action === 'rejected' ? 'document_rejected' : 'document_resubmission_required';
        const notificationTitle = action === 'approved' ? 'Document Approved' :
            action === 'rejected' ? 'Document Rejected' : 'Resubmission Required';

        await Notification.createNotification({
            recipient: document.uploadedBy._id,
            sender: req.user._id,
            type: notificationType,
            title: notificationTitle,
            message: `Your ${document.documentType.replace('_', ' ')} has been ${action}. ${finalRemarks}`,
            relatedDocument: document._id,
            priority: action === 'rejected' ? 'high' : 'medium'
        });

        res.status(200).json({
            success: true,
            message: `Document ${action} successfully`,
            data: document
        });
    } catch (error) {
        console.error('Document review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to review document',
            error: error.message
        });
    }
};

// Get predefined remarks
const getPredefinedRemarks = (action, remarkType) => {
    const remarks = {
        rejected: {
            'poor_quality': 'Document quality is not clear. Please upload a high-resolution, clearly visible document.',
            'incomplete_info': 'Required information is missing or incomplete. Please ensure all fields are properly filled.',
            'wrong_document': 'This appears to be the wrong document type. Please upload the correct document as requested.',
            'expired_document': 'The document appears to be expired. Please provide a valid, current document.',
            'illegible_text': 'Text in the document is not readable. Please provide a clearer version with legible text.'
        },
        resubmission_required: {
            'minor_corrections': 'Minor corrections needed. Please address the highlighted issues and resubmit.',
            'additional_info': 'Additional information required. Please provide the missing details.',
            'format_issue': 'Document format needs adjustment. Please follow the specified format guidelines.',
            'signature_missing': 'Signature or official stamp is missing. Please ensure proper authorization.',
            'date_discrepancy': 'Date discrepancy found. Please verify and correct the dates mentioned.'
        }
    };

    return remarks[action]?.[remarkType] || 'Please review and resubmit the document with necessary corrections.';
};

// Get approval message
const getApprovalMessage = (documentType) => {
    const approvalMessages = {
        'academic_certificate': 'Excellent! Your academic certificate has been verified and approved. All details are accurate and complete.',
        'identity_proof': 'Perfect! Your identity proof has been successfully verified. Thank you for providing clear documentation.',
        'address_proof': 'Great! Your address proof has been approved. All address details match our requirements.',
        'income_certificate': 'Wonderful! Your income certificate has been verified and meets all criteria.',
        'caste_certificate': 'Approved! Your caste certificate has been successfully verified.',
        'default': 'Fantastic! Your document has been thoroughly reviewed and approved. Everything looks perfect!'
    };

    return approvalMessages[documentType] || approvalMessages.default;
};

// Delete document
const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await Document.findById(id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Check permissions
        if (document.uploadedBy.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin' &&
            req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Delete from storage
        try {
            await deleteFile(document);
        } catch (deleteError) {
            console.error('Error deleting document from storage:', deleteError);
            // Continue with database deletion even if storage deletion fails
        }

        // Soft delete
        document.isActive = false;
        await document.save();

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete document',
            error: error.message
        });
    }
};

// Get staff assigned documents
const getStaffDocuments = async (req, res) => {
    try {
        const { status, priority, page = 1, limit = 20 } = req.query;
        const staffId = req.user._id;

        let query = { assignedTo: staffId, isActive: true };

        if (status) {
            query.status = status;
        }

        if (priority) {
            query.priority = priority;
        }

        const documents = await Document.find(query)
            .populate('uploadedBy', 'fullName email role phoneNumber')
            .populate('assignedTo', 'fullName email')
            .sort({ createdAt: -1 })
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
        console.error('Get staff documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get staff documents',
            error: error.message
        });
    }
};

// Get documents by student ID (for staff review)
const getStudentDocuments = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { status, documentType } = req.query;

        // Check if user has permission to view student documents
        if (req.user.role !== 'staff' && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        let query = {
            uploadedBy: studentId,
            isActive: true
        };

        if (status) {
            query.status = status;
        }

        if (documentType) {
            query.documentType = documentType;
        }

        const documents = await Document.find(query)
            .populate('uploadedBy', 'fullName email role phoneNumber')
            .populate('assignedTo', 'fullName email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                documents,
                total: documents.length
            }
        });
    } catch (error) {
        console.error('Get student documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get student documents',
            error: error.message
        });
    }
};

module.exports = {
    uploadDocument,
    getUserDocuments,
    getDocumentById,
    reviewDocument,
    deleteDocument,
    getStaffDocuments,
    getStudentDocuments
};
