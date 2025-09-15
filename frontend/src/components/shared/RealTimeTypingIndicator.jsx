import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../contexts/SocketContext';

const RealTimeTypingIndicator = ({ room, onTypingStart, onTypingStop }) => {
    const [typingUsers, setTypingUsers] = useState([]);
    const { socket, emitTypingStart, emitTypingStop } = useSocket();
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);

    useEffect(() => {
        if (socket) {
            // Listen for typing events
            const handleUserTyping = (data) => {
                if (data.room === room) {
                    if (data.isTyping) {
                        setTypingUsers(prev => {
                            const filtered = prev.filter(user => user.userId !== data.userId);
                            return [...filtered, { userId: data.userId, userName: data.userName }];
                        });
                    } else {
                        setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
                    }
                }
            };

            socket.on('user_typing', handleUserTyping);

            return () => {
                socket.off('user_typing', handleUserTyping);
            };
        }
    }, [socket, room]);

    const handleInputChange = (e) => {
        const value = e.target.value;

        if (value.length > 0 && !isTyping) {
            setIsTyping(true);
            emitTypingStart(room);
            if (onTypingStart) onTypingStart();
        }

        // Clear existing timeout
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // Set new timeout
        const timeout = setTimeout(() => {
            if (isTyping) {
                setIsTyping(false);
                emitTypingStop(room);
                if (onTypingStop) onTypingStop();
            }
        }, 1000);

        setTypingTimeout(timeout);
    };

    const handleInputBlur = () => {
        if (isTyping) {
            setIsTyping(false);
            emitTypingStop(room);
            if (onTypingStop) onTypingStop();
        }
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }
    };

    const getTypingText = () => {
        if (typingUsers.length === 0) return null;
        if (typingUsers.length === 1) {
            return `${typingUsers[0].userName} is typing...`;
        } else if (typingUsers.length === 2) {
            return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
        } else {
            return `${typingUsers[0].userName} and ${typingUsers.length - 1} others are typing...`;
        }
    };

    return (
        <div className="space-y-2">
            {/* Typing Indicator */}
            <AnimatePresence>
                {typingUsers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex items-center space-x-2 text-sm text-gray-500"
                    >
                        <div className="flex space-x-1">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                        </div>
                        <span>{getTypingText()}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input with typing detection */}
            <input
                type="text"
                placeholder="Type a message..."
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
        </div>
    );
};

export default RealTimeTypingIndicator;
