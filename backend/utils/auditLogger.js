const AuditLog = require('../models/AuditLog');

/**
 * Log a delete attempt
 * @param {Object} options - Delete attempt details
 * @param {Object} options.req - Express request object
 * @param {String} options.resourceType - Type of resource being deleted
 * @param {String|ObjectId} options.targetId - ID of the resource being deleted
 * @param {Array} options.targetIds - Array of IDs for bulk deletes
 * @param {Object} options.metadata - Additional metadata
 * @returns {Promise<String>} - Returns the log entry ID
 */
const logDeleteAttempt = async ({ req, resourceType, targetId = null, targetIds = null, metadata = {} }) => {
    try {
        const user = req.user || {};
        const isBulk = Array.isArray(targetIds) && targetIds.length > 0;
        
        const logData = {
            isBulk,
            resourceType: resourceType || 'Other',
            targetId: targetId ? (typeof targetId === 'string' ? targetId : targetId.toString()) : null,
            targetIds: targetIds || [],
            userId: user._id || null,
            email: user.email || null,
            role: user.role || null,
            fullName: user.fullName || null,
            method: req.method || 'DELETE',
            url: req.originalUrl || req.url || '',
            ip: req.ip || 
                req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                req.headers['x-real-ip'] || 
                req.connection?.remoteAddress || 
                req.socket?.remoteAddress || 
                'unknown',
            userAgent: req.get('User-Agent') || 'unknown',
            headers: {
                'content-type': req.get('Content-Type'),
                'referer': req.get('Referer')
            },
            metadata
        };
        
        const logEntry = await AuditLog.logDeleteAttempt(logData);
        return logEntry?._id?.toString() || null;
    } catch (error) {
        console.error('Error in logDeleteAttempt:', error);
        // Don't throw - audit logging should not break the main flow
        return null;
    }
};

/**
 * Log the result of a delete operation
 * @param {String} logId - The log entry ID from logDeleteAttempt
 * @param {Object} result - Delete result details
 * @param {Boolean} result.success - Whether the delete was successful
 * @param {String} result.message - Result message
 * @param {Number} result.deletedCount - Number of items deleted (for bulk)
 * @param {String} result.error - Error message if failed
 * @param {Number} result.statusCode - HTTP status code
 * @param {Boolean} result.isBulk - Whether this was a bulk delete
 */
const logDeleteResult = async (logId, { success, message, deletedCount = null, error = null, statusCode = null, isBulk = false }) => {
    if (!logId) {
        return;
    }
    
    try {
        await AuditLog.logDeleteResult(logId, {
            success,
            message,
            deletedCount,
            error,
            statusCode,
            isBulk
        });
    } catch (error) {
        console.error('Error in logDeleteResult:', error);
        // Don't throw - audit logging should not break the main flow
    }
};

/**
 * Get delete attempts for a specific ID
 * @param {String|ObjectId} targetId - The ID to check
 * @param {Number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of delete attempt logs
 */
const getDeleteAttemptsForId = async (targetId, limit = 50) => {
    try {
        return await AuditLog.getDeleteAttemptsForId(targetId, limit);
    } catch (error) {
        console.error('Error getting delete attempts:', error);
        return [];
    }
};

/**
 * Get all delete attempts by a user
 * @param {String|ObjectId} userId - The user ID
 * @param {Number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of delete attempt logs
 */
const getDeleteAttemptsByUser = async (userId, limit = 100) => {
    try {
        return await AuditLog.getDeleteAttemptsByUser(userId, limit);
    } catch (error) {
        console.error('Error getting user delete attempts:', error);
        return [];
    }
};

/**
 * Middleware to automatically log delete attempts
 * This can be used as middleware before delete routes
 */
const auditDeleteMiddleware = (resourceType) => {
    return async (req, res, next) => {
        // Only log DELETE requests
        if (req.method !== 'DELETE') {
            return next();
        }
        
        try {
            const targetId = req.params.id || null;
            const targetIds = req.body?.studentIds || req.body?.ids || req.body?.targetIds || null;
            
            // Log the attempt
            const logId = await logDeleteAttempt({
                req,
                resourceType: resourceType || 'Other',
                targetId,
                targetIds: Array.isArray(targetIds) ? targetIds : null,
                metadata: {
                    params: req.params,
                    query: req.query,
                    bodyKeys: Object.keys(req.body || {})
                }
            });
            
            // Store logId in request for later use
            req.auditLogId = logId;
            
            // Override res.json to log the result
            const originalJson = res.json.bind(res);
            res.json = function(data) {
                // Log the result
                if (req.auditLogId) {
                    logDeleteResult(req.auditLogId, {
                        success: res.statusCode < 400,
                        message: data.message || 'Delete completed',
                        deletedCount: data.deletedCount || null,
                        error: data.error || null,
                        statusCode: res.statusCode,
                        isBulk: Array.isArray(targetIds) && targetIds.length > 0
                    });
                }
                return originalJson(data);
            };
            
            next();
        } catch (error) {
            console.error('Error in auditDeleteMiddleware:', error);
            // Continue even if logging fails
            next();
        }
    };
};

module.exports = {
    logDeleteAttempt,
    logDeleteResult,
    getDeleteAttemptsForId,
    getDeleteAttemptsByUser,
    auditDeleteMiddleware
};

