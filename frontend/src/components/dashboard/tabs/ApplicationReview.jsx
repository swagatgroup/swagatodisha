import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentTextIcon,
    PhotoIcon,
    UserIcon,
    AcademicCapIcon,
    ShieldCheckIcon,
    CurrencyDollarIcon,
    ArrowDownTrayIcon,
    ArchiveBoxIcon,
    ClockIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';
import api from '../../../utils/api';
import { showSuccess, showError, showConfirm } from '../../../utils/sweetAlert';

const ApplicationReview = () => {
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [activeTab, setActiveTab] = useState('submitted');
    const [comments, setComments] = useState('');

    const tabs = [
        { id: 'submitted', name: 'Submitted', count: 0, color: 'blue' },
        { id: 'under_review', name: 'Under Review', count: 0, color: 'yellow' },
        { id: 'approved', name: 'Approved', count: 0, color: 'green' },
        { id: 'rejected', name: 'Rejected', count: 0, color: 'red' }
    ];

    const verificationSteps = [
        {
            id: 'documentsVerified',
            name: 'Documents Verification',
            icon: DocumentTextIcon,
            description: 'Verify all uploaded documents',
            color: 'blue'
        },
        {
            id: 'personalDetailsVerified',
            name: 'Personal Details',
            icon: UserIcon,
            description: 'Verify personal information',
            color: 'purple'
        },
        {
            id: 'academicDetailsVerified',
            name: 'Academic Details',
            icon: AcademicCapIcon,
            description: 'Verify academic qualifications',
            color: 'green'
        },
        {
            id: 'guardianDetailsVerified',
            name: 'Guardian Details',
            icon: ShieldCheckIcon,
            description: 'Verify guardian information',
            color: 'orange'
        },
        {
            id: 'financialDetailsVerified',
            name: 'Financial Details',
            icon: CurrencyDollarIcon,
            description: 'Verify financial information',
            color: 'indigo'
        }
    ];

    useEffect(() => {
        fetchApplications();
    }, [activeTab]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            // Temporarily use debug route for testing
            const response = await api.get(`/api/student-application/submitted-debug?status=${activeTab.toUpperCase()}`);

            if (response.data?.success) {
                setApplications(response.data.data.applications || []);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
            showError('Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicationDetails = async (applicationId) => {
        try {
            const response = await api.get(`/api/student-application/${applicationId}/review`);

            if (response.data?.success) {
                setSelectedApplication(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching application details:', error);
            showError('Failed to fetch application details');
        }
    };

    const handleVerification = async (verificationType, isVerified) => {
        if (!selectedApplication) return;

        try {
            setVerifying(true);
            const response = await api.put(`/api/student-application/${selectedApplication.applicationId}/verify`, {
                verificationType,
                isVerified,
                comments: comments.trim() || undefined
            });

            if (response.data?.success) {
                showSuccess(response.data.message);
                setComments('');
                await fetchApplicationDetails(selectedApplication.applicationId);
                await fetchApplications();
            }
        } catch (error) {
            console.error('Error verifying application:', error);
            showError('Failed to verify application');
        } finally {
            setVerifying(false);
        }
    };

    const handleGeneratePDF = async () => {
        if (!selectedApplication) return;

        try {
            const response = await api.post(`/api/student-application/${selectedApplication.applicationId}/combined-pdf`);

            if (response.data?.success) {
                showSuccess('Combined PDF generation initiated');
                // In a real implementation, you would download the PDF
                window.open(response.data.data.pdfUrl, '_blank');
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            showError('Failed to generate PDF');
        }
    };

    const handleGenerateZIP = async () => {
        if (!selectedApplication) return;

        try {
            const response = await api.post(`/api/student-application/${selectedApplication.applicationId}/documents-zip`);

            if (response.data?.success) {
                showSuccess('Documents ZIP generation initiated');
                // In a real implementation, you would download the ZIP
                window.open(response.data.data.zipUrl, '_blank');
            }
        } catch (error) {
            console.error('Error generating ZIP:', error);
            showError('Failed to generate ZIP');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'SUBMITTED': 'bg-blue-100 text-blue-800',
            'UNDER_REVIEW': 'bg-yellow-100 text-yellow-800',
            'APPROVED': 'bg-green-100 text-green-800',
            'REJECTED': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getVerificationStatus = (application, stepId) => {
        if (!application.reviewStatus) return 'pending';
        return application.reviewStatus[stepId] ? 'verified' : 'pending';
    };

    const renderApplicationCard = (application) => (
        <motion.div
            key={application._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => fetchApplicationDetails(application.applicationId)}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {application.personalDetails?.fullName || 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {application.personalDetails?.email || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Application ID: {application.applicationId}
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {application.status}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                        {application.personalDetails?.phoneNumber || 'N/A'}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Course</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                        {application.courseDetails?.courseName || 'N/A'}
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {new Date(application.submittedAt).toLocaleDateString()}
                </div>
                <button className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Review
                </button>
            </div>
        </motion.div>
    );

    const renderVerificationStep = (step) => {
        if (!selectedApplication) return null;

        const status = getVerificationStatus(selectedApplication, step.id);
        const Icon = step.icon;

        return (
            <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${status === 'verified' ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : ''
                    }`}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className={`p-3 rounded-lg ${status === 'verified'
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                            : `bg-${step.color}-100 text-${step.color}-600 dark:bg-${step.color}-900/30`
                            }`}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {step.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {step.description}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {status === 'verified' ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        ) : (
                            <ClockIcon className="h-6 w-6 text-gray-400" />
                        )}
                    </div>
                </div>

                {status !== 'verified' && (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleVerification(step.id, true)}
                            disabled={verifying}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            Approve
                        </button>
                        <button
                            onClick={() => handleVerification(step.id, false)}
                            disabled={verifying}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            <XCircleIcon className="h-4 w-4 mr-2" />
                            Reject
                        </button>
                    </div>
                )}
            </motion.div>
        );
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
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Application Review
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Review and verify student applications
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            {tab.name}
                            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === tab.id
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700'
                                }`}>
                                {applications.length}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Applications List */}
                <div className="lg:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Applications ({applications.length})
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {applications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No applications found
                            </div>
                        ) : (
                            applications.map(renderApplicationCard)
                        )}
                    </div>
                </div>

                {/* Application Details */}
                <div className="lg:col-span-2">
                    {selectedApplication ? (
                        <div className="space-y-6">
                            {/* Application Header */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                            {selectedApplication.personalDetails?.fullName}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {selectedApplication.personalDetails?.email}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Application ID: {selectedApplication.applicationId}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}>
                                        {selectedApplication.status}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleGeneratePDF}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                                        Generate PDF
                                    </button>
                                    <button
                                        onClick={handleGenerateZIP}
                                        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                    >
                                        <ArchiveBoxIcon className="h-4 w-4 mr-2" />
                                        Generate ZIP
                                    </button>
                                </div>
                            </div>

                            {/* Verification Steps */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Verification Steps
                                </h4>
                                {verificationSteps.map(renderVerificationStep)}
                            </div>

                            {/* Comments */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Add Comments
                                </h4>
                                <textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Add your comments here..."
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <DocumentTextIcon className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Select an Application
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Choose an application from the list to review its details
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplicationReview;
