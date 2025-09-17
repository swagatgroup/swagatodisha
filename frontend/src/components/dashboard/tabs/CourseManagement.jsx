import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';

const CourseManagement = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [filters, setFilters] = useState({
        institutionType: '',
        level: '',
        search: ''
    });

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        shortDescription: '',
        institutionType: '',
        level: '',
        duration: '',
        eligibility: '',
        pricing: {
            totalFee: 0,
            currency: 'INR',
            feeBreakdown: {
                admissionFee: 0,
                tuitionFee: 0,
                otherCharges: 0,
                examFee: 0,
                libraryFee: 0,
                labFee: 0
            },
            paymentOptions: [],
            discountAvailable: false,
            discountPercentage: 0
        },
        features: [],
        highlights: [],
        careerProspects: [],
        images: [],
        isActive: true,
        isFeatured: false,
        isPopular: false,
        displayOrder: 0,
        seoTitle: '',
        seoDescription: '',
        seoKeywords: []
    });

    const institutionTypes = [
        'School', 'Higher Secondary School', 'Degree College', 'Management School',
        'Engineering College', 'Polytechnic', 'B.Ed. College', 'Computer Academy'
    ];

    const levels = [
        'Primary', 'Secondary', 'Higher Secondary', 'Graduate', 'Post Graduate', 'Diploma', 'Certificate'
    ];

    const paymentOptions = ['One Time', 'Monthly', 'Quarterly', 'Yearly', 'Semester'];

    useEffect(() => {
        loadCourses();
        loadInstitutions();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/courses', {
                params: {
                    institutionType: filters.institutionType || undefined,
                    level: filters.level || undefined,
                    search: filters.search || undefined
                }
            });
            if (response.data.success) {
                setCourses(response.data.data.courses || []);
            }
        } catch (error) {
            console.error('Error loading courses:', error);
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

    const saveCourse = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const url = editingCourse ? `/api/courses/${editingCourse._id}` : '/api/courses';
            const method = editingCourse ? 'put' : 'post';

            const response = await api[method](url, formData);
            if (response.data.success) {
                alert(editingCourse ? 'Course updated successfully!' : 'Course created successfully!');
                setShowForm(false);
                setEditingCourse(null);
                resetForm();
                loadCourses();
            }
        } catch (error) {
            console.error('Error saving course:', error);
            alert('Error saving course. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const editCourse = (course) => {
        setEditingCourse(course);
        setFormData({
            ...course,
            features: course.features || [],
            highlights: course.highlights || [],
            careerProspects: course.careerProspects || [],
            images: course.images || [],
            seoKeywords: course.seoKeywords || []
        });
        setShowForm(true);
    };

    const deleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;

        try {
            const response = await api.delete(`/api/courses/${courseId}`);
            if (response.data.success) {
                alert('Course deleted successfully!');
                loadCourses();
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Error deleting course. Please try again.');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            description: '',
            shortDescription: '',
            institutionType: '',
            level: '',
            duration: '',
            eligibility: '',
            pricing: {
                totalFee: 0,
                currency: 'INR',
                feeBreakdown: {
                    admissionFee: 0,
                    tuitionFee: 0,
                    otherCharges: 0,
                    examFee: 0,
                    libraryFee: 0,
                    labFee: 0
                },
                paymentOptions: [],
                discountAvailable: false,
                discountPercentage: 0
            },
            features: [],
            highlights: [],
            careerProspects: [],
            images: [],
            isActive: true,
            isFeatured: false,
            isPopular: false,
            displayOrder: 0,
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

    const addArrayItem = (path, newItem) => {
        const newData = { ...formData };
        const keys = path.split('.');
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = [];
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]].push(newItem);
        setFormData(newData);
    };

    const removeArrayItem = (path, index) => {
        const newData = { ...formData };
        const keys = path.split('.');
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]].splice(index, 1);
        setFormData(newData);
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = !filters.search ||
            course.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            course.code.toLowerCase().includes(filters.search.toLowerCase());

        const matchesType = !filters.institutionType || course.institutionType === filters.institutionType;
        const matchesLevel = !filters.level || course.level === filters.level;

        return matchesSearch && matchesType && matchesLevel;
    });

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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Course Management</h2>
                <button
                    onClick={() => {
                        resetForm();
                        setEditingCourse(null);
                        setShowForm(true);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                    Add New Course
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
                            placeholder="Search courses..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Institution Type</label>
                        <select
                            value={filters.institutionType}
                            onChange={(e) => setFilters(prev => ({ ...prev, institutionType: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        >
                            <option value="">All Types</option>
                            {institutionTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level</label>
                        <select
                            value={filters.level}
                            onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        >
                            <option value="">All Levels</option>
                            {levels.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={loadCourses}
                            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Course List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Courses ({filteredCourses.length})
                    </h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCourses.map((course, index) => (
                        <motion.div
                            key={course._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                            <span className="text-blue-600 dark:text-blue-300 font-semibold text-lg">
                                                {course.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">{course.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {course.code} • {course.institutionType} • {course.level}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                Duration: {course.duration} • Fee: ₹{course.pricing.totalFee.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="flex space-x-2">
                                        {course.isFeatured && (
                                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full">
                                                Featured
                                            </span>
                                        )}
                                        {course.isPopular && (
                                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                                                Popular
                                            </span>
                                        )}
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${course.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                            {course.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => editCourse(course)}
                                            className="px-3 py-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteCourse(course._id)}
                                            className="px-3 py-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Course Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {editingCourse ? 'Edit Course' : 'Add New Course'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingCourse(null);
                                        resetForm();
                                    }}
                                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={saveCourse} className="space-y-6">
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Code *</label>
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => handleInputChange('code', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Institution Type *</label>
                                        <select
                                            value={formData.institutionType}
                                            onChange={(e) => handleInputChange('institutionType', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            required
                                        >
                                            <option value="">Select Type</option>
                                            {institutionTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level *</label>
                                        <select
                                            value={formData.level}
                                            onChange={(e) => handleInputChange('level', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            required
                                        >
                                            <option value="">Select Level</option>
                                            {levels.map(level => (
                                                <option key={level} value={level}>{level}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration *</label>
                                        <input
                                            type="text"
                                            value={formData.duration}
                                            onChange={(e) => handleInputChange('duration', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            placeholder="e.g., 3 Years, 2 Years, 1 Year"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Fee *</label>
                                        <input
                                            type="number"
                                            value={formData.pricing.totalFee}
                                            onChange={(e) => handleInputChange('pricing.totalFee', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Short Description</label>
                                    <input
                                        type="text"
                                        value={formData.shortDescription}
                                        onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        maxLength={200}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Eligibility *</label>
                                    <textarea
                                        value={formData.eligibility}
                                        onChange={(e) => handleInputChange('eligibility', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </div>

                                {/* Features and Highlights */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features (comma separated)</label>
                                        <textarea
                                            value={formData.features.join(', ')}
                                            onChange={(e) => handleArrayChange('features', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            placeholder="Feature 1, Feature 2, Feature 3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Highlights (comma separated)</label>
                                        <textarea
                                            value={formData.highlights.join(', ')}
                                            onChange={(e) => handleArrayChange('highlights', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            placeholder="Highlight 1, Highlight 2, Highlight 3"
                                        />
                                    </div>
                                </div>

                                {/* Status and Display */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Order</label>
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
                                                checked={formData.isPopular}
                                                onChange={(e) => handleInputChange('isPopular', e.target.checked)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Popular</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingCourse(null);
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
                                        {saving ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
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

export default CourseManagement;
