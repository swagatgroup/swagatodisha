import React from 'react';
import { useSocket } from '../../contexts/SocketContext';

const RealTimeStatus = () => {
    const { connected, notifications, unreadCount } = useSocket();

    return (
        <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                    {connected ? 'Connected' : 'Disconnected'}
                </span>
            </div>

            {/* Notification Count */}
            {unreadCount > 0 && (
                <div className="relative">
                    <div className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                </div>
            )}

            {/* Real-time Indicator */}
            {connected && (
                <div className="flex items-center space-x-1 text-green-600">
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">Live</span>
                </div>
            )}
        </div>
    );
};

export default RealTimeStatus;
