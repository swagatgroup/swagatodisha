import io from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    connect(token) {
        if (this.socket && this.isConnected) {
            return this.socket;
        }

        const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

        this.socket = io(serverUrl, {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling']
        });

        this.setupEventHandlers();
        return this.socket;
    }

    setupEventHandlers() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from server:', reason);
            this.isConnected = false;

            if (reason === 'io server disconnect') {
                // Server disconnected, try to reconnect
                this.attemptReconnect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.attemptReconnect();
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('Reconnected after', attemptNumber, 'attempts');
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('Reconnection error:', error);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('Failed to reconnect after', this.maxReconnectAttempts, 'attempts');
        });
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

            console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            setTimeout(() => {
                if (this.socket && !this.isConnected) {
                    this.socket.connect();
                }
            }, delay);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Join user room
    joinUserRoom(userId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('join-user-room', userId);
        }
    }

    // Join agent room
    joinAgentRoom(agentId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('join-agent-room', agentId);
        }
    }

    // Join staff room
    joinStaffRoom(staffId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('join-staff-room', staffId);
        }
    }

    // Join admin room
    joinAdminRoom() {
        if (this.socket && this.isConnected) {
            this.socket.emit('join-admin-room');
        }
    }

    // Listen for profile updates
    onProfileUpdate(callback) {
        if (this.socket) {
            this.socket.on('profile-updated', callback);
        }
    }

    // Listen for workflow updates
    onWorkflowUpdate(callback) {
        if (this.socket) {
            this.socket.on('workflow-updated', callback);
        }
    }

    // Listen for document updates
    onDocumentUpdate(callback) {
        if (this.socket) {
            this.socket.on('document-updated', callback);
        }
    }

    // Listen for payment updates
    onPaymentUpdate(callback) {
        if (this.socket) {
            this.socket.on('payment-updated', callback);
        }
    }

    // Listen for notifications
    onNotification(callback) {
        if (this.socket) {
            this.socket.on('notification', callback);
        }
    }

    // Listen for announcements
    onAnnouncement(callback) {
        if (this.socket) {
            this.socket.on('announcement', callback);
        }
    }

    // Emit profile update
    emitProfileUpdate(data) {
        if (this.socket && this.isConnected) {
            this.socket.emit('profile-updated', data);
        }
    }

    // Emit workflow update
    emitWorkflowUpdate(data) {
        if (this.socket && this.isConnected) {
            this.socket.emit('workflow-updated', data);
        }
    }

    // Emit document update
    emitDocumentUpdate(data) {
        if (this.socket && this.isConnected) {
            this.socket.emit('document-updated', data);
        }
    }

    // Emit payment update
    emitPaymentUpdate(data) {
        if (this.socket && this.isConnected) {
            this.socket.emit('payment-updated', data);
        }
    }

    // Remove all listeners
    removeAllListeners() {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }

    // Remove specific listener
    removeListener(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    // Get connection status
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            socketId: this.socket?.id || null
        };
    }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
