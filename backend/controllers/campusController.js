const Campus = require('../models/Campus');
const College = require('../models/College');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all campuses (optionally filtered by college)
// @route   GET /api/campuses
// @route   GET /api/colleges/:collegeId/campuses
// @access  Private
const getCampuses = asyncHandler(async (req, res) => {
    const { isActive } = req.query;
    const collegeId = req.params.collegeId;

    const filter = {};
    if (collegeId) {
        filter.college = collegeId;
    }
    if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
    }

    const campuses = await Campus.find(filter)
        .sort({ name: 1 })
        .populate('college', 'name code')
        .populate('createdBy', 'fullName email')
        .populate('updatedBy', 'fullName email');

    res.status(200).json({
        success: true,
        count: campuses.length,
        data: campuses
    });
});

// @desc    Get single campus
// @route   GET /api/campuses/:id
// @access  Private
const getCampus = asyncHandler(async (req, res) => {
    const campus = await Campus.findById(req.params.id)
        .populate('college', 'name code')
        .populate('createdBy', 'fullName email')
        .populate('updatedBy', 'fullName email');

    if (!campus) {
        return res.status(404).json({
            success: false,
            message: 'Campus not found'
        });
    }

    res.status(200).json({
        success: true,
        data: campus
    });
});

// @desc    Create new campus
// @route   POST /api/colleges/:collegeId/campuses
// @access  Private (Super Admin, Staff)
const createCampus = asyncHandler(async (req, res) => {
    const { collegeId } = req.params;
    const { name, code, description, address, contact, isActive } = req.body;

    // Check if college exists
    const college = await College.findById(collegeId);
    if (!college) {
        return res.status(404).json({
            success: false,
            message: 'College not found'
        });
    }

    // Validate name
    if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Campus name is required'
        });
    }

    // Check if campus with same name exists for this college
    const existingCampus = await Campus.findOne({
        college: collegeId,
        name: name.trim()
    });

    if (existingCampus) {
        return res.status(400).json({
            success: false,
            message: 'Campus with this name already exists for this college'
        });
    }

    const campus = await Campus.create({
        college: collegeId,
        name: name.trim(),
        code: code ? code.trim().toUpperCase() : undefined,
        description: description ? description.trim() : undefined,
        address: address || undefined,
        contact: contact || undefined,
        isActive: isActive !== 'false' && isActive !== false,
        createdBy: req.user._id,
        updatedBy: req.user._id
    });

    await campus.populate('college', 'name code');
    await campus.populate('createdBy', 'fullName email');
    await campus.populate('updatedBy', 'fullName email');

    console.log('✅ Campus created:', campus._id);

    res.status(201).json({
        success: true,
        message: 'Campus created successfully',
        data: campus
    });
});

// @desc    Update campus
// @route   PUT /api/colleges/:collegeId/campuses/:campusId
// @access  Private (Super Admin, Staff)
const updateCampus = asyncHandler(async (req, res) => {
    const { collegeId, campusId } = req.params;
    const { name, code, description, address, contact, isActive } = req.body;

    let campus = await Campus.findOne({
        _id: campusId,
        college: collegeId
    });

    if (!campus) {
        return res.status(404).json({
            success: false,
            message: 'Campus not found'
        });
    }

    // Check if another campus with same name exists for this college
    if (name) {
        const existingCampus = await Campus.findOne({
            _id: { $ne: campusId },
            college: collegeId,
            name: name.trim()
        });

        if (existingCampus) {
            return res.status(400).json({
                success: false,
                message: 'Campus with this name already exists for this college'
            });
        }
    }

    const updateData = {
        name: name !== undefined ? name.trim() : campus.name,
        code: code !== undefined ? (code.trim() ? code.trim().toUpperCase() : undefined) : campus.code,
        description: description !== undefined ? (description.trim() || undefined) : campus.description,
        address: address !== undefined ? address : campus.address,
        contact: contact !== undefined ? contact : campus.contact,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : campus.isActive,
        updatedBy: req.user._id
    };

    campus = await Campus.findByIdAndUpdate(
        campusId,
        updateData,
        { new: true, runValidators: true }
    ).populate('college', 'name code')
        .populate('createdBy', 'fullName email')
        .populate('updatedBy', 'fullName email');

    console.log('✅ Campus updated:', campus._id);

    res.status(200).json({
        success: true,
        message: 'Campus updated successfully',
        data: campus
    });
});

// @desc    Delete campus
// @route   DELETE /api/colleges/:collegeId/campuses/:campusId
// @access  Private (Super Admin, Staff)
const deleteCampus = asyncHandler(async (req, res) => {
    const { collegeId, campusId } = req.params;

    const campus = await Campus.findOne({
        _id: campusId,
        college: collegeId
    });

    if (!campus) {
        return res.status(404).json({
            success: false,
            message: 'Campus not found'
        });
    }

    await Campus.findByIdAndDelete(campusId);

    console.log('✅ Campus deleted:', campusId);

    res.status(200).json({
        success: true,
        message: 'Campus deleted successfully'
    });
});

// @desc    Get all active campuses grouped by college (Public - for registration form)
// @route   GET /api/campuses/public
// @route   GET /api/colleges/:collegeId/campuses/public
// @access  Public
const getPublicCampuses = asyncHandler(async (req, res) => {
    const { collegeId } = req.params;
    
    const filter = { isActive: true };
    if (collegeId) {
        filter.college = collegeId;
    }

    const campuses = await Campus.find(filter)
        .sort({ name: 1 })
        .populate('college', 'name code')
        .select('name code college');

    res.status(200).json({
        success: true,
        count: campuses.length,
        data: campuses
    });
});

module.exports = {
    getCampuses,
    getCampus,
    createCampus,
    updateCampus,
    deleteCampus,
    getPublicCampuses
};

