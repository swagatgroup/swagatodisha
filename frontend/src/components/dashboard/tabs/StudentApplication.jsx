import {useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';
import { showSuccess, showError, showConfirm } from '../../../utils/sweetAlert';
import { useAuth } from '../../../contexts/AuthContext';

const StudentApplication = ({ onStudentUpdate }) => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [students, setStudents] = useState([]);
    const [generating, setGenerating] = useState(false);
    const [rejectionDetails, setRejectionDetails] = useState(null);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [resubmitting, setResubmitting] = useState(false);

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

    const fetchRejectionDetails = async (applicationId) => {
        try {
            // Use different endpoints based on user role
            const endpoint = user?.role === 'agent' 
                ? `/api/agents/students/${applicationId}/rejection-details`
                : `/api/admin/students/${applicationId}/rejection-details`;
                
            const response = await api.get(endpoint);
            if (response.data.success) {
                setRejectionDetails(response.data.data);
                setShowRejectionModal(true);
            }
        } catch (error) {
            console.error('Error fetching rejection details:', error);
            showError('Failed to load rejection details');
        }
    };

    const resubmitApplication = async (applicationId) => {
        const confirmed = await showConfirm(
            'Resubmit Application',
            'Are you sure you want to resubmit this application? Make sure you have addressed all the issues mentioned in the rejection feedback.',
            'Yes, Resubmit',
            'Cancel'
        );

        if (!confirmed) return;

        try {
            setResubmitting(true);
            
            // Use different endpoints based on user role
            const endpoint = user?.role === 'agent' 
                ? `/api/agents/students/${applicationId}/resubmit`
                : `/api/admin/students/${applicationId}/resubmit`;
                
            const response = await api.post(endpoint);
            
            if (response.data.success) {
                showSuccess('Application resubmitted successfully! It will be reviewed again.');
                loadApplications(); // Refresh the list
            }
        } catch (error) {
            console.error('Error resubmitting application:', error);
            showError('Failed to resubmit application');
        } finally {
            setResubmitting(false);
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

                                                {application.status === 'rejected' && (
                                                    <>
                                                        <button
                                                            onClick={() => fetchRejectionDetails(application._id)}
                                                            className="px-3 py-1 text-red-600 hover:text-red-800 text-sm font-medium"
                                                        >
                                                            View Rejection Details
                                                        </button>
                                                        <button
                                                            onClick={() => resubmitApplication(application._id)}
                                                            disabled={resubmitting}
                                                            className="px-3 py-1 text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
                                                        >
                                                            {resubmitting ? 'Resubmitting...' : 'Resubmit'}
                                                        </button>
                                                    </>
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

            {/* Rejection Details Modal */}
            {showRejectionModal && rejectionDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Application Rejection Details
                                </h3>
                                <button
                                    onClick={() => setShowRejectionModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Rejection Summary */}
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <h4 className="text-md font-semibold text-red-800 dark:text-red-200 mb-2">
                                        Rejection Summary
                                    </h4>
                                    <p className="text-red-700 dark:text-red-300">
                                        <strong>Reason:</strong> {rejectionDetails.rejectionReason}
                                    </p>
                                    <p className="text-red-700 dark:text-red-300 mt-2">
                                        <strong>Message:</strong> {rejectionDetails.rejectionMessage}
                                    </p>
                                    <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                                        <strong>Rejected on:</strong> {new Date(rejectionDetails.rejectedAt).toLocaleString()}
                                    </p>
                                </div>

                                {/* Specific Issues */}
                                {rejectionDetails.rejectionDetails && rejectionDetails.rejectionDetails.length > 0 && (
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            Specific Issues to Address
                                        </h4>
                                        <div className="space-y-4">
                                            {rejectionDetails.rejectionDetails.map((detail, index) => (
                                                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                                            Issue #{index + 1}
                                                        </h5>
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                            detail.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                            detail.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                            {detail.priority} Priority
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Issue:</span>
                                                            <p className="text-gray-900 dark:text-gray-100">{detail.issue}</p>
                                                        </div>
                                                        
                                                        {detail.documentType && (
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Document:</span>
                                                                <p className="text-gray-900 dark:text-gray-100">{detail.documentType}</p>
                                                            </div>
                                                        )}
                                                        
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Action Required:</span>
                                                            <p className="text-gray-900 dark:text-gray-100">{detail.actionRequired}</p>
                                                        </div>
                                                        
                                                        {detail.specificFeedback && (
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Feedback:</span>
                                                                <p className="text-gray-900 dark:text-gray-100">{detail.specificFeedback}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Admin Notes */}
                                {rejectionDetails.adminNotes && rejectionDetails.adminNotes.length > 0 && (
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            Admin Notes
                                        </h4>
                                        <div className="space-y-2">
                                            {rejectionDetails.adminNotes.map((note, index) => (
                                                <div key={index} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                                    <p className="text-blue-800 dark:text-blue-200">{note.note}</p>
                                                    <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                                                        Added on: {new Date(note.addedAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Instructions */}
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                    <h4 className="text-md font-semibold text-green-800 dark:text-green-200 mb-2">
                                        Next Steps
                                    </h4>
                                    <ul className="text-green-700 dark:text-green-300 space-y-1">
                                        <li>• Review all the issues mentioned above</li>
                                        <li>• Gather the required documents or information</li>
                                        <li>• Upload corrected/updated documents</li>
                                        <li>• Click "Resubmit" when ready for review</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowRejectionModal(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRejectionModal(false);
                                        resubmitApplication(rejectionDetails.applicationId || '');
                                    }}
                                    disabled={resubmitting}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    {resubmitting ? 'Resubmitting...' : 'Resubmit Application'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentApplication;
