const io = require('socket.io');

class RealTimeUpdateService {
    constructor(server) {
        this.io = io(server, {
            cors: {
                origin: [
                    'https://www.swagatodisha.com',
                    'https://swagatodisha.com',
                    'http://localhost:3000',
                    'http://localhost:5173'
                ],
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        this.setupSocketHandlers();
        this.setupGlobalIO();
    }

    setupGlobalIO() {
        // Make io globally available for use in other modules
        global.io = this.io;
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);

            // Join user to their personal room
            socket.on('join-user-room', (userId) => {
                socket.join(userId.toString());
                console.log(`User ${userId} joined their room`);
            });

            // Join agent to their assigned students room
            socket.on('join-agent-room', (agentId) => {
                socket.join(`agent-${agentId}`);
                console.log(`Agent ${agentId} joined their room`);
            });

            // Join staff to their assigned students room
            socket.on('join-staff-room', (staffId) => {
                socket.join(`staff-${staffId}`);
                console.log(`Staff ${staffId} joined their room`);
            });

            // Join super admin to all rooms
            socket.on('join-admin-room', () => {
                socket.join('admin-all');
                console.log('Super admin joined admin room');
            });

            // Handle profile updates
            socket.on('profile-updated', (data) => {
                this.broadcastProfileUpdate(data);
            });

            // Handle workflow updates
            socket.on('workflow-updated', (data) => {
                this.broadcastWorkflowUpdate(data);
            });

            // Handle document updates
            socket.on('document-updated', (data) => {
                this.broadcastDocumentUpdate(data);
            });

            // Handle payment updates
            socket.on('payment-updated', (data) => {
                this.broadcastPaymentUpdate(data);
            });

            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id}`);
            });
        });
    }

    // Broadcast profile update to relevant users
    broadcastProfileUpdate(data) {
        const { studentId, userId, updates } = data;

        // Notify the student
        this.io.to(userId.toString()).emit('profile-updated', {
            type: 'profile-update',
            studentId,
            updates,
            timestamp: new Date()
        });

        // Notify assigned agent
        if (updates.assignedAgent) {
            this.io.to(`agent-${updates.assignedAgent}`).emit('student-profile-updated', {
                type: 'student-profile-update',
                studentId,
                updates,
                timestamp: new Date()
            });
        }

        // Notify assigned staff
        if (updates.assignedStaff) {
            this.io.to(`staff-${updates.assignedStaff}`).emit('student-profile-updated', {
                type: 'student-profile-update',
                studentId,
                updates,
                timestamp: new Date()
            });
        }

        // Notify super admin
        this.io.to('admin-all').emit('student-profile-updated', {
            type: 'student-profile-update',
            studentId,
            updates,
            timestamp: new Date()
        });
    }

    // Broadcast workflow update to relevant users
    broadcastWorkflowUpdate(data) {
        const { studentId, userId, stage, reviewedBy, remarks } = data;

        // Notify the student
        this.io.to(userId.toString()).emit('workflow-updated', {
            type: 'workflow-update',
            studentId,
            stage,
            reviewedBy,
            remarks,
            timestamp: new Date()
        });

        // Notify assigned agent
        if (data.assignedAgent) {
            this.io.to(`agent-${data.assignedAgent}`).emit('workflow-updated', {
                type: 'workflow-update',
                studentId,
                stage,
                reviewedBy,
                remarks,
                timestamp: new Date()
            });
        }

        // Notify assigned staff
        if (data.assignedStaff) {
            this.io.to(`staff-${data.assignedStaff}`).emit('workflow-updated', {
                type: 'workflow-update',
                studentId,
                stage,
                reviewedBy,
                remarks,
                timestamp: new Date()
            });
        }

        // Notify super admin
        this.io.to('admin-all').emit('workflow-updated', {
            type: 'workflow-update',
            studentId,
            stage,
            reviewedBy,
            remarks,
            timestamp: new Date()
        });
    }

    // Broadcast document update to relevant users
    broadcastDocumentUpdate(data) {
        const { studentId, userId, documentId, status, remarks } = data;

        // Notify the student
        this.io.to(userId.toString()).emit('document-updated', {
            type: 'document-update',
            studentId,
            documentId,
            status,
            remarks,
            timestamp: new Date()
        });

        // Notify assigned agent
        if (data.assignedAgent) {
            this.io.to(`agent-${data.assignedAgent}`).emit('document-updated', {
                type: 'document-update',
                studentId,
                documentId,
                status,
                remarks,
                timestamp: new Date()
            });
        }

        // Notify assigned staff
        if (data.assignedStaff) {
            this.io.to(`staff-${data.assignedStaff}`).emit('document-updated', {
                type: 'document-update',
                studentId,
                documentId,
                status,
                remarks,
                timestamp: new Date()
            });
        }

        // Notify super admin
        this.io.to('admin-all').emit('document-updated', {
            type: 'document-update',
            studentId,
            documentId,
            status,
            remarks,
            timestamp: new Date()
        });
    }

    // Broadcast payment update to relevant users
    broadcastPaymentUpdate(data) {
        const { studentId, userId, paymentId, status, amount } = data;

        // Notify the student
        this.io.to(userId.toString()).emit('payment-updated', {
            type: 'payment-update',
            studentId,
            paymentId,
            status,
            amount,
            timestamp: new Date()
        });

        // Notify assigned agent
        if (data.assignedAgent) {
            this.io.to(`agent-${data.assignedAgent}`).emit('payment-updated', {
                type: 'payment-update',
                studentId,
                paymentId,
                status,
                amount,
                timestamp: new Date()
            });
        }

        // Notify assigned staff
        if (data.assignedStaff) {
            this.io.to(`staff-${data.assignedStaff}`).emit('payment-updated', {
                type: 'payment-update',
                studentId,
                paymentId,
                status,
                amount,
                timestamp: new Date()
            });
        }

        // Notify super admin
        this.io.to('admin-all').emit('payment-updated', {
            type: 'payment-update',
            studentId,
            paymentId,
            status,
            amount,
            timestamp: new Date()
        });
    }

    // Send notification to specific user
    sendNotification(userId, notification) {
        this.io.to(userId.toString()).emit('notification', {
            ...notification,
            timestamp: new Date()
        });
    }

    // Send notification to all users of a role
    sendNotificationToRole(role, notification) {
        this.io.to(`${role}-all`).emit('notification', {
            ...notification,
            timestamp: new Date()
        });
    }

    // Send system-wide announcement
    sendAnnouncement(announcement) {
        this.io.emit('announcement', {
            ...announcement,
            timestamp: new Date()
        });
    }

    // Get connected users count
    getConnectedUsersCount() {
        return this.io.engine.clientsCount;
    }

    // Get connected users by room
    getConnectedUsersByRoom(room) {
        return this.io.sockets.adapter.rooms.get(room)?.size || 0;
    }
}

module.exports = RealTimeUpdateService;
