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

const SliderManagement = () => {
    const [sliders, setSliders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingSlider, setEditingSlider] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        link: '',
        order: 0,
        isActive: true
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchSliders();
    }, []);

    const fetchSliders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/admin/sliders');
            if (response.data.success) {
                setSliders(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching sliders:', error);
            showError('Error', 'Failed to fetch sliders');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showError('Invalid File', 'Please select an image file');
                return;
            }

            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                showError('File Too Large', 'Image size must be less than 10MB');
                return;
            }

            setSelectedFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile && !editingSlider) {
            showError('Missing Image', 'Please upload an image');
            return;
        }

        try {
            setUploading(true);
            showLoading('Processing...', 'Uploading and optimizing image...');

            const formDataToSend = new FormData();

            if (selectedFile) {
                formDataToSend.append('image', selectedFile);
            }

            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description || '');
            formDataToSend.append('link', formData.link || '');
            formDataToSend.append('order', formData.order || 0);
            formDataToSend.append('isActive', formData.isActive);

            let response;
            if (editingSlider) {
                response = await api.put(
                    `/api/admin/sliders/${editingSlider._id}`,
                    formDataToSend,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }
                );
            } else {
                response = await api.post('/api/admin/sliders', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (response.data.success) {
                closeLoading();
                showSuccessToast(editingSlider ? 'Slider updated successfully!' : 'Slider created successfully!');
                resetForm();
                fetchSliders();
            }
        } catch (error) {
            closeLoading();
            console.error('Error saving slider:', error);
            showError('Error', error.response?.data?.message || 'Failed to save slider');
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (slider) => {
        setEditingSlider(slider);
        setFormData({
            title: slider.title || '',
            description: slider.description || '',
            link: slider.link || '',
            order: slider.order || 0,
            isActive: slider.isActive !== false
        });
        setPreviewImage(slider.image?.startsWith('/') ? slider.image : `/api${slider.image}`);
        setSelectedFile(null);
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm(
            'Delete Slider',
            'Are you sure you want to delete this slider? This action cannot be undone.',
            'warning'
        );

        if (!confirmed) return;

        try {
            showLoading('Deleting...', 'Removing slider...');
            const response = await api.delete(`/api/admin/sliders/${id}`);
            if (response.data.success) {
                closeLoading();
                showSuccessToast('Slider deleted successfully!');
                fetchSliders();
            }
        } catch (error) {
            closeLoading();
            console.error('Error deleting slider:', error);
            showError('Error', error.response?.data?.message || 'Failed to delete slider');
        }
    };

    const handleToggleActive = async (slider) => {
        try {
            const response = await api.put(`/api/admin/sliders/${slider._id}`, {
                isActive: !slider.isActive
            });
            if (response.data.success) {
                fetchSliders();
            }
        } catch (error) {
            console.error('Error updating slider:', error);
            showError('Error', 'Failed to update slider status');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            link: '',
            order: 0,
            isActive: true
        });
        setPreviewImage(null);
        setSelectedFile(null);
        setEditingSlider(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start">
                    <i className="fa-solid fa-info-circle text-blue-600 dark:text-blue-400 text-xl mr-3 mt-1"></i>
                    <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Image Guidelines</h3>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            <li>• Recommended dimensions: 1920 x 600 pixels</li>
                            <li>• Supported formats: JPG, PNG, WebP</li>
                            <li>• Maximum file size: 10MB</li>
                            <li>• Images will be automatically resized to 1920x600 and optimized</li>
                            <li>• Images will be uploaded to Cloudinary and auto-compressed</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {editingSlider ? 'Edit Slider' : 'Add New Slider'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Link (Optional)
                        </label>
                        <input
                            type="url"
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="https://example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Image <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300"
                            />
                            {previewImage && (
                                <div className="relative">
                                    <img
                                        src={previewImage}
                                        alt="Preview"
                                        className="h-20 w-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                                    />
                                </div>
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
                            {uploading ? 'Saving...' : editingSlider ? 'Update Slider' : 'Create Slider'}
                        </button>
                        {editingSlider && (
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

            {/* Sliders List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Current Sliders ({sliders.length})
                </h2>

                {sliders.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No sliders found. Create your first slider above.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sliders.map((slider) => (
                            <motion.div
                                key={slider._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="relative">
                                    <img
                                        src={slider.image?.startsWith('/') ? slider.image : `/api${slider.image}`}
                                        alt={slider.title}
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.jpg';
                                        }}
                                    />
                                    {!slider.isActive && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                                            Inactive
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        {slider.title}
                                    </h3>
                                    {slider.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                            {slider.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Order: {slider.order}
                                        </span>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleToggleActive(slider)}
                                                className={`px-2 py-1 rounded text-xs ${slider.isActive
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                {slider.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(slider)}
                                                className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-800"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(slider._id)}
                                                className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded text-xs hover:bg-red-200 dark:hover:bg-red-800"
                                            >
                                                Delete
                                            </button>
                                        </div>
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

export default SliderManagement;

