import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../utils/api';
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
    PhotoIcon,
    GlobeAltIcon,
    Bars3Icon,
    LinkIcon,
    UserGroupIcon,
    TrophyIcon,
    SpeakerWaveIcon,
    DocumentTextIcon,
    CogIcon,
    ArrowUpTrayIcon,
    XMarkIcon,
    CheckIcon
} from '@heroicons/react/24/outline';

const WebsiteManagementSystem = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [activeTab, setActiveTab] = useState('hero');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [websiteContent, setWebsiteContent] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);

    const tabs = [
        { id: 'hero', name: 'Hero Section', icon: PhotoIcon, description: 'Manage carousel and hero content', color: 'blue' },
        { id: 'navigation', name: 'Navigation', icon: Bars3Icon, description: 'Control menu items and links', color: 'purple' },
        { id: 'about', name: 'About Section', icon: DocumentTextIcon, description: 'About us content and team', color: 'green' },
        { id: 'services', name: 'Services', icon: CogIcon, description: 'Services and offerings', color: 'orange' },
        { id: 'gallery', name: 'Gallery', icon: PhotoIcon, description: 'Image galleries and media', color: 'pink' },
        { id: 'testimonials', name: 'Testimonials', icon: SpeakerWaveIcon, description: 'Customer testimonials', color: 'indigo' },
        { id: 'contact', name: 'Contact Info', icon: LinkIcon, description: 'Contact details and social links', color: 'red' },
        { id: 'footer', name: 'Footer', icon: DocumentTextIcon, description: 'Footer content and links', color: 'gray' }
    ];

    // Real-time updates
    useEffect(() => {
        if (socket) {
            const handleWebsiteUpdate = (data) => {
                console.log('Real-time website update:', data);
                loadWebsiteContent();
            };

            socket.on('websiteContentUpdated', handleWebsiteUpdate);
            return () => {
                socket.off('websiteContentUpdated', handleWebsiteUpdate);
            };
        }
    }, [socket]);

    useEffect(() => {
        loadWebsiteContent();
    }, []);

    const loadWebsiteContent = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/website-content');
            if (response.data.success) {
                setWebsiteContent(response.data.data);
            }
        } catch (error) {
            console.error('Error loading website content:', error);
            showError('Failed to load website content');
        } finally {
            setLoading(false);
        }
    };

    const saveWebsiteContent = async (sectionData) => {
        try {
            setSaving(true);
            const response = await api.put('/api/website-content', sectionData);
            if (response.data.success) {
                setWebsiteContent(response.data.data);
                showSuccess('Website content saved successfully!');

                // Emit real-time update
                if (socket) {
                    socket.emit('websiteContentUpdated', { section: activeTab });
                }
            }
        } catch (error) {
            console.error('Error saving website content:', error);
            showError('Error saving website content. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (path, value) => {
        const newContent = { ...websiteContent };
        const keys = path.split('.');
        let current = newContent;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        setWebsiteContent(newContent);
    };

    const handleArrayItemChange = (path, index, field, value) => {
        const newContent = { ...websiteContent };
        const keys = path.split('.');
        let current = newContent;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = [];
            current = current[keys[i]];
        }

        if (!current[index]) current[index] = {};
        current[index][field] = value;
        setWebsiteContent(newContent);
    };

    const addArrayItem = (path, newItem) => {
        const newContent = { ...websiteContent };
        const keys = path.split('.');
        let current = newContent;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = [];
            current = current[keys[i]];
        }

        current.push(newItem);
        setWebsiteContent(newContent);
    };

    const removeArrayItem = (path, index) => {
        const newContent = { ...websiteContent };
        const keys = path.split('.');
        let current = newContent;

        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }

        current.splice(index, 1);
        setWebsiteContent(newContent);
    };

    const renderHeroSection = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Hero Carousel</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage the main carousel images and content</p>
                </div>
                <button
                    onClick={() => addArrayItem('heroCarousel', {
                        image: '',
                        title: '',
                        subtitle: '',
                        buttonText: 'Learn More',
                        buttonLink: '#',
                        order: (websiteContent?.heroCarousel?.length || 0) + 1,
                        isActive: true
                    })}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Slide
                </button>
            </div>

            <div className="space-y-4">
                {(websiteContent?.heroCarousel || []).map((slide, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Slide {index + 1}</h4>
                            <div className="flex items-center space-x-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={slide.isActive || false}
                                        onChange={(e) => handleArrayItemChange('heroCarousel', index, 'isActive', e.target.checked)}
                                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                                </label>
                                <button
                                    onClick={() => removeArrayItem('heroCarousel', index)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Image URL
                                    </label>
                                    <input
                                        type="text"
                                        value={slide.image || ''}
                                        onChange={(e) => handleArrayItemChange('heroCarousel', index, 'image', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={slide.title || ''}
                                        onChange={(e) => handleArrayItemChange('heroCarousel', index, 'title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Welcome to Swagat Odisha"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Subtitle
                                    </label>
                                    <textarea
                                        value={slide.subtitle || ''}
                                        onChange={(e) => handleArrayItemChange('heroCarousel', index, 'subtitle', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Your gateway to quality education..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Button Text
                                    </label>
                                    <input
                                        type="text"
                                        value={slide.buttonText || ''}
                                        onChange={(e) => handleArrayItemChange('heroCarousel', index, 'buttonText', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Get Started"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Button Link
                                    </label>
                                    <input
                                        type="text"
                                        value={slide.buttonLink || ''}
                                        onChange={(e) => handleArrayItemChange('heroCarousel', index, 'buttonLink', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="/admissions"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={slide.order || index + 1}
                                        onChange={(e) => handleArrayItemChange('heroCarousel', index, 'order', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Image Preview */}
                        {slide.image && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Preview
                                </label>
                                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                                    <img
                                        src={slide.image}
                                        alt={slide.title || 'Hero slide'}
                                        className="w-full h-48 object-cover rounded-lg"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                    <div className="hidden text-center text-gray-500 dark:text-gray-400 py-8">
                                        <PhotoIcon className="h-12 w-12 mx-auto mb-2" />
                                        <p>Image not found or invalid URL</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderNavigationSection = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Navigation Menu</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage the main navigation menu items</p>
                </div>
                <button
                    onClick={() => addArrayItem('navigationItems', {
                        name: '',
                        href: '',
                        icon: '',
                        order: (websiteContent?.navigationItems?.length || 0) + 1,
                        isActive: true
                    })}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Menu Item
                </button>
            </div>

            <div className="space-y-4">
                {(websiteContent?.navigationItems || []).map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Menu Item {index + 1}</h4>
                            <div className="flex items-center space-x-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={item.isActive || false}
                                        onChange={(e) => handleArrayItemChange('navigationItems', index, 'isActive', e.target.checked)}
                                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                                </label>
                                <button
                                    onClick={() => removeArrayItem('navigationItems', index)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Menu Name
                                </label>
                                <input
                                    type="text"
                                    value={item.name || ''}
                                    onChange={(e) => handleArrayItemChange('navigationItems', index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Home"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Link URL
                                </label>
                                <input
                                    type="text"
                                    value={item.href || ''}
                                    onChange={(e) => handleArrayItemChange('navigationItems', index, 'href', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="/"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Icon (optional)
                                </label>
                                <input
                                    type="text"
                                    value={item.icon || ''}
                                    onChange={(e) => handleArrayItemChange('navigationItems', index, 'icon', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="home"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    value={item.order || index + 1}
                                    onChange={(e) => handleArrayItemChange('navigationItems', index, 'order', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderAboutSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">About Section</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage the about us content and team information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            About Title
                        </label>
                        <input
                            type="text"
                            value={websiteContent?.aboutSection?.title || ''}
                            onChange={(e) => handleInputChange('aboutSection.title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="About Swagat Odisha"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            About Description
                        </label>
                        <textarea
                            value={websiteContent?.aboutSection?.description || ''}
                            onChange={(e) => handleInputChange('aboutSection.description', e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Write about your institution..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            About Image URL
                        </label>
                        <input
                            type="text"
                            value={websiteContent?.aboutSection?.image || ''}
                            onChange={(e) => handleInputChange('aboutSection.image', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="https://example.com/about-image.jpg"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Mission Statement
                        </label>
                        <textarea
                            value={websiteContent?.aboutSection?.mission || ''}
                            onChange={(e) => handleInputChange('aboutSection.mission', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Our mission is to..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Vision Statement
                        </label>
                        <textarea
                            value={websiteContent?.aboutSection?.vision || ''}
                            onChange={(e) => handleInputChange('aboutSection.vision', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Our vision is to..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderServicesSection = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Services & Offerings</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage your services and what you offer</p>
                </div>
                <button
                    onClick={() => addArrayItem('services', {
                        title: '',
                        description: '',
                        icon: '',
                        image: '',
                        features: [],
                        order: (websiteContent?.services?.length || 0) + 1,
                        isActive: true
                    })}
                    className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Service
                </button>
            </div>

            <div className="space-y-4">
                {(websiteContent?.services || []).map((service, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Service {index + 1}</h4>
                            <div className="flex items-center space-x-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={service.isActive || false}
                                        onChange={(e) => handleArrayItemChange('services', index, 'isActive', e.target.checked)}
                                        className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                                </label>
                                <button
                                    onClick={() => removeArrayItem('services', index)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Service Title
                                    </label>
                                    <input
                                        type="text"
                                        value={service.title || ''}
                                        onChange={(e) => handleArrayItemChange('services', index, 'title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Admission Guidance"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={service.description || ''}
                                        onChange={(e) => handleArrayItemChange('services', index, 'description', e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Describe your service..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Icon (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={service.icon || ''}
                                        onChange={(e) => handleArrayItemChange('services', index, 'icon', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="graduation-cap"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Service Image URL
                                    </label>
                                    <input
                                        type="text"
                                        value={service.image || ''}
                                        onChange={(e) => handleArrayItemChange('services', index, 'image', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="https://example.com/service-image.jpg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={service.order || index + 1}
                                        onChange={(e) => handleArrayItemChange('services', index, 'order', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                {/* Image Preview */}
                                {service.image && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Preview
                                        </label>
                                        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                                            <img
                                                src={service.image}
                                                alt={service.title || 'Service image'}
                                                className="w-full h-32 object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                            <div className="hidden text-center text-gray-500 dark:text-gray-400 py-4">
                                                <PhotoIcon className="h-8 w-8 mx-auto mb-2" />
                                                <p className="text-sm">Image not found</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderGallerySection = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Image Gallery</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage your image galleries and media</p>
                </div>
                <button
                    onClick={() => addArrayItem('gallery', {
                        title: '',
                        image: '',
                        description: '',
                        category: 'general',
                        order: (websiteContent?.gallery?.length || 0) + 1,
                        isActive: true
                    })}
                    className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Image
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(websiteContent?.gallery || []).map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Image {index + 1}</h4>
                                <div className="flex items-center space-x-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={item.isActive || false}
                                            onChange={(e) => handleArrayItemChange('gallery', index, 'isActive', e.target.checked)}
                                            className="mr-1 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                        />
                                        <span className="text-xs text-gray-700 dark:text-gray-300">Active</span>
                                    </label>
                                    <button
                                        onClick={() => removeArrayItem('gallery', index)}
                                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <input
                                        type="text"
                                        value={item.title || ''}
                                        onChange={(e) => handleArrayItemChange('gallery', index, 'title', e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Image title"
                                    />
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        value={item.image || ''}
                                        onChange={(e) => handleArrayItemChange('gallery', index, 'image', e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Image URL"
                                    />
                                </div>

                                <div>
                                    <select
                                        value={item.category || 'general'}
                                        onChange={(e) => handleArrayItemChange('gallery', index, 'category', e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="general">General</option>
                                        <option value="campus">Campus</option>
                                        <option value="events">Events</option>
                                        <option value="students">Students</option>
                                        <option value="faculty">Faculty</option>
                                    </select>
                                </div>

                                {/* Image Preview */}
                                {item.image && (
                                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt={item.title || 'Gallery image'}
                                            className="w-full h-32 object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div className="hidden h-32 items-center justify-center text-gray-500 dark:text-gray-400">
                                            <PhotoIcon className="h-8 w-8" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderTestimonialsSection = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Customer Testimonials</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage customer reviews and testimonials</p>
                </div>
                <button
                    onClick={() => addArrayItem('testimonials', {
                        name: '',
                        position: '',
                        company: '',
                        content: '',
                        image: '',
                        rating: 5,
                        order: (websiteContent?.testimonials?.length || 0) + 1,
                        isActive: true
                    })}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Testimonial
                </button>
            </div>

            <div className="space-y-4">
                {(websiteContent?.testimonials || []).map((testimonial, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Testimonial {index + 1}</h4>
                            <div className="flex items-center space-x-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={testimonial.isActive || false}
                                        onChange={(e) => handleArrayItemChange('testimonials', index, 'isActive', e.target.checked)}
                                        className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                                </label>
                                <button
                                    onClick={() => removeArrayItem('testimonials', index)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Customer Name
                                    </label>
                                    <input
                                        type="text"
                                        value={testimonial.name || ''}
                                        onChange={(e) => handleArrayItemChange('testimonials', index, 'name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Position
                                    </label>
                                    <input
                                        type="text"
                                        value={testimonial.position || ''}
                                        onChange={(e) => handleArrayItemChange('testimonials', index, 'position', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Student"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Company/Institution
                                    </label>
                                    <input
                                        type="text"
                                        value={testimonial.company || ''}
                                        onChange={(e) => handleArrayItemChange('testimonials', index, 'company', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="ABC University"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Testimonial Content
                                    </label>
                                    <textarea
                                        value={testimonial.content || ''}
                                        onChange={(e) => handleArrayItemChange('testimonials', index, 'content', e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Write the testimonial content..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Customer Image URL
                                    </label>
                                    <input
                                        type="text"
                                        value={testimonial.image || ''}
                                        onChange={(e) => handleArrayItemChange('testimonials', index, 'image', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="https://example.com/customer.jpg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Rating (1-5)
                                    </label>
                                    <select
                                        value={testimonial.rating || 5}
                                        onChange={(e) => handleArrayItemChange('testimonials', index, 'rating', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value={1}>1 Star</option>
                                        <option value={2}>2 Stars</option>
                                        <option value={3}>3 Stars</option>
                                        <option value={4}>4 Stars</option>
                                        <option value={5}>5 Stars</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderFooterSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Footer Content</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage footer content and links</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Footer Information</h4>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            About Text
                        </label>
                        <textarea
                            value={websiteContent?.footerContent?.aboutText || ''}
                            onChange={(e) => handleInputChange('footerContent.aboutText', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Brief description about your institution..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Copyright Text
                        </label>
                        <input
                            type="text"
                            value={websiteContent?.footerContent?.copyrightText || ''}
                            onChange={(e) => handleInputChange('footerContent.copyrightText', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="© 2024 Swagat Odisha. All rights reserved."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Disclaimer Text
                        </label>
                        <textarea
                            value={websiteContent?.footerContent?.disclaimerText || ''}
                            onChange={(e) => handleInputChange('footerContent.disclaimerText', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Legal disclaimer text..."
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Quick Links</h4>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Privacy Policy Link
                        </label>
                        <input
                            type="text"
                            value={websiteContent?.footerContent?.privacyPolicyLink || ''}
                            onChange={(e) => handleInputChange('footerContent.privacyPolicyLink', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="/privacy-policy"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Terms of Service Link
                        </label>
                        <input
                            type="text"
                            value={websiteContent?.footerContent?.termsOfServiceLink || ''}
                            onChange={(e) => handleInputChange('footerContent.termsOfServiceLink', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="/terms-of-service"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Contact Page Link
                        </label>
                        <input
                            type="text"
                            value={websiteContent?.footerContent?.contactPageLink || ''}
                            onChange={(e) => handleInputChange('footerContent.contactPageLink', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="/contact"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContactSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contact Information</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage contact details and social media links</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Basic Information</h4>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone Number
                        </label>
                        <input
                            type="text"
                            value={websiteContent?.contactInfo?.phone || ''}
                            onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="+91 9876543210"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={websiteContent?.contactInfo?.email || ''}
                            onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="info@swagatodisha.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Address
                        </label>
                        <textarea
                            value={websiteContent?.contactInfo?.address || ''}
                            onChange={(e) => handleInputChange('contactInfo.address', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Enter your complete address..."
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Social Media Links</h4>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Facebook
                        </label>
                        <input
                            type="url"
                            value={websiteContent?.socialLinks?.facebook || ''}
                            onChange={(e) => handleInputChange('socialLinks.facebook', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="https://facebook.com/swagatodisha"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Instagram
                        </label>
                        <input
                            type="url"
                            value={websiteContent?.socialLinks?.instagram || ''}
                            onChange={(e) => handleInputChange('socialLinks.instagram', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="https://instagram.com/swagatodisha"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            YouTube
                        </label>
                        <input
                            type="url"
                            value={websiteContent?.socialLinks?.youtube || ''}
                            onChange={(e) => handleInputChange('socialLinks.youtube', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="https://youtube.com/swagatodisha"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            LinkedIn
                        </label>
                        <input
                            type="url"
                            value={websiteContent?.socialLinks?.linkedin || ''}
                            onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="https://linkedin.com/company/swagatodisha"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'hero':
                return renderHeroSection();
            case 'navigation':
                return renderNavigationSection();
            case 'about':
                return renderAboutSection();
            case 'services':
                return renderServicesSection();
            case 'gallery':
                return renderGallerySection();
            case 'testimonials':
                return renderTestimonialsSection();
            case 'contact':
                return renderContactSection();
            case 'footer':
                return renderFooterSection();
            default:
                return (
                    <div className="text-center py-12">
                        <div className="text-gray-400 dark:text-gray-600 mb-4">
                            <DocumentTextIcon className="h-16 w-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {tabs.find(tab => tab.id === activeTab)?.name} Management
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            This section is coming soon. We're working on adding more website management features.
                        </p>
                    </div>
                );
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
        <div className="p-6">
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Website Management System
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Control your website's content, images, and sections in real-time
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${previewMode
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <EyeIcon className="h-5 w-5 mr-2" />
                            {previewMode ? 'Exit Preview' : 'Preview Mode'}
                        </button>
                        <button
                            onClick={() => saveWebsiteContent(websiteContent)}
                            disabled={saving}
                            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckIcon className="h-5 w-5 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-1 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const colorClasses = {
                            blue: isActive ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600',
                            purple: isActive ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-600',
                            green: isActive ? 'border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:border-green-300 dark:hover:border-green-600',
                            orange: isActive ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-300 dark:hover:border-orange-600',
                            pink: isActive ? 'border-pink-500 text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-300 dark:hover:border-pink-600',
                            indigo: isActive ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600',
                            red: isActive ? 'border-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-600',
                            gray: isActive ? 'border-gray-500 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                        };

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center rounded-t-lg transition-all duration-200 ${colorClasses[tab.color]
                                    }`}
                                title={tab.description}
                            >
                                <Icon className="h-5 w-5 mr-2" />
                                {tab.name}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderTabContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default WebsiteManagementSystem;
