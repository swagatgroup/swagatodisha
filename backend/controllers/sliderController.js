const Slider = require('../models/Slider');
const path = require('path');
const fs = require('fs').promises;
const { asyncHandler } = require('../middleware/errorHandler');
const CloudinaryService = require('../utils/cloudinary');

// @desc    Get all sliders
// @route   GET /api/admin/sliders
// @access  Private (Super Admin, Staff)
const getSliders = asyncHandler(async (req, res) => {
    const { isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
    }

    const sliders = await Slider.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .populate('createdBy', 'fullName email')
        .populate('updatedBy', 'fullName email');

    res.status(200).json({
        success: true,
        count: sliders.length,
        data: sliders
    });
});

// @desc    Get single slider
// @route   GET /api/admin/sliders/:id
// @access  Private
const getSlider = asyncHandler(async (req, res) => {
    const slider = await Slider.findById(req.params.id)
        .populate('createdBy', 'fullName email')
        .populate('updatedBy', 'fullName email');

    if (!slider) {
        return res.status(404).json({
            success: false,
            message: 'Slider not found'
        });
    }

    res.status(200).json({
        success: true,
        data: slider
    });
});

// @desc    Create new slider
// @route   POST /api/admin/sliders
// @access  Private (Super Admin, Staff)
const createSlider = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Please upload an image'
        });
    }

    const { title, description, link, order, isActive } = req.body;

    // Use Cloudinary URL if available, otherwise fallback to local path
    const imageUrl = req.file.cloudinaryUrl || `/uploads/sliders/${req.file.filename}`;
    const cloudinaryPublicId = req.file.cloudinaryPublicId || null;

    // Properly parse isActive boolean (FormData sends strings)
    let activeStatus = true; // Default to true
    if (isActive !== undefined && isActive !== null) {
        if (typeof isActive === 'string') {
            activeStatus = isActive === 'true' || isActive === '1';
        } else if (typeof isActive === 'boolean') {
            activeStatus = isActive;
        }
    }

    const slider = await Slider.create({
        title,
        description,
        image: imageUrl,
        cloudinaryPublicId: cloudinaryPublicId,
        link,
        order: order || 0,
        isActive: activeStatus,
        createdBy: req.user._id,
        updatedBy: req.user._id
    });

    await slider.populate('createdBy', 'fullName email');
    await slider.populate('updatedBy', 'fullName email');

    console.log('✅ Slider created:', slider._id);

    res.status(201).json({
        success: true,
        message: 'Slider created successfully',
        data: slider
    });
});

// @desc    Update slider
// @route   PUT /api/admin/sliders/:id
// @access  Private (Super Admin, Staff)
const updateSlider = asyncHandler(async (req, res) => {
    let slider = await Slider.findById(req.params.id);

    if (!slider) {
        // Clean up uploaded file if any
        if (req.file) {
            await fs.unlink(req.file.path);
        }
        return res.status(404).json({
            success: false,
            message: 'Slider not found'
        });
    }

    const { title, description, link, order, isActive } = req.body;

    // Properly parse isActive boolean (FormData sends strings)
    let activeStatus = slider.isActive; // Keep existing value by default
    if (isActive !== undefined && isActive !== null) {
        if (typeof isActive === 'string') {
            activeStatus = isActive === 'true' || isActive === '1';
        } else if (typeof isActive === 'boolean') {
            activeStatus = isActive;
        }
    }

    // Prepare update data
    const updateData = {
        title: title !== undefined ? title : slider.title,
        description: description !== undefined ? description : slider.description,
        link: link !== undefined ? link : slider.link,
        order: order !== undefined ? order : slider.order,
        isActive: activeStatus,
        updatedBy: req.user._id
    };

    // If new image is uploaded
    if (req.file) {
        // Delete old image from Cloudinary if it exists
        if (slider.cloudinaryPublicId) {
            try {
                await CloudinaryService.deleteImage(slider.cloudinaryPublicId);
                console.log('🗑️ Old image deleted from Cloudinary:', slider.cloudinaryPublicId);
            } catch (error) {
                console.log('⚠️ Failed to delete old image from Cloudinary:', error.message);
            }
        } else {
            // Delete old local file if it exists
            const oldImagePath = path.join(__dirname, '..', slider.image);
            try {
                await fs.unlink(oldImagePath);
                console.log('🗑️ Old image deleted:', oldImagePath);
            } catch (error) {
                console.log('⚠️ Old image not found or already deleted');
            }
        }

        // Update with new image (Cloudinary URL or local path)
        updateData.image = req.file.cloudinaryUrl || `/uploads/sliders/${req.file.filename}`;
        updateData.cloudinaryPublicId = req.file.cloudinaryPublicId || null;
    }

    slider = await Slider.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    ).populate('createdBy', 'fullName email')
        .populate('updatedBy', 'fullName email');

    console.log('✅ Slider updated:', slider._id);

    res.status(200).json({
        success: true,
        message: 'Slider updated successfully',
        data: slider
    });
});

// @desc    Delete slider
// @route   DELETE /api/admin/sliders/:id
// @access  Private (Super Admin, Staff)
const deleteSlider = asyncHandler(async (req, res) => {
    const slider = await Slider.findById(req.params.id);

    if (!slider) {
        return res.status(404).json({
            success: false,
            message: 'Slider not found'
        });
    }

    // Delete image from Cloudinary if it exists
    if (slider.cloudinaryPublicId) {
        try {
            await CloudinaryService.deleteImage(slider.cloudinaryPublicId);
            console.log('🗑️ Image deleted from Cloudinary:', slider.cloudinaryPublicId);
        } catch (error) {
            console.log('⚠️ Failed to delete image from Cloudinary:', error.message);
        }
    } else {
        // Delete local file if it exists
        const imagePath = path.join(__dirname, '..', slider.image);
        try {
            await fs.unlink(imagePath);
            console.log('🗑️ Image deleted:', imagePath);
        } catch (error) {
            console.log('⚠️ Image file not found or already deleted');
        }
    }

    // Delete slider from database
    await Slider.findByIdAndDelete(req.params.id);

    console.log('✅ Slider deleted:', req.params.id);

    res.status(200).json({
        success: true,
        message: 'Slider deleted successfully'
    });
});

// @desc    Reorder sliders
// @route   PUT /api/admin/sliders/reorder
// @access  Private (Super Admin, Staff)
const reorderSliders = asyncHandler(async (req, res) => {
    const { sliders } = req.body; // Array of {id, order}

    if (!Array.isArray(sliders)) {
        return res.status(400).json({
            success: false,
            message: 'Sliders must be an array'
        });
    }

    // Update order for each slider
    const updatePromises = sliders.map(item =>
        Slider.findByIdAndUpdate(item.id, { order: item.order, updatedBy: req.user._id })
    );

    await Promise.all(updatePromises);

    console.log('✅ Sliders reordered');

    res.status(200).json({
        success: true,
        message: 'Sliders reordered successfully'
    });
});

module.exports = {
    getSliders,
    getSlider,
    createSlider,
    updateSlider,
    deleteSlider,
    reorderSliders
};

