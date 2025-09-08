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
    const { user, token } = useAuth();

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
                console.log('Socket connected:', newSocket.id);
                setConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
                setConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setConnected(false);
            });

            // Document status update handler
            newSocket.on('document_status_changed', (data) => {
                console.log('Document status changed:', data);
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
                console.log('New document uploaded:', data);
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
                console.log('Document reviewed:', data);
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
                console.log('New referral:', data);
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
                console.log('New user registered:', data);
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
                console.log('System announcement:', data);
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

            // Request notifications on connection
            newSocket.emit('request_notifications');

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        }
    }, [user, token]);

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

    const value = {
        socket,
        connected,
        notifications,
        unreadCount,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        emitDocumentStatusUpdate,
        emitTypingStart,
        emitTypingStop
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
