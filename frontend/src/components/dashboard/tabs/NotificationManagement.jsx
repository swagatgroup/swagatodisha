import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';

const NotificationManagement = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);
    const [filters, setFilters] = useState({
        type: '',
        category: '',
        status: '',
        search: ''
    });

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        shortDescription: '',
        type: 'General',
        category: 'Notification',
        targetAudience: 'All',
        targetInstitutions: [],
        targetCourses: [],
        priority: 'Medium',
        isUrgent: false,
        isImportant: false,
        attachments: [],
        image: '',
        pdfDocument: '',
        publishDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        eventDate: '',
        status: 'Draft',
        isActive: true,
        displayOrder: 0,
        showOnHomepage: false,
        showInQuickLinks: false,
        seoTitle: '',
        seoDescription: '',
        seoKeywords: []
    });

    const notificationTypes = [
        'General', 'Academic', 'Admission', 'Exam', 'Result', 'Holiday', 'Event', 'Emergency', 'Maintenance'
    ];

    const categories = [
        'Timetable', 'Result', 'Notification', 'Announcement', 'Alert'
    ];

    const targetAudiences = [
        'All', 'Students', 'Parents', 'Teachers', 'Staff', 'Agents', 'Public'
    ];

    const priorities = ['Low', 'Medium', 'High', 'Critical'];
    const statuses = ['Draft', 'Published', 'Archived', 'Expired'];

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/notifications', {
                params: {
                    type: filters.type || undefined,
                    category: filters.category || undefined,
                    status: filters.status || undefined,
                    search: filters.search || undefined
                }
            });
            if (response.data.success) {
                setNotifications(response.data.data.notifications || []);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveNotification = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const url = editingNotification ? `/api/notifications/${editingNotification._id}` : '/api/notifications';
            const method = editingNotification ? 'put' : 'post';

            const response = await api[method](url, formData);
            if (response.data.success) {
                alert(editingNotification ? 'Notification updated successfully!' : 'Notification created successfully!');
                setShowForm(false);
                setEditingNotification(null);
                resetForm();
                loadNotifications();
            }
        } catch (error) {
            console.error('Error saving notification:', error);
            alert('Error saving notification. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const editNotification = (notification) => {
        setEditingNotification(notification);
        setFormData({
            ...notification,
            publishDate: notification.publishDate ? new Date(notification.publishDate).toISOString().split('T')[0] : '',
            expiryDate: notification.expiryDate ? new Date(notification.expiryDate).toISOString().split('T')[0] : '',
            eventDate: notification.eventDate ? new Date(notification.eventDate).toISOString().split('T')[0] : '',
            seoKeywords: notification.seoKeywords || []
        });
        setShowForm(true);
    };

    const deleteNotification = async (notificationId) => {
        if (!window.confirm('Are you sure you want to delete this notification?')) return;

        try {
            const response = await api.delete(`/api/notifications/${notificationId}`);
            if (response.data.success) {
                alert('Notification deleted successfully!');
                loadNotifications();
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            alert('Error deleting notification. Please try again.');
        }
    };

    const publishNotification = async (notificationId) => {
        try {
            const response = await api.put(`/api/notifications/${notificationId}/status`, {
                status: 'Published'
            });
            if (response.data.success) {
                alert('Notification published successfully!');
                loadNotifications();
            }
        } catch (error) {
            console.error('Error publishing notification:', error);
            alert('Error publishing notification. Please try again.');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            shortDescription: '',
            type: 'General',
            category: 'Notification',
            targetAudience: 'All',
            targetInstitutions: [],
            targetCourses: [],
            priority: 'Medium',
            isUrgent: false,
            isImportant: false,
            attachments: [],
            image: '',
            pdfDocument: '',
            publishDate: new Date().toISOString().split('T')[0],
            expiryDate: '',
            eventDate: '',
            status: 'Draft',
            isActive: true,
            displayOrder: 0,
            showOnHomepage: false,
            showInQuickLinks: false,
            seoTitle: '',
            seoDescription: '',
            seoKeywords: []
        });
    };

    const handleInputChange = (path, value) => {
        const newData = { ...formData };
        const keys = path.split('.');
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        setFormData(newData);
    };

    const handleArrayChange = (path, value) => {
        const newData = { ...formData };
        const keys = path.split('.');
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = [];
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value.split(',').map(item => item.trim()).filter(item => item);
        setFormData(newData);
    };

    const filteredNotifications = notifications.filter(notification => {
        const matchesSearch = !filters.search ||
            notification.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            notification.content.toLowerCase().includes(filters.search.toLowerCase());

        const matchesType = !filters.type || notification.type === filters.type;
        const matchesCategory = !filters.category || notification.category === filters.category;
        const matchesStatus = !filters.status || notification.status === filters.status;

        return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical': return 'bg-red-100 text-red-800';
            case 'High': return 'bg-orange-100 text-orange-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Published': return 'bg-green-100 text-green-800';
            case 'Draft': return 'bg-yellow-100 text-yellow-800';
            case 'Archived': return 'bg-gray-100 text-gray-800';
            case 'Expired': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notification Management</h2>
                <button
                    onClick={() => {
                        resetForm();
                        setEditingNotification(null);
                        setShowForm(true);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                    Add New Notification
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Search notifications..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        >
                            <option value="">All Types</option>
                            {notificationTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        >
                            <option value="">All Statuses</option>
                            {statuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={loadNotifications}
                            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Notifications ({filteredNotifications.length})
                    </h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredNotifications.map((notification, index) => (
                        <motion.div
                            key={notification._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">{notification.title}</h4>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notification.priority)}`}>
                                            {notification.priority}
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(notification.status)}`}>
                                            {notification.status}
                                        </span>
                                        {notification.isUrgent && (
                                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full">
                                                Urgent
                                            </span>
                                        )}
                                        {notification.isImportant && (
                                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                                                Important
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        {notification.type} • {notification.category} • {notification.targetAudience}
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">
                                        {notification.shortDescription || notification.content.substring(0, 150)}...
                                    </p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                        <span>Published: {new Date(notification.publishDate).toLocaleDateString()}</span>
                                        <span>Views: {notification.views || 0}</span>
                                        <span>Clicks: {notification.clicks || 0}</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {notification.status === 'Draft' && (
                                        <button
                                            onClick={() => publishNotification(notification._id)}
                                            className="px-3 py-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-sm font-medium"
                                        >
                                            Publish
                                        </button>
                                    )}
                                    <button
                                        onClick={() => editNotification(notification)}
                                        className="px-3 py-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteNotification(notification._id)}
                                        className="px-3 py-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Notification Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {editingNotification ? 'Edit Notification' : 'Add New Notification'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingNotification(null);
                                        resetForm();
                                    }}
                                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={saveNotification} className="space-y-6">
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type *</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => handleInputChange('type', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            required
                                        >
                                            {notificationTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => handleInputChange('category', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        >
                                            {categories.map(category => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Audience *</label>
                                        <select
                                            value={formData.targetAudience}
                                            onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            required
                                        >
                                            {targetAudiences.map(audience => (
                                                <option key={audience} value={audience}>{audience}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => handleInputChange('priority', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        >
                                            {priorities.map(priority => (
                                                <option key={priority} value={priority}>{priority}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => handleInputChange('status', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        >
                                            {statuses.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Short Description</label>
                                    <input
                                        type="text"
                                        value={formData.shortDescription}
                                        onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        maxLength={200}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content *</label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => handleInputChange('content', e.target.value)}
                                        rows={6}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Publish Date</label>
                                        <input
                                            type="date"
                                            value={formData.publishDate}
                                            onChange={(e) => handleInputChange('publishDate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiry Date</label>
                                        <input
                                            type="date"
                                            value={formData.expiryDate}
                                            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Date</label>
                                        <input
                                            type="date"
                                            value={formData.eventDate}
                                            onChange={(e) => handleInputChange('eventDate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                </div>

                                {/* Display Settings */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Order</label>
                                        <input
                                            type="number"
                                            value={formData.displayOrder}
                                            onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-6">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.isUrgent}
                                                onChange={(e) => handleInputChange('isUrgent', e.target.checked)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Urgent</span>
                                        </label>

                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.isImportant}
                                                onChange={(e) => handleInputChange('isImportant', e.target.checked)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Important</span>
                                        </label>

                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.showOnHomepage}
                                                onChange={(e) => handleInputChange('showOnHomepage', e.target.checked)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Show on Homepage</span>
                                        </label>

                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.showInQuickLinks}
                                                onChange={(e) => handleInputChange('showInQuickLinks', e.target.checked)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Show in Quick Links</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingNotification(null);
                                            resetForm();
                                        }}
                                        className="px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : (editingNotification ? 'Update Notification' : 'Create Notification')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationManagement;
