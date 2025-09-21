const express = require('express');
const { protect, isSuperAdmin } = require('../middleware/auth');
const performanceMonitor = require('../utils/performance');
// Simple in-memory cache (Redis removed)
const memoryCache = new Map();

const router = express.Router();

// @desc    Get performance metrics
// @route   GET /api/performance/metrics
// @access  Private (Super Admin only)
router.get('/metrics', protect, isSuperAdmin, async (req, res) => {
    try {
        const metrics = performanceMonitor.getAllMetrics();
        const cacheStats = {
            size: memoryCache.size,
            connected: true
        };

        res.json({
            success: true,
            data: {
                ...metrics,
                cache: cacheStats
            }
        });
    } catch (error) {
        console.error('Performance metrics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch performance metrics'
        });
    }
});

// @desc    Get performance health status
// @route   GET /api/performance/health
// @access  Private (Super Admin only)
router.get('/health', protect, isSuperAdmin, async (req, res) => {
    try {
        const healthStatus = performanceMonitor.getHealthStatus();

        res.json({
            success: true,
            data: healthStatus
        });
    } catch (error) {
        console.error('Performance health error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch performance health status'
        });
    }
});

// @desc    Get performance recommendations
// @route   GET /api/performance/recommendations
// @access  Private (Super Admin only)
router.get('/recommendations', protect, isSuperAdmin, async (req, res) => {
    try {
        const recommendations = performanceMonitor.getRecommendations();

        res.json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        console.error('Performance recommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch performance recommendations'
        });
    }
});

// @desc    Reset performance metrics
// @route   POST /api/performance/reset
// @access  Private (Super Admin only)
router.post('/reset', protect, isSuperAdmin, async (req, res) => {
    try {
        performanceMonitor.reset();

        res.json({
            success: true,
            message: 'Performance metrics reset successfully'
        });
    } catch (error) {
        console.error('Performance reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset performance metrics'
        });
    }
});

// @desc    Clear cache
// @route   POST /api/performance/clear-cache
// @access  Private (Super Admin only)
router.post('/clear-cache', protect, isSuperAdmin, async (req, res) => {
    try {
        memoryCache.clear();

        res.json({
            success: true,
            message: 'Cache cleared successfully'
        });
    } catch (error) {
        console.error('Cache clear error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cache'
        });
    }
});

// @desc    Get cache statistics
// @route   GET /api/performance/cache-stats
// @access  Private (Super Admin only)
router.get('/cache-stats', protect, isSuperAdmin, async (req, res) => {
    try {
        const stats = {
            size: memoryCache.size,
            connected: true
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Cache stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cache statistics'
        });
    }
});

module.exports = router;
