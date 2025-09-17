import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';

const WebsiteContentManagement = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [content, setContent] = useState(null);

    const tabs = [
        { id: 'general', name: 'General Settings', icon: '⚙️' },
        { id: 'hero', name: 'Hero Carousel', icon: '🖼️' },
        { id: 'navigation', name: 'Navigation', icon: '🧭' },
        { id: 'quicklinks', name: 'Quick Links', icon: '🔗' },
        { id: 'management', name: 'Management Team', icon: '👥' },
        { id: 'chairman', name: 'Chairman Message', icon: '💬' },
        { id: 'milestone', name: 'Milestone', icon: '🏆' },
        { id: 'footer', name: 'Footer Content', icon: '📄' },
        { id: 'seo', name: 'SEO Settings', icon: '🔍' }
    ];

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/website-content');
            if (response.data.success) {
                setContent(response.data.data);
            }
        } catch (error) {
            console.error('Error loading content:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveContent = async (sectionData) => {
        try {
            setSaving(true);
            const response = await api.put('/api/website-content', sectionData);
            if (response.data.success) {
                setContent(response.data.data);
                alert('Content saved successfully!');
            }
        } catch (error) {
            console.error('Error saving content:', error);
            alert('Error saving content. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (path, value) => {
        const newContent = { ...content };
        const keys = path.split('.');
        let current = newContent;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        setContent(newContent);
    };

    const handleArrayItemChange = (path, index, field, value) => {
        const newContent = { ...content };
        const keys = path.split('.');
        let current = newContent;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = [];
            current = current[keys[i]];
        }

        if (!current[index]) current[index] = {};
        current[index][field] = value;
        setContent(newContent);
    };

    const addArrayItem = (path, newItem) => {
        const newContent = { ...content };
        const keys = path.split('.');
        let current = newContent;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = [];
            current = current[keys[i]];
        }

        current.push(newItem);
        setContent(newContent);
    };

    const removeArrayItem = (path, index) => {
        const newContent = { ...content };
        const keys = path.split('.');
        let current = newContent;

        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }

        current.splice(index, 1);
        setContent(newContent);
    };

    const renderGeneralSettings = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                    <input
                        type="text"
                        value={content?.siteName || ''}
                        onChange={(e) => handleInputChange('siteName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                    <input
                        type="text"
                        value={content?.siteDescription || ''}
                        onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Logo URL</label>
                    <input
                        type="text"
                        value={content?.siteLogo || ''}
                        onChange={(e) => handleInputChange('siteLogo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Favicon URL</label>
                    <input
                        type="text"
                        value={content?.siteFavicon || ''}
                        onChange={(e) => handleInputChange('siteFavicon', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                            type="text"
                            value={content?.contactInfo?.phone || ''}
                            onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={content?.contactInfo?.email || ''}
                            onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <textarea
                            value={content?.contactInfo?.address || ''}
                            onChange={(e) => handleInputChange('contactInfo.address', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Map URL</label>
                        <input
                            type="text"
                            value={content?.contactInfo?.mapUrl || ''}
                            onChange={(e) => handleInputChange('contactInfo.mapUrl', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-3">Social Media Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                        <input
                            type="url"
                            value={content?.socialLinks?.facebook || ''}
                            onChange={(e) => handleInputChange('socialLinks.facebook', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                        <input
                            type="url"
                            value={content?.socialLinks?.twitter || ''}
                            onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                        <input
                            type="url"
                            value={content?.socialLinks?.instagram || ''}
                            onChange={(e) => handleInputChange('socialLinks.instagram', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                        <input
                            type="url"
                            value={content?.socialLinks?.youtube || ''}
                            onChange={(e) => handleInputChange('socialLinks.youtube', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                        <input
                            type="url"
                            value={content?.socialLinks?.linkedin || ''}
                            onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderHeroCarousel = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Hero Carousel Images</h3>
                <button
                    onClick={() => addArrayItem('heroCarousel', { image: '', title: '', subtitle: '', order: 0, isActive: true })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Add Image
                </button>
            </div>

            <div className="space-y-4">
                {(content?.heroCarousel || []).map((slide, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900">Slide {index + 1}</h4>
                            <button
                                onClick={() => removeArrayItem('heroCarousel', index)}
                                className="text-red-600 hover:text-red-800"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                                <input
                                    type="text"
                                    value={slide.image || ''}
                                    onChange={(e) => handleArrayItemChange('heroCarousel', index, 'image', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                                <input
                                    type="number"
                                    value={slide.order || 0}
                                    onChange={(e) => handleArrayItemChange('heroCarousel', index, 'order', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={slide.title || ''}
                                    onChange={(e) => handleArrayItemChange('heroCarousel', index, 'title', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                                <input
                                    type="text"
                                    value={slide.subtitle || ''}
                                    onChange={(e) => handleArrayItemChange('heroCarousel', index, 'subtitle', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={slide.isActive || false}
                                        onChange={(e) => handleArrayItemChange('heroCarousel', index, 'isActive', e.target.checked)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderNavigation = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Navigation Menu</h3>
                <button
                    onClick={() => addArrayItem('navigationItems', { name: '', href: '', icon: '', order: 0, isActive: true })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Add Item
                </button>
            </div>

            <div className="space-y-4">
                {(content?.navigationItems || []).map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900">Menu Item {index + 1}</h4>
                            <button
                                onClick={() => removeArrayItem('navigationItems', index)}
                                className="text-red-600 hover:text-red-800"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={item.name || ''}
                                    onChange={(e) => handleArrayItemChange('navigationItems', index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                                <input
                                    type="text"
                                    value={item.href || ''}
                                    onChange={(e) => handleArrayItemChange('navigationItems', index, 'href', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                                <input
                                    type="text"
                                    value={item.icon || ''}
                                    onChange={(e) => handleArrayItemChange('navigationItems', index, 'icon', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                                <input
                                    type="number"
                                    value={item.order || 0}
                                    onChange={(e) => handleArrayItemChange('navigationItems', index, 'order', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={item.isActive || false}
                                        onChange={(e) => handleArrayItemChange('navigationItems', index, 'isActive', e.target.checked)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderQuickLinks = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
                <button
                    onClick={() => addArrayItem('quickLinks', { name: '', icon: '', href: '', color: '', order: 0, isActive: true })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Add Link
                </button>
            </div>

            <div className="space-y-4">
                {(content?.quickLinks || []).map((link, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900">Quick Link {index + 1}</h4>
                            <button
                                onClick={() => removeArrayItem('quickLinks', index)}
                                className="text-red-600 hover:text-red-800"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={link.name || ''}
                                    onChange={(e) => handleArrayItemChange('quickLinks', index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Icon URL</label>
                                <input
                                    type="text"
                                    value={link.icon || ''}
                                    onChange={(e) => handleArrayItemChange('quickLinks', index, 'icon', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                                <input
                                    type="text"
                                    value={link.href || ''}
                                    onChange={(e) => handleArrayItemChange('quickLinks', index, 'href', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                                <input
                                    type="text"
                                    value={link.color || ''}
                                    onChange={(e) => handleArrayItemChange('quickLinks', index, 'color', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                                <input
                                    type="number"
                                    value={link.order || 0}
                                    onChange={(e) => handleArrayItemChange('quickLinks', index, 'order', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={link.isActive || false}
                                        onChange={(e) => handleArrayItemChange('quickLinks', index, 'isActive', e.target.checked)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderManagementTeam = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Management Team</h3>
                <button
                    onClick={() => addArrayItem('managementTeam', { name: '', position: '', image: '', bio: '', order: 0, isActive: true })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Add Member
                </button>
            </div>

            <div className="space-y-4">
                {(content?.managementTeam || []).map((member, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900">Team Member {index + 1}</h4>
                            <button
                                onClick={() => removeArrayItem('managementTeam', index)}
                                className="text-red-600 hover:text-red-800"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={member.name || ''}
                                    onChange={(e) => handleArrayItemChange('managementTeam', index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                                <input
                                    type="text"
                                    value={member.position || ''}
                                    onChange={(e) => handleArrayItemChange('managementTeam', index, 'position', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                                <input
                                    type="text"
                                    value={member.image || ''}
                                    onChange={(e) => handleArrayItemChange('managementTeam', index, 'image', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                                <input
                                    type="number"
                                    value={member.order || 0}
                                    onChange={(e) => handleArrayItemChange('managementTeam', index, 'order', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                <textarea
                                    value={member.bio || ''}
                                    onChange={(e) => handleArrayItemChange('managementTeam', index, 'bio', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={member.isActive || false}
                                        onChange={(e) => handleArrayItemChange('managementTeam', index, 'isActive', e.target.checked)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderChairmanMessage = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Chairman Message</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                        type="text"
                        value={content?.chairmanMessage?.name || ''}
                        onChange={(e) => handleInputChange('chairmanMessage.name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <input
                        type="text"
                        value={content?.chairmanMessage?.position || ''}
                        onChange={(e) => handleInputChange('chairmanMessage.position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                        type="text"
                        value={content?.chairmanMessage?.image || ''}
                        onChange={(e) => handleInputChange('chairmanMessage.image', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                        value={content?.chairmanMessage?.message || ''}
                        onChange={(e) => handleInputChange('chairmanMessage.message', e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={content?.chairmanMessage?.isActive || false}
                            onChange={(e) => handleInputChange('chairmanMessage.isActive', e.target.checked)}
                            className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Active</span>
                    </label>
                </div>
            </div>
        </div>
    );

    const renderMilestone = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Milestone</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <input
                        type="text"
                        value={content?.milestone?.year || ''}
                        onChange={(e) => handleInputChange('milestone.year', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                        type="text"
                        value={content?.milestone?.title || ''}
                        onChange={(e) => handleInputChange('milestone.title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                        type="text"
                        value={content?.milestone?.image || ''}
                        onChange={(e) => handleInputChange('milestone.image', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        value={content?.milestone?.description || ''}
                        onChange={(e) => handleInputChange('milestone.description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={content?.milestone?.isActive || false}
                            onChange={(e) => handleInputChange('milestone.isActive', e.target.checked)}
                            className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Active</span>
                    </label>
                </div>
            </div>
        </div>
    );

    const renderFooterContent = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Footer Content</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">About Text</label>
                    <textarea
                        value={content?.footerContent?.aboutText || ''}
                        onChange={(e) => handleInputChange('footerContent.aboutText', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Text</label>
                    <input
                        type="text"
                        value={content?.footerContent?.copyrightText || ''}
                        onChange={(e) => handleInputChange('footerContent.copyrightText', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Disclaimer Text</label>
                    <textarea
                        value={content?.footerContent?.disclaimerText || ''}
                        onChange={(e) => handleInputChange('footerContent.disclaimerText', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );

    const renderSEOSettings = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">SEO Settings</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                    <input
                        type="text"
                        value={content?.seoSettings?.metaTitle || ''}
                        onChange={(e) => handleInputChange('seoSettings.metaTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                    <textarea
                        value={content?.seoSettings?.metaDescription || ''}
                        onChange={(e) => handleInputChange('seoSettings.metaDescription', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords (comma separated)</label>
                    <input
                        type="text"
                        value={(content?.seoSettings?.metaKeywords || []).join(', ')}
                        onChange={(e) => handleInputChange('seoSettings.metaKeywords', e.target.value.split(',').map(k => k.trim()))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Open Graph Title</label>
                    <input
                        type="text"
                        value={content?.seoSettings?.ogTitle || ''}
                        onChange={(e) => handleInputChange('seoSettings.ogTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Open Graph Description</label>
                    <textarea
                        value={content?.seoSettings?.ogDescription || ''}
                        onChange={(e) => handleInputChange('seoSettings.ogDescription', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Open Graph Image URL</label>
                    <input
                        type="text"
                        value={content?.seoSettings?.ogImage || ''}
                        onChange={(e) => handleInputChange('seoSettings.ogImage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return renderGeneralSettings();
            case 'hero':
                return renderHeroCarousel();
            case 'navigation':
                return renderNavigation();
            case 'quicklinks':
                return renderQuickLinks();
            case 'management':
                return renderManagementTeam();
            case 'chairman':
                return renderChairmanMessage();
            case 'milestone':
                return renderMilestone();
            case 'footer':
                return renderFooterContent();
            case 'seo':
                return renderSEOSettings();
            default:
                return null;
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Website Content Management</h2>
                <button
                    onClick={() => saveContent(content)}
                    disabled={saving}
                    className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
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
        </div>
    );
};

export default WebsiteContentManagement;
