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

const SimpleQuickAccessManagement = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [activeCategory, setActiveCategory] = useState('timetable');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        type: 'timetable',
        title: '',
        description: '',
        publishDate: new Date().toISOString().split('T')[0],
        order: 0,
        isActive: true
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const categories = [
        { id: 'timetable', name: 'Time Tables', icon: 'fa-solid fa-calendar-days', color: 'purple' },
        { id: 'career', name: 'Career Roadmaps', icon: 'fa-solid fa-route', color: 'blue' },
        { id: 'result', name: 'Results', icon: 'fa-solid fa-chart-line', color: 'orange' }
    ];

    useEffect(() => {
        fetchDocuments();
    }, [activeCategory]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/admin/quick-access');
            if (response.data.success) {
                const allDocs = response.data.data || [];
                // Filter by active category
                const filtered = activeCategory 
                    ? allDocs.filter(doc => doc.type === activeCategory)
                    : allDocs;
                setDocuments(filtered);
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile && !editingDoc) {
            showError('Missing File', 'Please upload a file');
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
                response = await api.post(
                    '/api/admin/quick-access',
                    formDataToSend,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }
                );
            }

            if (response.data.success) {
                showSuccess('Success', editingDoc ? 'Document updated successfully!' : 'Document uploaded successfully!');
                setShowForm(false);
                setEditingDoc(null);
                setSelectedFile(null);
                resetForm();
                fetchDocuments();
            }
        } catch (error) {
            console.error('Error saving document:', error);
            showError('Error', 'Failed to save document');
        } finally {
            setUploading(false);
            closeLoading();
        }
    };

    const handleEdit = (doc) => {
        setFormData({
            type: doc.type || 'timetable',
            title: doc.title || '',
            description: doc.description || '',
            publishDate: doc.publishDate 
                ? new Date(doc.publishDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
            order: doc.order || 0,
            isActive: doc.isActive !== undefined ? doc.isActive : true
        });
        setEditingDoc(doc);
        setActiveCategory(doc.type);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm(
            'Delete Document',
            'Are you sure you want to delete this document?',
            'warning'
        );

        if (confirmed) {
            try {
                showLoading('Deleting document...');
                const response = await api.delete(`/api/admin/quick-access/${id}`);
                if (response.data.success) {
                    showSuccess('Success', 'Document deleted successfully!');
                    fetchDocuments();
                }
            } catch (error) {
                console.error('Error deleting document:', error);
                showError('Error', 'Failed to delete document');
            } finally {
                closeLoading();
            }
        }
    };

    const resetForm = () => {
        setFormData({
            type: activeCategory,
            title: '',
            description: '',
            publishDate: new Date().toISOString().split('T')[0],
            order: 0,
            isActive: true
        });
        setEditingDoc(null);
        setSelectedFile(null);
    };

    const filteredDocuments = documents.filter(doc => doc.type === activeCategory);

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
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Quick Access Documents</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage Time Tables, Career Roadmaps, and Results documents
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
                    Add Document
                </button>
            </div>

            {/* Category Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex space-x-4">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => {
                                setActiveCategory(category.id);
                                setFormData(prev => ({ ...prev, type: category.id }));
                            }}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                activeCategory === category.id
                                    ? `bg-${category.color}-100 text-${category.color}-700 dark:bg-${category.color}-900 dark:text-${category.color}-300`
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            <i className={`${category.icon} ${activeCategory === category.id ? 'text-lg' : ''}`}></i>
                            <span className="font-medium">{category.name}</span>
                            <span className={`px-2 py-0.5 text-xs rounded ${
                                activeCategory === category.id
                                    ? `bg-${category.color}-200 text-${category.color}-800 dark:bg-${category.color}-800 dark:text-${category.color}-200`
                                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                                {documents.filter(d => d.type === category.id).length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                        {editingDoc ? 'Edit Document' : 'Add New Document'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Category *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

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
                                placeholder="Enter document title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="Enter document description"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {editingDoc ? 'Update File (optional)' : 'Upload File *'}
                            </label>
                            <input
                                type="file"
                                required={!editingDoc}
                                onChange={handleFileSelect}
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Supported formats: PDF, JPG, PNG (Max 10MB)
                            </p>
                            {editingDoc && editingDoc.filePath && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    Current: <a href={editingDoc.filePath} target="_blank" rel="noopener noreferrer" className="underline">View current file</a>
                                </p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Active (visible on website)
                            </label>
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
                                disabled={uploading}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : editingDoc ? 'Update' : 'Upload'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Documents List */}
            {!showForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    {filteredDocuments.length === 0 ? (
                        <div className="text-center py-12">
                            <i className={`${categories.find(c => c.id === activeCategory)?.icon} text-4xl text-gray-400 mb-4`}></i>
                            <p className="text-gray-500 dark:text-gray-400">No {categories.find(c => c.id === activeCategory)?.name.toLowerCase()} found</p>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowForm(true);
                                }}
                                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Add First Document
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredDocuments.map((doc) => (
                                <motion.div
                                    key={doc._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {doc.title}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs rounded ${
                                                    doc.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                    {doc.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            {doc.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    {doc.description}
                                                </p>
                                            )}
                                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                                {doc.filePath && (
                                                    <a
                                                        href={doc.filePath}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                                    >
                                                        <i className="fa-solid fa-file-pdf mr-1"></i>
                                                        View Document
                                                    </a>
                                                )}
                                                {doc.publishDate && (
                                                    <span>
                                                        <i className="fa-solid fa-calendar mr-1"></i>
                                                        {new Date(doc.publishDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                                <span>
                                                    <i className="fa-solid fa-sort mr-1"></i>
                                                    Order: {doc.order || 0}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 ml-4">
                                            <button
                                                onClick={() => handleEdit(doc)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <i className="fa-solid fa-edit"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doc._id)}
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

export default SimpleQuickAccessManagement;

