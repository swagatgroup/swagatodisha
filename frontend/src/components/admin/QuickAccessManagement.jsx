import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import {
    showSuccess,
    showError,
    showConfirm,
    showLoading,
    closeLoading,
    showSuccessToast,
    showErrorToast
} from '../../utils/sweetAlert';

const QuickAccessManagement = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [activeTab, setActiveTab] = useState('timetable');
    const [formData, setFormData] = useState({
        type: 'timetable',
        title: '',
        description: '',
        publishDate: new Date().toISOString().split('T')[0],
        order: 0,
        isActive: true
    });
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/admin/quick-access');
            if (response.data.success) {
                setDocuments(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            showError('Error', 'Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (file.type !== 'application/pdf') {
                showError('Invalid File', 'Please select a PDF file');
                return;
            }

            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                showError('File Too Large', 'PDF size must be less than 10MB');
                return;
            }

            setSelectedFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile && !editingDoc) {
            showError('Missing File', 'Please upload a PDF file');
            return;
        }

        try {
            setUploading(true);
            showLoading('Processing...', 'Uploading document...');

            const formDataToSend = new FormData();

            if (selectedFile) {
                formDataToSend.append('file', selectedFile);
            }

            formDataToSend.append('type', formData.type);
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description || '');
            formDataToSend.append('publishDate', formData.publishDate);
            formDataToSend.append('order', formData.order || 0);
            formDataToSend.append('isActive', formData.isActive);

            let response;
            if (editingDoc) {
                response = await api.put(
                    `/api/admin/quick-access/${editingDoc._id}`,
                    formDataToSend,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }
                );
            } else {
                response = await api.post('/api/admin/quick-access', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (response.data.success) {
                closeLoading();
                showSuccessToast(editingDoc ? 'Document updated successfully!' : 'Document created successfully!');
                resetForm();
                fetchDocuments();
            }
        } catch (error) {
            closeLoading();
            console.error('Error saving document:', error);
            showError('Error', error.response?.data?.message || 'Failed to save document');
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (doc) => {
        setEditingDoc(doc);
        setFormData({
            type: doc.type,
            title: doc.title || '',
            description: doc.description || '',
            publishDate: doc.publishDate ? new Date(doc.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            order: doc.order || 0,
            isActive: doc.isActive !== false
        });
        setSelectedFile(null);
        setActiveTab(doc.type);
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm(
            'Delete Document',
            'Are you sure you want to delete this document? This action cannot be undone.',
            'warning'
        );

        if (!confirmed) return;

        try {
            showLoading('Deleting...', 'Removing document...');
            const response = await api.delete(`/api/admin/quick-access/${id}`);
            if (response.data.success) {
                closeLoading();
                showSuccessToast('Document deleted successfully!');
                fetchDocuments();
            }
        } catch (error) {
            closeLoading();
            console.error('Error deleting document:', error);
            showError('Error', error.response?.data?.message || 'Failed to delete document');
        }
    };

    const handleToggleActive = async (doc) => {
        try {
            const response = await api.put(`/api/admin/quick-access/${doc._id}`, {
                isActive: !doc.isActive
            });
            if (response.data.success) {
                fetchDocuments();
            }
        } catch (error) {
            console.error('Error updating document:', error);
            showError('Error', 'Failed to update document status');
        }
    };

    const resetForm = () => {
        setFormData({
            type: activeTab,
            title: '',
            description: '',
            publishDate: new Date().toISOString().split('T')[0],
            order: 0,
            isActive: true
        });
        setSelectedFile(null);
        setEditingDoc(null);
    };

    const filteredDocuments = documents.filter(doc => doc.type === activeTab);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    const typeLabels = {
        timetable: 'Time Tables',
        notification: 'Notifications',
        result: 'Results'
    };

    return (
        <div className="space-y-6">
            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {editingDoc ? 'Edit Document' : 'Add New Document'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Document Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                                disabled={!!editingDoc}
                            >
                                <option value="timetable">Time Table</option>
                                <option value="notification">Notification</option>
                                <option value="result">Result</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Display Order
                            </label>
                            <input
                                type="number"
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                min="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Publish Date
                            </label>
                            <input
                                type="date"
                                value={formData.publishDate}
                                onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                PDF File {!editingDoc && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileSelect}
                                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300"
                                required={!editingDoc}
                            />
                            {selectedFile && (
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Selected: {selectedFile.name}
                                </p>
                            )}
                            {editingDoc && !selectedFile && (
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Current: {editingDoc.fileName || 'No file'}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Active
                        </label>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Saving...' : editingDoc ? 'Update Document' : 'Create Document'}
                        </button>
                        {editingDoc && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Documents List by Type */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Documents
                    </h2>
                    <div className="flex space-x-2">
                        {['timetable', 'notification', 'result'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setActiveTab(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === type
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {typeLabels[type]} ({documents.filter(d => d.type === type).length})
                            </button>
                        ))}
                    </div>
                </div>

                {filteredDocuments.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No {typeLabels[activeTab].toLowerCase()} found. Create your first document above.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {filteredDocuments.map((doc) => (
                            <motion.div
                                key={doc._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <i className="fa-solid fa-file-pdf text-red-600 dark:text-red-400"></i>
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                {doc.title}
                                            </h3>
                                            {!doc.isActive && (
                                                <span className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded text-xs">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        {doc.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {doc.description}
                                            </p>
                                        )}
                                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                            <span>Order: {doc.order}</span>
                                            <span>•</span>
                                            <span>
                                                Published: {new Date(doc.publishDate).toLocaleDateString()}
                                            </span>
                                            <span>•</span>
                                            <span>Type: {typeLabels[doc.type]}</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            onClick={() => handleToggleActive(doc)}
                                            className={`px-3 py-1 rounded text-xs ${doc.isActive
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            {doc.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(doc)}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-800"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc._id)}
                                            className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded text-xs hover:bg-red-200 dark:hover:bg-red-800"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuickAccessManagement;

