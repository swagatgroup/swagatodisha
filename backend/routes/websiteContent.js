const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getWebsiteContent,
    updateWebsiteContent,
    updateSection,
    resetToDefaults
} = require('../controllers/websiteContentController');

// Get website content
router.get('/', getWebsiteContent);

// Update website content
router.put('/', protect, updateWebsiteContent);

// Update specific section
router.put('/:section', protect, updateSection);

// Reset to defaults
router.post('/reset', protect, resetToDefaults);

module.exports = router;
