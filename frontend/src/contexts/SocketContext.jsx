import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [realtimeStats, setRealtimeStats] = useState(null);
    const { user, token, updateUser } = useAuth();

    useEffect(() => {
        if (user && token) {
            // Initialize socket connection
            const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
                auth: {
                    token: token
                },
                transports: ['websocket', 'polling']
            });

            // Connection event handlers
            newSocket.on('connect', () => {
                // Socket connected
                setConnected(true);
            });

            newSocket.on('disconnect', () => {
                // Socket disconnected
                setConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setConnected(false);
            });

            // Document status update handler
            newSocket.on('document_status_changed', (data) => {
                // Document status changed
                addNotification({
                    id: Date.now(),
                    type: 'document',
                    title: 'Document Status Updated',
                    message: `Your document has been ${data.status}`,
                    data: data,
                    timestamp: new Date(),
                    read: false
                });
            });

            // New document uploaded handler (for staff)
            newSocket.on('new_document_uploaded', (data) => {
                // New document uploaded
                addNotification({
                    id: Date.now(),
                    type: 'document',
                    title: 'New Document Uploaded',
                    message: `A new document has been uploaded by a student`,
                    data: data,
                    timestamp: new Date(),
                    read: false
                });
            });

            // Document reviewed handler (for staff)
            newSocket.on('document_reviewed', (data) => {
                // Document reviewed
                addNotification({
                    id: Date.now(),
                    type: 'document',
                    title: 'Document Reviewed',
                    message: `A document has been reviewed by ${data.reviewedBy}`,
                    data: data,
                    timestamp: new Date(),
                    read: false
                });
            });

            // New referral handler (for agents)
            newSocket.on('new_referral', (data) => {
                // New referral
                addNotification({
                    id: Date.now(),
                    type: 'referral',
                    title: 'New Referral',
                    message: `You have a new referral: ${data.studentName}`,
                    data: data,
                    timestamp: new Date(),
                    read: false
                });
            });

            // New user registration handler (for staff/admin)
            newSocket.on('new_user_registered', (data) => {
                // New user registered
                addNotification({
                    id: Date.now(),
                    type: 'user',
                    title: 'New User Registration',
                    message: `A new ${data.role} has registered`,
                    data: data,
                    timestamp: new Date(),
                    read: false
                });
            });

            // System announcement handler
            newSocket.on('system_announcement', (data) => {
                // System announcement
                addNotification({
                    id: Date.now(),
                    type: 'system',
                    title: data.title || 'System Announcement',
                    message: data.message,
                    data: data,
                    timestamp: new Date(),
                    read: false
                });
            });

            // Notifications handler
            newSocket.on('notifications', (data) => {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.read).length);
            });

            // Profile updated handler (e.g., referralCode assigned)
            newSocket.on('profile-updated', (data) => {
                try {
                    if (data?.user?.id && user && data.user.id === user.id) {
                        const updated = { ...user, ...data.user };
                        updateUser(updated);
                        addNotification({
                            id: Date.now(),
                            type: 'profile',
                            title: 'Profile Updated',
                            message: data.updatedFields?.includes('referralCode')
                                ? `Your referral code is now ${data.user.referralCode}`
                                : 'Your profile has been updated',
                            data,
                            timestamp: new Date(),
                            read: false
                        });
                    }
                } catch (e) { }
            });

            // Online users handler
            newSocket.on('online_users_update', (data) => {
                setOnlineUsers(data);
            });

            // User connected/disconnected handlers
            newSocket.on('user_connected', (data) => {
                setOnlineUsers(prev => {
                    const filtered = prev.filter(user => user.userId !== data.userId);
                    return [...filtered, data];
                });
            });

            newSocket.on('user_disconnected', (data) => {
                setOnlineUsers(prev => prev.filter(user => user.userId !== data.userId));
            });

            // Dashboard data handler
            newSocket.on('dashboard_data_update', (data) => {
                setDashboardData(data);
            });

            // Real-time stats handler
            newSocket.on('stats_update', (data) => {
                setRealtimeStats(data);
            });

            // Activity update handler
            newSocket.on('activity_update', (data) => {
                addNotification({
                    id: Date.now(),
                    type: 'activity',
                    title: 'System Activity',
                    message: data.message || 'New activity detected',
                    data: data,
                    timestamp: new Date(),
                    read: false
                });
            });

            // Request notifications on connection
            newSocket.emit('request_notifications');

            // Request dashboard data
            newSocket.emit('request_dashboard_data', {
                role: user.role,
                userId: user.id
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        }
    }, [user, token]);

    // Application workflow notifications (no-op handlers to ensure events are received globally)
    useEffect(() => {
        if (!socket) return;
        const noop = () => { };
        const events = [
            'application_created',
            'application_updated',
            'application_draft_saved',
            'application_pdf_generated',
            'application_submitted',
            'application_approved',
            'application_rejected'
        ];
        events.forEach((ev) => socket.on(ev, noop));
        return () => { events.forEach((ev) => socket.off(ev, noop)); };
    }, [socket]);

    const addNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
    };

    const markNotificationAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId
                    ? { ...notification, read: true }
                    : notification
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllNotificationsAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
    };

    const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    const emitDocumentStatusUpdate = (data) => {
        if (socket && connected) {
            socket.emit('document_status_update', data);
        }
    };

    const emitTypingStart = (room) => {
        if (socket && connected) {
            socket.emit('typing_start', { room });
        }
    };

    const emitTypingStop = (room) => {
        if (socket && connected) {
            socket.emit('typing_stop', { room });
        }
    };

    const joinApplicationRoom = (applicationId) => {
        if (socket && connected && applicationId) {
            socket.emit('join_application_room', applicationId);
        }
    };

    const leaveApplicationRoom = (applicationId) => {
        if (socket && connected && applicationId) {
            socket.emit('leave_application_room', applicationId);
        }
    };

    const value = {
        socket,
        connected,
        notifications,
        unreadCount,
        onlineUsers,
        dashboardData,
        realtimeStats,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        emitDocumentStatusUpdate,
        emitTypingStart,
        emitTypingStop,
        joinApplicationRoom,
        leaveApplicationRoom
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
