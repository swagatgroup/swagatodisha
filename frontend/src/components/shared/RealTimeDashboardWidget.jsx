import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../contexts/SocketContext';

const RealTimeDashboardWidget = ({ title, icon, value, change, changeType, color = 'blue' }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [animationKey, setAnimationKey] = useState(0);
    const { connected } = useSocket();

    useEffect(() => {
        // Trigger animation when value changes
        setAnimationKey(prev => prev + 1);
    }, [value]);

    const getColorClasses = (color) => {
        const colors = {
            blue: {
                bg: 'bg-blue-50',
                text: 'text-blue-600',
                border: 'border-blue-200',
                icon: 'text-blue-500'
            },
            green: {
                bg: 'bg-green-50',
                text: 'text-green-600',
                border: 'border-green-200',
                icon: 'text-green-500'
            },
            yellow: {
                bg: 'bg-yellow-50',
                text: 'text-yellow-600',
                border: 'border-yellow-200',
                icon: 'text-yellow-500'
            },
            red: {
                bg: 'bg-red-50',
                text: 'text-red-600',
                border: 'border-red-200',
                icon: 'text-red-500'
            },
            purple: {
                bg: 'bg-purple-50',
                text: 'text-purple-600',
                border: 'border-purple-200',
                icon: 'text-purple-500'
            }
        };
        return colors[color] || colors.blue;
    };

    const colorClasses = getColorClasses(color);

    const getChangeIcon = (changeType) => {
        if (changeType === 'increase') {
            return (
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
            );
        } else if (changeType === 'decrease') {
            return (
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                </svg>
            );
        }
        return null;
    };

    return (
        <motion.div
            key={animationKey}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`relative bg-white rounded-lg shadow-sm border ${colorClasses.border} p-6 hover:shadow-md transition-shadow duration-200`}
        >
            {/* Live Indicator */}
            {connected && (
                <div className="absolute top-2 right-2">
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-500">Live</span>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
                            <div className={`${colorClasses.icon}`}>
                                {icon}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">{title}</p>
                            <motion.p
                                key={value}
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className={`text-2xl font-bold ${colorClasses.text}`}
                            >
                                {value}
                            </motion.p>
                        </div>
                    </div>
                </div>

                {change && (
                    <div className="flex items-center space-x-1">
                        {getChangeIcon(changeType)}
                        <span className={`text-sm font-medium ${changeType === 'increase' ? 'text-green-600' :
                                changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                            {change}
                        </span>
                    </div>
                )}
            </div>

            {/* Connection Status */}
            {!connected && (
                <div className="mt-2 flex items-center space-x-1 text-xs text-gray-400">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span>Offline</span>
                </div>
            )}
        </motion.div>
    );
};

export default RealTimeDashboardWidget;
