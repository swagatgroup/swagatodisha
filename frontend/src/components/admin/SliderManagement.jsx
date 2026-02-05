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
import { normalizeImageUrl } from '../../utils/imageUtils';

const SliderManagement = () => {
    const [sliders, setSliders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState({ horizontal: false, vertical: false });
    const [editingSlider, setEditingSlider] = useState(null);
    const [activeSection, setActiveSection] = useState('horizontal'); // 'horizontal' or 'vertical'
    
    // Separate form data for each section
    const [horizontalFormData, setHorizontalFormData] = useState({
        title: '',
        description: '',
        link: '',
        order: 0,
        isActive: true,
        sliderType: 'horizontal'
    });
    
    const [verticalFormData, setVerticalFormData] = useState({
        title: '',
        description: '',
        link: '',
        order: 0,
        isActive: true,
        sliderType: 'vertical'
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

    // Get current form data based on active section
    const getCurrentFormData = () => {
        return activeSection === 'horizontal' ? horizontalFormData : verticalFormData;
    };

    // Set current form data based on active section
    const setCurrentFormData = (data) => {
        if (activeSection === 'horizontal') {
            setHorizontalFormData(data);
        } else {
            setVerticalFormData(data);
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

        const formData = getCurrentFormData();
        const isHorizontal = activeSection === 'horizontal';

        try {
            setUploading(prev => ({ ...prev, [activeSection]: true }));
            showLoading('Processing...', 'Uploading and optimizing image...');

            const formDataToSend = new FormData();

            if (selectedFile) {
                formDataToSend.append('image', selectedFile);
            }

            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description || '');
            formDataToSend.append('link', formData.link || '');
            formDataToSend.append('order', formData.order || 0);
            formDataToSend.append('isActive', formData.isActive ? 'true' : 'false');
            formDataToSend.append('sliderType', isHorizontal ? 'horizontal' : 'vertical');

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
            setUploading(prev => ({ ...prev, [activeSection]: false }));
        }
    };

    const handleEdit = (slider) => {
        setEditingSlider(slider);
        const formData = {
            title: slider.title || '',
            description: slider.description || '',
            link: slider.link || '',
            order: slider.order || 0,
            isActive: slider.isActive !== false,
            sliderType: slider.sliderType || 'horizontal'
        };
        
        // Set the active section based on slider type
        if (slider.sliderType === 'vertical') {
            setActiveSection('vertical');
            setVerticalFormData(formData);
        } else {
            setActiveSection('horizontal');
            setHorizontalFormData(formData);
        }
        
        // Use utility function to normalize image URL
        setPreviewImage(normalizeImageUrl(slider.image));
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
            // Use FormData to match the route expectations
            const formDataToSend = new FormData();
            formDataToSend.append('title', slider.title || '');
            formDataToSend.append('description', slider.description || '');
            formDataToSend.append('link', slider.link || '');
            formDataToSend.append('order', slider.order || 0);
            formDataToSend.append('isActive', (!slider.isActive).toString());
            formDataToSend.append('sliderType', slider.sliderType || 'horizontal');
            
            const response = await api.put(
                `/api/admin/sliders/${slider._id}`,
                formDataToSend,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );
            if (response.data.success) {
                showSuccessToast(`Slider ${!slider.isActive ? 'activated' : 'deactivated'} successfully!`);
                fetchSliders();
            }
        } catch (error) {
            console.error('Error updating slider:', error);
            showError('Error', error.response?.data?.message || 'Failed to update slider status');
        }
    };

    const resetForm = () => {
        if (activeSection === 'horizontal') {
            setHorizontalFormData({
                title: '',
                description: '',
                link: '',
                order: 0,
                isActive: true,
                sliderType: 'horizontal'
            });
        } else {
            setVerticalFormData({
                title: '',
                description: '',
                link: '',
                order: 0,
                isActive: true,
                sliderType: 'vertical'
            });
        }
        setPreviewImage(null);
        setSelectedFile(null);
        setEditingSlider(null);
    };

    // Filter sliders by type
    const horizontalSliders = sliders.filter(s => (s.sliderType || 'horizontal') === 'horizontal');
    const verticalSliders = sliders.filter(s => s.sliderType === 'vertical');

    // Render form for a specific section
    const renderForm = (sectionType) => {
        const formData = sectionType === 'horizontal' ? horizontalFormData : verticalFormData;
        const setFormData = sectionType === 'horizontal' ? setHorizontalFormData : setVerticalFormData;
        const isActive = activeSection === sectionType;
        const isUploading = uploading[sectionType];

        return (
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 ${!isActive ? 'hidden' : ''}`}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {sectionType === 'horizontal' ? '🖥️ Horizontal Slider' : '📱 Vertical Slider'}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                        ({sectionType === 'horizontal' ? 'For screens above 1000px width' : 'For screens below 1000px width'})
                    </span>
                </h2>

                {editingSlider && editingSlider.sliderType === sectionType && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <i className="fa-solid fa-edit mr-2"></i>
                            Editing: {editingSlider.title}
                        </p>
                    </div>
                )}

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
                            id={`isActive-${sectionType}`}
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`isActive-${sectionType}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Active
                        </label>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? 'Saving...' : editingSlider && editingSlider.sliderType === sectionType ? 'Update Slider' : 'Create Slider'}
                        </button>
                        {editingSlider && editingSlider.sliderType === sectionType && (
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
        );
    };

    // Render slider list for a specific section
    const renderSliderList = (sectionType, slidersList) => {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {sectionType === 'horizontal' ? '🖥️ Horizontal Sliders' : '📱 Vertical Sliders'} ({slidersList.length})
                </h2>

                {slidersList.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No {sectionType} sliders found. Create your first {sectionType} slider above.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {slidersList.map((slider) => (
                            <motion.div
                                key={slider._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="relative">
                                    <img
                                        src={normalizeImageUrl(slider.image)}
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
                                    <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded text-xs">
                                        {slider.sliderType === 'vertical' ? '📱 Vertical' : '🖥️ Horizontal'}
                                    </div>
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
        );
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
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Slider Guidelines</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
                            <div>
                                <h4 className="font-semibold mb-1">🖥️ Horizontal Sliders (Desktop &gt;1000px)</h4>
                                <ul className="space-y-1">
                                    <li>• Recommended: 1920 x 1080 pixels</li>
                                    <li>• Covers full screen height (100vh)</li>
                                    <li>• Activated above 1000px viewport width</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">📱 Vertical Sliders (Mobile/Tablet &lt;1000px)</h4>
                                <ul className="space-y-1">
                                    <li>• Recommended: 600 x 840 pixels</li>
                                    <li>• Covers 70vh height</li>
                                    <li>• Activated below 1000px viewport width</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-3 text-sm">
                            <p>• Supported formats: JPG, PNG, WebP</p>
                            <p>• Maximum file size: 10MB</p>
                            <p>• Images will be automatically resized and optimized</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => {
                                if (editingSlider && editingSlider.sliderType !== 'horizontal') {
                                    resetForm();
                                }
                                setActiveSection('horizontal');
                            }}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeSection === 'horizontal'
                                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <i className="fa-solid fa-desktop mr-2"></i>
                            Horizontal Sliders (Desktop)
                        </button>
                        <button
                            onClick={() => {
                                if (editingSlider && editingSlider.sliderType !== 'vertical') {
                                    resetForm();
                                }
                                setActiveSection('vertical');
                            }}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeSection === 'vertical'
                                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <i className="fa-solid fa-mobile-screen-button mr-2"></i>
                            Vertical Sliders (Mobile/Tablet)
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {/* Horizontal Slider Form */}
                    {renderForm('horizontal')}
                    
                    {/* Vertical Slider Form */}
                    {renderForm('vertical')}
                </div>
            </div>

            {/* Horizontal Sliders List */}
            {renderSliderList('horizontal', horizontalSliders)}

            {/* Vertical Sliders List */}
            {renderSliderList('vertical', verticalSliders)}
        </div>
    );
};

export default SliderManagement;
