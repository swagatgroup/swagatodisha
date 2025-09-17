import {useState, useEffect} from 'react';
import { Bell, X, Check, Trash2, Filter, Search, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

const NotificationSystem = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();

        // Set up polling for new notifications
        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const result = await response.json();
            if (result.success) {
                setNotifications(result.data.notifications);
            }
        } catch (error) {
            console.error('Fetch notifications error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch('/api/notifications/unread-count', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const result = await response.json();
            if (result.success) {
                setUnreadCount(result.data.unreadCount);
            }
        } catch (error) {
            console.error('Fetch unread count error:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notif =>
                        notif._id === notificationId
                            ? { ...notif, isRead: true }
                            : notif
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notif => ({ ...notif, isRead: true }))
                );
                setUnreadCount(0);
                Swal.fire({
                    icon: 'success',
                    title: 'All notifications marked as read',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error('Mark all as read error:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
                Swal.fire({
                    icon: 'success',
                    title: 'Notification deleted',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error('Delete notification error:', error);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            document_upload: '📄',
            document_approved: '✅',
            document_rejected: '❌',
            document_resubmission_required: '🔄',
            referral_new: '👥',
            referral_approved: '🎉',
            system_update: '⚙️',
            general: '📢'
        };
        return icons[type] || '📢';
    };

    const getNotificationColor = (type, isRead) => {
        if (isRead) return 'bg-gray-50';

        const colors = {
            document_upload: 'bg-blue-50 border-l-blue-500',
            document_approved: 'bg-green-50 border-l-green-500',
            document_rejected: 'bg-red-50 border-l-red-500',
            document_resubmission_required: 'bg-orange-50 border-l-orange-500',
            referral_new: 'bg-purple-50 border-l-purple-500',
            referral_approved: 'bg-green-50 border-l-green-500',
            system_update: 'bg-gray-50 border-l-gray-500',
            general: 'bg-blue-50 border-l-blue-500'
        };
        return colors[type] || 'bg-blue-50 border-l-blue-500';
    };

    const filteredNotifications = notifications.filter(notif => {
        const matchesFilter = filter === 'all' ||
            (filter === 'unread' && !notif.isRead) ||
            (filter === 'read' && notif.isRead) ||
            notif.type === filter;

        const matchesSearch = searchTerm === '' ||
            notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notif.message.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const displayNotifications = showAll ? filteredNotifications : filteredNotifications.slice(0, 5);

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Bell className="h-6 w-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={fetchNotifications}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                            title="Refresh"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Mark All Read
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Notifications</option>
                        <option value="unread">Unread Only</option>
                        <option value="read">Read Only</option>
                        <option value="document_upload">Document Uploads</option>
                        <option value="document_approved">Document Approved</option>
                        <option value="document_rejected">Document Rejected</option>
                        <option value="referral_new">New Referrals</option>
                        <option value="system_update">System Updates</option>
                    </select>
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : displayNotifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No notifications found.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        <AnimatePresence>
                            {displayNotifications.map((notification) => (
                                <motion.div
                                    key={notification._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className={`p-4 border-l-4 ${getNotificationColor(notification.type, notification.isRead)} hover:bg-gray-50 transition-colors`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3 flex-1">
                                            <span className="text-2xl">
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <h4 className={`text-sm font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.isRead && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    )}
                                                </div>
                                                <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                    <span>{notification.timeAgo}</span>
                                                    {notification.sender && (
                                                        <span>From: {notification.sender.fullName}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 ml-4">
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                                                    title="Mark as read"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification._id)}
                                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                title="Delete notification"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Show More/Less Button */}
            {filteredNotifications.length > 5 && (
                <div className="p-4 border-t border-gray-200 text-center">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        {showAll ? 'Show Less' : `Show All (${filteredNotifications.length})`}
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationSystem;
