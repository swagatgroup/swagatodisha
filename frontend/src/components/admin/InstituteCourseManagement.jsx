import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { showSuccessToast, showErrorToast } from '../../utils/sweetAlert';

const InstituteCourseManagement = () => {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showCollegeForm, setShowCollegeForm] = useState(false);
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [editingCollege, setEditingCollege] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null);
    const [selectedCollege, setSelectedCollege] = useState(null);
    const [courses, setCourses] = useState([]);

    const [collegeFormData, setCollegeFormData] = useState({
        name: '',
        code: '',
        description: '',
        isActive: true
    });

    const [courseFormData, setCourseFormData] = useState({
        courseName: '',
        courseCode: '',
        streams: [],
        isActive: true
    });

    const [newStream, setNewStream] = useState('');

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

    const fetchCourses = async (collegeId) => {
        try {
            const response = await api.get(`/api/colleges/${collegeId}/courses`);
            if (response.data.success) {
                setCourses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            showErrorToast('Failed to load courses');
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

            const response = await api[method](url, collegeFormData);
            if (response.data.success) {
                showSuccessToast(
                    editingCollege 
                        ? 'Institute updated successfully' 
                        : 'Institute created successfully'
                );
                setShowCollegeForm(false);
                setEditingCollege(null);
                setCollegeFormData({ name: '', code: '', description: '', isActive: true });
                fetchColleges();
            }
        } catch (error) {
            console.error('Error saving college:', error);
            showErrorToast(
                error.response?.data?.message || 
                'Failed to save institute'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCollege) {
            showErrorToast('Please select an institute first');
            return;
        }

        try {
            setSaving(true);
            const url = editingCourse
                ? `/api/colleges/${selectedCollege._id}/courses/${editingCourse._id}`
                : `/api/colleges/${selectedCollege._id}/courses`;
            const method = editingCourse ? 'put' : 'post';

            const response = await api[method](url, courseFormData);
            if (response.data.success) {
                showSuccessToast(
                    editingCourse
                        ? 'Course updated successfully'
                        : 'Course created successfully'
                );
                setShowCourseForm(false);
                setEditingCourse(null);
                setCourseFormData({ courseName: '', courseCode: '', streams: [], isActive: true });
                setNewStream('');
                fetchCourses(selectedCollege._id);
            }
        } catch (error) {
            console.error('Error saving course:', error);
            showErrorToast(
                error.response?.data?.message ||
                'Failed to save course'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEditCollege = (college) => {
        setEditingCollege(college);
        setCollegeFormData({
            name: college.name || '',
            code: college.code || '',
            description: college.description || '',
            isActive: college.isActive !== false
        });
        setShowCollegeForm(true);
    };

    const handleEditCourse = (course) => {
        setEditingCourse(course);
        setCourseFormData({
            courseName: course.courseName || '',
            courseCode: course.courseCode || '',
            streams: course.streams ? course.streams.map(s => s.name || s) : [],
            isActive: course.isActive !== false
        });
        setShowCourseForm(true);
    };

    const handleDeleteCollege = async (collegeId) => {
        if (!window.confirm('Are you sure you want to delete this institute? This will also delete all associated courses.')) {
            return;
        }

        try {
            const response = await api.delete(`/api/colleges/${collegeId}`);
            if (response.data.success) {
                showSuccessToast('Institute deleted successfully');
                fetchColleges();
                if (selectedCollege?._id === collegeId) {
                    setSelectedCollege(null);
                    setCourses([]);
                }
            }
        } catch (error) {
            console.error('Error deleting college:', error);
            showErrorToast(
                error.response?.data?.message ||
                'Failed to delete institute'
            );
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) {
            return;
        }

        try {
            const response = await api.delete(`/api/colleges/${selectedCollege._id}/courses/${courseId}`);
            if (response.data.success) {
                showSuccessToast('Course deleted successfully');
                fetchCourses(selectedCollege._id);
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            showErrorToast(
                error.response?.data?.message ||
                'Failed to delete course'
            );
        }
    };

    const handleSelectCollege = (college) => {
        setSelectedCollege(college);
        fetchCourses(college._id);
        setShowCourseForm(false);
        setEditingCourse(null);
    };

    const addStream = () => {
        if (newStream.trim()) {
            setCourseFormData(prev => ({
                ...prev,
                streams: [...prev.streams, newStream.trim()]
            }));
            setNewStream('');
        }
    };

    const removeStream = (index) => {
        setCourseFormData(prev => ({
            ...prev,
            streams: prev.streams.filter((_, i) => i !== index)
        }));
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
            {/* Header with Add Institute Button */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Institutes & Courses
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage institutes and their courses for the registration form
                    </p>
                </div>
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

            {/* College Form Modal */}
            <AnimatePresence>
                {showCollegeForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                        onClick={() => {
                            setShowCollegeForm(false);
                            setEditingCollege(null);
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
                                {editingCollege ? 'Edit Institute' : 'Add New Institute'}
                            </h3>
                            <form onSubmit={handleCollegeSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Institute Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={collegeFormData.name}
                                        onChange={(e) => setCollegeFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Institute Code (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={collegeFormData.code}
                                        onChange={(e) => setCollegeFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        value={collegeFormData.description}
                                        onChange={(e) => setCollegeFormData(prev => ({ ...prev, description: e.target.value }))}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="collegeActive"
                                        checked={collegeFormData.isActive}
                                        onChange={(e) => setCollegeFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <label htmlFor="collegeActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        Active (visible in registration form)
                                    </label>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCollegeForm(false);
                                            setEditingCollege(null);
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
                                        {saving ? 'Saving...' : editingCollege ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Course Form Modal */}
            <AnimatePresence>
                {showCourseForm && selectedCollege && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                        onClick={() => {
                            setShowCourseForm(false);
                            setEditingCourse(null);
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
                                {editingCourse ? 'Edit Course' : 'Add New Course'}
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 block mt-1">
                                    for {selectedCollege.name}
                                </span>
                            </h3>
                            <form onSubmit={handleCourseSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Course Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={courseFormData.courseName}
                                        onChange={(e) => setCourseFormData(prev => ({ ...prev, courseName: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Course Code (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={courseFormData.courseCode}
                                        onChange={(e) => setCourseFormData(prev => ({ ...prev, courseCode: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Streams (Optional)
                                    </label>
                                    <div className="flex space-x-2 mb-2">
                                        <input
                                            type="text"
                                            value={newStream}
                                            onChange={(e) => setNewStream(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addStream();
                                                }
                                            }}
                                            placeholder="Enter stream name"
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={addStream}
                                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {courseFormData.streams.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {courseFormData.streams.map((stream, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm"
                                                >
                                                    {stream}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeStream(index)}
                                                        className="ml-2 text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100"
                                                    >
                                                        <i className="fa-solid fa-times"></i>
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="courseActive"
                                        checked={courseFormData.isActive}
                                        onChange={(e) => setCourseFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <label htmlFor="courseActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        Active (visible in registration form)
                                    </label>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCourseForm(false);
                                            setEditingCourse(null);
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
                                        {saving ? 'Saving...' : editingCourse ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                {/* Courses List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Courses {selectedCollege ? `(${courses.length})` : ''}
                        </h3>
                        {selectedCollege && (
                            <button
                                onClick={() => {
                                    setShowCourseForm(true);
                                    setEditingCourse(null);
                                    setCourseFormData({ courseName: '', courseCode: '', streams: [], isActive: true });
                                    setNewStream('');
                                }}
                                className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <i className="fa-solid fa-plus mr-1"></i>
                                Add Course
                            </button>
                        )}
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                        {!selectedCollege ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <i className="fa-solid fa-book text-4xl mb-4"></i>
                                <p>Select an institute to view courses</p>
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <i className="fa-solid fa-book text-4xl mb-4"></i>
                                <p>No courses found for {selectedCollege.name}</p>
                                <p className="text-sm mt-2">Click "Add Course" to create one</p>
                            </div>
                        ) : (
                            courses.map((course) => (
                                <div key={course._id} className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {course.courseName}
                                                </h4>
                                                {course.isActive ? (
                                                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            {course.courseCode && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Code: {course.courseCode}
                                                </p>
                                            )}
                                            {course.streams && course.streams.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {course.streams.map((stream, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                                                        >
                                                            {stream.name || stream}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex space-x-2 ml-4">
                                            <button
                                                onClick={() => handleEditCourse(course)}
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                                title="Edit"
                                            >
                                                <i className="fa-solid fa-edit"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCourse(course._id)}
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

