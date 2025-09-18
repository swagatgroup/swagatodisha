const redisManager = require('../config/redis');
const { Server } = require('socket.io');

class RealTimeManager {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: [
                    'http://localhost:3000',
                    'http://localhost:5173',
                    'https://www.swagatodisha.com',
                    'https://swagatodisha.com',
                    'https://swagatodisha.vercel.app'
                ],
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        this.connectedUsers = new Map();
        this.subscriptions = new Map();
        this.initializeSocketHandlers();
        this.initializeRedisSubscriptions();
    }

    initializeSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);

            // Authentication middleware
            socket.use(async (packet, next) => {
                try {
                    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

                    if (!token) {
                        return next(new Error('Authentication error: No token provided'));
                    }

                    // Verify token and get user info
                    const user = await this.authenticateUser(token);
                    socket.user = user;
                    next();
                } catch (error) {
                    next(new Error('Authentication error: Invalid token'));
                }
            });

            // Handle user connection
            socket.on('authenticate', async (data) => {
                try {
                    const { token, userRole, userId } = data;
                    const user = await this.authenticateUser(token);

                    socket.user = user;
                    socket.userRole = userRole;
                    socket.userId = userId;

                    // Store connection
                    this.connectedUsers.set(userId, {
                        socketId: socket.id,
                        userId,
                        userRole,
                        connectedAt: new Date(),
                        lastActivity: Date.now()
                    });

                    // Join role-based rooms
                    socket.join(userRole);
                    socket.join(userId);

                    // Send connection confirmation
                    socket.emit('authenticated', {
                        userId,
                        userRole,
                        connectedAt: new Date()
                    });

                    // Notify others about user connection
                    socket.to(userRole).emit('user_connected', {
                        userId,
                        userRole,
                        connectedAt: new Date()
                    });

                    console.log(`User ${userId} (${userRole}) authenticated and connected`);

                } catch (error) {
                    socket.emit('authentication_error', { error: error.message });
                }
            });

            // Handle room subscriptions
            socket.on('subscribe', (data) => {
                const { channel, filters } = data;
                this.subscribeToChannel(socket, channel, filters);
            });

            socket.on('unsubscribe', (data) => {
                const { channel } = data;
                this.unsubscribeFromChannel(socket, channel);
            });

            // Handle real-time requests
            socket.on('request_dashboard_data', async (data) => {
                await this.sendDashboardData(socket, data);
            });

            socket.on('request_application_status', async (data) => {
                await this.sendApplicationStatus(socket, data);
            });

            // Handle typing indicators
            socket.on('typing_start', (data) => {
                socket.to(data.room).emit('user_typing', {
                    userId: socket.userId,
                    isTyping: true,
                    room: data.room
                });
            });

            socket.on('typing_stop', (data) => {
                socket.to(data.room).emit('user_typing', {
                    userId: socket.userId,
                    isTyping: false,
                    room: data.room
                });
            });

            // Handle disconnect
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id}`);
                this.handleDisconnect(socket);
            });
        });
    }

    async initializeRedisSubscriptions() {
        // Subscribe to application events
        await redisManager.subscribeToChannel('application:created', (event) => {
            this.broadcastApplicationEvent('application_created', event);
        });

        await redisManager.subscribeToChannel('application:updated', (event) => {
            this.broadcastApplicationEvent('application_updated', event);
        });

        await redisManager.subscribeToChannel('application:submitted', (event) => {
            this.broadcastApplicationEvent('application_submitted', event);
        });

        await redisManager.subscribeToChannel('application:approved', (event) => {
            this.broadcastApplicationEvent('application_approved', event);
        });

        await redisManager.subscribeToChannel('application:rejected', (event) => {
            this.broadcastApplicationEvent('application_rejected', event);
        });

        // Subscribe to document events
        await redisManager.subscribeToChannel('document:processed', (event) => {
            this.broadcastDocumentEvent('document_processed', event);
        });

        await redisManager.subscribeToChannel('document:status_changed', (event) => {
            this.broadcastDocumentEvent('document_status_changed', event);
        });

        // Subscribe to workflow events
        await redisManager.subscribeToChannel('workflow:progress', (event) => {
            this.broadcastWorkflowEvent('workflow_progress', event);
        });

        await redisManager.subscribeToChannel('workflow:completed', (event) => {
            this.broadcastWorkflowEvent('workflow_completed', event);
        });

        await redisManager.subscribeToChannel('workflow:error', (event) => {
            this.broadcastWorkflowEvent('workflow_error', event);
        });

        // Subscribe to dashboard events
        await redisManager.subscribeToChannel('dashboard:staff', (event) => {
            this.broadcastToRole('staff', event.event, event.data);
        });

        await redisManager.subscribeToChannel('dashboard:agent', (event) => {
            this.broadcastToRole('agent', event.event, event.data);
        });

        await redisManager.subscribeToChannel('dashboard:admin', (event) => {
            this.broadcastToRole('super_admin', event.event, event.data);
        });

        console.log('Redis subscriptions initialized');
    }

    async authenticateUser(token) {
        // Implement JWT token verification
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');
        const Admin = require('../models/Admin');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id || decoded.userId;
        const userType = decoded.userType || 'user';

        let user;
        if (userType === 'admin') {
            user = await Admin.findById(userId).select('-password');
        } else {
            user = await User.findById(userId).select('-password');
        }

        if (!user || !user.isActive) {
            throw new Error('User not found or inactive');
        }

        return user;
    }

    subscribeToChannel(socket, channel, filters = {}) {
        const subscriptionKey = `${socket.id}:${channel}`;

        // Store subscription
        this.subscriptions.set(subscriptionKey, {
            socketId: socket.id,
            channel,
            filters,
            subscribedAt: Date.now()
        });

        // Join socket to channel room
        socket.join(channel);

        // Send subscription confirmation
        socket.emit('subscribed', {
            channel,
            subscribedAt: new Date()
        });

        console.log(`Socket ${socket.id} subscribed to channel: ${channel}`);
    }

    unsubscribeFromChannel(socket, channel) {
        const subscriptionKey = `${socket.id}:${channel}`;

        // Remove subscription
        this.subscriptions.delete(subscriptionKey);

        // Leave socket from channel room
        socket.leave(channel);

        // Send unsubscription confirmation
        socket.emit('unsubscribed', {
            channel,
            unsubscribedAt: new Date()
        });

        console.log(`Socket ${socket.id} unsubscribed from channel: ${channel}`);
    }

    broadcastApplicationEvent(eventType, event) {
        const { data } = event;

        // Broadcast to specific user
        if (data.userId) {
            this.io.to(data.userId).emit(eventType, {
                ...data,
                timestamp: event.timestamp
            });
        }

        // Broadcast to application room
        if (data.applicationId) {
            this.io.to(`application_${data.applicationId}`).emit(eventType, {
                ...data,
                timestamp: event.timestamp
            });
        }

        // Broadcast to role-based rooms
        if (data.roles) {
            data.roles.forEach(role => {
                this.io.to(role).emit(eventType, {
                    ...data,
                    timestamp: event.timestamp
                });
            });
        }
    }

    broadcastDocumentEvent(eventType, event) {
        const { data } = event;

        // Broadcast to user
        if (data.userId) {
            this.io.to(data.userId).emit(eventType, {
                ...data,
                timestamp: event.timestamp
            });
        }

        // Broadcast to submission room
        if (data.submissionId) {
            this.io.to(`submission_${data.submissionId}`).emit(eventType, {
                ...data,
                timestamp: event.timestamp
            });
        }
    }

    broadcastWorkflowEvent(eventType, event) {
        const { data } = event;

        // Broadcast to user
        if (data.userId) {
            this.io.to(data.userId).emit(eventType, {
                ...data,
                timestamp: event.timestamp
            });
        }

        // Broadcast to submission room
        if (data.submissionId) {
            this.io.to(`submission_${data.submissionId}`).emit(eventType, {
                ...data,
                timestamp: event.timestamp
            });
        }
    }

    broadcastToRole(role, event, data) {
        this.io.to(role).emit(event, {
            ...data,
            timestamp: Date.now()
        });
    }

    async sendDashboardData(socket, data) {
        const { role, userId } = data;

        try {
            // Get dashboard data from Redis cache or database
            const dashboardData = await this.getDashboardData(role, userId);

            socket.emit('dashboard_data_update', {
                data: dashboardData,
                timestamp: Date.now()
            });

        } catch (error) {
            console.error('Error sending dashboard data:', error);
            socket.emit('dashboard_error', { error: error.message });
        }
    }

    async sendApplicationStatus(socket, data) {
        const { applicationId, submissionId } = data;

        try {
            // Get application status from Redis
            const status = await redisManager.getWorkflowStatus(submissionId);

            socket.emit('application_status_update', {
                applicationId,
                submissionId,
                status,
                timestamp: Date.now()
            });

        } catch (error) {
            console.error('Error sending application status:', error);
            socket.emit('status_error', { error: error.message });
        }
    }

    async getDashboardData(role, userId) {
        // Try to get from Redis cache first
        const cacheKey = `dashboard:${role}:${userId}`;
        const cachedData = await redisManager.get(cacheKey);

        if (cachedData) {
            return JSON.parse(cachedData);
        }

        // Generate fresh data based on role
        let dashboardData = {};

        switch (role) {
            case 'student':
                dashboardData = await this.getStudentDashboardData(userId);
                break;
            case 'agent':
                dashboardData = await this.getAgentDashboardData(userId);
                break;
            case 'staff':
                dashboardData = await this.getStaffDashboardData(userId);
                break;
            case 'super_admin':
                dashboardData = await this.getAdminDashboardData();
                break;
        }

        // Cache the data for 5 minutes
        await redisManager.setex(cacheKey, 300, JSON.stringify(dashboardData));

        return dashboardData;
    }

    async getStudentDashboardData(userId) {
        const StudentApplication = require('../models/StudentApplication');

        const applications = await StudentApplication.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(10);

        const stats = {
            total: applications.length,
            pending: applications.filter(app => app.status === 'SUBMITTED').length,
            approved: applications.filter(app => app.status === 'APPROVED').length,
            rejected: applications.filter(app => app.status === 'REJECTED').length
        };

        return {
            applications: applications.slice(0, 5),
            stats,
            recentActivity: applications.slice(0, 3)
        };
    }

    async getAgentDashboardData(userId) {
        const StudentApplication = require('../models/StudentApplication');

        const applications = await StudentApplication.find({
            'referralInfo.referredBy': userId
        }).sort({ createdAt: -1 });

        const stats = {
            total: applications.length,
            pending: applications.filter(app => app.status === 'SUBMITTED').length,
            approved: applications.filter(app => app.status === 'APPROVED').length,
            rejected: applications.filter(app => app.status === 'REJECTED').length
        };

        return {
            applications: applications.slice(0, 10),
            stats,
            recentActivity: applications.slice(0, 5)
        };
    }

    async getStaffDashboardData(userId) {
        const StudentApplication = require('../models/StudentApplication');

        const applications = await StudentApplication.find()
            .sort({ createdAt: -1 })
            .limit(50);

        const stats = {
            total: applications.length,
            pending: applications.filter(app => app.status === 'SUBMITTED').length,
            approved: applications.filter(app => app.status === 'APPROVED').length,
            rejected: applications.filter(app => app.status === 'REJECTED').length
        };

        return {
            applications: applications.slice(0, 20),
            stats,
            recentActivity: applications.slice(0, 10)
        };
    }

    async getAdminDashboardData() {
        const StudentApplication = require('../models/StudentApplication');
        const User = require('../models/User');

        const [applications, users] = await Promise.all([
            StudentApplication.find().sort({ createdAt: -1 }).limit(100),
            User.find().sort({ createdAt: -1 }).limit(50)
        ]);

        const stats = {
            applications: {
                total: applications.length,
                pending: applications.filter(app => app.status === 'SUBMITTED').length,
                approved: applications.filter(app => app.status === 'APPROVED').length,
                rejected: applications.filter(app => app.status === 'REJECTED').length
            },
            users: {
                total: users.length,
                students: users.filter(user => user.role === 'student').length,
                agents: users.filter(user => user.role === 'agent').length,
                staff: users.filter(user => user.role === 'staff').length
            }
        };

        return {
            applications: applications.slice(0, 20),
            users: users.slice(0, 20),
            stats,
            recentActivity: applications.slice(0, 10)
        };
    }

    handleDisconnect(socket) {
        if (socket.userId) {
            // Remove from connected users
            this.connectedUsers.delete(socket.userId);

            // Notify others about disconnection
            if (socket.userRole) {
                socket.to(socket.userRole).emit('user_disconnected', {
                    userId: socket.userId,
                    userRole: socket.userRole,
                    disconnectedAt: new Date()
                });
            }

            // Clean up subscriptions
            for (const [key, subscription] of this.subscriptions) {
                if (subscription.socketId === socket.id) {
                    this.subscriptions.delete(key);
                }
            }
        }
    }

    // Public methods for external use
    async notifyUser(userId, event, data) {
        this.io.to(userId).emit(event, {
            ...data,
            timestamp: Date.now()
        });
    }

    async notifyRole(role, event, data) {
        this.io.to(role).emit(event, {
            ...data,
            timestamp: Date.now()
        });
    }

    async notifyRoom(room, event, data) {
        this.io.to(room).emit(event, {
            ...data,
            timestamp: Date.now()
        });
    }

    getConnectedUsers() {
        return Array.from(this.connectedUsers.values());
    }

    getConnectedUsersByRole(role) {
        return Array.from(this.connectedUsers.values())
            .filter(user => user.userRole === role);
    }

    isUserOnline(userId) {
        return this.connectedUsers.has(userId);
    }

    // Health check
    async healthCheck() {
        return {
            connectedUsers: this.connectedUsers.size,
            subscriptions: this.subscriptions.size,
            redis: await redisManager.healthCheck(),
            timestamp: Date.now()
        };
    }
}

module.exports = RealTimeManager;
