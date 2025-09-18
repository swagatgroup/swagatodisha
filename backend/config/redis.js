const redis = require('redis');
const { promisify } = require('util');

class RedisManager {
    constructor() {
        this.client = null;
        this.publisher = null;
        this.subscriber = null;
        this.isConnected = false;
        this.retryAttempts = 0;
        this.maxRetries = 5;
    }

    async connect() {
        try {
            // Create Redis clients for different purposes
            this.client = redis.createClient({
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD || null,
                db: process.env.REDIS_DB || 0,
                retry_strategy: (options) => {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        console.error('Redis server connection refused');
                        return new Error('Redis server connection refused');
                    }
                    if (options.total_retry_time > 1000 * 60 * 60) {
                        console.error('Redis retry time exhausted');
                        return new Error('Retry time exhausted');
                    }
                    if (options.attempt > this.maxRetries) {
                        console.error('Redis max retries exceeded');
                        return new Error('Max retries exceeded');
                    }
                    return Math.min(options.attempt * 100, 3000);
                }
            });

            this.publisher = redis.createClient({
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD || null,
                db: process.env.REDIS_DB || 0
            });

            this.subscriber = redis.createClient({
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD || null,
                db: process.env.REDIS_DB || 0
            });

            // Promisify Redis methods
            this.get = promisify(this.client.get).bind(this.client);
            this.set = promisify(this.client.set).bind(this.client);
            this.del = promisify(this.client.del).bind(this.client);
            this.exists = promisify(this.client.exists).bind(this.client);
            this.expire = promisify(this.client.expire).bind(this.client);
            this.hget = promisify(this.client.hget).bind(this.client);
            this.hset = promisify(this.client.hset).bind(this.client);
            this.hgetall = promisify(this.client.hgetall).bind(this.client);
            this.hdel = promisify(this.client.hdel).bind(this.client);
            this.lpush = promisify(this.client.lpush).bind(this.client);
            this.rpop = promisify(this.client.rpop).bind(this.client);
            this.llen = promisify(this.client.llen).bind(this.client);
            this.sadd = promisify(this.client.sadd).bind(this.client);
            this.srem = promisify(this.client.srem).bind(this.client);
            this.smembers = promisify(this.client.smembers).bind(this.client);
            this.zadd = promisify(this.client.zadd).bind(this.client);
            this.zrange = promisify(this.client.zrange).bind(this.client);
            this.zrem = promisify(this.client.zrem).bind(this.client);
            this.publish = promisify(this.publisher.publish).bind(this.publisher);

            // Event handlers
            this.client.on('connect', () => {
                console.log('Redis client connected');
                this.isConnected = true;
                this.retryAttempts = 0;
            });

            this.client.on('error', (err) => {
                console.error('Redis client error:', err);
                this.isConnected = false;
                this.handleConnectionError();
            });

            this.client.on('end', () => {
                console.log('Redis client disconnected');
                this.isConnected = false;
            });

            this.publisher.on('error', (err) => {
                console.error('Redis publisher error:', err);
            });

            this.subscriber.on('error', (err) => {
                console.error('Redis subscriber error:', err);
            });

            // Connect clients
            await this.client.connect();
            await this.publisher.connect();
            await this.subscriber.connect();

            console.log('Redis Manager initialized successfully');
            return true;

        } catch (error) {
            console.error('Redis connection failed:', error);
            this.handleConnectionError();
            return false;
        }
    }

    handleConnectionError() {
        this.retryAttempts++;
        if (this.retryAttempts < this.maxRetries) {
            console.log(`Retrying Redis connection in ${this.retryAttempts * 1000}ms...`);
            setTimeout(() => this.connect(), this.retryAttempts * 1000);
        } else {
            console.error('Max Redis connection retries exceeded');
        }
    }

    // Application State Management
    async saveApplicationState(userId, applicationId, state) {
        const key = `app:state:${userId}:${applicationId}`;
        const stateData = {
            ...state,
            lastUpdated: Date.now(),
            version: (await this.get(`${key}:version`)) || 0 + 1
        };

        await this.set(key, JSON.stringify(stateData));
        await this.set(`${key}:version`, stateData.version);
        await this.expire(key, 3600); // 1 hour TTL

        return stateData;
    }

    async getApplicationState(userId, applicationId) {
        const key = `app:state:${userId}:${applicationId}`;
        const state = await this.get(key);
        return state ? JSON.parse(state) : null;
    }

    async deleteApplicationState(userId, applicationId) {
        const key = `app:state:${userId}:${applicationId}`;
        await this.del(key);
        await this.del(`${key}:version`);
    }

    // Workflow State Management
    async setWorkflowStep(applicationId, step, status, data = {}) {
        const key = `workflow:${applicationId}`;
        await this.hset(key, step, JSON.stringify({
            status,
            data,
            timestamp: Date.now()
        }));
        await this.expire(key, 7200); // 2 hours TTL
    }

    async getWorkflowStep(applicationId, step) {
        const key = `workflow:${applicationId}`;
        const stepData = await this.hget(key, step);
        return stepData ? JSON.parse(stepData) : null;
    }

    async getWorkflowStatus(applicationId) {
        const key = `workflow:${applicationId}`;
        const workflow = await this.hgetall(key);
        const result = {};

        for (const [step, data] of Object.entries(workflow)) {
            result[step] = JSON.parse(data);
        }

        return result;
    }

    async isWorkflowComplete(applicationId) {
        const workflow = await this.getWorkflowStatus(applicationId);
        const requiredSteps = ['registration', 'documents', 'pdf_generation', 'submission'];

        return requiredSteps.every(step =>
            workflow[step] && workflow[step].status === 'completed'
        );
    }

    // Queue Management
    async addToQueue(queueName, jobData, priority = 0) {
        const job = {
            id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            data: jobData,
            priority,
            createdAt: Date.now(),
            attempts: 0,
            maxAttempts: 3
        };

        if (priority > 0) {
            await this.zadd(`${queueName}:priority`, priority, JSON.stringify(job));
        } else {
            await this.lpush(`${queueName}:fifo`, JSON.stringify(job));
        }

        return job.id;
    }

    async processQueue(queueName, processor) {
        try {
            // Check priority queue first
            const priorityJobs = await this.zrange(`${queueName}:priority`, 0, 0);
            if (priorityJobs.length > 0) {
                const job = JSON.parse(priorityJobs[0]);
                await this.zrem(`${queueName}:priority`, priorityJobs[0]);
                return await this.executeJob(job, processor);
            }

            // Then check FIFO queue
            const jobData = await this.rpop(`${queueName}:fifo`);
            if (jobData) {
                const job = JSON.parse(jobData);
                return await this.executeJob(job, processor);
            }

            return null;
        } catch (error) {
            console.error(`Queue processing error for ${queueName}:`, error);
            return null;
        }
    }

    async executeJob(job, processor) {
        try {
            job.attempts++;
            const result = await processor(job.data);

            // Job completed successfully
            await this.publish('job:completed', JSON.stringify({
                jobId: job.id,
                result,
                completedAt: Date.now()
            }));

            return result;
        } catch (error) {
            console.error(`Job execution error for ${job.id}:`, error);

            if (job.attempts < job.maxAttempts) {
                // Retry with exponential backoff
                const delay = Math.pow(2, job.attempts) * 1000;
                setTimeout(() => {
                    this.addToQueue('retry', job, 0);
                }, delay);
            } else {
                // Move to dead letter queue
                await this.lpush('dead_letter_queue', JSON.stringify({
                    ...job,
                    error: error.message,
                    failedAt: Date.now()
                }));
            }

            throw error;
        }
    }

    // Real-time Pub/Sub
    async publishEvent(channel, event, data) {
        const message = {
            event,
            data,
            timestamp: Date.now(),
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        await this.publish(channel, JSON.stringify(message));
        return message.id;
    }

    async subscribeToChannel(channel, callback) {
        this.subscriber.subscribe(channel);
        this.subscriber.on('message', (receivedChannel, message) => {
            if (receivedChannel === channel) {
                try {
                    const event = JSON.parse(message);
                    callback(event);
                } catch (error) {
                    console.error('Error parsing pub/sub message:', error);
                }
            }
        });
    }

    // Distributed Locking
    async acquireLock(lockKey, ttl = 30) {
        const lockValue = `lock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const result = await this.set(lockKey, lockValue, 'EX', ttl, 'NX');
        return result === 'OK' ? lockValue : null;
    }

    async releaseLock(lockKey, lockValue) {
        const script = `
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
            else
                return 0
            end
        `;

        const result = await this.client.eval(script, 1, lockKey, lockValue);
        return result === 1;
    }

    // Session Management
    async createSession(userId, sessionData) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const key = `session:${sessionId}`;

        await this.set(key, JSON.stringify({
            userId,
            data: sessionData,
            createdAt: Date.now(),
            lastAccessed: Date.now()
        }));

        await this.expire(key, 3600); // 1 hour TTL
        await this.sadd(`user:sessions:${userId}`, sessionId);

        return sessionId;
    }

    async getSession(sessionId) {
        const key = `session:${sessionId}`;
        const session = await this.get(key);

        if (session) {
            const sessionData = JSON.parse(session);
            sessionData.lastAccessed = Date.now();
            await this.set(key, JSON.stringify(sessionData));
            await this.expire(key, 3600);
        }

        return session ? JSON.parse(session) : null;
    }

    async destroySession(sessionId) {
        const key = `session:${sessionId}`;
        const session = await this.get(key);

        if (session) {
            const sessionData = JSON.parse(session);
            await this.srem(`user:sessions:${sessionData.userId}`, sessionId);
        }

        await this.del(key);
    }

    // Health Check
    async healthCheck() {
        try {
            const pong = await this.client.ping();
            return {
                status: 'healthy',
                connected: this.isConnected,
                response: pong,
                timestamp: Date.now()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                connected: false,
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    // Cleanup
    async cleanup() {
        try {
            if (this.client) await this.client.quit();
            if (this.publisher) await this.publisher.quit();
            if (this.subscriber) await this.subscriber.quit();
            console.log('Redis connections closed');
        } catch (error) {
            console.error('Error closing Redis connections:', error);
        }
    }
}

// Singleton instance
const redisManager = new RedisManager();

module.exports = redisManager;
