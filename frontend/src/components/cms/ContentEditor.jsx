import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { showSuccess, showError } from '../../utils/sweetAlert';
import {
    DocumentTextIcon,
    PhotoIcon,
    EyeIcon,
    CodeBracketIcon,
    LinkIcon,
    CalendarIcon,
    TagIcon,
    StarIcon,
    GlobeAltIcon,
    ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

const ContentEditor = ({ content, onSave, onCancel }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        type: 'page',
        category: 'general',
        content: '',
        excerpt: '',
        metaTitle: '',
        metaDescription: '',
        keywords: [],
        isPublished: false,
        isFeatured: false,
        isSticky: false,
        visibility: 'draft',
        template: 'default',
        layout: 'standard',
        allowComments: true,
        featuredImage: {
            url: '',
            alt: '',
            caption: ''
        },
        images: [],
        customFields: {}
    });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('content');
    const [previewMode, setPreviewMode] = useState(false);

    useEffect(() => {
        if (content) {
            setFormData({
                title: content.title || '',
                slug: content.slug || '',
                type: content.type || 'page',
                category: content.category || 'general',
                content: content.content || '',
                excerpt: content.excerpt || '',
                metaTitle: content.metaTitle || '',
                metaDescription: content.metaDescription || '',
                keywords: content.keywords || [],
                isPublished: content.isPublished || false,
                isFeatured: content.isFeatured || false,
                isSticky: content.isSticky || false,
                visibility: content.visibility || 'draft',
                template: content.template || 'default',
                layout: content.layout || 'standard',
                allowComments: content.allowComments !== false,
                featuredImage: content.featuredImage || { url: '', alt: '', caption: '' },
                images: content.images || [],
                customFields: content.customFields || {}
            });
        }
    }, [content]);

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleKeywordsChange = (value) => {
        const keywords = value.split(',').map(k => k.trim()).filter(k => k);
        setFormData(prev => ({ ...prev, keywords }));
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    };

    const handleTitleChange = (value) => {
        setFormData(prev => ({
            ...prev,
            title: value,
            slug: prev.slug || generateSlug(value)
        }));
    };

    const handleSave = async (publish = false) => {
        try {
            setLoading(true);

            const dataToSave = {
                ...formData,
                isPublished: publish ? true : formData.isPublished,
                visibility: publish ? 'public' : formData.visibility
            };

            let response;
            if (content) {
                response = await api.put(`/api/cms/${content._id}`, dataToSave);
            } else {
                response = await api.post('/api/cms', dataToSave);
            }

            if (response.data.success) {
                showSuccess(publish ? 'Content published successfully!' : 'Content saved successfully!');
                onSave(response.data.data);
            }
        } catch (error) {
            console.error('Error saving content:', error);
            showError('Failed to save content');
        } finally {
            setLoading(false);
        }
    };

    const renderTabs = () => (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
                {[
                    { id: 'content', label: 'Content', icon: DocumentTextIcon },
                    { id: 'seo', label: 'SEO', icon: GlobeAltIcon },
                    { id: 'media', label: 'Media', icon: PhotoIcon },
                    { id: 'settings', label: 'Settings', icon: CodeBracketIcon }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        <tab.icon className="h-5 w-5 mr-2" />
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );

    const renderContentTab = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                </label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter content title"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Slug *
                </label>
                <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                        /
                    </span>
                    <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="content-slug"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type *
                    </label>
                    <select
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                        <option value="page">Page</option>
                        <option value="section">Section</option>
                        <option value="announcement">Announcement</option>
                        <option value="news">News</option>
                        <option value="event">Event</option>
                        <option value="gallery">Gallery</option>
                        <option value="course">Course</option>
                        <option value="institution">Institution</option>
                        <option value="testimonial">Testimonial</option>
                        <option value="faq">FAQ</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category *
                    </label>
                    <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                        <option value="general">General</option>
                        <option value="home">Home</option>
                        <option value="about">About</option>
                        <option value="admissions">Admissions</option>
                        <option value="academics">Academics</option>
                        <option value="institutions">Institutions</option>
                        <option value="gallery">Gallery</option>
                        <option value="news">News</option>
                        <option value="events">Events</option>
                        <option value="contact">Contact</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content *
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                        <div className="flex space-x-2">
                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                                <DocumentTextIcon className="h-4 w-4" />
                            </button>
                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                                <LinkIcon className="h-4 w-4" />
                            </button>
                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                                <PhotoIcon className="h-4 w-4" />
                            </button>
                        </div>
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            {previewMode ? 'Edit' : 'Preview'}
                        </button>
                    </div>
                    {previewMode ? (
                        <div className="p-4 prose dark:prose-invert max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                        </div>
                    ) : (
                        <textarea
                            value={formData.content}
                            onChange={(e) => handleInputChange('content', e.target.value)}
                            rows={15}
                            className="w-full px-3 py-2 border-0 focus:ring-0 dark:bg-gray-800 dark:text-white resize-none"
                            placeholder="Write your content here..."
                        />
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Excerpt
                </label>
                <textarea
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Brief description of the content"
                />
            </div>
        </div>
    );

    const renderSEOTab = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Title
                </label>
                <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                    maxLength={60}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="SEO title (max 60 characters)"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formData.metaTitle.length}/60 characters
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Description
                </label>
                <textarea
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    maxLength={160}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="SEO description (max 160 characters)"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formData.metaDescription.length}/160 characters
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Keywords
                </label>
                <input
                    type="text"
                    value={formData.keywords.join(', ')}
                    onChange={(e) => handleKeywordsChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Separate keywords with commas
                </p>
            </div>
        </div>
    );

    const renderMediaTab = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Featured Image
                </label>
                <div className="space-y-4">
                    <input
                        type="url"
                        value={formData.featuredImage.url}
                        onChange={(e) => handleInputChange('featuredImage.url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Image URL"
                    />
                    <input
                        type="text"
                        value={formData.featuredImage.alt}
                        onChange={(e) => handleInputChange('featuredImage.alt', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Alt text"
                    />
                    <input
                        type="text"
                        value={formData.featuredImage.caption}
                        onChange={(e) => handleInputChange('featuredImage.caption', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Caption"
                    />
                    {formData.featuredImage.url && (
                        <div className="mt-2">
                            <img
                                src={formData.featuredImage.url}
                                alt={formData.featuredImage.alt}
                                className="h-32 w-32 object-cover rounded-lg"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Images
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                        Drag and drop images here or click to upload
                    </p>
                </div>
            </div>
        </div>
    );

    const renderSettingsTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Template
                    </label>
                    <select
                        value={formData.template}
                        onChange={(e) => handleInputChange('template', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                        <option value="default">Default</option>
                        <option value="landing">Landing Page</option>
                        <option value="blog">Blog Post</option>
                        <option value="gallery">Gallery</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Layout
                    </label>
                    <select
                        value={formData.layout}
                        onChange={(e) => handleInputChange('layout', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                        <option value="standard">Standard</option>
                        <option value="full-width">Full Width</option>
                        <option value="sidebar">With Sidebar</option>
                        <option value="centered">Centered</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isPublished"
                        checked={formData.isPublished}
                        onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Published
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Featured
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isSticky"
                        checked={formData.isSticky}
                        onChange={(e) => handleInputChange('isSticky', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isSticky" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Sticky
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="allowComments"
                        checked={formData.allowComments}
                        onChange={(e) => handleInputChange('allowComments', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="allowComments" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Allow Comments
                    </label>
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'content':
                return renderContentTab();
            case 'seo':
                return renderSEOTab();
            case 'media':
                return renderMediaTab();
            case 'settings':
                return renderSettingsTab();
            default:
                return renderContentTab();
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {content ? 'Edit Content' : 'Create New Content'}
                        </h2>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleSave(false)}
                                disabled={loading}
                                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Draft'}
                            </button>
                            <button
                                onClick={() => handleSave(true)}
                                disabled={loading}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Publishing...' : 'Publish'}
                            </button>
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {renderTabs()}
                    <div className="mt-6">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentEditor;
