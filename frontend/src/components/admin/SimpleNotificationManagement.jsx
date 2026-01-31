import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import {
    showSuccess,
    showError,
    showConfirm,
    showLoading,
    closeLoading
} from '../../utils/sweetAlert';

const SimpleNotificationManagement = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);
    const [formData, setFormData] = useState({
        title: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/notifications');
            if (response.data.success) {
                setNotifications(response.data.data?.notifications || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            showError('Error', 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type - allow PDF and images
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                showError('Invalid File', 'Please select a PDF or image file (JPG, PNG, WebP)');
                return;
            }

            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                showError('File Too Large', 'File size must be less than 10MB');
                return;
            }

            setSelectedFile(file);
        }
    };

    // Helper function to get file URL from notification
    const getFileUrl = (notification) => {
        if (notification.pdfDocument) {
            return notification.pdfDocument;
        } else if (notification.image) {
            return notification.image;
        } else if (notification.attachments && notification.attachments.length > 0) {
            return notification.attachments[0].url;
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            showLoading('Saving notification...');

            const formDataToSend = new FormData();

            // Append file if selected
            if (selectedFile) {
                formDataToSend.append('file', selectedFile);
            }

            // Append form fields - only title is required
            formDataToSend.append('title', formData.title);
            formDataToSend.append('content', formData.title); // Use title as content
            formDataToSend.append('type', 'General');
            formDataToSend.append('priority', 'Medium');
            formDataToSend.append('isActive', 'true');
            formDataToSend.append('publishDate', new Date().toISOString().split('T')[0]);
            formDataToSend.append('targetAudience', 'All');

            const url = editingNotification 
                ? `/api/notifications/${editingNotification._id}`
                : '/api/notifications';
            const method = editingNotification ? 'put' : 'post';

            const response = await api[method](url, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.success) {
                showSuccess('Success', editingNotification ? 'Notification updated successfully!' : 'Notification created successfully!');
                setShowForm(false);
                setEditingNotification(null);
                setSelectedFile(null);
                resetForm();
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error saving notification:', error);
            showError('Error', 'Failed to save notification');
        } finally {
            setSaving(false);
            closeLoading();
        }
    };

    const handleEdit = (notification) => {
        setFormData({
            title: notification.title || ''
        });
        setEditingNotification(notification);
        setSelectedFile(null); // Clear file selection when editing
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            'warning'
        );

        if (confirmed) {
            try {
                showLoading('Deleting notification...');
                const response = await api.delete(`/api/notifications/${id}`);
                if (response.data.success) {
                    showSuccess('Success', 'Notification deleted successfully!');
                    fetchNotifications();
                }
            } catch (error) {
                console.error('Error deleting notification:', error);
                showError('Error', 'Failed to delete notification');
            } finally {
                closeLoading();
            }
        }
    };

    const resetForm = () => {
        setFormData({
            title: ''
        });
        setEditingNotification(null);
        setSelectedFile(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Notifications</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage website notifications and announcements
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add Notification
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                        {editingNotification ? 'Edit Notification' : 'Add New Notification'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="Enter notification title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {editingNotification ? 'Update File (optional)' : 'Upload File (optional)'}
                            </label>
                            <input
                                type="file"
                                onChange={handleFileSelect}
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Supported formats: PDF, JPG, PNG, WebP (Max 10MB)
                            </p>
                            {selectedFile && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    <i className="fa-solid fa-check-circle mr-1"></i>
                                    Selected: {selectedFile.name}
                                </p>
                            )}
                            {editingNotification && (editingNotification.pdfDocument || editingNotification.image) && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    Current: <a href={editingNotification.pdfDocument || editingNotification.image} target="_blank" rel="noopener noreferrer" className="underline">View current file</a>
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    resetForm();
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : editingNotification ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Notifications List */}
            {!showForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    {notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <i className="fa-solid fa-bell text-4xl text-gray-400 mb-4"></i>
                            <p className="text-gray-500 dark:text-gray-400">No notifications found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {notifications.map((notification) => (
                                <motion.div
                                    key={notification._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {notification.title}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs rounded ${
                                                    notification.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                                                    notification.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                                    notification.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {notification.priority}
                                                </span>
                                                <span className={`px-2 py-1 text-xs rounded ${
                                                    notification.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {notification.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {notification.content}
                                            </p>
                                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                                <span>
                                                    <i className="fa-solid fa-tag mr-1"></i>
                                                    {notification.type}
                                                </span>
                                                {notification.publishDate && (
                                                    <span>
                                                        <i className="fa-solid fa-calendar mr-1"></i>
                                                        {new Date(notification.publishDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {(notification.pdfDocument || notification.image || (notification.attachments && notification.attachments.length > 0)) && (() => {
                                                    const fileUrl = getFileUrl(notification);
                                                    return fileUrl ? (
                                                        <a
                                                            href={fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                                            title="Click to view file in new tab"
                                                        >
                                                            <i className="fa-solid fa-file mr-1"></i>
                                                            View File
                                                        </a>
                                                    ) : null;
                                                })()}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 ml-4">
                                            <button
                                                onClick={() => handleEdit(notification)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <i className="fa-solid fa-edit"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(notification._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default SimpleNotificationManagement;

