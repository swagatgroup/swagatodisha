const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getAllDocumentTypes,
    getRequiredDocuments,
    getOptionalDocuments,
    getDocumentCategories,
    getDocumentType
} = require('../config/documentTypes');

// Get all document types
router.get('/', protect, (req, res) => {
    try {
        const documentTypes = getAllDocumentTypes();
        const categories = getDocumentCategories();

        res.json({
            success: true,
            data: {
                documentTypes,
                categories,
                summary: {
                    total: documentTypes.length,
                    required: documentTypes.filter(doc => doc.isRequired).length,
                    optional: documentTypes.filter(doc => !doc.isRequired).length
                }
            }
        });
    } catch (error) {
        console.error('Get document types error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get document types',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get required documents only
router.get('/required', protect, (req, res) => {
    try {
        const requiredDocuments = getRequiredDocuments();

        res.json({
            success: true,
            data: {
                documents: requiredDocuments,
                count: requiredDocuments.length
            }
        });
    } catch (error) {
        console.error('Get required documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get required documents',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get optional documents only
router.get('/optional', protect, (req, res) => {
    try {
        const optionalDocuments = getOptionalDocuments();

        res.json({
            success: true,
            data: {
                documents: optionalDocuments,
                count: optionalDocuments.length
            }
        });
    } catch (error) {
        console.error('Get optional documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get optional documents',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get document categories
router.get('/categories', protect, (req, res) => {
    try {
        const categories = getDocumentCategories();

        res.json({
            success: true,
            data: {
                categories
            }
        });
    } catch (error) {
        console.error('Get document categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get document categories',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get specific document type
router.get('/:documentId', protect, (req, res) => {
    try {
        const { documentId } = req.params;
        const documentType = getDocumentType(documentId);

        if (!documentType) {
            return res.status(404).json({
                success: false,
                message: 'Document type not found'
            });
        }

        res.json({
            success: true,
            data: {
                documentType
            }
        });
    } catch (error) {
        console.error('Get document type error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get document type',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
