const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

class SocketManager {
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
        this.setupMiddleware();
        this.setupEventHandlers();
    }

    setupMiddleware() {
        // Authentication middleware
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

                if (!token) {
                    return next(new Error('Authentication error: No token provided'));
                }

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
                    return next(new Error('Authentication error: User not found or inactive'));
                }

                socket.userId = userId;
                socket.userType = userType;
                socket.userRole = user.role;
                socket.userName = user.fullName || `${user.firstName} ${user.lastName}`;

                next();
            } catch (error) {
                console.error('Socket authentication error:', error);
                next(new Error('Authentication error: Invalid token'));
            }
        });
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            // User connected
            console.log(`User connected: ${socket.userName} (${socket.userRole})`);

            // Store user connection
            this.connectedUsers.set(socket.userId, {
                socketId: socket.id,
                userId: socket.userId,
                userType: socket.userType,
                userRole: socket.userRole,
                userName: socket.userName,
                connectedAt: new Date()
            });

            // Join user to role-based rooms
            socket.join(socket.userRole);
            socket.join(socket.userId);

            // Notify others about user connection
            socket.to(socket.userRole).emit('user_connected', {
                userId: socket.userId,
                userName: socket.userName,
                userRole: socket.userRole,
                connectedAt: new Date()
            });

            // Send current online users to the connected user
            socket.emit('online_users_update', Array.from(this.connectedUsers.values()));

            // Handle document status updates
            socket.on('document_status_update', (data) => {
                this.handleDocumentStatusUpdate(socket, data);
            });

            // Handle notification requests
            socket.on('request_notifications', () => {
                this.sendUserNotifications(socket);
            });

            // Handle typing indicators
            socket.on('typing_start', (data) => {
                socket.to(data.room).emit('user_typing', {
                    userId: socket.userId,
                    userName: socket.userName,
                    isTyping: true,
                    room: data.room
                });
            });

            socket.on('typing_stop', (data) => {
                socket.to(data.room).emit('user_typing', {
                    userId: socket.userId,
                    userName: socket.userName,
                    isTyping: false,
                    room: data.room
                });
            });

            // Handle online users request
            socket.on('get_online_users', () => {
                socket.emit('online_users_update', Array.from(this.connectedUsers.values()));
            });

            // Handle real-time dashboard updates
            socket.on('request_dashboard_data', (data) => {
                this.sendDashboardData(socket, data);
            });

            // Handle Dashboard events
            socket.on('join_application_room', (applicationId) => {
                socket.join(`application_${applicationId}`);
            });

            socket.on('leave_application_room', (applicationId) => {
                socket.leave(`application_${applicationId}`);
            });

            // Handle disconnect
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.userName} (${socket.userRole})`);

                // Notify others about user disconnection
                socket.to(socket.userRole).emit('user_disconnected', {
                    userId: socket.userId,
                    userName: socket.userName,
                    userRole: socket.userRole
                });

                // Remove user from connected users
                this.connectedUsers.delete(socket.userId);
            });
        });
    }

    // Document status update handler
    handleDocumentStatusUpdate(socket, data) {
        const { documentId, studentId, status, remarks, reviewedBy } = data;

        // Notify student about document status change
        this.io.to(studentId).emit('document_status_changed', {
            documentId,
            status,
            remarks,
            reviewedBy: socket.userName,
            timestamp: new Date()
        });

        // Notify staff about document review completion
        this.io.to('staff').emit('document_reviewed', {
            documentId,
            studentId,
            status,
            reviewedBy: socket.userName,
            timestamp: new Date()
        });

        // Notify super admin about all document activities
        this.io.to('super_admin').emit('document_activity', {
            documentId,
            studentId,
            status,
            reviewedBy: socket.userName,
            timestamp: new Date()
        });
    }

    // Send notifications to user
    sendUserNotifications(socket) {
        // This would typically fetch from a notifications collection
        const notifications = [
            {
                id: 1,
                type: 'info',
                title: 'Welcome to Swagat Odisha',
                message: 'Your account has been successfully created.',
                timestamp: new Date(),
                read: false
            }
        ];

        socket.emit('notifications', notifications);
    }

    // Broadcast to all users
    broadcastToAll(event, data) {
        this.io.emit(event, data);
    }

    // Broadcast to specific role
    broadcastToRole(role, event, data) {
        this.io.to(role).emit(event, data);
    }

    // Broadcast to specific user
    broadcastToUser(userId, event, data) {
        this.io.to(userId).emit(event, data);
    }

    // Send system announcement
    sendSystemAnnouncement(announcement) {
        this.broadcastToAll('system_announcement', {
            ...announcement,
            timestamp: new Date()
        });
    }

    // Send document upload notification
    notifyDocumentUpload(studentId, documentData) {
        // Notify staff about new document upload
        this.broadcastToRole('staff', 'new_document_uploaded', {
            studentId,
            documentData,
            timestamp: new Date()
        });

        // Notify super admin
        this.broadcastToRole('super_admin', 'new_document_uploaded', {
            studentId,
            documentData,
            timestamp: new Date()
        });
    }

    // Send referral notification
    notifyReferral(agentId, referralData) {
        // Notify agent about new referral
        this.broadcastToUser(agentId, 'new_referral', {
            ...referralData,
            timestamp: new Date()
        });

        // Notify staff about new referral
        this.broadcastToRole('staff', 'new_referral', {
            ...referralData,
            timestamp: new Date()
        });
    }

    // Send user registration notification
    notifyUserRegistration(userData) {
        // Notify staff about new user registration
        this.broadcastToRole('staff', 'new_user_registered', {
            ...userData,
            timestamp: new Date()
        });

        // Notify super admin
        this.broadcastToRole('super_admin', 'new_user_registered', {
            ...userData,
            timestamp: new Date()
        });
    }

    // Get connected users count
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }

    // Get connected users by role
    getConnectedUsersByRole(role) {
        return Array.from(this.connectedUsers.values()).filter(user => user.userRole === role);
    }

    // Check if user is online
    isUserOnline(userId) {
        return this.connectedUsers.has(userId);
    }

    // Send dashboard data
    sendDashboardData(socket, data) {
        const { role, userId } = data;

        // Mock dashboard data based on role
        let dashboardData = {};

        switch (role) {
            case 'student':
                dashboardData = {
                    applications: { total: 3, pending: 1, approved: 2 },
                    documents: { total: 8, pending: 2, approved: 6 },
                    payments: { total: 2, pending: 0, completed: 2 }
                };
                break;
            case 'agent':
                dashboardData = {
                    referrals: { total: 15, pending: 3, approved: 12 },
                    commissions: { total: 2500, pending: 500, earned: 2000 },
                    students: { total: 12, active: 10, inactive: 2 }
                };
                break;
            case 'staff':
                dashboardData = {
                    applications: { total: 45, pending: 12, approved: 28, rejected: 5 },
                    documents: { total: 120, pending: 20, approved: 85, rejected: 15 },
                    students: { total: 150, active: 120, inactive: 30 }
                };
                break;
            case 'super_admin':
                dashboardData = {
                    users: { total: 200, students: 150, agents: 30, staff: 20 },
                    applications: { total: 500, pending: 50, approved: 400, rejected: 50 },
                    system: { uptime: '99.9%', storage: '75%', performance: 'Excellent' }
                };
                break;
        }

        socket.emit('dashboard_data_update', dashboardData);
    }

    // Send real-time statistics update
    sendStatsUpdate(role, stats) {
        this.broadcastToRole(role, 'stats_update', {
            stats,
            timestamp: new Date()
        });
    }

    // Send real-time activity update
    sendActivityUpdate(activity) {
        this.broadcastToAll('activity_update', {
            ...activity,
            timestamp: new Date()
        });
    }

    // Dashboard notifications
    notifyApplicationCreated(applicationData) {
        // Notify student
        this.broadcastToUser(applicationData.userId, 'application_created', applicationData);

        // Notify staff about new application
        this.broadcastToRole('staff', 'new_application_created', applicationData);

        // Notify super admin
        this.broadcastToRole('super_admin', 'new_application_created', applicationData);
    }

    notifyApplicationUpdated(applicationData) {
        // Notify student
        this.broadcastToUser(applicationData.userId, 'application_updated', applicationData);

        // Notify assigned agent if exists
        if (applicationData.assignedAgent) {
            this.broadcastToUser(applicationData.assignedAgent, 'application_updated', applicationData);
        }

        // Notify assigned staff if exists
        if (applicationData.assignedStaff) {
            this.broadcastToUser(applicationData.assignedStaff, 'application_updated', applicationData);
        }

        // Notify application room
        this.io.to(`application_${applicationData.applicationId}`).emit('application_updated', applicationData);
    }

    notifyApplicationSubmitted(applicationData) {
        // Notify student
        this.broadcastToUser(applicationData.userId, 'application_submitted', applicationData);

        // Notify assigned agent
        if (applicationData.assignedAgent) {
            this.broadcastToUser(applicationData.assignedAgent, 'application_submitted', applicationData);
        }

        // Notify staff about new submission
        this.broadcastToRole('staff', 'application_submitted', applicationData);

        // Notify super admin
        this.broadcastToRole('super_admin', 'application_submitted', applicationData);
    }

    notifyApplicationApproved(applicationData) {
        // Notify student
        this.broadcastToUser(applicationData.userId, 'application_approved', applicationData);

        // Notify assigned agent
        if (applicationData.assignedAgent) {
            this.broadcastToUser(applicationData.assignedAgent, 'application_approved', applicationData);
        }

        // Notify staff
        this.broadcastToRole('staff', 'application_approved', applicationData);

        // Notify super admin
        this.broadcastToRole('super_admin', 'application_approved', applicationData);
    }

    notifyApplicationRejected(applicationData) {
        // Notify student
        this.broadcastToUser(applicationData.userId, 'application_rejected', applicationData);

        // Notify assigned agent
        if (applicationData.assignedAgent) {
            this.broadcastToUser(applicationData.assignedAgent, 'application_rejected', applicationData);
        }

        // Notify staff
        this.broadcastToRole('staff', 'application_rejected', applicationData);

        // Notify super admin
        this.broadcastToRole('super_admin', 'application_rejected', applicationData);
    }

    notifyApplicationPDFGenerated(applicationData) {
        // Notify student
        this.broadcastToUser(applicationData.userId, 'application_pdf_generated', applicationData);

        // Notify application room
        this.io.to(`application_${applicationData.applicationId}`).emit('application_pdf_generated', applicationData);
    }

    notifyApplicationDraftSaved(applicationData) {
        // Notify student
        this.broadcastToUser(applicationData.userId, 'application_draft_saved', applicationData);

        // Notify application room
        this.io.to(`application_${applicationData.applicationId}`).emit('application_draft_saved', applicationData);
    }
}

module.exports = SocketManager;
