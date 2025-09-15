const mongoose = require('mongoose');

class DatabaseOptimization {
    constructor() {
        this.indexes = new Map();
        this.queryStats = new Map();
    }

    // Create optimized indexes for common queries
    async createOptimizedIndexes() {
        try {
            console.log('🔧 Creating optimized database indexes...');

            // User model indexes
            await this.createUserIndexes();

            // Document model indexes
            await this.createDocumentIndexes();

            // Application model indexes
            await this.createApplicationIndexes();

            // Payment model indexes
            await this.createPaymentIndexes();

            // Notification model indexes
            await this.createNotificationIndexes();

            console.log('✅ Database indexes created successfully');
        } catch (error) {
            console.error('❌ Error creating database indexes:', error);
        }
    }

    async createUserIndexes() {
        const User = require('../models/User');

        try {
            // Check existing indexes first
            const existingIndexes = await User.collection.indexes();
            const indexNames = existingIndexes.map(idx => idx.name);

            // Email index for login (only if not exists)
            if (!indexNames.includes('email_1')) {
                await User.collection.createIndex({ email: 1 }, { unique: true });
            }

            // Role index for role-based queries
            if (!indexNames.includes('role_1')) {
                await User.collection.createIndex({ role: 1 });
            }

            // Status index for active/inactive users
            if (!indexNames.includes('isActive_1')) {
                await User.collection.createIndex({ isActive: 1 });
            }

            // Created date index for time-based queries
            if (!indexNames.includes('createdAt_-1')) {
                await User.collection.createIndex({ createdAt: -1 });
            }

            // Compound index for role and status
            if (!indexNames.includes('role_1_isActive_1')) {
                await User.collection.createIndex({ role: 1, isActive: 1 });
            }

            // Referral code index
            if (!indexNames.includes('referralCode_1')) {
                await User.collection.createIndex({ referralCode: 1 }, { unique: true, sparse: true });
            }

            // Phone number index
            if (!indexNames.includes('phone_1')) {
                await User.collection.createIndex({ phone: 1 }, { unique: true, sparse: true });
            }
        } catch (error) {
            console.warn('Warning: Could not create User indexes:', error.message);
        }
    }

    async createDocumentIndexes() {
        const Document = require('../models/Document');

        try {
            const existingIndexes = await Document.collection.indexes();
            const indexNames = existingIndexes.map(idx => idx.name);

            // Status index for document filtering
            if (!indexNames.includes('status_1')) {
                await Document.collection.createIndex({ status: 1 });
            }

            // Uploaded by index for user documents
            if (!indexNames.includes('uploadedBy_1')) {
                await Document.collection.createIndex({ uploadedBy: 1 });
            }

            // Document type index
            if (!indexNames.includes('documentType_1')) {
                await Document.collection.createIndex({ documentType: 1 });
            }

            // Upload date index
            if (!indexNames.includes('uploadedAt_-1')) {
                await Document.collection.createIndex({ uploadedAt: -1 });
            }

            // Compound index for status and upload date
            if (!indexNames.includes('status_1_uploadedAt_-1')) {
                await Document.collection.createIndex({ status: 1, uploadedAt: -1 });
            }

            // Student ID index
            if (!indexNames.includes('studentId_1')) {
                await Document.collection.createIndex({ studentId: 1 });
            }

            // Compound index for student and status
            if (!indexNames.includes('studentId_1_status_1')) {
                await Document.collection.createIndex({ studentId: 1, status: 1 });
            }
        } catch (error) {
            console.warn('Warning: Could not create Document indexes:', error.message);
        }
    }

    async createApplicationIndexes() {
        const Application = require('../models/Application');

        try {
            const existingIndexes = await Application.collection.indexes();
            const indexNames = existingIndexes.map(idx => idx.name);

            // Student ID index
            if (!indexNames.includes('studentId_1')) {
                await Application.collection.createIndex({ studentId: 1 });
            }

            // Status index
            if (!indexNames.includes('status_1')) {
                await Application.collection.createIndex({ status: 1 });
            }

            // Created date index
            if (!indexNames.includes('createdAt_-1')) {
                await Application.collection.createIndex({ createdAt: -1 });
            }

            // Agent ID index for referrals
            if (!indexNames.includes('agentId_1')) {
                await Application.collection.createIndex({ agentId: 1 }, { sparse: true });
            }

            // Compound index for student and status
            if (!indexNames.includes('studentId_1_status_1')) {
                await Application.collection.createIndex({ studentId: 1, status: 1 });
            }

            // Compound index for agent and status
            if (!indexNames.includes('agentId_1_status_1')) {
                await Application.collection.createIndex({ agentId: 1, status: 1 }, { sparse: true });
            }
        } catch (error) {
            console.warn('Warning: Could not create Application indexes:', error.message);
        }
    }

    async createPaymentIndexes() {
        const Payment = require('../models/Payment');

        try {
            const existingIndexes = await Payment.collection.indexes();
            const indexNames = existingIndexes.map(idx => idx.name);

            // Student ID index
            if (!indexNames.includes('studentId_1')) {
                await Payment.collection.createIndex({ studentId: 1 });
            }

            // Status index
            if (!indexNames.includes('status_1')) {
                await Payment.collection.createIndex({ status: 1 });
            }

            // Payment date index
            if (!indexNames.includes('paymentDate_-1')) {
                await Payment.collection.createIndex({ paymentDate: -1 });
            }

            // Transaction ID index
            if (!indexNames.includes('transactionId_1')) {
                await Payment.collection.createIndex({ transactionId: 1 }, { unique: true, sparse: true });
            }

            // Compound index for student and status
            if (!indexNames.includes('studentId_1_status_1')) {
                await Payment.collection.createIndex({ studentId: 1, status: 1 });
            }
        } catch (error) {
            console.warn('Warning: Could not create Payment indexes:', error.message);
        }
    }

    async createNotificationIndexes() {
        const Notification = require('../models/Notification');

        try {
            const existingIndexes = await Notification.collection.indexes();
            const indexNames = existingIndexes.map(idx => idx.name);

            // User ID index
            if (!indexNames.includes('userId_1')) {
                await Notification.collection.createIndex({ userId: 1 });
            }

            // Read status index
            if (!indexNames.includes('read_1')) {
                await Notification.collection.createIndex({ read: 1 });
            }

            // Created date index
            if (!indexNames.includes('createdAt_-1')) {
                await Notification.collection.createIndex({ createdAt: -1 });
            }

            // Type index
            if (!indexNames.includes('type_1')) {
                await Notification.collection.createIndex({ type: 1 });
            }

            // Compound index for user and read status
            if (!indexNames.includes('userId_1_read_1')) {
                await Notification.collection.createIndex({ userId: 1, read: 1 });
            }

            // TTL index for auto-deletion of old notifications
            if (!indexNames.includes('createdAt_1')) {
                await Notification.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days
            }
        } catch (error) {
            console.warn('Warning: Could not create Notification indexes:', error.message);
        }
    }

    // Query optimization utilities
    optimizeQuery(query, options = {}) {
        const optimizedQuery = { ...query };

        // Add lean() for better performance when not modifying documents
        if (options.lean !== false) {
            optimizedQuery.lean = true;
        }

        // Add select() to limit fields
        if (options.select) {
            optimizedQuery.select = options.select;
        }

        // Add limit() to prevent large result sets
        if (options.limit) {
            optimizedQuery.limit = options.limit;
        }

        // Add sort() for consistent ordering
        if (options.sort) {
            optimizedQuery.sort = options.sort;
        }

        return optimizedQuery;
    }

    // Pagination helper
    createPaginationOptions(page = 1, limit = 10, sort = { createdAt: -1 }) {
        const skip = (page - 1) * limit;

        return {
            skip,
            limit: Math.min(limit, 100), // Cap at 100 items per page
            sort
        };
    }

    // Aggregation pipeline optimization
    optimizeAggregationPipeline(pipeline) {
        const optimizedPipeline = [...pipeline];

        // Add $match stage early to reduce documents
        const matchStage = optimizedPipeline.find(stage => stage.$match);
        if (matchStage && optimizedPipeline.indexOf(matchStage) > 0) {
            // Move $match to the beginning
            optimizedPipeline.splice(optimizedPipeline.indexOf(matchStage), 1);
            optimizedPipeline.unshift(matchStage);
        }

        // Add $limit stage early if possible
        const limitStage = optimizedPipeline.find(stage => stage.$limit);
        if (limitStage && optimizedPipeline.indexOf(limitStage) > 2) {
            // Move $limit closer to the beginning
            optimizedPipeline.splice(optimizedPipeline.indexOf(limitStage), 1);
            optimizedPipeline.splice(2, 0, limitStage);
        }

        return optimizedPipeline;
    }

    // Connection pooling optimization
    optimizeConnectionPool() {
        const options = {
            maxPoolSize: 10, // Maximum number of connections
            minPoolSize: 2,  // Minimum number of connections
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
            serverSelectionTimeoutMS: 5000, // How long to try selecting a server
            socketTimeoutMS: 45000, // How long a send or receive on a socket can take
            bufferMaxEntries: 0, // Disable mongoose buffering
            bufferCommands: false, // Disable mongoose buffering
        };

        return options;
    }

    // Query performance monitoring
    startQueryTimer(queryName) {
        const startTime = Date.now();
        return {
            end: () => {
                const duration = Date.now() - startTime;
                this.recordQueryStats(queryName, duration);
                return duration;
            }
        };
    }

    recordQueryStats(queryName, duration) {
        if (!this.queryStats.has(queryName)) {
            this.queryStats.set(queryName, {
                count: 0,
                totalTime: 0,
                averageTime: 0,
                maxTime: 0,
                minTime: Infinity
            });
        }

        const stats = this.queryStats.get(queryName);
        stats.count++;
        stats.totalTime += duration;
        stats.averageTime = stats.totalTime / stats.count;
        stats.maxTime = Math.max(stats.maxTime, duration);
        stats.minTime = Math.min(stats.minTime, duration);

        // Log slow queries
        if (duration > 1000) {
            console.warn(`🐌 Slow query detected: ${queryName} took ${duration}ms`);
        }
    }

    getQueryStats() {
        const stats = {};
        for (const [queryName, queryStats] of this.queryStats) {
            stats[queryName] = { ...queryStats };
        }
        return stats;
    }

    // Database health check
    async getDatabaseHealth() {
        try {
            const admin = mongoose.connection.db.admin();
            const serverStatus = await admin.serverStatus();

            return {
                status: 'healthy',
                version: serverStatus.version,
                uptime: serverStatus.uptime,
                connections: serverStatus.connections,
                memory: serverStatus.mem,
                operations: serverStatus.opcounters,
                queryStats: this.getQueryStats()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }

    // Cleanup old data
    async cleanupOldData() {
        try {
            console.log('🧹 Starting database cleanup...');

            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            // Clean up old notifications
            const Notification = require('../models/Notification');
            const deletedNotifications = await Notification.deleteMany({
                createdAt: { $lt: thirtyDaysAgo },
                read: true
            });

            console.log(`✅ Cleaned up ${deletedNotifications.deletedCount} old notifications`);

            // Clean up old logs (if you have a logs collection)
            // const Log = require('../models/Log');
            // const deletedLogs = await Log.deleteMany({
            //     createdAt: { $lt: thirtyDaysAgo }
            // });

            return {
                notifications: deletedNotifications.deletedCount,
                // logs: deletedLogs.deletedCount
            };
        } catch (error) {
            console.error('❌ Error during cleanup:', error);
            throw error;
        }
    }
}

// Create singleton instance
const databaseOptimization = new DatabaseOptimization();

module.exports = databaseOptimization;
