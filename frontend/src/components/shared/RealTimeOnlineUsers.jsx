import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../contexts/SocketContext';

const RealTimeOnlineUsers = ({ showCount = true, showList = false, maxDisplay = 5 }) => {
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [showUserList, setShowUserList] = useState(false);
    const { socket, connected } = useSocket();

    useEffect(() => {
        if (socket) {
            // Listen for user connection/disconnection events
            const handleUserConnected = (data) => {
                setOnlineUsers(prev => {
                    const filtered = prev.filter(user => user.userId !== data.userId);
                    return [...filtered, data];
                });
            };

            const handleUserDisconnected = (data) => {
                setOnlineUsers(prev => prev.filter(user => user.userId !== data.userId));
            };

            const handleOnlineUsersUpdate = (users) => {
                setOnlineUsers(users);
            };

            socket.on('user_connected', handleUserConnected);
            socket.on('user_disconnected', handleUserDisconnected);
            socket.on('online_users_update', handleOnlineUsersUpdate);

            // Request current online users
            socket.emit('get_online_users');

            return () => {
                socket.off('user_connected', handleUserConnected);
                socket.off('user_disconnected', handleUserDisconnected);
                socket.off('online_users_update', handleOnlineUsersUpdate);
            };
        }
    }, [socket]);

    const getRoleColor = (role) => {
        switch (role) {
            case 'student':
                return 'bg-blue-100 text-blue-800';
            case 'agent':
                return 'bg-green-100 text-green-800';
            case 'staff':
                return 'bg-purple-100 text-purple-800';
            case 'super_admin':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'student':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                );
            case 'agent':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                );
            case 'staff':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            case 'super_admin':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                );
        }
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const diff = now - new Date(timestamp);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return 'Long time ago';
    };

    if (!connected) {
        return (
            <div className="flex items-center space-x-2 text-gray-400">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm">Offline</span>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Online Count */}
            {showCount && (
                <button
                    onClick={() => setShowUserList(!showUserList)}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>{onlineUsers.length} online</span>
                    </div>
                    {showList && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    )}
                </button>
            )}

            {/* User List Dropdown */}
            <AnimatePresence>
                {showUserList && showList && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                    >
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900">Online Users</h3>
                            <p className="text-xs text-gray-500">{onlineUsers.length} users currently online</p>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {onlineUsers.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    <p className="text-sm">No users online</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {onlineUsers.slice(0, maxDisplay).map((user) => (
                                        <motion.div
                                            key={user.userId}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-3 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="relative">
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-medium text-gray-600">
                                                            {user.userName?.charAt(0) || 'U'}
                                                        </span>
                                                    </div>
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {user.userName || 'Unknown User'}
                                                        </p>
                                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getRoleColor(user.userRole)}`}>
                                                            {getRoleIcon(user.userRole)}
                                                            <span className="ml-1 capitalize">{user.userRole}</span>
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        Connected {formatTimeAgo(user.connectedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {onlineUsers.length > maxDisplay && (
                                        <div className="p-3 text-center text-sm text-gray-500">
                                            +{onlineUsers.length - maxDisplay} more users
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RealTimeOnlineUsers;
