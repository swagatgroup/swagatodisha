const express = require('express');
const { protect } = require('../middleware/auth');
const {
    getStudentApplications,
    createApplication,
    updateApplication,
    withdrawApplication,
    getApplicationById
} = require('../controllers/studentApplicationController');

const router = express.Router();

// All routes are protected
router.use(protect);

// Get student applications
router.get('/', getStudentApplications);

// Create new application
router.post('/', createApplication);

// Get application by ID
router.get('/:applicationId', getApplicationById);

// Update application
router.put('/:applicationId', updateApplication);

// Withdraw application
router.delete('/:applicationId', withdrawApplication);

module.exports = router;
