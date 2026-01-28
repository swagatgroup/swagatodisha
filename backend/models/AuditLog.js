const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    // Action details
    action: {
        type: String,
        required: true,
        enum: ['DELETE_ATTEMPT', 'DELETE_SUCCESS', 'DELETE_FAILED', 'BULK_DELETE_ATTEMPT', 'BULK_DELETE_SUCCESS', 'BULK_DELETE_FAILED'],
        index: true
    },
    
    // Resource information
    resourceType: {
        type: String,
        required: true,
        enum: ['Student', 'StudentApplication', 'Document', 'File', 'User', 'College', 'Course', 'Other'],
        index: true
    },
    
    // IDs being deleted
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    
    targetIds: [{
        type: mongoose.Schema.Types.ObjectId
    }],
    
    // User who attempted the delete
    performedBy: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true
        },
        email: String,
        role: String,
        fullName: String
    },
    
    // Request details
    requestDetails: {
        method: String,
        url: String,
        ip: String,
        userAgent: String,
        headers: mongoose.Schema.Types.Mixed
    },
    
    // Result details
    result: {
        success: {
            type: Boolean,
            default: false
        },
        message: String,
        deletedCount: Number,
        error: String,
        statusCode: Number
    },
    
    // Additional metadata
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    
    // Timestamps
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ 'performedBy.userId': 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ 'result.success': 1, timestamp: -1 });
auditLogSchema.index({ 'requestDetails.ip': 1, timestamp: -1 }); // Index for IP address queries

// Compound index for common queries
auditLogSchema.index({ resourceType: 1, action: 1, timestamp: -1 });

// Static method to log delete attempt
auditLogSchema.statics.logDeleteAttempt = async function(data) {
    try {
        const logEntry = {
            action: data.isBulk ? 'BULK_DELETE_ATTEMPT' : 'DELETE_ATTEMPT',
            resourceType: data.resourceType || 'Other',
            targetId: data.targetId,
            targetIds: data.targetIds || [],
            performedBy: {
                userId: data.userId,
                email: data.email,
                role: data.role,
                fullName: data.fullName
            },
            requestDetails: {
                method: data.method || 'DELETE',
                url: data.url,
                ip: data.ip,
                userAgent: data.userAgent,
                headers: data.headers || {}
            },
            result: {
                success: false,
                message: 'Delete attempt logged',
                statusCode: null
            },
            metadata: data.metadata || {}
        };
        
        return await this.create(logEntry);
    } catch (error) {
        console.error('Error logging delete attempt:', error);
        // Don't throw - audit logging should not break the main flow
        return null;
    }
};

// Static method to log delete result
auditLogSchema.statics.logDeleteResult = async function(logId, result) {
    try {
        const updateData = {
            action: result.isBulk 
                ? (result.success ? 'BULK_DELETE_SUCCESS' : 'BULK_DELETE_FAILED')
                : (result.success ? 'DELETE_SUCCESS' : 'DELETE_FAILED'),
            'result.success': result.success,
            'result.message': result.message,
            'result.deletedCount': result.deletedCount,
            'result.error': result.error,
            'result.statusCode': result.statusCode
        };
        
        return await this.findByIdAndUpdate(logId, updateData, { new: true });
    } catch (error) {
        console.error('Error logging delete result:', error);
        return null;
    }
};

// Static method to get delete attempts for a specific ID
auditLogSchema.statics.getDeleteAttemptsForId = async function(targetId, limit = 50) {
    try {
        return await this.find({
            $or: [
                { targetId: targetId },
                { targetIds: targetId }
            ],
            action: { $in: ['DELETE_ATTEMPT', 'DELETE_SUCCESS', 'DELETE_FAILED', 'BULK_DELETE_ATTEMPT', 'BULK_DELETE_SUCCESS', 'BULK_DELETE_FAILED'] }
        })
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('performedBy.userId', 'email role fullName')
        .lean();
    } catch (error) {
        console.error('Error fetching delete attempts:', error);
        return [];
    }
};

// Static method to get all delete attempts by a user
auditLogSchema.statics.getDeleteAttemptsByUser = async function(userId, limit = 100) {
    try {
        return await this.find({
            'performedBy.userId': userId,
            action: { $in: ['DELETE_ATTEMPT', 'DELETE_SUCCESS', 'DELETE_FAILED', 'BULK_DELETE_ATTEMPT', 'BULK_DELETE_SUCCESS', 'BULK_DELETE_FAILED'] }
        })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
        console.error('Error fetching user delete attempts:', error);
        return [];
    }
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;

