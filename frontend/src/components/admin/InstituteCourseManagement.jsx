import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { showSuccessToast, showErrorToast } from '../../utils/sweetAlert';

const InstituteCourseManagement = () => {
    const [colleges, setColleges] = useState([]);
    const [campuses, setCampuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showCollegeForm, setShowCollegeForm] = useState(false);
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [showCampusForm, setShowCampusForm] = useState(false);
    const [editingCollege, setEditingCollege] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null);
    const [editingCampus, setEditingCampus] = useState(null);
    const [selectedCollege, setSelectedCollege] = useState(null);
    const [courses, setCourses] = useState([]);

    const [formData, setFormData] = useState({
        instituteName: '',
        campuses: [],
        courses: []
    });

    const [campusFormData, setCampusFormData] = useState({
        name: '',
        code: '',
        description: '',
        isActive: true
    });

    const [newStream, setNewStream] = useState('');
    const [selectedCourseIndex, setSelectedCourseIndex] = useState(null);

    useEffect(() => {
        fetchColleges();
    }, []);

    const fetchColleges = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/colleges');
            if (response.data.success) {
                setColleges(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching colleges:', error);
            showErrorToast('Failed to load institutes');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.instituteName.trim()) {
            showErrorToast('Please enter institute name');
            return;
        }

    const fetchCampuses = async (collegeId) => {
        if (!collegeId) {
            setCampuses([]);
            return;
        }
        try {
            console.log('Fetching campuses for college:', collegeId);
            const response = await api.get(`/api/colleges/${collegeId}/campuses`);
            console.log('Campuses response:', response.data);
            if (response.data.success) {
                setCampuses(response.data.data || []);
                console.log('Campuses set:', response.data.data);
            } else {
                console.error('Failed to fetch campuses:', response.data);
                setCampuses([]);
            }
        } catch (error) {
            console.error('Error fetching campuses:', error);
            console.error('Error details:', error.response?.data);
            showErrorToast(error.response?.data?.message || 'Failed to load campuses');
            setCampuses([]);
        }
    };

    const handleCollegeSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const url = editingCollege
                ? `/api/colleges/${editingCollege._id}`
                : '/api/colleges';
            const method = editingCollege ? 'put' : 'post';

            const response = await api[method](url, {
                name: formData.instituteName,
                campuses: formData.campuses.map(c => ({ name: c })),
                courses: formData.courses.map(course => ({
                    name: course.name,
                    streams: course.streams.map(s => ({ name: s }))
                }))
            });

            if (response.data.success) {
                showSuccessToast(
                    editingCollege
                        ? 'Institute updated successfully'
                        : 'Institute created successfully'
                );
                resetForm();
                fetchColleges();
            }
        } catch (error) {
            console.error('Error saving institute:', error);
            showErrorToast(
                error.response?.data?.message ||
                'Failed to save institute'
            );
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingCollege(null);
        setFormData({
            instituteName: '',
            campuses: [],
            courses: []
        });
        setNewCampus('');
        setNewCourse('');
        setNewStream('');
        setSelectedCourseIndex(null);
    };

    const handleEdit = (college) => {
        setEditingCollege(college);
        // Fetch courses for this college
        fetchCoursesForEdit(college._id);
    };

    const fetchCoursesForEdit = async (collegeId) => {
        try {
            const response = await api.get(`/api/colleges/${collegeId}/courses`);
            if (response.data.success) {
                const coursesData = response.data.data || [];
                setFormData({
                    instituteName: college.name || '',
                    campuses: (college.campuses || []).map(c => c.name || c),
                    courses: coursesData.map(course => ({
                        name: course.courseName || '',
                        streams: (course.streams || []).map(s => s.name || s)
                    }))
                });
                setShowForm(true);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            setFormData({
                instituteName: college.name || '',
                campuses: (college.campuses || []).map(c => c.name || c),
                courses: []
            });
            setShowForm(true);
        }
    };

    const handleDelete = async (collegeId) => {
        if (!window.confirm('Are you sure you want to delete this institute? This will also delete all associated courses.')) {
            return;
        }

        try {
            const response = await api.delete(`/api/colleges/${collegeId}`);
            if (response.data.success) {
                showSuccessToast('Institute deleted successfully');
                fetchColleges();
            }
        } catch (error) {
            console.error('Error deleting institute:', error);
            showErrorToast(
                error.response?.data?.message ||
                'Failed to delete institute'
            );
        }
    };

    const addCampus = () => {
        if (newCampus.trim()) {
            setFormData(prev => ({
                ...prev,
                campuses: [...prev.campuses, newCampus.trim()]
            }));
            setNewCampus('');
        }
    };

    const removeCampus = (index) => {
        setFormData(prev => ({
            ...prev,
            campuses: prev.campuses.filter((_, i) => i !== index)
        }));
    };

    const addCourse = () => {
        if (newCourse.trim()) {
            setFormData(prev => ({
                ...prev,
                courses: [...prev.courses, {
                    name: newCourse.trim(),
                    streams: []
                }]
            }));
            setNewCourse('');
        }
    };

    const handleSelectCollege = (college) => {
        setSelectedCollege(college);
        fetchCourses(college._id);
        fetchCampuses(college._id);
        setShowCourseForm(false);
        setEditingCourse(null);
    };

    const addStream = (courseIndex) => {
        if (newStream.trim()) {
            setFormData(prev => ({
                ...prev,
                courses: prev.courses.map((course, i) =>
                    i === courseIndex
                        ? { ...course, streams: [...course.streams, newStream.trim()] }
                        : course
                )
            }));
            setNewStream('');
            setSelectedCourseIndex(null);
        }
    };

    const removeStream = (courseIndex, streamIndex) => {
        setFormData(prev => ({
            ...prev,
            courses: prev.courses.map((course, i) =>
                i === courseIndex
                    ? { ...course, streams: course.streams.filter((_, si) => si !== streamIndex) }
                    : course
            )
        }));
    };

    const handleCampusSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCollege) {
            showErrorToast('Please select an institute first');
            return;
        }

        try {
            setSaving(true);
            const url = editingCampus
                ? `/api/colleges/${selectedCollege._id}/campuses/${editingCampus._id}`
                : `/api/colleges/${selectedCollege._id}/campuses`;
            const method = editingCampus ? 'put' : 'post';

            const response = await api[method](url, campusFormData);
            if (response.data.success) {
                showSuccessToast(
                    editingCampus 
                        ? 'Campus updated successfully' 
                        : 'Campus created successfully'
                );
                setShowCampusForm(false);
                setEditingCampus(null);
                setCampusFormData({ name: '', code: '', description: '', isActive: true });
                fetchCampuses(selectedCollege._id);
            }
        } catch (error) {
            console.error('Error saving campus:', error);
            showErrorToast(
                error.response?.data?.message || 
                'Failed to save campus'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEditCampus = (campus) => {
        setEditingCampus(campus);
        setCampusFormData({
            name: campus.name || '',
            code: campus.code || '',
            description: campus.description || '',
            isActive: campus.isActive !== false
        });
        setShowCampusForm(true);
    };

    const handleDeleteCampus = async (campusId) => {
        if (!selectedCollege) {
            showErrorToast('Please select an institute first');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this campus?')) {
            return;
        }

        try {
            const response = await api.delete(`/api/colleges/${selectedCollege._id}/campuses/${campusId}`);
            if (response.data.success) {
                showSuccessToast('Campus deleted successfully');
                fetchCampuses(selectedCollege._id);
            }
        } catch (error) {
            console.error('Error deleting campus:', error);
            showErrorToast(
                error.response?.data?.message ||
                'Failed to delete campus'
            );
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Add Buttons */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Institutes, Courses & Campuses
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage institutes, courses, streams, and campuses for the registration form
                    </p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => {
                            setShowCollegeForm(true);
                            setEditingCollege(null);
                            setCollegeFormData({ name: '', code: '', description: '', isActive: true });
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <i className="fa-solid fa-plus mr-2"></i>
                        Add Institute
                    </button>
                </div>
            </div>

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                        onClick={resetForm}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                {editingCollege ? 'Edit Institute' : 'Add New Institute'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* 1. Institute */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Institute Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.instituteName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, instituteName: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter institute name"
                                        required
                                    />
                                </div>

                                {/* 2. Campus */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Campus
                                    </label>
                                    <div className="flex space-x-2 mb-2">
                                        <input
                                            type="text"
                                            value={newCampus}
                                            onChange={(e) => setNewCampus(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addCampus();
                                                }
                                            }}
                                            placeholder="Enter campus name"
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={addCampus}
                                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {formData.campuses.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.campuses.map((campus, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                                                >
                                                    {campus}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCampus(index)}
                                                        className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                                                    >
                                                        <i className="fa-solid fa-times"></i>
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* 3. Courses */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Courses
                                    </label>
                                    <div className="flex space-x-2 mb-2">
                                        <input
                                            type="text"
                                            value={newCourse}
                                            onChange={(e) => setNewCourse(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addCourse();
                                                }
                                            }}
                                            placeholder="Enter course name"
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={addCourse}
                                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {formData.courses.length > 0 && (
                                        <div className="space-y-3 mt-3">
                                            {formData.courses.map((course, courseIndex) => (
                                                <div key={courseIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                                            {course.name}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCourse(courseIndex)}
                                                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </div>

                                                    {/* 4. Streams under each course */}
                                                    <div className="mt-2">
                                                        <div className="flex space-x-2 mb-2">
                                                            <input
                                                                type="text"
                                                                value={selectedCourseIndex === courseIndex ? newStream : ''}
                                                                onChange={(e) => setNewStream(e.target.value)}
                                                                onKeyPress={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        addStream(courseIndex);
                                                                    }
                                                                }}
                                                                onFocus={() => setSelectedCourseIndex(courseIndex)}
                                                                placeholder="Enter stream name"
                                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => addStream(courseIndex)}
                                                                className="px-3 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 text-sm"
                                                            >
                                                                Add Stream
                                                            </button>
                                                        </div>
                                                        {course.streams.length > 0 && (
                                                            <div className="flex flex-wrap gap-2">
                                                                {course.streams.map((stream, streamIndex) => (
                                                                    <span
                                                                        key={streamIndex}
                                                                        className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs"
                                                                    >
                                                                        {stream}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeStream(courseIndex, streamIndex)}
                                                                            className="ml-1 text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100"
                                                                        >
                                                                            <i className="fa-solid fa-times"></i>
                                                                        </button>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : editingCollege ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Campus Form Modal */}
            <AnimatePresence>
                {showCampusForm && selectedCollege && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                        onClick={() => {
                            setShowCampusForm(false);
                            setEditingCampus(null);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                {editingCampus ? 'Edit Campus' : 'Add New Campus'}
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 block mt-1">
                                    for {selectedCollege.name}
                                </span>
                            </h3>
                            <form onSubmit={handleCampusSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Campus Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={campusFormData.name}
                                        onChange={(e) => setCampusFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Campus Code (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={campusFormData.code}
                                        onChange={(e) => setCampusFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        value={campusFormData.description}
                                        onChange={(e) => setCampusFormData(prev => ({ ...prev, description: e.target.value }))}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="campusActive"
                                        checked={campusFormData.isActive}
                                        onChange={(e) => setCampusFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <label htmlFor="campusActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        Active (visible in registration form)
                                    </label>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCampusForm(false);
                                            setEditingCampus(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : editingCampus ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Layout: Institutes on left, Courses and Campuses on right when selected */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Institutes List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Institutes ({colleges.length})
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                        {colleges.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <i className="fa-solid fa-building text-4xl mb-4"></i>
                                <p>No institutes found</p>
                                <p className="text-sm mt-2">Click "Add Institute" to create one</p>
                            </div>
                        ) : (
                            colleges.map((college) => (
                                <div
                                    key={college._id}
                                    className={`p-4 cursor-pointer transition-colors ${
                                        selectedCollege?._id === college._id
                                            ? 'bg-purple-50 dark:bg-purple-900/20'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }`}
                                    onClick={() => handleSelectCollege(college)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {college.name}
                                                </h4>
                                                {college.isActive ? (
                                                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            {college.code && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Code: {college.code}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex space-x-2 ml-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditCollege(college);
                                                }}
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                                title="Edit"
                                            >
                                                <i className="fa-solid fa-edit"></i>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteCollege(college._id);
                                                }}
                                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                title="Delete"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                    {colleges.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <i className="fa-solid fa-building text-4xl mb-4"></i>
                            <p>No institutes found</p>
                            <p className="text-sm mt-2">Click "Add Institute" to create one</p>
                        </div>
                    ) : (
                        colleges.map((college) => (
                            <div
                                key={college._id}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                            {college.name}
                                        </h4>
                                        {college.campuses && college.campuses.length > 0 && (
                                            <div className="mb-2">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Campuses: </span>
                                                <div className="inline-flex flex-wrap gap-1 mt-1">
                                                    {college.campuses.map((campus, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                                                        >
                                                            {campus.name || campus}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            onClick={() => handleEdit(college)}
                                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                            title="Edit"
                                        >
                                            <i className="fa-solid fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(college._id)}
                                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                            title="Delete"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Campuses List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Campuses {selectedCollege ? `(${campuses.length})` : ''}
                        </h3>
                        {selectedCollege && (
                            <button
                                onClick={() => {
                                    setShowCampusForm(true);
                                    setEditingCampus(null);
                                    setCampusFormData({ name: '', code: '', description: '', isActive: true });
                                }}
                                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <i className="fa-solid fa-plus mr-1"></i>
                                Add Campus
                            </button>
                        )}
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                        {!selectedCollege ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <i className="fa-solid fa-building text-4xl mb-4"></i>
                                <p>Select an institute to view campuses</p>
                            </div>
                        ) : campuses.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <i className="fa-solid fa-building text-4xl mb-4"></i>
                                <p>No campuses found for {selectedCollege.name}</p>
                                <p className="text-sm mt-2">Click "Add Campus" to create one</p>
                            </div>
                        ) : (
                            campuses.map((campus) => (
                                <div key={campus._id} className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {campus.name}
                                                </h4>
                                                {campus.isActive ? (
                                                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            {campus.code && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Code: {campus.code}
                                                </p>
                                            )}
                                            {campus.description && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {campus.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex space-x-2 ml-4">
                                            <button
                                                onClick={() => handleEditCampus(campus)}
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                                title="Edit"
                                            >
                                                <i className="fa-solid fa-edit"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCampus(campus._id)}
                                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                title="Delete"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstituteCourseManagement;
