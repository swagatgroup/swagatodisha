const College = require('../models/College');
const CollegeCourse = require('../models/CollegeCourse');
const Campus = require('../models/Campus');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all colleges
// @route   GET /api/admin/colleges
// @access  Private
const getColleges = asyncHandler(async (req, res) => {
    const { isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
    }

    const colleges = await College.find(filter)
        .sort({ name: 1 })
        .populate('createdBy', 'fullName email')
        .populate('updatedBy', 'fullName email');

    res.status(200).json({
        success: true,
        count: colleges.length,
        data: colleges
    });
});

// @desc    Get single college with courses
// @route   GET /api/admin/colleges/:id
// @access  Private
const getCollege = asyncHandler(async (req, res) => {
    const college = await College.findById(req.params.id)
        .populate('createdBy', 'fullName email')
        .populate('updatedBy', 'fullName email');

    if (!college) {
        return res.status(404).json({
            success: false,
            message: 'College not found'
        });
    }

    // Get courses for this college
    const courses = await CollegeCourse.find({ college: college._id, isActive: true })
        .sort({ courseName: 1 });

    res.status(200).json({
        success: true,
        data: {
            ...college.toObject(),
            courses
        }
    });
});

// @desc    Create new college
// @route   POST /api/admin/colleges
// @access  Private (Super Admin, Staff)
const createCollege = asyncHandler(async (req, res) => {
    const { name, code, description, isActive } = req.body;

    // Validate name
    if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Institution name is required'
        });
    }

    // Check if college with same name exists (case-insensitive)
    const existingCollege = await College.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (existingCollege) {
        return res.status(400).json({
            success: false,
            message: `A college with the name "${name.trim()}" already exists. Please use a different name.`,
            field: 'name'
        });
    }

    // Process code: if empty/null, set to null (sparse index allows multiple nulls)
    let processedCode = null;
    if (code && code.trim()) {
        processedCode = code.trim().toUpperCase();
        
        // Check if college with same code exists
        const existingCodeCollege = await College.findOne({
            code: processedCode
        });

        if (existingCodeCollege) {
            return res.status(400).json({
                success: false,
                message: `A college with the code "${processedCode}" already exists. Please use a different code.`,
                field: 'code'
            });
        }
    }

    try {
        const collegeData = {
            name: name.trim(),
            description: description ? description.trim() : undefined,
            isActive: isActive !== 'false' && isActive !== false,
            createdBy: req.user._id,
            updatedBy: req.user._id
        };
        
        // Only add code field if it's not null (MongoDB sparse index handles null properly)
        if (processedCode) {
            collegeData.code = processedCode;
        }
        
        const college = await College.create(collegeData);

        await college.populate('createdBy', 'fullName email');
        await college.populate('updatedBy', 'fullName email');

        console.log('✅ College created:', college._id);

        res.status(201).json({
            success: true,
            message: 'College created successfully',
            data: college
        });
    } catch (error) {
        // Handle duplicate key errors
        if (error.code === 11000) {
            // Determine which field caused the duplicate
            const duplicateField = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'unknown';
            const duplicateValue = error.keyValue ? error.keyValue[duplicateField] : null;

            let message = 'Duplicate field value entered';
            
            if (duplicateField === 'name') {
                message = `A college with the name "${duplicateValue}" already exists. Please use a different name.`;
            } else if (duplicateField === 'code') {
                // Handle null/empty code duplicates - this shouldn't happen with sparse index, but handle it anyway
                if (!duplicateValue || duplicateValue === null || duplicateValue === 'null') {
                    message = `A college without a code already exists. The code field must be unique when provided, or can be left empty.`;
                } else {
                    message = `A college with the code "${duplicateValue}" already exists. Please use a different code or leave it empty.`;
                }
            } else {
                message = `A college with this ${duplicateField} already exists. Please use a different value.`;
            }

            return res.status(400).json({
                success: false,
                message,
                field: duplicateField
            });
        }
        // Re-throw other errors to be handled by asyncHandler
        throw error;
    }
});

// @desc    Update college
// @route   PUT /api/admin/colleges/:id
// @access  Private (Super Admin, Staff)
const updateCollege = asyncHandler(async (req, res) => {
    let college = await College.findById(req.params.id);

    if (!college) {
        return res.status(404).json({
            success: false,
            message: 'College not found'
        });
    }

    const { name, code, description, isActive } = req.body;

    // Check if another college with same name exists
    if (name) {
        const existingCollege = await College.findOne({
            _id: { $ne: req.params.id },
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });

        if (existingCollege) {
            return res.status(400).json({
                success: false,
                message: `A college with the name "${name.trim()}" already exists. Please use a different name.`,
                field: 'name'
            });
        }
    }

    // Check if another college with same code exists (if code is provided)
    const updateData = {
        name: name !== undefined ? name.trim() : college.name,
        description: description !== undefined ? (description.trim() || undefined) : college.description,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : college.isActive,
        updatedBy: req.user._id
    };
    
    if (code !== undefined) {
        // If code is empty/null, unset it (sparse index allows multiple nulls/undefined)
        if (!code || !code.trim()) {
            updateData.$unset = { code: '' };
        } else {
            const processedCode = code.trim().toUpperCase();
            
            // Check for duplicate code
            const existingCodeCollege = await College.findOne({
                _id: { $ne: req.params.id },
                code: processedCode
            });

            if (existingCodeCollege) {
                return res.status(400).json({
                    success: false,
                    message: `A college with the code "${processedCode}" already exists. Please use a different code.`,
                    field: 'code'
                });
            }
            
            updateData.code = processedCode;
        }
    }

    try {
        college = await College.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy', 'fullName email')
            .populate('updatedBy', 'fullName email');

        console.log('✅ College updated:', college._id);

        res.status(200).json({
            success: true,
            message: 'College updated successfully',
            data: college
        });
    } catch (error) {
        // Handle duplicate key errors
        if (error.code === 11000) {
            // Determine which field caused the duplicate
            const duplicateField = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'unknown';
            const duplicateValue = error.keyValue ? error.keyValue[duplicateField] : null;

            let message = 'Duplicate field value entered';
            
            if (duplicateField === 'name') {
                message = `A college with the name "${duplicateValue}" already exists. Please use a different name.`;
            } else if (duplicateField === 'code') {
                // Handle null/empty code duplicates - this shouldn't happen with sparse index, but handle it anyway
                if (!duplicateValue || duplicateValue === null || duplicateValue === 'null') {
                    message = `A college without a code already exists. The code field must be unique when provided, or can be left empty.`;
                } else {
                    message = `A college with the code "${duplicateValue}" already exists. Please use a different code or leave it empty.`;
                }
            } else {
                message = `A college with this ${duplicateField} already exists. Please use a different value.`;
            }

            return res.status(400).json({
                success: false,
                message,
                field: duplicateField
            });
        }
        // Re-throw other errors to be handled by asyncHandler
        throw error;
    }
});

// @desc    Delete college
// @route   DELETE /api/admin/colleges/:id
// @access  Private (Super Admin, Staff)
const deleteCollege = asyncHandler(async (req, res) => {
    const college = await College.findById(req.params.id);

    if (!college) {
        return res.status(404).json({
            success: false,
            message: 'College not found'
        });
    }

    // Check if college has courses
    const courseCount = await CollegeCourse.countDocuments({ college: college._id });
    if (courseCount > 0) {
        return res.status(400).json({
            success: false,
            message: `Cannot delete college. It has ${courseCount} course(s) associated with it. Please delete or reassign courses first.`
        });
    }

    await College.findByIdAndDelete(req.params.id);

    console.log('✅ College deleted:', req.params.id);

    res.status(200).json({
        success: true,
        message: 'College deleted successfully'
    });
});

// @desc    Get all courses for a college
// @route   GET /api/admin/colleges/:collegeId/courses
// @access  Private
const getCollegeCourses = asyncHandler(async (req, res) => {
    const { collegeId } = req.params;
    const { isActive } = req.query;

    const filter = { college: collegeId };
    if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
    }

    const courses = await CollegeCourse.find(filter)
        .sort({ courseName: 1 })
        .populate('college', 'name code')
        .populate('createdBy', 'fullName email')
        .populate('updatedBy', 'fullName email');

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    });
});

// @desc    Create course for a college
// @route   POST /api/admin/colleges/:collegeId/courses
// @access  Private (Super Admin, Staff)
const createCollegeCourse = asyncHandler(async (req, res) => {
    const { collegeId } = req.params;
    const { courseName, courseCode, streams, isActive } = req.body;

    // Check if college exists
    const college = await College.findById(collegeId);
    if (!college) {
        return res.status(404).json({
            success: false,
            message: 'College not found'
        });
    }

    // Check if course with same name exists for this college
    const existingCourse = await CollegeCourse.findOne({
        college: collegeId,
        courseName: courseName.trim()
    });

    if (existingCourse) {
        return res.status(400).json({
            success: false,
            message: 'Course with this name already exists for this college'
        });
    }

    // Process streams array
    const processedStreams = Array.isArray(streams) ? streams.map(stream => ({
        name: stream.name?.trim() || stream.trim(),
        isActive: stream.isActive !== false
    })) : [];

    const course = await CollegeCourse.create({
        college: collegeId,
        courseName: courseName.trim(),
        courseCode: courseCode ? courseCode.trim() : undefined,
        streams: processedStreams,
        isActive: isActive !== 'false' && isActive !== false,
        createdBy: req.user._id,
        updatedBy: req.user._id
    });

    await course.populate('college', 'name code');
    await course.populate('createdBy', 'fullName email');
    await course.populate('updatedBy', 'fullName email');

    console.log('✅ College course created:', course._id);

    res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course
    });
});

// @desc    Update course
// @route   PUT /api/admin/colleges/:collegeId/courses/:courseId
// @access  Private (Super Admin, Staff)
const updateCollegeCourse = asyncHandler(async (req, res) => {
    const { collegeId, courseId } = req.params;
    const { courseName, courseCode, streams, isActive } = req.body;

    let course = await CollegeCourse.findOne({
        _id: courseId,
        college: collegeId
    });

    if (!course) {
        return res.status(404).json({
            success: false,
            message: 'Course not found'
        });
    }

    // Check if another course with same name exists for this college
    if (courseName) {
        const existingCourse = await CollegeCourse.findOne({
            _id: { $ne: courseId },
            college: collegeId,
            courseName: courseName.trim()
        });

        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: 'Course with this name already exists for this college'
            });
        }
    }

    // Process streams array if provided
    let processedStreams = course.streams;
    if (streams !== undefined) {
        processedStreams = Array.isArray(streams) ? streams.map(stream => ({
            name: stream.name?.trim() || stream.trim(),
            isActive: stream.isActive !== false
        })) : [];
    }

    const updateData = {
        courseName: courseName !== undefined ? courseName.trim() : course.courseName,
        courseCode: courseCode !== undefined ? (courseCode.trim() || undefined) : course.courseCode,
        streams: processedStreams,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : course.isActive,
        updatedBy: req.user._id
    };

    course = await CollegeCourse.findByIdAndUpdate(
        courseId,
        updateData,
        { new: true, runValidators: true }
    ).populate('college', 'name code')
        .populate('createdBy', 'fullName email')
        .populate('updatedBy', 'fullName email');

    console.log('✅ College course updated:', course._id);

    res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: course
    });
});

// @desc    Delete course
// @route   DELETE /api/admin/colleges/:collegeId/courses/:courseId
// @access  Private (Super Admin, Staff)
const deleteCollegeCourse = asyncHandler(async (req, res) => {
    const { collegeId, courseId } = req.params;

    const course = await CollegeCourse.findOne({
        _id: courseId,
        college: collegeId
    });

    if (!course) {
        return res.status(404).json({
            success: false,
            message: 'Course not found'
        });
    }

    await CollegeCourse.findByIdAndDelete(courseId);

    console.log('✅ College course deleted:', courseId);

    res.status(200).json({
        success: true,
        message: 'Course deleted successfully'
    });
});

// @desc    Get all colleges with courses (Public - for registration form)
// @route   GET /api/colleges/public
// @access  Public
const getPublicColleges = asyncHandler(async (req, res) => {
    const colleges = await College.find({ isActive: true })
        .sort({ name: 1 })
        .select('name');

    // Get courses and campuses for each college
    const collegesWithCourses = await Promise.all(
        colleges.map(async (college) => {
            const courses = await CollegeCourse.find({
                college: college._id,
                isActive: true
            })
                .sort({ courseName: 1 })
                .select('courseName courseCode streams');

            const campuses = await Campus.find({
                college: college._id,
                isActive: true
            })
                .sort({ name: 1 })
                .select('name code');

            return {
                _id: college._id,
                name: college.name,
                courses: courses.map(c => ({
                    _id: c._id,
                    courseName: c.courseName,
                    streams: c.streams ? c.streams.filter(s => s.isActive).map(s => s.name) : []
                })),
                campuses: campuses.map(c => ({
                    _id: c._id,
                    name: c.name,
                    code: c.code
                }))
            };
        })
    );

    res.status(200).json({
        success: true,
        count: collegesWithCourses.length,
        data: collegesWithCourses
    });
});

module.exports = {
    getColleges,
    getCollege,
    createCollege,
    updateCollege,
    deleteCollege,
    getCollegeCourses,
    createCollegeCourse,
    updateCollegeCourse,
    deleteCollegeCourse,
    getPublicColleges
};

