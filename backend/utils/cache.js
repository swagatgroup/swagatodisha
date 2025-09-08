const NodeCache = require('node-cache');
const redis = require('redis');

class CacheManager {
    constructor() {
        // In-memory cache for development
        this.memoryCache = new NodeCache({
            stdTTL: 600, // 10 minutes default TTL
            checkperiod: 120, // Check for expired keys every 2 minutes
            useClones: false
        });

        // Redis client for production
        this.redisClient = null;
        this.isRedisConnected = false;

        this.initializeRedis();
    }

    async initializeRedis() {
        try {
            if (process.env.REDIS_URL) {
                this.redisClient = redis.createClient({
                    url: process.env.REDIS_URL
                });

                this.redisClient.on('error', (err) => {
                    console.error('Redis Client Error:', err);
                    this.isRedisConnected = false;
                });

                this.redisClient.on('connect', () => {
                    console.log('✅ Redis connected successfully');
                    this.isRedisConnected = true;
                });

                await this.redisClient.connect();
            }
        } catch (error) {
            console.warn('⚠️ Redis not available, using memory cache only:', error.message);
            this.isRedisConnected = false;
        }
    }

    async get(key) {
        try {
            // Try Redis first if available
            if (this.isRedisConnected && this.redisClient) {
                const value = await this.redisClient.get(key);
                if (value) {
                    return JSON.parse(value);
                }
            }

            // Fallback to memory cache
            return this.memoryCache.get(key);
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    async set(key, value, ttl = 600) {
        try {
            const serializedValue = JSON.stringify(value);

            // Set in Redis if available
            if (this.isRedisConnected && this.redisClient) {
                await this.redisClient.setEx(key, ttl, serializedValue);
            }

            // Also set in memory cache as backup
            this.memoryCache.set(key, value, ttl);
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    async del(key) {
        try {
            // Delete from Redis if available
            if (this.isRedisConnected && this.redisClient) {
                await this.redisClient.del(key);
            }

            // Delete from memory cache
            this.memoryCache.del(key);
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    }

    async flush() {
        try {
            // Flush Redis if available
            if (this.isRedisConnected && this.redisClient) {
                await this.redisClient.flushAll();
            }

            // Flush memory cache
            this.memoryCache.flushAll();
        } catch (error) {
            console.error('Cache flush error:', error);
        }
    }

    // Cache middleware for Express routes
    cacheMiddleware(ttl = 600) {
        return async (req, res, next) => {
            const key = `cache:${req.originalUrl}:${JSON.stringify(req.query)}`;

            try {
                const cachedData = await this.get(key);
                if (cachedData) {
                    return res.json(cachedData);
                }

                // Store original res.json
                const originalJson = res.json.bind(res);

                // Override res.json to cache the response
                res.json = (data) => {
                    this.set(key, data, ttl);
                    return originalJson(data);
                };

                next();
            } catch (error) {
                console.error('Cache middleware error:', error);
                next();
            }
        };
    }

    // Cache user data
    async cacheUserData(userId, userData, ttl = 1800) {
        const key = `user:${userId}`;
        await this.set(key, userData, ttl);
    }

    async getUserData(userId) {
        const key = `user:${userId}`;
        return await this.get(key);
    }

    // Cache document data
    async cacheDocumentData(documentId, documentData, ttl = 600) {
        const key = `document:${documentId}`;
        await this.set(key, documentData, ttl);
    }

    async getDocumentData(documentId) {
        const key = `document:${documentId}`;
        return await this.get(key);
    }

    // Cache dashboard stats
    async cacheDashboardStats(role, stats, ttl = 300) {
        const key = `dashboard:${role}:stats`;
        await this.set(key, stats, ttl);
    }

    async getDashboardStats(role) {
        const key = `dashboard:${role}:stats`;
        return await this.get(key);
    }

    // Cache API responses
    async cacheApiResponse(endpoint, params, data, ttl = 600) {
        const key = `api:${endpoint}:${JSON.stringify(params)}`;
        await this.set(key, data, ttl);
    }

    async getApiResponse(endpoint, params) {
        const key = `api:${endpoint}:${JSON.stringify(params)}`;
        return await this.get(key);
    }

    // Cache invalidation patterns
    async invalidateUserCache(userId) {
        const patterns = [
            `user:${userId}`,
            `dashboard:*:stats`,
            `api:*:${userId}`
        ];

        for (const pattern of patterns) {
            await this.del(pattern);
        }
    }

    async invalidateDocumentCache(documentId) {
        const patterns = [
            `document:${documentId}`,
            `api:documents:*`
        ];

        for (const pattern of patterns) {
            await this.del(pattern);
        }
    }

    // Cache statistics
    getStats() {
        const memoryStats = this.memoryCache.getStats();
        return {
            memory: {
                keys: memoryStats.keys,
                hits: memoryStats.hits,
                misses: memoryStats.misses,
                hitRate: memoryStats.hits / (memoryStats.hits + memoryStats.misses) * 100
            },
            redis: {
                connected: this.isRedisConnected
            }
        };
    }
}

// Create singleton instance
const cacheManager = new CacheManager();

module.exports = cacheManager;
