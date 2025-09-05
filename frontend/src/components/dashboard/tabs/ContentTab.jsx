import React, { useState } from 'react';

const ContentTab = () => {
    const [activeSection, setActiveSection] = useState('hero');
    const [formData, setFormData] = useState({
        hero: {
            title: "Welcome to Swagat Group of Institutions",
            subtitle: "Your Gateway to Excellence in Education",
            description: "Join thousands of students who have achieved their dreams with our world-class education and state-of-the-art facilities.",
            buttonText: "Apply Now",
            backgroundImage: ""
        },
        about: {
            title: "About Us",
            subtitle: "Excellence in Education Since 1995",
            description: "We are committed to providing quality education and nurturing the next generation of leaders.",
            features: [
                "25+ Years of Excellence",
                "5000+ Successful Alumni",
                "50+ Expert Faculty",
                "Modern Infrastructure"
            ]
        },
        courses: {
            title: "Our Courses",
            subtitle: "Choose Your Path to Success",
            description: "We offer a wide range of courses designed to meet industry demands and student aspirations."
        },
        contact: {
            title: "Contact Us",
            subtitle: "Get in Touch",
            address: "123 Education Street, Bhubaneswar, Odisha 751001",
            phone: "+91 9876543210",
            email: "info@swagat.edu",
            hours: "Mon - Fri: 9:00 AM - 5:00 PM"
        }
    });

    const handleInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleFeatureChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            about: {
                ...prev.about,
                features: prev.about.features.map((feature, i) => i === index ? value : feature)
            }
        }));
    };

    const addFeature = () => {
        setFormData(prev => ({
            ...prev,
            about: {
                ...prev.about,
                features: [...prev.about.features, ""]
            }
        }));
    };

    const removeFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            about: {
                ...prev.about,
                features: prev.about.features.filter((_, i) => i !== index)
            }
        }));
    };

    const handleSave = () => {
        // Here you would typically make an API call to save the content
        alert('Content saved successfully!');
    };

    const renderHeroSection = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
                    <input
                        type="text"
                        value={formData.hero.title}
                        onChange={(e) => handleInputChange('hero', 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
                    <input
                        type="text"
                        value={formData.hero.subtitle}
                        onChange={(e) => handleInputChange('hero', 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Description</label>
                <textarea
                    value={formData.hero.description}
                    onChange={(e) => handleInputChange('hero', 'description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                    <input
                        type="text"
                        value={formData.hero.buttonText}
                        onChange={(e) => handleInputChange('hero', 'buttonText', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Image URL</label>
                    <input
                        type="url"
                        value={formData.hero.backgroundImage}
                        onChange={(e) => handleInputChange('hero', 'backgroundImage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
            </div>
        </div>
    );

    const renderAboutSection = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">About Title</label>
                    <input
                        type="text"
                        value={formData.about.title}
                        onChange={(e) => handleInputChange('about', 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">About Subtitle</label>
                    <input
                        type="text"
                        value={formData.about.subtitle}
                        onChange={(e) => handleInputChange('about', 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">About Description</label>
                <textarea
                    value={formData.about.description}
                    onChange={(e) => handleInputChange('about', 'description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                <div className="space-y-2">
                    {formData.about.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={feature}
                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <button
                                onClick={() => removeFeature(index)}
                                className="px-3 py-2 text-red-600 hover:text-red-800"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={addFeature}
                        className="px-4 py-2 text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                        + Add Feature
                    </button>
                </div>
            </div>
        </div>
    );

    const renderContactSection = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Title</label>
                    <input
                        type="text"
                        value={formData.contact.title}
                        onChange={(e) => handleInputChange('contact', 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Subtitle</label>
                    <input
                        type="text"
                        value={formData.contact.subtitle}
                        onChange={(e) => handleInputChange('contact', 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                    value={formData.contact.address}
                    onChange={(e) => handleInputChange('contact', 'address', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                        type="tel"
                        value={formData.contact.phone}
                        onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                        type="email"
                        value={formData.contact.email}
                        onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
                    <input
                        type="text"
                        value={formData.contact.hours}
                        onChange={(e) => handleInputChange('contact', 'hours', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
            </div>
        </div>
    );

    const renderCoursesSection = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Courses Title</label>
                    <input
                        type="text"
                        value={formData.courses.title}
                        onChange={(e) => handleInputChange('courses', 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Courses Subtitle</label>
                    <input
                        type="text"
                        value={formData.courses.subtitle}
                        onChange={(e) => handleInputChange('courses', 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Courses Description</label>
                <textarea
                    value={formData.courses.description}
                    onChange={(e) => handleInputChange('courses', 'description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Course management is handled separately in the Students section.
                    This section only controls the display text on the website.
                </p>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'hero': return renderHeroSection();
            case 'about': return renderAboutSection();
            case 'courses': return renderCoursesSection();
            case 'contact': return renderContactSection();
            default: return renderHeroSection();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Website Content Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Home / Content</p>
                </div>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                </button>
            </div>

            {/* Section Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveSection('hero')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeSection === 'hero'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Hero Section
                </button>
                <button
                    onClick={() => setActiveSection('about')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeSection === 'about'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    About Us
                </button>
                <button
                    onClick={() => setActiveSection('courses')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeSection === 'courses'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Courses
                </button>
                <button
                    onClick={() => setActiveSection('contact')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeSection === 'contact'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Contact
                </button>
            </div>

            {/* Content Form */}
            <div className="bg-white rounded-lg shadow p-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default ContentTab;
