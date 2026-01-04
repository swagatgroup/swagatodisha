const College = require('../models/College');
const CollegeCourse = require('../models/CollegeCourse');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all colleges
// @route   GET /api/admin/colleges
// @access  Private
const getColleges = asyncHandler(async (req, res) => {
    const colleges = await College.find({})
        .sort({ name: 1 });

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
    const college = await College.findById(req.params.id);

    if (!college) {
        return res.status(404).json({
            success: false,
            message: 'College not found'
        });
    }

    // Get courses for this college
    const courses = await CollegeCourse.find({ college: college._id })
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
    const { name, campuses, courses } = req.body;

    // Validate name
    if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Institution name is required'
        });
    }

    // Check if college with same name exists
    const existingCollege = await College.findOne({
        name: name.trim()
    });

    if (existingCollege) {
        return res.status(400).json({
            success: false,
            message: 'College with this name already exists'
        });
    }

    // Process campuses
    const processedCampuses = Array.isArray(campuses) ? campuses.map(campus => ({
        name: campus.name?.trim() || campus.trim()
    })) : [];

    const college = await College.create({
        name: name.trim(),
        campuses: processedCampuses
    });

    // Create courses if provided
    if (Array.isArray(courses) && courses.length > 0) {
        for (const courseData of courses) {
            if (courseData.name && courseData.name.trim()) {
                const processedStreams = Array.isArray(courseData.streams)
                    ? courseData.streams.map(stream => ({
                        name: stream.name?.trim() || stream.trim(),
                        isActive: true
                    }))
                    : [];

                await CollegeCourse.create({
                    college: college._id,
                    courseName: courseData.name.trim(),
                    streams: processedStreams,
                    isActive: true
                });
            }
        }
    }

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

    const { name, campuses, courses } = req.body;

    // Check if another college with same name exists
    if (name) {
        const existingCollege = await College.findOne({
            _id: { $ne: req.params.id },
            name: name.trim()
        });

        if (existingCollege) {
            return res.status(400).json({
                success: false,
                message: 'College with this name already exists'
            });
        }
    }

    // Process campuses
    const processedCampuses = Array.isArray(campuses) ? campuses.map(campus => ({
        name: campus.name?.trim() || campus.trim()
    })) : [];

    const updateData = {
        name: name !== undefined ? name.trim() : college.name,
        campuses: processedCampuses
    };

    college = await College.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    );

    // Update courses if provided
    if (Array.isArray(courses)) {
        // Delete all existing courses for this college
        await CollegeCourse.deleteMany({ college: college._id });

        // Create new courses
        for (const courseData of courses) {
            if (courseData.name && courseData.name.trim()) {
                const processedStreams = Array.isArray(courseData.streams)
                    ? courseData.streams.map(stream => ({
                        name: stream.name?.trim() || stream.trim(),
                        isActive: true
                    }))
                    : [];

                await CollegeCourse.create({
                    college: college._id,
                    courseName: courseData.name.trim(),
                    streams: processedStreams,
                    isActive: true
                });
            }
        }
    }

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

    const courses = await CollegeCourse.find({ college: collegeId })
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
    const { courseName, courseCode, streams } = req.body;

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
        streams: processedStreams
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
    const { courseName, courseCode, streams } = req.body;

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
        streams: processedStreams
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
    const colleges = await College.find({})
        .sort({ name: 1 })
        .select('name campuses');

    // Get courses for each college
    const collegesWithCourses = await Promise.all(
        colleges.map(async (college) => {
            const courses = await CollegeCourse.find({
                college: college._id
            })
                .sort({ courseName: 1 })
                .select('courseName streams');

            return {
                _id: college._id,
                name: college.name,
                campuses: college.campuses || [],
                courses: courses.map(c => ({
                    _id: c._id,
                    courseName: c.courseName,
                    streams: c.streams ? c.streams.map(s => s.name || s) : []
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

