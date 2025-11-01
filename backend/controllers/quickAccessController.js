const QuickAccess = require('../models/QuickAccess');
const path = require('path');
const fs = require('fs').promises;
const { asyncHandler } = require('../middleware/errorHandler');

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
    if (!['timetable', 'notification', 'result'].includes(type)) {
        // Clean up uploaded file
        await fs.unlink(req.file.path);
        return res.status(400).json({
            success: false,
            message: 'Invalid document type. Must be timetable, notification, or result'
        });
    }

    // Create file URL
    const fileUrl = `/uploads/quick-access/${req.file.filename}`;

    const doc = await QuickAccess.create({
        type,
        title,
        description,
        file: fileUrl,
        fileName: req.file.originalname,
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
        // Clean up uploaded file if any
        if (req.file) {
            await fs.unlink(req.file.path);
        }
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
        // Delete old file
        const oldFilePath = path.join(__dirname, '..', doc.file);
        try {
            await fs.unlink(oldFilePath);
            console.log('🗑️ Old file deleted:', oldFilePath);
        } catch (error) {
            console.log('⚠️ Old file not found or already deleted');
        }

        // Update with new file
        updateData.file = `/uploads/quick-access/${req.file.filename}`;
        updateData.fileName = req.file.originalname;
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

    // Delete file
    const filePath = path.join(__dirname, '..', doc.file);
    try {
        await fs.unlink(filePath);
        console.log('🗑️ File deleted:', filePath);
    } catch (error) {
        console.log('⚠️ File not found or already deleted');
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

