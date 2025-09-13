const express = require('express');
const { protect } = require('../middleware/auth');
const {
    getStudentCourse,
    getStudentAssignments,
    submitAssignment,
    getStudentGrades,
    getCourseMaterials,
    getAcademicSchedule
} = require('../controllers/academicController');

const router = express.Router();

// All routes are protected
router.use(protect);

// Get student course
router.get('/course', getStudentCourse);

// Get student assignments
router.get('/assignments', getStudentAssignments);

// Submit assignment
router.post('/assignments/:assignmentId/submit', submitAssignment);

// Get student grades
router.get('/grades', getStudentGrades);

// Get course materials
router.get('/materials', getCourseMaterials);

// Get academic schedule
router.get('/schedule', getAcademicSchedule);

module.exports = router;
