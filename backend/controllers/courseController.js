const Course = require('../models/Course');
const Institution = require('../models/Institution');

// Get all courses
const getCourses = async (req, res) => {
    try {
        const { institutionType, level, search, page = 1, limit = 20 } = req.query;

        let query = {};

        if (institutionType) {
            query.institutionType = institutionType;
        }

        if (level) {
            query.level = level;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const courses = await Course.find(query)
            .populate('institution', 'name type')
            .sort({ displayOrder: 1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Course.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                courses,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get courses',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get course by ID
const getCourseById = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId)
            .populate('institution', 'name type');

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            data: course
        });
    } catch (error) {
        console.error('Get course by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get course',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Create new course
const createCourse = async (req, res) => {
    try {
        const courseData = {
            ...req.body,
            lastModified: new Date(),
            modifiedBy: req.user._id
        };

        const course = new Course(courseData);
        await course.save();

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: course
        });
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create course',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update course
const updateCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const updateData = {
            ...req.body,
            lastModified: new Date(),
            modifiedBy: req.user._id
        };

        const course = await Course.findByIdAndUpdate(
            courseId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            data: course
        });
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update course',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Delete course
const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findByIdAndDelete(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete course',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get courses by institution type
const getCoursesByInstitutionType = async (req, res) => {
    try {
        const { institutionType } = req.params;

        const courses = await Course.find({
            institutionType,
            isActive: true
        }).sort({ displayOrder: 1, name: 1 });

        res.status(200).json({
            success: true,
            data: courses
        });
    } catch (error) {
        console.error('Get courses by institution type error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get courses',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get featured courses
const getFeaturedCourses = async (req, res) => {
    try {
        const courses = await Course.find({
            isFeatured: true,
            isActive: true
        }).sort({ displayOrder: 1, name: 1 });

        res.status(200).json({
            success: true,
            data: courses
        });
    } catch (error) {
        console.error('Get featured courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get featured courses',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get popular courses
const getPopularCourses = async (req, res) => {
    try {
        const courses = await Course.find({
            isPopular: true,
            isActive: true
        }).sort({ displayOrder: 1, name: 1 });

        res.status(200).json({
            success: true,
            data: courses
        });
    } catch (error) {
        console.error('Get popular courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get popular courses',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update course status
const updateCourseStatus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { isActive, isFeatured, isPopular } = req.body;

        const updateData = {
            lastModified: new Date(),
            modifiedBy: req.user._id
        };

        if (isActive !== undefined) updateData.isActive = isActive;
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
        if (isPopular !== undefined) updateData.isPopular = isPopular;

        const course = await Course.findByIdAndUpdate(
            courseId,
            updateData,
            { new: true }
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Course status updated successfully',
            data: course
        });
    } catch (error) {
        console.error('Update course status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update course status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get course statistics
const getCourseStats = async (req, res) => {
    try {
        const totalCourses = await Course.countDocuments();
        const activeCourses = await Course.countDocuments({ isActive: true });
        const featuredCourses = await Course.countDocuments({ isFeatured: true });
        const popularCourses = await Course.countDocuments({ isPopular: true });

        const byInstitutionType = await Course.aggregate([
            { $group: { _id: '$institutionType', count: { $sum: 1 } } }
        ]);

        const byLevel = await Course.aggregate([
            { $group: { _id: '$level', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalCourses,
                activeCourses,
                featuredCourses,
                popularCourses,
                byInstitutionType,
                byLevel
            }
        });
    } catch (error) {
        console.error('Get course stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get course statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getCoursesByInstitutionType,
    getFeaturedCourses,
    getPopularCourses,
    updateCourseStatus,
    getCourseStats
};
