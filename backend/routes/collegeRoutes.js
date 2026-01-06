const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/collegeController');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Public route - Get colleges with courses for registration form
router.get('/public', getPublicColleges);

// All other routes require authentication
router.use(protect);

// Apply role-based access control for write operations
const isSuperAdminOrStaff = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'User not authenticated'
        });
    }
    if (!['super_admin', 'staff'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Super Admin or Staff only.'
        });
    }
    next();
};

// College routes
router.get('/', getColleges);
router.get('/:id', getCollege);
router.post('/', isSuperAdminOrStaff, createCollege);
router.put('/:id', isSuperAdminOrStaff, updateCollege);
router.delete('/:id', isSuperAdminOrStaff, deleteCollege);

// Course routes for a college
router.get('/:collegeId/courses', getCollegeCourses);
router.post('/:collegeId/courses', isSuperAdminOrStaff, createCollegeCourse);
router.put('/:collegeId/courses/:courseId', isSuperAdminOrStaff, updateCollegeCourse);
router.delete('/:collegeId/courses/:courseId', isSuperAdminOrStaff, deleteCollegeCourse);

// Campus routes for a college
const {
    getCampuses: getCollegeCampuses,
    getCampus: getCollegeCampus,
    createCampus: createCollegeCampus,
    updateCampus: updateCollegeCampus,
    deleteCampus: deleteCollegeCampus,
    getPublicCampuses: getPublicCollegeCampuses
} = require('../controllers/campusController');

router.get('/:collegeId/campuses', getCollegeCampuses);
router.get('/:collegeId/campuses/public', getPublicCollegeCampuses);
router.get('/:collegeId/campuses/:campusId', getCollegeCampus);
router.post('/:collegeId/campuses', isSuperAdminOrStaff, createCollegeCampus);
router.put('/:collegeId/campuses/:campusId', isSuperAdminOrStaff, updateCollegeCampus);
router.delete('/:collegeId/campuses/:campusId', isSuperAdminOrStaff, deleteCollegeCampus);

module.exports = router;

