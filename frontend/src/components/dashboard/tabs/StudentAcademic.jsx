import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';
import { showSuccess, showError } from '../../../utils/sweetAlert';

const StudentAcademic = () => {
    const [academicData, setAcademicData] = useState({
        course: null,
        assignments: [],
        grades: [],
        materials: [],
        schedule: []
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchAcademicData();
    }, []);

    const fetchAcademicData = async () => {
        try {
            setLoading(true);
            const [courseResponse, assignmentsResponse, gradesResponse, materialsResponse, scheduleResponse] = await Promise.all([
                api.get('/api/students/course'),
                api.get('/api/students/assignments'),
                api.get('/api/students/grades'),
                api.get('/api/students/materials'),
                api.get('/api/students/schedule')
            ]);

            setAcademicData({
                course: courseResponse.data.data.course,
                assignments: assignmentsResponse.data.data.assignments || [],
                grades: gradesResponse.data.data.grades || [],
                materials: materialsResponse.data.data.materials || [],
                schedule: scheduleResponse.data.data.schedule || []
            });
        } catch (error) {
            console.error('Error fetching academic data:', error);
            showError('Failed to load academic data');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignmentSubmit = async (assignmentId, submissionData) => {
        try {
            await api.post(`/api/students/assignments/${assignmentId}/submit`, submissionData);
            showSuccess('Assignment submitted successfully!');
            fetchAcademicData();
        } catch (error) {
            console.error('Error submitting assignment:', error);
            showError('Failed to submit assignment');
        }
    };

    const getGradeColor = (grade) => {
        if (grade >= 90) return 'text-green-600';
        if (grade >= 80) return 'text-blue-600';
        if (grade >= 70) return 'text-yellow-600';
        if (grade >= 60) return 'text-orange-600';
        return 'text-red-600';
    };

    const getGradeLetter = (grade) => {
        if (grade >= 90) return 'A+';
        if (grade >= 80) return 'A';
        if (grade >= 70) return 'B+';
        if (grade >= 60) return 'B';
        if (grade >= 50) return 'C+';
        if (grade >= 40) return 'C';
        return 'F';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'submitted': return 'bg-blue-100 text-blue-800';
            case 'graded': return 'bg-green-100 text-green-800';
            case 'late': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Filter helpers to ensure course-wise visibility
    const matchesStudentCourse = (item) => {
        if (!academicData.course) return true;
        const courseId = academicData.course._id || academicData.course.id;
        return (
            item.courseId === courseId ||
            item.course === academicData.course.name ||
            item.courseName === academicData.course.name
        );
    };

    const filteredAssignments = academicData.assignments.filter(matchesStudentCourse);
    const filteredMaterials = academicData.materials.filter(matchesStudentCourse);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Academic Dashboard</h2>
                        <p className="text-gray-600">
                            {academicData.course ? academicData.course.name : 'Course information not available'}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'overview'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('assignments')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'assignments'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Assignments
                        </button>
                        <button
                            onClick={() => setActiveTab('grades')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'grades'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Grades
                        </button>
                        <button
                            onClick={() => setActiveTab('materials')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'materials'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Materials
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Course Information */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
                        {academicData.course ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-900">{academicData.course.name}</h4>
                                    <p className="text-gray-600">{academicData.course.description}</p>
                                    <div className="mt-4 space-y-2">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Duration:</span> {academicData.course.duration}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Credits:</span> {academicData.course.credits}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Instructor:</span> {academicData.course.instructor}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h5 className="font-medium text-gray-900 mb-2">Course Progress</h5>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full"
                                            style={{ width: `${academicData.course.progress || 0}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-gray-600">{academicData.course.progress || 0}% Complete</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">No course information available</p>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Assignments</p>
                                    <p className="text-2xl font-semibold text-gray-900">{academicData.assignments.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-100 rounded-full">
                                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {academicData.assignments.filter(a => a.status === 'graded').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-yellow-100 rounded-full">
                                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {academicData.assignments.filter(a => a.status === 'pending').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Average Grade</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {academicData.grades.length > 0
                                            ? (academicData.grades.reduce((sum, g) => sum + g.grade, 0) / academicData.grades.length).toFixed(1)
                                            : 'N/A'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Deadlines */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
                        <div className="space-y-3">
                            {filteredAssignments
                                .filter(a => new Date(a.dueDate) > new Date())
                                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                                .slice(0, 5)
                                .map(assignment => (
                                    <div key={assignment._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                                            <p className="text-sm text-gray-600">{assignment.subject}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(assignment.dueDate).toLocaleDateString()}
                                            </p>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                                                {assignment.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Assignments Tab */}
            {activeTab === 'assignments' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow"
                >
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {filteredAssignments.map((assignment, index) => (
                            <motion.div
                                key={assignment._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 hover:bg-gray-50"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h4 className="text-lg font-semibold text-gray-900">{assignment.title}</h4>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                                                {assignment.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-2">{assignment.description}</p>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span>Subject: {assignment.subject}</span>
                                            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                            <span>Points: {assignment.points}</span>
                                        </div>
                                        {assignment.instructions && (
                                            <p className="text-sm text-gray-600 mt-2 italic">"{assignment.instructions}"</p>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {assignment.status === 'pending' && (
                                            <button className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                                Submit
                                            </button>
                                        )}
                                        <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Grades Tab */}
            {activeTab === 'grades' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow"
                >
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Grades</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {academicData.grades.filter(matchesStudentCourse).map((grade, index) => (
                            <motion.div
                                key={grade._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 hover:bg-gray-50"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-900">{grade.assignment}</h4>
                                        <p className="text-gray-600 mb-2">{grade.subject}</p>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span>Submitted: {new Date(grade.submittedDate).toLocaleDateString()}</span>
                                            <span>Graded: {new Date(grade.gradedDate).toLocaleDateString()}</span>
                                        </div>
                                        {grade.feedback && (
                                            <p className="text-sm text-gray-600 mt-2 italic">"{grade.feedback}"</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-2xl font-bold ${getGradeColor(grade.grade)}`}>
                                            {grade.grade}%
                                        </div>
                                        <div className={`text-sm font-medium ${getGradeColor(grade.grade)}`}>
                                            {getGradeLetter(grade.grade)}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Materials Tab */}
            {activeTab === 'materials' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow"
                >
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Course Materials</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {filteredMaterials.map((material, index) => (
                            <motion.div
                                key={material._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{material.title}</h4>
                                        <p className="text-sm text-gray-600">{material.type}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{material.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        {new Date(material.uploadDate).toLocaleDateString()}
                                    </span>
                                    <a href={material.url || material.fileUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                        Download
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                        {filteredMaterials.length === 0 && (
                            <div className="col-span-full text-center text-gray-500 py-8">No materials available for your course yet.</div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default StudentAcademic;
