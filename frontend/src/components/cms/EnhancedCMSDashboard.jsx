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
    StarIcon,
    DocumentTextIcon,
    PhotoIcon,
    CalendarIcon,
    ChartBarIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowUpTrayIcon,
    ArrowDownTrayIcon,
    CogIcon,
    GlobeAltIcon,
    NewspaperIcon,
    VideoCameraIcon,
    SpeakerWaveIcon,
    BookOpenIcon,
    UserGroupIcon,
    TrophyIcon,
    LinkIcon,
    DocumentDuplicateIcon,
    QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const EnhancedCMSDashboard = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [activeTab, setActiveTab] = useState('content');
    const [contents, setContents] = useState([]);
    const [websiteContent, setWebsiteContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState({});
    const [filters, setFilters] = useState({
        search: '',
        type: '',
        category: '',
        status: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pages: 1,
        total: 0,
        limit: 20
    });
    const [selectedContents, setSelectedContents] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingContent, setEditingContent] = useState(null);

    const tabs = [
        { id: 'content', name: 'Content Management', icon: DocumentTextIcon },
        { id: 'website', name: 'Website Settings', icon: GlobeAltIcon },
        { id: 'media', name: 'Media Library', icon: PhotoIcon },
        { id: 'analytics', name: 'Analytics', icon: ChartBarIcon }
    ];

    const contentTypes = [
        { value: 'page', label: 'Page', icon: DocumentTextIcon },
        { value: 'section', label: 'Section', icon: DocumentDuplicateIcon },
        { value: 'announcement', label: 'Announcement', icon: SpeakerWaveIcon },
        { value: 'news', label: 'News', icon: NewspaperIcon },
        { value: 'event', label: 'Event', icon: CalendarIcon },
        { value: 'gallery', label: 'Gallery', icon: PhotoIcon },
        { value: 'course', label: 'Course', icon: BookOpenIcon },
        { value: 'institution', label: 'Institution', icon: UserGroupIcon },
        { value: 'testimonial', label: 'Testimonial', icon: StarIcon },
        { value: 'faq', label: 'FAQ', icon: QuestionMarkCircleIcon }
    ];

    // Real-time updates
    useEffect(() => {
        if (socket) {
            const handleContentUpdate = (data) => {
                console.log('Real-time content update:', data);
                loadContents();
                loadWebsiteContent();
            };

            socket.on('contentCreated', handleContentUpdate);
            socket.on('contentUpdated', handleContentUpdate);
            socket.on('contentDeleted', handleContentUpdate);
            socket.on('contentPublished', handleContentUpdate);
            socket.on('contentUnpublished', handleContentUpdate);
            socket.on('contentBulkAction', handleContentUpdate);
            socket.on('websiteContentUpdated', handleContentUpdate);

            return () => {
                socket.off('contentCreated', handleContentUpdate);
                socket.off('contentUpdated', handleContentUpdate);
                socket.off('contentDeleted', handleContentUpdate);
                socket.off('contentPublished', handleContentUpdate);
                socket.off('contentUnpublished', handleContentUpdate);
                socket.off('contentBulkAction', handleContentUpdate);
                socket.off('websiteContentUpdated', handleContentUpdate);
            };
        }
    }, [socket]);

    useEffect(() => {
        loadContents();
        loadWebsiteContent();
        loadStats();
    }, [filters, pagination.current]);

    const loadContents = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.current,
                limit: pagination.limit,
                ...filters
            });

            const response = await api.get(`/api/cms?${params}`);
            if (response.data.success) {
                setContents(response.data.data.contents);
                setPagination(response.data.data.pagination);
            }
        } catch (error) {
            console.error('Error loading contents:', error);
            showError('Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    const loadWebsiteContent = async () => {
        try {
            const response = await api.get('/api/website-content');
            if (response.data.success) {
                setWebsiteContent(response.data.data);
            }
        } catch (error) {
            console.error('Error loading website content:', error);
        }
    };

    const loadStats = async () => {
        try {
            const response = await api.get('/api/cms/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleCreateContent = () => {
        setEditingContent(null);
        setShowCreateModal(true);
    };

    const handleEditContent = (content) => {
        setEditingContent(content);
        setShowCreateModal(true);
    };

    const handleDeleteContent = async (content) => {
        const confirmed = await showConfirm(
            'Delete Content',
            `Are you sure you want to delete "${content.title}"? This action cannot be undone.`
        );

        if (confirmed) {
            try {
                await api.delete(`/api/cms/${content._id}`);
                showSuccess('Content deleted successfully');
                loadContents();
            } catch (error) {
                console.error('Error deleting content:', error);
                showError('Failed to delete content');
            }
        }
    };

    const handlePublishContent = async (content) => {
        try {
            await api.post(`/api/cms/${content._id}/publish`);
            showSuccess('Content published successfully');
            loadContents();
        } catch (error) {
            console.error('Error publishing content:', error);
            showError('Failed to publish content');
        }
    };

    const handleUnpublishContent = async (content) => {
        try {
            await api.post(`/api/cms/${content._id}/unpublish`);
            showSuccess('Content unpublished successfully');
            loadContents();
        } catch (error) {
            console.error('Error unpublishing content:', error);
            showError('Failed to unpublish content');
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedContents.length === 0) {
            showError('Please select content items first');
            return;
        }

        const confirmed = await showConfirm(
            'Bulk Action',
            `Are you sure you want to ${action} ${selectedContents.length} content item(s)?`
        );

        if (confirmed) {
            try {
                await api.post('/api/cms/bulk-action', {
                    action,
                    contentIds: selectedContents
                });
                showSuccess(`Bulk ${action} completed successfully`);
                setSelectedContents([]);
                loadContents();
            } catch (error) {
                console.error('Error performing bulk action:', error);
                showError(`Failed to ${action} content`);
            }
        }
    };

    const handleSelectContent = (contentId) => {
        setSelectedContents(prev =>
            prev.includes(contentId)
                ? prev.filter(id => id !== contentId)
                : [...prev, contentId]
        );
    };

    const handleSelectAll = () => {
        if (selectedContents.length === contents.length) {
            setSelectedContents([]);
        } else {
            setSelectedContents(contents.map(c => c._id));
        }
    };

    const saveWebsiteContent = async (sectionData) => {
        try {
            setSaving(true);
            const response = await api.put('/api/website-content', sectionData);
            if (response.data.success) {
                setWebsiteContent(response.data.data);
                showSuccess('Website content saved successfully!');
            }
        } catch (error) {
            console.error('Error saving website content:', error);
            showError('Error saving website content. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const renderStats = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
                <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Content</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {stats.overview?.totalContent || 0}
                        </p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
                <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <EyeIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {stats.overview?.publishedContent || 0}
                        </p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
                <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                        <PencilIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drafts</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {stats.overview?.draftContent || 0}
                        </p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
                <div className="flex items-center">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {stats.overview?.totalViews || 0}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );

    const renderContentManagement = () => (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search content..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <select
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">All Types</option>
                        {contentTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>

                    <select
                        value={filters.category}
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">All Categories</option>
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

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                    </select>

                    <select
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onChange={(e) => {
                            const [sortBy, sortOrder] = e.target.value.split('-');
                            setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="title-asc">Title A-Z</option>
                        <option value="title-desc">Title Z-A</option>
                        <option value="publishedAt-desc">Recently Published</option>
                        <option value="views-desc">Most Viewed</option>
                    </select>
                </div>
            </div>

            {/* Content List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Content Management
                        </h3>
                        <div className="flex items-center space-x-2">
                            {selectedContents.length > 0 && (
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {selectedContents.length} selected
                                    </span>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => handleBulkAction('publish')}
                                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                        >
                                            Publish
                                        </button>
                                        <button
                                            onClick={() => handleBulkAction('unpublish')}
                                            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                                        >
                                            Unpublish
                                        </button>
                                        <button
                                            onClick={() => handleBulkAction('delete')}
                                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={handleCreateContent}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Create Content
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedContents.length === contents.length && contents.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Content
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Author
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : contents.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        No content found
                                    </td>
                                </tr>
                            ) : (
                                contents.map((content) => (
                                    <motion.tr
                                        key={content._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedContents.includes(content._id)}
                                                onChange={() => handleSelectContent(content._id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {content.featuredImage?.url ? (
                                                        <img
                                                            className="h-10 w-10 rounded-lg object-cover"
                                                            src={content.featuredImage.url}
                                                            alt={content.featuredImage.alt || content.title}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                                            <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {content.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        /{content.slug}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                {content.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                {content.isPublished ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        <EyeIcon className="h-3 w-3 mr-1" />
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                        <EyeSlashIcon className="h-3 w-3 mr-1" />
                                                        Draft
                                                    </span>
                                                )}
                                                {content.isFeatured && (
                                                    <StarIcon className="h-4 w-4 text-yellow-500" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                            {content.author?.firstName} {content.author?.lastName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(content.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEditContent(content)}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                {content.isPublished ? (
                                                    <button
                                                        onClick={() => handleUnpublishContent(content)}
                                                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                    >
                                                        <EyeSlashIcon className="h-4 w-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePublishContent(content)}
                                                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteContent(content)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                Showing {((pagination.current - 1) * pagination.limit) + 1} to{' '}
                                {Math.min(pagination.current * pagination.limit, pagination.total)} of{' '}
                                {pagination.total} results
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                                    disabled={pagination.current === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1 text-sm">
                                    Page {pagination.current} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                                    disabled={pagination.current === pagination.pages}
                                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderWebsiteSettings = () => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Website Settings
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Configure your website's basic settings, appearance, and content.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Site Name
                        </label>
                        <input
                            type="text"
                            value={websiteContent?.siteName || ''}
                            onChange={(e) => setWebsiteContent(prev => ({ ...prev, siteName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Site Description
                        </label>
                        <input
                            type="text"
                            value={websiteContent?.siteDescription || ''}
                            onChange={(e) => setWebsiteContent(prev => ({ ...prev, siteDescription: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Site Logo URL
                        </label>
                        <input
                            type="text"
                            value={websiteContent?.siteLogo || ''}
                            onChange={(e) => setWebsiteContent(prev => ({ ...prev, siteLogo: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Site Favicon URL
                        </label>
                        <input
                            type="text"
                            value={websiteContent?.siteFavicon || ''}
                            onChange={(e) => setWebsiteContent(prev => ({ ...prev, siteFavicon: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => saveWebsiteContent(websiteContent)}
                        disabled={saving}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderMediaLibrary = () => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Media Library
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Manage your media files, images, and documents.
                </p>

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                        Media Library Coming Soon
                    </h4>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Upload and manage your media files here.
                    </p>
                </div>
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Content Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Track your content performance and engagement.
                </p>

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                        Analytics Coming Soon
                    </h4>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        View detailed analytics and insights about your content.
                    </p>
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'content':
                return renderContentManagement();
            case 'website':
                return renderWebsiteSettings();
            case 'media':
                return renderMediaLibrary();
            case 'analytics':
                return renderAnalytics();
            default:
                return null;
        }
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Enhanced Content Management System
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage your website content, settings, and media in real-time
                </p>
            </div>

            {renderStats()}

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
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

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {editingContent ? 'Edit Content' : 'Create New Content'}
                        </h2>
                        {/* Content form would go here */}
                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                {editingContent ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedCMSDashboard;
