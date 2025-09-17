import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';

const GalleryManagement = () => {
    const { user } = useAuth();
    const [galleryItems, setGalleryItems] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        institution: '',
        search: ''
    });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        alt: '',
        imageUrl: '',
        thumbnailUrl: '',
        originalFileName: '',
        fileSize: 0,
        mimeType: '',
        dimensions: {
            width: 0,
            height: 0
        },
        category: 'General',
        subcategory: '',
        tags: [],
        institution: '',
        course: '',
        isActive: true,
        isFeatured: false,
        displayOrder: 0,
        showOnHomepage: false,
        album: {
            name: '',
            description: '',
            coverImage: false
        },
        seoTitle: '',
        seoDescription: '',
        seoKeywords: []
    });

    const categories = [
        'Infrastructure', 'Classroom', 'Laboratory', 'Library', 'Sports',
        'Events', 'Students', 'Teachers', 'Achievements', 'General'
    ];

    const imageTypes = [
        'main', 'gallery', 'infrastructure', 'classroom', 'lab', 'library', 'sports'
    ];

    useEffect(() => {
        loadGalleryItems();
        loadInstitutions();
    }, []);

    const loadGalleryItems = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/gallery', {
                params: {
                    category: filters.category || undefined,
                    institution: filters.institution || undefined,
                    search: filters.search || undefined
                }
            });
            if (response.data.success) {
                setGalleryItems(response.data.data.galleryItems || []);
            }
        } catch (error) {
            console.error('Error loading gallery items:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadInstitutions = async () => {
        try {
            const response = await api.get('/api/admin/staff');
            if (response.data.success) {
                setInstitutions(response.data.data.institutions || []);
            }
        } catch (error) {
            console.error('Error loading institutions:', error);
        }
    };

    const saveGalleryItem = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const url = editingItem ? `/api/gallery/${editingItem._id}` : '/api/gallery';
            const method = editingItem ? 'put' : 'post';

            const response = await api[method](url, formData);
            if (response.data.success) {
                alert(editingItem ? 'Gallery item updated successfully!' : 'Gallery item created successfully!');
                setShowForm(false);
                setEditingItem(null);
                resetForm();
                loadGalleryItems();
            }
        } catch (error) {
            console.error('Error saving gallery item:', error);
            alert('Error saving gallery item. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const editGalleryItem = (item) => {
        setEditingItem(item);
        setFormData({
            ...item,
            tags: item.tags || [],
            seoKeywords: item.seoKeywords || []
        });
        setShowForm(true);
    };

    const deleteGalleryItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this gallery item?')) return;

        try {
            const response = await api.delete(`/api/gallery/${itemId}`);
            if (response.data.success) {
                alert('Gallery item deleted successfully!');
                loadGalleryItems();
            }
        } catch (error) {
            console.error('Error deleting gallery item:', error);
            alert('Error deleting gallery item. Please try again.');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            alt: '',
            imageUrl: '',
            thumbnailUrl: '',
            originalFileName: '',
            fileSize: 0,
            mimeType: '',
            dimensions: {
                width: 0,
                height: 0
            },
            category: 'General',
            subcategory: '',
            tags: [],
            institution: '',
            course: '',
            isActive: true,
            isFeatured: false,
            displayOrder: 0,
            showOnHomepage: false,
            album: {
                name: '',
                description: '',
                coverImage: false
            },
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

    const filteredGalleryItems = galleryItems.filter(item => {
        const matchesSearch = !filters.search ||
            item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            item.description.toLowerCase().includes(filters.search.toLowerCase());

        const matchesCategory = !filters.category || item.category === filters.category;
        const matchesInstitution = !filters.institution || item.institution === filters.institution;

        return matchesSearch && matchesCategory && matchesInstitution;
    });

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 Bytes';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gallery Management</h2>
                <button
                    onClick={() => {
                        resetForm();
                        setEditingItem(null);
                        setShowForm(true);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                    Add New Image
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Search gallery..."
                        />
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Institution</label>
                        <select
                            value={filters.institution}
                            onChange={(e) => setFilters(prev => ({ ...prev, institution: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        >
                            <option value="">All Institutions</option>
                            {institutions.map(institution => (
                                <option key={institution._id} value={institution._id}>{institution.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={loadGalleryItems}
                            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Gallery Items ({filteredGalleryItems.length})
                    </h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredGalleryItems.map((item, index) => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="aspect-w-16 aspect-h-9">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.alt || item.title}
                                        className="w-full h-48 object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.title}</h4>
                                        <div className="flex space-x-1">
                                            {item.isFeatured && (
                                                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full">
                                                    Featured
                                                </span>
                                            )}
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                }`}>
                                                {item.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{item.category}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{item.description}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>{formatFileSize(item.fileSize)}</span>
                                        <span>Views: {item.views || 0}</span>
                                    </div>
                                    <div className="flex space-x-2 mt-3">
                                        <button
                                            onClick={() => editGalleryItem(item)}
                                            className="flex-1 px-2 py-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteGalleryItem(item._id)}
                                            className="flex-1 px-2 py-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-xs font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gallery Item Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingItem(null);
                                        resetForm();
                                    }}
                                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={saveGalleryItem} className="space-y-6">
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
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => handleInputChange('category', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            required
                                        >
                                            {categories.map(category => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URL *</label>
                                        <input
                                            type="url"
                                            value={formData.imageUrl}
                                            onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thumbnail URL</label>
                                        <input
                                            type="url"
                                            value={formData.thumbnailUrl}
                                            onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alt Text</label>
                                        <input
                                            type="text"
                                            value={formData.alt}
                                            onChange={(e) => handleInputChange('alt', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subcategory</label>
                                        <input
                                            type="text"
                                            value={formData.subcategory}
                                            onChange={(e) => handleInputChange('subcategory', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    />
                                </div>

                                {/* File Information */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">File Size (bytes)</label>
                                        <input
                                            type="number"
                                            value={formData.fileSize}
                                            onChange={(e) => handleInputChange('fileSize', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Width (px)</label>
                                        <input
                                            type="number"
                                            value={formData.dimensions.width}
                                            onChange={(e) => handleInputChange('dimensions.width', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Height (px)</label>
                                        <input
                                            type="number"
                                            value={formData.dimensions.height}
                                            onChange={(e) => handleInputChange('dimensions.height', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                </div>

                                {/* Tags and Keywords */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags (comma separated)</label>
                                        <input
                                            type="text"
                                            value={formData.tags.join(', ')}
                                            onChange={(e) => handleArrayChange('tags', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            placeholder="tag1, tag2, tag3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SEO Keywords (comma separated)</label>
                                        <input
                                            type="text"
                                            value={formData.seoKeywords.join(', ')}
                                            onChange={(e) => handleArrayChange('seoKeywords', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            placeholder="keyword1, keyword2, keyword3"
                                        />
                                    </div>
                                </div>

                                {/* Album Information */}
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Album Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Album Name</label>
                                            <input
                                                type="text"
                                                value={formData.album.name}
                                                onChange={(e) => handleInputChange('album.name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Album Description</label>
                                            <input
                                                type="text"
                                                value={formData.album.description}
                                                onChange={(e) => handleInputChange('album.description', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.album.coverImage}
                                                    onChange={(e) => handleInputChange('album.coverImage', e.target.checked)}
                                                    className="mr-2"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Use as Album Cover Image</span>
                                            </label>
                                        </div>
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

                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                                        </label>

                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.isFeatured}
                                                onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
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
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingItem(null);
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
                                        {saving ? 'Saving...' : (editingItem ? 'Update Item' : 'Create Item')}
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

export default GalleryManagement;
