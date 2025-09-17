import {useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';

const StudentApplication = ({ onStudentUpdate }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [students, setStudents] = useState([]);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        loadStudents();
        loadApplications();
    }, []);

    const loadStudents = async () => {
        try {
            const response = await api.get('/api/agents/students');
            if (response.data.success) {
                const list = response.data.data?.students ?? response.data.data ?? [];
                setStudents(Array.isArray(list) ? list : []);
            } else {
                setStudents([]);
            }
        } catch (error) {
            console.error('Error loading students:', error);
            setStudents([]);
        }
    };

    const loadApplications = async () => {
        try {
            setLoading(true);
            let response;
            try {
                response = await api.get('/api/applications');
            } catch (err) {
                if (err?.response?.status === 404) {
                    // fallback to student applications endpoint if exists
                    response = await api.get('/api/students/applications');
                } else {
                    throw err;
                }
            }

            if (response?.data?.success) {
                const list = response.data.data?.applications ?? response.data.data ?? [];
                setApplications(Array.isArray(list) ? list : []);
            } else if (Array.isArray(response?.data)) {
                setApplications(response.data);
            } else {
                setApplications([]);
            }
        } catch (error) {
            console.error('Error loading applications:', error);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const generateApplication = async (studentId) => {
        try {
            setGenerating(true);
            const response = await api.post('/api/applications/generate', {
                studentId
            });

            if (response.data.success) {
                alert('Application generated successfully!');
                loadApplications();
                onStudentUpdate();
            }
        } catch (error) {
            console.error('Error generating application:', error);
            alert('Error generating application. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const downloadApplication = async (applicationId) => {
        try {
            const response = await api.get(`/api/applications/${applicationId}/download`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `application_${applicationId}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading application:', error);
            alert('Error downloading application. Please try again.');
        }
    };

    const submitApplication = async (applicationId) => {
        if (!window.confirm('Are you sure you want to submit this application? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await api.post(`/api/applications/${applicationId}/submit`);

            if (response.data.success) {
                alert('Application submitted successfully!');
                loadApplications();
                onStudentUpdate();
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('Error submitting application. Please try again.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            case 'generated':
                return 'bg-blue-100 text-blue-800';
            case 'submitted':
                return 'bg-green-100 text-green-800';
            case 'under_review':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'draft':
                return 'Draft';
            case 'generated':
                return 'Generated';
            case 'submitted':
                return 'Submitted';
            case 'under_review':
                return 'Under Review';
            case 'approved':
                return 'Approved';
            case 'rejected':
                return 'Rejected';
            default:
                return 'Unknown';
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
            {/* Header with Student Selection */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Application Management</h3>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
                        <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Choose a student...</option>
                            {(Array.isArray(students) ? students : []).map(student => (
                                <option key={student._id} value={student._id}>
                                    {student.personalDetails?.fullName} - {student.studentId}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => selectedStudent && generateApplication(selectedStudent)}
                            disabled={!selectedStudent || generating}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {generating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>Generate Application</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Application List */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900">Applications ({applications.length})</h4>
                </div>

                <div className="p-6">
                    {applications.length === 0 ? (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
                            <p className="mt-1 text-sm text-gray-500">Generate applications for students to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {(Array.isArray(applications) ? applications : []).map((application, index) => (
                                <motion.div
                                    key={application._id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>

                                            <div>
                                                <h5 className="font-medium text-gray-900">
                                                    Application #{application.applicationNumber}
                                                </h5>
                                                <p className="text-sm text-gray-500">
                                                    {application.student?.personalDetails?.fullName} • {application.student?.studentId}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Course: {application.student?.courseDetails?.selectedCourse}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Created: {new Date(application.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                                                {getStatusText(application.status)}
                                            </span>

                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => downloadApplication(application._id)}
                                                    className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Download PDF
                                                </button>

                                                {application.status === 'generated' && (
                                                    <button
                                                        onClick={() => submitApplication(application._id)}
                                                        className="px-3 py-1 text-green-600 hover:text-green-800 text-sm font-medium"
                                                    >
                                                        Submit
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        // View application details
                                                        alert('View application details functionality would be implemented here');
                                                    }}
                                                    className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm font-medium"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {application.remarks && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded">
                                            <p className="text-sm text-gray-600">
                                                <strong>Remarks:</strong> {application.remarks}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Terms and Conditions</h4>
                <div className="prose max-w-none text-sm text-gray-600">
                    <p className="mb-4">
                        By submitting an application, the student agrees to the following terms and conditions:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>All information provided is true and accurate to the best of the student's knowledge.</li>
                        <li>The student understands that providing false information may result in rejection of the application.</li>
                        <li>The student agrees to comply with all institutional policies and procedures.</li>
                        <li>Fees are non-refundable once the application is approved and admission is confirmed.</li>
                        <li>The institution reserves the right to verify all submitted documents and information.</li>
                        <li>Admission is subject to availability of seats and meeting all eligibility criteria.</li>
                        <li>The student agrees to maintain academic standards and conduct as per institutional guidelines.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default StudentApplication;
