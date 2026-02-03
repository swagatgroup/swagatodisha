const QuickAccess = require('../models/QuickAccess');
const path = require('path');
const fs = require('fs').promises;
const { asyncHandler } = require('../middleware/errorHandler');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Get all quick access documents
// @route   GET /api/admin/quick-access
// @access  Private
const getQuickAccessDocs = asyncHandler(async (req, res) => {
    const { type, isActive } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const docs = await QuickAccess.find(filter)
        .sort({ type: 1, order: 1, publishDate: -1 })
        .populate('createdBy', 'fullName email')
        .populate('updatedBy', 'fullName email');

    res.status(200).json({
        success: true,
        count: docs.length,
        data: docs
    });
});

// @desc    Get single quick access document
// @route   GET /api/admin/quick-access/:id
// @access  Private
const getQuickAccessDoc = asyncHandler(async (req, res) => {
    const doc = await QuickAccess.findById(req.params.id)
        .populate('createdBy', 'fullName email')
        .populate('updatedBy', 'fullName email');

    if (!doc) {
        return res.status(404).json({
            success: false,
            message: 'Document not found'
        });
    }

    res.status(200).json({
        success: true,
        data: doc
    });
});

// @desc    Create new quick access document
// @route   POST /api/admin/quick-access
// @access  Private (Super Admin, Staff)
const createQuickAccessDoc = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Please upload a PDF file'
        });
    }

    const { type, title, description, publishDate, order, isActive } = req.body;

    // Validate type
    if (!['timetable', 'career', 'notification', 'result'].includes(type)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid document type. Must be timetable, career, notification, or result'
        });
    }

    // Use Cloudinary URL if available, otherwise fallback to local path
    const fileUrl = req.file.cloudinaryUrl || `/uploads/quick-access/${req.file.filename}`;
    const cloudinaryPublicId = req.file.cloudinaryPublicId || null;

    const doc = await QuickAccess.create({
        type,
        title,
        description,
        file: fileUrl,
        fileName: req.file.originalname,
        cloudinaryPublicId: cloudinaryPublicId,
        publishDate: publishDate || Date.now(),
        order: order || 0,
        isActive: isActive !== 'false',
        createdBy: req.user._id,
        updatedBy: req.user._id
    });

    await doc.populate('createdBy', 'fullName email');
    await doc.populate('updatedBy', 'fullName email');

    console.log('✅ Quick access document created:', doc._id);

    res.status(201).json({
        success: true,
        message: 'Document created successfully',
        data: doc
    });
});

// @desc    Update quick access document
// @route   PUT /api/admin/quick-access/:id
// @access  Private (Super Admin, Staff)
const updateQuickAccessDoc = asyncHandler(async (req, res) => {
    let doc = await QuickAccess.findById(req.params.id);

    if (!doc) {
        return res.status(404).json({
            success: false,
            message: 'Document not found'
        });
    }

    const { type, title, description, publishDate, order, isActive } = req.body;

    // Prepare update data
    const updateData = {
        type: type || doc.type,
        title: title !== undefined ? title : doc.title,
        description: description !== undefined ? description : doc.description,
        publishDate: publishDate || doc.publishDate,
        order: order !== undefined ? order : doc.order,
        isActive: isActive !== undefined ? isActive === 'true' : doc.isActive,
        updatedBy: req.user._id
    };

    // If new file is uploaded
    if (req.file) {
        // Delete old file from Cloudinary if it exists
        if (doc.cloudinaryPublicId) {
            try {
                // Determine resource type based on old file URL
                const isOldPDF = doc.file && (doc.file.includes('.pdf') || doc.file.includes('/raw/'));
                const resourceType = isOldPDF ? 'raw' : 'image';
                await cloudinary.uploader.destroy(doc.cloudinaryPublicId, { resource_type: resourceType });
                console.log('🗑️ Old file deleted from Cloudinary:', doc.cloudinaryPublicId);
            } catch (error) {
                console.log('⚠️ Failed to delete old file from Cloudinary:', error.message);
            }
        } else {
            // Delete old local file if it exists
            const oldFilePath = path.join(__dirname, '..', doc.file);
            try {
                await fs.unlink(oldFilePath);
                console.log('🗑️ Old file deleted:', oldFilePath);
            } catch (error) {
                console.log('⚠️ Old file not found or already deleted');
            }
        }

        // Update with new file (Cloudinary URL or local path)
        updateData.file = req.file.cloudinaryUrl || `/uploads/quick-access/${req.file.filename}`;
        updateData.fileName = req.file.originalname;
        updateData.cloudinaryPublicId = req.file.cloudinaryPublicId || null;
    }

    doc = await QuickAccess.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    ).populate('createdBy', 'fullName email')
        .populate('updatedBy', 'fullName email');

    console.log('✅ Document updated:', doc._id);

    res.status(200).json({
        success: true,
        message: 'Document updated successfully',
        data: doc
    });
});

// @desc    Delete quick access document
// @route   DELETE /api/admin/quick-access/:id
// @access  Private (Super Admin, Staff)
const deleteQuickAccessDoc = asyncHandler(async (req, res) => {
    const doc = await QuickAccess.findById(req.params.id);

    if (!doc) {
        return res.status(404).json({
            success: false,
            message: 'Document not found'
        });
    }

    // Delete file from Cloudinary if it exists
    if (doc.cloudinaryPublicId) {
        try {
            // Determine resource type based on file URL
            const isPDF = doc.file && (doc.file.includes('.pdf') || doc.file.includes('/raw/'));
            const resourceType = isPDF ? 'raw' : 'image';
            await cloudinary.uploader.destroy(doc.cloudinaryPublicId, { resource_type: resourceType });
            console.log('🗑️ File deleted from Cloudinary:', doc.cloudinaryPublicId);
        } catch (error) {
            console.log('⚠️ Failed to delete file from Cloudinary:', error.message);
        }
    } else {
        // Delete local file if it exists
        const filePath = path.join(__dirname, '..', doc.file);
        try {
            await fs.unlink(filePath);
            console.log('🗑️ File deleted:', filePath);
        } catch (error) {
            console.log('⚠️ File not found or already deleted');
        }
    }

    // Delete document from database
    await QuickAccess.findByIdAndDelete(req.params.id);

    console.log('✅ Document deleted:', req.params.id);

    res.status(200).json({
        success: true,
        message: 'Document deleted successfully'
    });
});

module.exports = {
    getQuickAccessDocs,
    getQuickAccessDoc,
    createQuickAccessDoc,
    updateQuickAccessDoc,
    deleteQuickAccessDoc
};

