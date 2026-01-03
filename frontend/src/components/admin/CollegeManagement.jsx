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

const CollegeManagement = () => {
    const [colleges, setColleges] = useState([]);
    const [selectedCollege, setSelectedCollege] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCollege, setEditingCollege] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null);
    const [collegeFormData, setCollegeFormData] = useState({
        name: '',
        isActive: true
    });
    const [courseFormData, setCourseFormData] = useState({
        courseName: '',
        courseCode: '',
        streams: [],
        isActive: true
    });
    const [newStreamName, setNewStreamName] = useState('');

    useEffect(() => {
        fetchColleges();
    }, []);

    useEffect(() => {
        if (selectedCollege) {
            fetchCourses(selectedCollege._id);
        } else {
            setCourses([]);
        }
    }, [selectedCollege]);

    const fetchColleges = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/admin/colleges');
            if (response.data.success) {
                setColleges(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching colleges:', error);
            showError('Error', 'Failed to fetch colleges');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async (collegeId) => {
        try {
            const response = await api.get(`/api/admin/colleges/${collegeId}/courses`);
            if (response.data.success) {
                setCourses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            showError('Error', 'Failed to fetch courses');
        }
    };

    const handleCollegeSubmit = async (e) => {
        e.preventDefault();

        try {
            showLoading('Processing...', 'Saving college...');

            let response;
            if (editingCollege) {
                response = await api.put(`/api/admin/colleges/${editingCollege._id}`, collegeFormData);
            } else {
                response = await api.post('/api/admin/colleges', collegeFormData);
            }

            if (response.data.success) {
                closeLoading();
                showSuccessToast(editingCollege ? 'College updated successfully!' : 'College created successfully!');
                resetCollegeForm();
                fetchColleges();
            }
        } catch (error) {
            closeLoading();
            console.error('Error saving college:', error);
            showError('Error', error.response?.data?.message || 'Failed to save college');
        }
    };

    const handleCourseSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCollege) {
            showError('Error', 'Please select a college first');
            return;
        }

        try {
            showLoading('Processing...', 'Saving course...');

            let response;
            if (editingCourse) {
                response = await api.put(
                    `/api/admin/colleges/${selectedCollege._id}/courses/${editingCourse._id}`,
                    courseFormData
                );
            } else {
                response = await api.post(`/api/admin/colleges/${selectedCollege._id}/courses`, courseFormData);
            }

            if (response.data.success) {
                closeLoading();
                showSuccessToast(editingCourse ? 'Course updated successfully!' : 'Course created successfully!');
                resetCourseForm();
                fetchCourses(selectedCollege._id);
            }
        } catch (error) {
            closeLoading();
            console.error('Error saving course:', error);
            showError('Error', error.response?.data?.message || 'Failed to save course');
        }
    };

    const handleEditCollege = (college) => {
        setEditingCollege(college);
        setCollegeFormData({
            name: college.name || '',
            isActive: college.isActive !== false
        });
    };

    const handleEditCourse = (course) => {
        setEditingCourse(course);
        setCourseFormData({
            courseName: course.courseName || '',
            streams: course.streams || [],
            isActive: course.isActive !== false
        });
    };

    const handleDeleteCollege = async (id) => {
        const confirmed = await showConfirm(
            'Delete College',
            'Are you sure you want to delete this college? This will also delete all associated courses. This action cannot be undone.',
            'warning'
        );

        if (!confirmed) return;

        try {
            showLoading('Deleting...', 'Removing college...');
            const response = await api.delete(`/api/admin/colleges/${id}`);
            if (response.data.success) {
                closeLoading();
                showSuccessToast('College deleted successfully!');
                if (selectedCollege?._id === id) {
                    setSelectedCollege(null);
                }
                fetchColleges();
            }
        } catch (error) {
            closeLoading();
            console.error('Error deleting college:', error);
            showError('Error', error.response?.data?.message || 'Failed to delete college');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        const confirmed = await showConfirm(
            'Delete Course',
            'Are you sure you want to delete this course? This action cannot be undone.',
            'warning'
        );

        if (!confirmed || !confirmed.isConfirmed) return;

        try {
            showLoading('Deleting...', 'Removing course...');
            const response = await api.delete(`/api/admin/colleges/${selectedCollege._id}/courses/${courseId}`);
            if (response.data.success) {
                closeLoading();
                showSuccessToast('Course deleted successfully!');
                fetchCourses(selectedCollege._id);
            }
        } catch (error) {
            closeLoading();
            console.error('Error deleting course:', error);
            showError('Error', error.response?.data?.message || 'Failed to delete course');
        }
    };

    const resetCollegeForm = () => {
        setCollegeFormData({
            name: '',
            isActive: true
        });
        setEditingCollege(null);
    };

    const resetCourseForm = () => {
        setCourseFormData({
            courseName: '',
            streams: [],
            isActive: true
        });
        setEditingCourse(null);
        setNewStreamName('');
    };

    const addStream = () => {
        if (!newStreamName.trim()) {
            showError('Error', 'Please enter a stream name');
            return;
        }
        setCourseFormData({
            ...courseFormData,
            streams: [...courseFormData.streams, { name: newStreamName.trim(), isActive: true }]
        });
        setNewStreamName('');
    };

    const removeStream = (index) => {
        setCourseFormData({
            ...courseFormData,
            streams: courseFormData.streams.filter((_, i) => i !== index)
        });
    };

    const toggleStreamActive = (index) => {
        const updatedStreams = [...courseFormData.streams];
        updatedStreams[index] = {
            ...updatedStreams[index],
            isActive: !updatedStreams[index].isActive
        };
        setCourseFormData({
            ...courseFormData,
            streams: updatedStreams
        });
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
            {/* College Management */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {editingCollege ? 'Edit Institution' : 'Add New Institution'}
                </h2>

                <form onSubmit={handleCollegeSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Institution Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={collegeFormData.name}
                            onChange={(e) => setCollegeFormData({ ...collegeFormData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                            placeholder="Enter institution name"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="collegeIsActive"
                            checked={collegeFormData.isActive}
                            onChange={(e) => setCollegeFormData({ ...collegeFormData, isActive: e.target.checked })}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor="collegeIsActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Active
                        </label>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {editingCollege ? 'Update Institution' : 'Create Institution'}
                        </button>
                        {editingCollege && (
                            <button
                                type="button"
                                onClick={resetCollegeForm}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Colleges List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Institutions ({colleges.length})
                </h2>

                {colleges.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No institutions found. Create your first institution above.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {colleges.map((college) => (
                            <motion.div
                                key={college._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${selectedCollege?._id === college._id
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                    : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                onClick={() => {
                                    setSelectedCollege(college);
                                    fetchCourses(college._id);
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                {college.name}
                                            </h3>
                                            {!college.isActive && (
                                                <span className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded text-xs">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditCollege(college);
                                            }}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-800"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteCollege(college._id);
                                            }}
                                            className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded text-xs hover:bg-red-200 dark:hover:bg-red-800"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Course Management - Only show if college is selected */}
            {selectedCollege ? (
                <>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {editingCourse ? 'Edit Course' : `Add Course to ${selectedCollege.name}`}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Manage courses and streams for this institution
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedCollege(null)}
                                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded"
                            >
                                Clear Selection
                            </button>
                        </div>

                        <form onSubmit={handleCourseSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Course Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={courseFormData.courseName}
                                    onChange={(e) => setCourseFormData({ ...courseFormData, courseName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    required
                                    placeholder="e.g., B.Tech Computer Science, B.Sc, B.Com"
                                />
                            </div>

                            {/* Streams Management */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Streams/Branches (Optional)
                                </label>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newStreamName}
                                            onChange={(e) => setNewStreamName(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addStream();
                                                }
                                            }}
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="Enter stream name (e.g., Physics, Chemistry, Biology)"
                                        />
                                        <button
                                            type="button"
                                            onClick={addStream}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            Add Stream
                                        </button>
                                    </div>
                                    {courseFormData.streams.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {courseFormData.streams.map((stream, index) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">{stream.name}</span>
                                                        <span className={`text-xs px-2 py-1 rounded ${stream.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'}`}>
                                                            {stream.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleStreamActive(index)}
                                                            className={`text-xs px-2 py-1 rounded ${stream.isActive ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                                                        >
                                                            {stream.isActive ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeStream(index)}
                                                            className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="courseIsActive"
                                    checked={courseFormData.isActive}
                                    onChange={(e) => setCourseFormData({ ...courseFormData, isActive: e.target.checked })}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label htmlFor="courseIsActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    Active
                                </label>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {editingCourse ? 'Update Course' : 'Create Course'}
                                </button>
                                {editingCourse && (
                                    <button
                                        type="button"
                                        onClick={resetCourseForm}
                                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Courses List */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            Courses for {selectedCollege.name} ({courses.length})
                        </h2>

                        {courses.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                No courses found. Create your first course above.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {courses.map((course) => (
                                    <motion.div
                                        key={course._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {course.courseName}
                                                    </h3>
                                                    {!course.isActive && (
                                                        <span className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded text-xs">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                                {course.streams && course.streams.length > 0 && (
                                                    <div className="mt-2">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Streams:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {course.streams.filter(s => s.isActive).map((stream, idx) => (
                                                                <span key={idx} className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded">
                                                                    {stream.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex space-x-2 ml-4">
                                                <button
                                                    onClick={() => handleEditCourse(course)}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-800"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCourse(course._id)}
                                                    className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded text-xs hover:bg-red-200 dark:hover:bg-red-800"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400 mb-2">
                            Select an institution from above to manage courses and streams
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            Click on any institution to view and add courses
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollegeManagement;

