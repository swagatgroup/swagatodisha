const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
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
} = require('../controllers/courseController');

// Public routes
router.get('/', getCourses);
router.get('/featured', getFeaturedCourses);
router.get('/popular', getPopularCourses);
router.get('/institution-type/:institutionType', getCoursesByInstitutionType);
router.get('/stats', getCourseStats);
router.get('/:courseId', getCourseById);

// Protected routes (Admin only)
router.post('/', protect, createCourse);
router.put('/:courseId', protect, updateCourse);
router.delete('/:courseId', protect, deleteCourse);
router.put('/:courseId/status', protect, updateCourseStatus);

module.exports = router;
