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
                    isTyping: true
                });
            });

            socket.on('typing_stop', (data) => {
                socket.to(data.room).emit('user_typing', {
                    userId: socket.userId,
                    userName: socket.userName,
                    isTyping: false
                });
            });

            // Handle disconnect
            socket.on('disconnect', () => {
                // User disconnected
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
}

module.exports = SocketManager;
