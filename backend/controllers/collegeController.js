const College = require('../models/College');
const CollegeCourse = require('../models/CollegeCourse');
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
        .sort({ displayOrder: 1, name: 1 })
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
        .sort({ displayOrder: 1, courseName: 1 });

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
    const { name, code, description, displayOrder, isActive } = req.body;

    // Check if college with same name or code exists
    const existingCollege = await College.findOne({
        $or: [
            { name: name.trim() },
            { code: code.trim().toUpperCase() }
        ]
    });

    if (existingCollege) {
        return res.status(400).json({
            success: false,
            message: 'College with this name or code already exists'
        });
    }

    const college = await College.create({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description?.trim() || '',
        displayOrder: displayOrder || 0,
        isActive: isActive !== 'false',
        createdBy: req.user._id,
        updatedBy: req.user._id
    });

    await college.populate('createdBy', 'fullName email');
    await college.populate('updatedBy', 'fullName email');

    console.log('✅ College created:', college._id);

    res.status(201).json({
        success: true,
        message: 'College created successfully',
        data: college
    });
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

    const { name, code, description, displayOrder, isActive } = req.body;

    // Check if another college with same name or code exists
    if (name || code) {
        const existingCollege = await College.findOne({
            _id: { $ne: req.params.id },
            $or: [
                name ? { name: name.trim() } : {},
                code ? { code: code.trim().toUpperCase() } : {}
            ]
        });

        if (existingCollege) {
            return res.status(400).json({
                success: false,
                message: 'College with this name or code already exists'
            });
        }
    }

    const updateData = {
        name: name !== undefined ? name.trim() : college.name,
        code: code !== undefined ? code.trim().toUpperCase() : college.code,
        description: description !== undefined ? description.trim() : college.description,
        displayOrder: displayOrder !== undefined ? displayOrder : college.displayOrder,
        isActive: isActive !== undefined ? isActive === 'true' : college.isActive,
        updatedBy: req.user._id
    };

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
        .sort({ displayOrder: 1, courseName: 1 })
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
    const { courseName, courseCode, displayOrder, isActive } = req.body;

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

    const course = await CollegeCourse.create({
        college: collegeId,
        courseName: courseName.trim(),
        courseCode: courseCode?.trim() || '',
        displayOrder: displayOrder || 0,
        isActive: isActive !== 'false',
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
    const { courseName, courseCode, displayOrder, isActive } = req.body;

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

    const updateData = {
        courseName: courseName !== undefined ? courseName.trim() : course.courseName,
        courseCode: courseCode !== undefined ? courseCode.trim() : course.courseCode,
        displayOrder: displayOrder !== undefined ? displayOrder : course.displayOrder,
        isActive: isActive !== undefined ? isActive === 'true' : course.isActive,
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
        .sort({ displayOrder: 1, name: 1 })
        .select('name code');

    // Get courses for each college
    const collegesWithCourses = await Promise.all(
        colleges.map(async (college) => {
            const courses = await CollegeCourse.find({
                college: college._id,
                isActive: true
            })
                .sort({ displayOrder: 1, courseName: 1 })
                .select('courseName courseCode');

            return {
                _id: college._id,
                name: college.name,
                code: college.code,
                courses: courses.map(c => ({
                    _id: c._id,
                    courseName: c.courseName,
                    courseCode: c.courseCode
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

