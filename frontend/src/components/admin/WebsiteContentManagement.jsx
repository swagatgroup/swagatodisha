import {useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';

// Icon components
const GlobeIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
    </svg>
);

const EditIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const SaveIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);

const UploadIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const SettingsIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const UsersIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
);

const BookOpenIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const BarChartIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const FileTextIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const RefreshIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

const PlusIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

const TrashIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const EyeIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
import {
    showSuccess,
    showError,
    showConfirm,
    showLoading,
    closeLoading,
    handleApiError
} from '../../utils/sweetAlert';

const WebsiteContentManagement = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('hero');
    const [editingSection, setEditingSection] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        fetchWebsiteSettings();
    }, []);

    const fetchWebsiteSettings = async () => {
        try {
            setLoading(true);
            showLoading('Loading website settings...');

            const response = await api.get('/api/admin/website-settings');

            if (response.data.success) {
                setSettings(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to load website settings');
            }

            closeLoading();
        } catch (error) {
            console.error('Error fetching website settings:', error);
            closeLoading();
            handleApiError(error, 'Failed to load website settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (sectionData) => {
        try {
            setSaving(true);
            showLoading('Saving changes...');

            const response = await api.put('/api/admin/website-settings', sectionData);

            if (response.data.success) {
                closeLoading();
                showSuccess('Settings saved successfully!');
                setEditingSection(null);
                await fetchWebsiteSettings(); // Refresh data
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            closeLoading();
            handleApiError(error, 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (file, imageType) => {
        try {
            setUploadingImage(true);
            showLoading('Uploading image...');

            const formData = new FormData();
            formData.append('image', file);
            formData.append('imageType', imageType);

            const response = await api.post('/api/admin/upload-website-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                closeLoading();
                showSuccess('Image uploaded successfully!');
                await fetchWebsiteSettings(); // Refresh data
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            closeLoading();
            handleApiError(error, 'Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const addArrayItem = (section, field, newItem) => {
        const updatedSettings = { ...settings };
        if (!updatedSettings[section][field]) {
            updatedSettings[section][field] = [];
        }
        updatedSettings[section][field].push(newItem);
        setSettings(updatedSettings);
    };

    const removeArrayItem = (section, field, index) => {
        const updatedSettings = { ...settings };
        updatedSettings[section][field].splice(index, 1);
        setSettings(updatedSettings);
    };

    const updateArrayItem = (section, field, index, updatedItem) => {
        const updatedSettings = { ...settings };
        updatedSettings[section][field][index] = { ...updatedSettings[section][field][index], ...updatedItem };
        setSettings(updatedSettings);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Failed to load website settings</p>
            </div>
        );
    }

    const tabs = [
        { id: 'hero', label: 'Hero Section', icon: <GlobeIcon className="h-4 w-4" /> },
        { id: 'about', label: 'About Section', icon: <UsersIcon className="h-4 w-4" /> },
        { id: 'programs', label: 'Academic Programs', icon: <BookOpenIcon className="h-4 w-4" /> },
        { id: 'admission', label: 'Admission Info', icon: <FileTextIcon className="h-4 w-4" /> },
        { id: 'contact', label: 'Contact Info', icon: <SettingsIcon className="h-4 w-4" /> },
        { id: 'seo', label: 'SEO Settings', icon: <BarChartIcon className="h-4 w-4" /> },
        { id: 'system', label: 'System Settings', icon: <SettingsIcon className="h-4 w-4" /> }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Website Content Management</h2>
                        <p className="text-gray-600 dark:text-gray-300">Manage Website Content, settings, and appearance</p>
                    </div>
                    <button
                        onClick={fetchWebsiteSettings}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshIcon className="h-4 w-4 mr-2 inline" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 dark:border-gray-700">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center space-x-2 ${activeTab === tab.id
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300'
                                    }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Hero Section */}
                    {activeTab === 'hero' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Hero Section</h3>
                                <button
                                    onClick={() => setEditingSection(editingSection === 'hero' ? null : 'hero')}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    {editingSection === 'hero' ? <EyeIcon className="h-4 w-4 mr-2 inline" /> : <EditIcon className="h-4 w-4 mr-2 inline" />}
                                    {editingSection === 'hero' ? 'Preview' : 'Edit'}
                                </button>
                            </div>

                            {editingSection === 'hero' ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={settings.heroSection.title}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    heroSection: { ...settings.heroSection, title: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
                                            <textarea
                                                value={settings.heroSection.subtitle}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    heroSection: { ...settings.heroSection, subtitle: e.target.value }
                                                })}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA Text</label>
                                            <input
                                                type="text"
                                                value={settings.heroSection.ctaText}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    heroSection: { ...settings.heroSection, ctaText: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA Link</label>
                                            <input
                                                type="text"
                                                value={settings.heroSection.ctaLink}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    heroSection: { ...settings.heroSection, ctaLink: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background Image</label>
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    value={settings.heroSection.backgroundImage}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        heroSection: { ...settings.heroSection, backgroundImage: e.target.value }
                                                    })}
                                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        if (e.target.files[0]) {
                                                            handleImageUpload(e.target.files[0], 'heroBackground');
                                                        }
                                                    }}
                                                    className="hidden"
                                                    id="hero-bg-upload"
                                                />
                                                <label
                                                    htmlFor="hero-bg-upload"
                                                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 cursor-pointer"
                                                >
                                                    <UploadIcon className="h-4 w-4" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900">Preview</h4>
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                                            <div
                                                className="h-64 rounded-lg bg-cover bg-center flex items-center justify-center text-white text-center"
                                                style={{ backgroundImage: `url(${settings.heroSection.backgroundImage})` }}
                                            >
                                                <div>
                                                    <h1 className="text-2xl font-bold mb-2">{settings.heroSection.title}</h1>
                                                    <p className="text-lg mb-4">{settings.heroSection.subtitle}</p>
                                                    <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                                        {settings.heroSection.ctaText}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <p><strong>Title:</strong> {settings.heroSection.title}</p>
                                        <p><strong>Subtitle:</strong> {settings.heroSection.subtitle}</p>
                                        <p><strong>CTA Text:</strong> {settings.heroSection.ctaText}</p>
                                        <p><strong>CTA Link:</strong> {settings.heroSection.ctaLink}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p><strong>Background Image:</strong></p>
                                        <img
                                            src={settings.heroSection.backgroundImage}
                                            alt="Hero background"
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                    </div>
                                </div>
                            )}

                            {editingSection === 'hero' && (
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setEditingSection(null)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 dark:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleSave({ heroSection: settings.heroSection })}
                                        disabled={saving}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        <SaveIcon className="h-4 w-4 mr-2 inline" />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* About Section */}
                    {activeTab === 'about' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">About Section</h3>
                                <button
                                    onClick={() => setEditingSection(editingSection === 'about' ? null : 'about')}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    {editingSection === 'about' ? <EyeIcon className="h-4 w-4 mr-2 inline" /> : <EditIcon className="h-4 w-4 mr-2 inline" />}
                                    {editingSection === 'about' ? 'Preview' : 'Edit'}
                                </button>
                            </div>

                            {editingSection === 'about' ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={settings.aboutSection.title}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    aboutSection: { ...settings.aboutSection, title: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                            <textarea
                                                value={settings.aboutSection.description}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    aboutSection: { ...settings.aboutSection, description: e.target.value }
                                                })}
                                                rows={4}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    value={settings.aboutSection.image}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        aboutSection: { ...settings.aboutSection, image: e.target.value }
                                                    })}
                                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        if (e.target.files[0]) {
                                                            handleImageUpload(e.target.files[0], 'aboutImage');
                                                        }
                                                    }}
                                                    className="hidden"
                                                    id="about-img-upload"
                                                />
                                                <label
                                                    htmlFor="about-img-upload"
                                                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 cursor-pointer"
                                                >
                                                    <UploadIcon className="h-4 w-4" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900">Preview</h4>
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                                            <h3 className="text-xl font-bold mb-2">{settings.aboutSection.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-300 mb-4">{settings.aboutSection.description}</p>
                                            <img
                                                src={settings.aboutSection.image}
                                                alt="About section"
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <p><strong>Title:</strong> {settings.aboutSection.title}</p>
                                        <p><strong>Description:</strong> {settings.aboutSection.description}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p><strong>Image:</strong></p>
                                        <img
                                            src={settings.aboutSection.image}
                                            alt="About section"
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                    </div>
                                </div>
                            )}

                            {editingSection === 'about' && (
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setEditingSection(null)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 dark:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleSave({ aboutSection: settings.aboutSection })}
                                        disabled={saving}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        <SaveIcon className="h-4 w-4 mr-2 inline" />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Contact Information */}
                    {activeTab === 'contact' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contact Information</h3>
                                <button
                                    onClick={() => setEditingSection(editingSection === 'contact' ? null : 'contact')}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    {editingSection === 'contact' ? <EyeIcon className="h-4 w-4 mr-2 inline" /> : <EditIcon className="h-4 w-4 mr-2 inline" />}
                                    {editingSection === 'contact' ? 'Preview' : 'Edit'}
                                </button>
                            </div>

                            {editingSection === 'contact' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                            <input
                                                type="text"
                                                value={settings.contactInfo.phone}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    contactInfo: { ...settings.contactInfo, phone: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp</label>
                                            <input
                                                type="text"
                                                value={settings.contactInfo.whatsapp}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    contactInfo: { ...settings.contactInfo, whatsapp: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={settings.contactInfo.email}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    contactInfo: { ...settings.contactInfo, email: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                            <textarea
                                                value={settings.contactInfo.address}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    contactInfo: { ...settings.contactInfo, address: e.target.value }
                                                })}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900">Preview</h4>
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                                            <div className="space-y-3">
                                                <div className="flex items-center">
                                                    <span className="font-medium w-20">Phone:</span>
                                                    <span>{settings.contactInfo.phone}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="font-medium w-20">WhatsApp:</span>
                                                    <span>{settings.contactInfo.whatsapp}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="font-medium w-20">Email:</span>
                                                    <span>{settings.contactInfo.email}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="font-medium w-20">Address:</span>
                                                    <span>{settings.contactInfo.address}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <p><strong>Phone:</strong> {settings.contactInfo.phone}</p>
                                        <p><strong>WhatsApp:</strong> {settings.contactInfo.whatsapp}</p>
                                        <p><strong>Email:</strong> {settings.contactInfo.email}</p>
                                        <p><strong>Address:</strong> {settings.contactInfo.address}</p>
                                    </div>
                                </div>
                            )}

                            {editingSection === 'contact' && (
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setEditingSection(null)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 dark:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleSave({ contactInfo: settings.contactInfo })}
                                        disabled={saving}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        <SaveIcon className="h-4 w-4 mr-2 inline" />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* System Settings */}
                    {activeTab === 'system' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">System Settings</h3>
                                <button
                                    onClick={() => setEditingSection(editingSection === 'system' ? null : 'system')}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    {editingSection === 'system' ? <EyeIcon className="h-4 w-4 mr-2 inline" /> : <EditIcon className="h-4 w-4 mr-2 inline" />}
                                    {editingSection === 'system' ? 'Preview' : 'Edit'}
                                </button>
                            </div>

                            {editingSection === 'system' ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Maintenance Mode</label>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.systemSettings.maintenanceMode}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        systemSettings: { ...settings.systemSettings, maintenanceMode: e.target.checked }
                                                    })}
                                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Registration</label>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.systemSettings.allowRegistration}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        systemSettings: { ...settings.systemSettings, allowRegistration: e.target.checked }
                                                    })}
                                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Agent Registration</label>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.systemSettings.allowAgentRegistration}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        systemSettings: { ...settings.systemSettings, allowAgentRegistration: e.target.checked }
                                                    })}
                                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Require Email Verification</label>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.systemSettings.requireEmailVerification}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        systemSettings: { ...settings.systemSettings, requireEmailVerification: e.target.checked }
                                                    })}
                                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max File Size (bytes)</label>
                                                <input
                                                    type="number"
                                                    value={settings.systemSettings.maxFileSize}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        systemSettings: { ...settings.systemSettings, maxFileSize: parseInt(e.target.value) }
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allowed File Types</label>
                                                <input
                                                    type="text"
                                                    value={settings.systemSettings.allowedFileTypes.join(', ')}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        systemSettings: {
                                                            ...settings.systemSettings,
                                                            allowedFileTypes: e.target.value.split(',').map(type => type.trim())
                                                        }
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <p><strong>Maintenance Mode:</strong> {settings.systemSettings.maintenanceMode ? 'Enabled' : 'Disabled'}</p>
                                        <p><strong>Allow Registration:</strong> {settings.systemSettings.allowRegistration ? 'Yes' : 'No'}</p>
                                        <p><strong>Allow Agent Registration:</strong> {settings.systemSettings.allowAgentRegistration ? 'Yes' : 'No'}</p>
                                        <p><strong>Require Email Verification:</strong> {settings.systemSettings.requireEmailVerification ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p><strong>Max File Size:</strong> {(settings.systemSettings.maxFileSize / 1024 / 1024).toFixed(2)} MB</p>
                                        <p><strong>Allowed File Types:</strong> {settings.systemSettings.allowedFileTypes.join(', ')}</p>
                                    </div>
                                </div>
                            )}

                            {editingSection === 'system' && (
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setEditingSection(null)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 dark:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleSave({ systemSettings: settings.systemSettings })}
                                        disabled={saving}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        <SaveIcon className="h-4 w-4 mr-2 inline" />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Placeholder for other tabs */}
                    {['programs', 'admission', 'seo'].includes(activeTab) && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                {activeTab === 'programs' && <BookOpenIcon className="h-12 w-12 mx-auto" />}
                                {activeTab === 'admission' && <FileTextIcon className="h-12 w-12 mx-auto" />}
                                {activeTab === 'seo' && <BarChartIcon className="h-12 w-12 mx-auto" />}
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {activeTab === 'programs' && 'Academic Programs Management'}
                                {activeTab === 'admission' && 'Admission Information Management'}
                                {activeTab === 'seo' && 'SEO Settings Management'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">This section will be implemented in the next phase.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WebsiteContentManagement;
