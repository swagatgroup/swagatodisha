const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');
const mongoose = require('mongoose');

// @desc    Get recent delete attempts (for investigation)
// @route   GET /api/audit-logs/recent
// @access  Private - Staff/Super Admin only
router.get('/recent', protect, authorize('staff', 'super_admin'), async (req, res) => {
    try {
        const { hours = 24, resourceType } = req.query;
        const hoursAgo = parseInt(hours);
        const startTime = new Date();
        startTime.setHours(startTime.getHours() - hoursAgo);

        const query = {
            timestamp: { $gte: startTime },
            action: {
                $in: ['DELETE_ATTEMPT', 'DELETE_SUCCESS', 'DELETE_FAILED', 'BULK_DELETE_ATTEMPT', 'BULK_DELETE_SUCCESS', 'BULK_DELETE_FAILED']
            }
        };

        if (resourceType) {
            query.resourceType = resourceType;
        }

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .populate('performedBy.userId', 'email role fullName')
            .lean();

        res.json({
            success: true,
            count: logs.length,
            hoursAgo,
            startTime: startTime.toISOString(),
            data: logs
        });
    } catch (error) {
        console.error('Error fetching recent delete attempts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent delete attempts',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Get delete attempts for a specific ID
// @route   GET /api/audit-logs/delete-attempts/:id
// @access  Private - Staff/Super Admin only
router.get('/delete-attempts/:id', protect, authorize('staff', 'super_admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 50 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format'
            });
        }

        const attempts = await AuditLog.getDeleteAttemptsForId(id, parseInt(limit));

        res.json({
            success: true,
            count: attempts.length,
            data: attempts
        });
    } catch (error) {
        console.error('Error fetching delete attempts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch delete attempts',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Get all delete attempts by a user
// @route   GET /api/audit-logs/user/:userId
// @access  Private - Staff/Super Admin only
router.get('/user/:userId', protect, authorize('staff', 'super_admin'), async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 100 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        const attempts = await AuditLog.getDeleteAttemptsByUser(userId, parseInt(limit));

        res.json({
            success: true,
            count: attempts.length,
            data: attempts
        });
    } catch (error) {
        console.error('Error fetching user delete attempts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user delete attempts',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Get delete attempts by IP address
// @route   GET /api/audit-logs/ip/:ipAddress
// @access  Private - Staff/Super Admin only
router.get('/ip/:ipAddress', protect, authorize('staff', 'super_admin'), async (req, res) => {
    try {
        const { ipAddress } = req.params;
        const { hours = 168, limit = 100 } = req.query; // Default: last 7 days

        const startTime = new Date();
        startTime.setHours(startTime.getHours() - parseInt(hours));

        const attempts = await AuditLog.find({
            'requestDetails.ip': ipAddress,
            timestamp: { $gte: startTime },
            action: {
                $in: ['DELETE_ATTEMPT', 'DELETE_SUCCESS', 'DELETE_FAILED', 'BULK_DELETE_ATTEMPT', 'BULK_DELETE_SUCCESS', 'BULK_DELETE_FAILED']
            }
        })
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .populate('performedBy.userId', 'email role fullName')
        .lean();

        res.json({
            success: true,
            count: attempts.length,
            ipAddress,
            hoursAgo: parseInt(hours),
            startTime: startTime.toISOString(),
            data: attempts
        });
    } catch (error) {
        console.error('Error fetching delete attempts by IP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch delete attempts by IP',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Get all delete attempts (with filters)
// @route   GET /api/audit-logs
// @access  Private - Super Admin only
router.get('/', protect, authorize('super_admin'), async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            resourceType,
            action,
            success,
            startDate,
            endDate,
            userId,
            ipAddress
        } = req.query;

        const query = {
            action: {
                $in: ['DELETE_ATTEMPT', 'DELETE_SUCCESS', 'DELETE_FAILED', 'BULK_DELETE_ATTEMPT', 'BULK_DELETE_SUCCESS', 'BULK_DELETE_FAILED']
            }
        };

        // Apply filters
        if (resourceType) {
            query.resourceType = resourceType;
        }

        if (action) {
            query.action = action;
        }

        if (success !== undefined) {
            query['result.success'] = success === 'true';
        }

        if (userId) {
            query['performedBy.userId'] = new mongoose.Types.ObjectId(userId);
        }

        if (ipAddress) {
            query['requestDetails.ip'] = ipAddress;
        }

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) {
                query.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                query.timestamp.$lte = new Date(endDate);
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('performedBy.userId', 'email role fullName')
                .lean(),
            AuditLog.countDocuments(query)
        ]);

        res.json({
            success: true,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            },
            data: logs
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit logs',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Get delete attempt statistics
// @route   GET /api/audit-logs/statistics
// @access  Private - Super Admin only
router.get('/statistics', protect, authorize('super_admin'), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.timestamp = {};
            if (startDate) {
                dateFilter.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                dateFilter.timestamp.$lte = new Date(endDate);
            }
        }

        const query = {
            ...dateFilter,
            action: {
                $in: ['DELETE_ATTEMPT', 'DELETE_SUCCESS', 'DELETE_FAILED', 'BULK_DELETE_ATTEMPT', 'BULK_DELETE_SUCCESS', 'BULK_DELETE_FAILED']
            }
        };

        const [
            totalAttempts,
            successfulDeletes,
            failedDeletes,
            byResourceType,
            byUser,
            recentAttempts
        ] = await Promise.all([
            AuditLog.countDocuments(query),
            AuditLog.countDocuments({ ...query, 'result.success': true }),
            AuditLog.countDocuments({ ...query, 'result.success': false }),
            AuditLog.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: '$resourceType',
                        count: { $sum: 1 },
                        successful: {
                            $sum: { $cond: ['$result.success', 1, 0] }
                        },
                        failed: {
                            $sum: { $cond: ['$result.success', 0, 1] }
                        }
                    }
                },
                { $sort: { count: -1 } }
            ]),
            AuditLog.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: '$performedBy.userId',
                        email: { $first: '$performedBy.email' },
                        role: { $first: '$performedBy.role' },
                        fullName: { $first: '$performedBy.fullName' },
                        count: { $sum: 1 },
                        successful: {
                            $sum: { $cond: ['$result.success', 1, 0] }
                        },
                        failed: {
                            $sum: { $cond: ['$result.success', 0, 1] }
                        }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            AuditLog.find(query)
                .sort({ timestamp: -1 })
                .limit(10)
                .select('action resourceType targetId performedBy timestamp result.success')
                .lean()
        ]);

        res.json({
            success: true,
            statistics: {
                totalAttempts,
                successfulDeletes,
                failedDeletes,
                successRate: totalAttempts > 0 ? ((successfulDeletes / totalAttempts) * 100).toFixed(2) : 0,
                byResourceType,
                topUsers: byUser,
                recentAttempts
            }
        });
    } catch (error) {
        console.error('Error fetching audit log statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit log statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;

