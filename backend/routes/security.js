const express = require('express');
const { protect, isSuperAdmin } = require('../middleware/auth');
const SecurityAudit = require('../utils/securityAudit');
const {
    securityLogger,
    ipWhitelist,
    sanitizeInput,
    preventSQLInjection,
    preventXSS
} = require('../middleware/security');

const router = express.Router();

// Apply security middleware to all routes
router.use(securityLogger);
router.use(sanitizeInput);
router.use(preventSQLInjection);
router.use(preventXSS);

// @desc    Get security audit report
// @route   GET /api/security/audit
// @access  Private (Super Admin only)
router.get('/audit', protect, isSuperAdmin, async (req, res) => {
    try {
        const report = await SecurityAudit.generateSecurityReport();

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Security audit error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate security audit report'
        });
    }
});

// @desc    Get password security audit
// @route   GET /api/security/passwords
// @access  Private (Super Admin only)
router.get('/passwords', protect, isSuperAdmin, async (req, res) => {
    try {
        const audit = await SecurityAudit.auditUserPasswords();

        res.json({
            success: true,
            data: audit
        });
    } catch (error) {
        console.error('Password audit error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to audit passwords'
        });
    }
});

// @desc    Fix weak passwords
// @route   POST /api/security/fix-passwords
// @access  Private (Super Admin only)
router.post('/fix-passwords', protect, isSuperAdmin, async (req, res) => {
    try {
        const result = await SecurityAudit.fixWeakPasswords();

        res.json({
            success: true,
            message: `Fixed ${result.fixedCount} out of ${result.totalWeak} weak passwords`,
            data: result
        });
    } catch (error) {
        console.error('Password fix error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fix weak passwords'
        });
    }
});

// @desc    Get JWT security audit
// @route   GET /api/security/jwt
// @access  Private (Super Admin only)
router.get('/jwt', protect, isSuperAdmin, async (req, res) => {
    try {
        const audit = await SecurityAudit.auditJWTTokens();

        res.json({
            success: true,
            data: audit
        });
    } catch (error) {
        console.error('JWT audit error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to audit JWT configuration'
        });
    }
});

// @desc    Get database security audit
// @route   GET /api/security/database
// @access  Private (Super Admin only)
router.get('/database', protect, isSuperAdmin, async (req, res) => {
    try {
        const audit = await SecurityAudit.auditDatabaseSecurity();

        res.json({
            success: true,
            data: audit
        });
    } catch (error) {
        console.error('Database audit error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to audit database security'
        });
    }
});

// @desc    Get file upload security audit
// @route   GET /api/security/file-uploads
// @access  Private (Super Admin only)
router.get('/file-uploads', protect, isSuperAdmin, async (req, res) => {
    try {
        const audit = await SecurityAudit.auditFileUploads();

        res.json({
            success: true,
            data: audit
        });
    } catch (error) {
        console.error('File upload audit error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to audit file upload security'
        });
    }
});

// @desc    Get rate limiting audit
// @route   GET /api/security/rate-limiting
// @access  Private (Super Admin only)
router.get('/rate-limiting', protect, isSuperAdmin, async (req, res) => {
    try {
        const audit = await SecurityAudit.auditRateLimiting();

        res.json({
            success: true,
            data: audit
        });
    } catch (error) {
        console.error('Rate limiting audit error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to audit rate limiting configuration'
        });
    }
});

// @desc    Get CORS security audit
// @route   GET /api/security/cors
// @access  Private (Super Admin only)
router.get('/cors', protect, isSuperAdmin, async (req, res) => {
    try {
        const audit = await SecurityAudit.auditCORSConfiguration();

        res.json({
            success: true,
            data: audit
        });
    } catch (error) {
        console.error('CORS audit error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to audit CORS configuration'
        });
    }
});

// @desc    Get security logs
// @route   GET /api/security/logs
// @access  Private (Super Admin only)
router.get('/logs', protect, isSuperAdmin, async (req, res) => {
    try {
        // In a real implementation, this would fetch from a logging service
        // For now, return a placeholder response
        res.json({
            success: true,
            data: {
                message: 'Security logs endpoint - would integrate with logging service',
                timestamp: new Date(),
                logs: []
            }
        });
    } catch (error) {
        console.error('Security logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch security logs'
        });
    }
});

// @desc    Generate security report
// @route   POST /api/security/generate-report
// @access  Private (Super Admin only)
router.post('/generate-report', protect, isSuperAdmin, async (req, res) => {
    try {
        const report = await SecurityAudit.generateSecurityReport();

        // In a real implementation, this would save the report to a file or database
        // Security Report Generated

        res.json({
            success: true,
            message: 'Security report generated successfully',
            data: report
        });
    } catch (error) {
        console.error('Security report generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate security report'
        });
    }
});

module.exports = router;
