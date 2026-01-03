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
        code: '',
        description: '',
        displayOrder: 0,
        isActive: true
    });
    const [courseFormData, setCourseFormData] = useState({
        courseName: '',
        courseCode: '',
        displayOrder: 0,
        isActive: true
    });

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
            code: college.code || '',
            description: college.description || '',
            displayOrder: college.displayOrder || 0,
            isActive: college.isActive !== false
        });
    };

    const handleEditCourse = (course) => {
        setEditingCourse(course);
        setCourseFormData({
            courseName: course.courseName || '',
            courseCode: course.courseCode || '',
            displayOrder: course.displayOrder || 0,
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

        if (!confirmed) return;

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
            code: '',
            description: '',
            displayOrder: 0,
            isActive: true
        });
        setEditingCollege(null);
    };

    const resetCourseForm = () => {
        setCourseFormData({
            courseName: '',
            courseCode: '',
            displayOrder: 0,
            isActive: true
        });
        setEditingCourse(null);
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
                    {editingCollege ? 'Edit College' : 'Add New College'}
                </h2>

                <form onSubmit={handleCollegeSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                College Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={collegeFormData.name}
                                onChange={(e) => setCollegeFormData({ ...collegeFormData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                College Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={collegeFormData.code}
                                onChange={(e) => setCollegeFormData({ ...collegeFormData, code: e.target.value.toUpperCase() })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                                placeholder="e.g., COE, CSE"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={collegeFormData.description}
                            onChange={(e) => setCollegeFormData({ ...collegeFormData, description: e.target.value })}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Display Order
                            </label>
                            <input
                                type="number"
                                value={collegeFormData.displayOrder}
                                onChange={(e) => setCollegeFormData({ ...collegeFormData, displayOrder: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                min="0"
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
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {editingCollege ? 'Update College' : 'Create College'}
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
                    Colleges ({colleges.length})
                </h2>

                {colleges.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No colleges found. Create your first college above.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {colleges.map((college) => (
                            <motion.div
                                key={college._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                                    selectedCollege?._id === college._id
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-gray-200 dark:border-gray-700'
                                }`}
                                onClick={() => setSelectedCollege(college)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                {college.name}
                                            </h3>
                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                                                {college.code}
                                            </span>
                                            {!college.isActive && (
                                                <span className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded text-xs">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        {college.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {college.description}
                                            </p>
                                        )}
                                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                            <span>Order: {college.displayOrder}</span>
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
            {selectedCollege && (
                <>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            {editingCourse ? 'Edit Course' : `Add Course to ${selectedCollege.name}`}
                        </h2>

                        <form onSubmit={handleCourseSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        placeholder="e.g., B.Tech Computer Science"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Course Code
                                    </label>
                                    <input
                                        type="text"
                                        value={courseFormData.courseCode}
                                        onChange={(e) => setCourseFormData({ ...courseFormData, courseCode: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="e.g., BTECH-CS"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={courseFormData.displayOrder}
                                        onChange={(e) => setCourseFormData({ ...courseFormData, displayOrder: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        min="0"
                                    />
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
                                                    {course.courseCode && (
                                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                                                            {course.courseCode}
                                                        </span>
                                                    )}
                                                    {!course.isActive && (
                                                        <span className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded text-xs">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                                    <span>Order: {course.displayOrder}</span>
                                                </div>
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
            )}
        </div>
    );
};

export default CollegeManagement;

