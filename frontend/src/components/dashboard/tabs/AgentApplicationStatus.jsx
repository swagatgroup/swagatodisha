import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    ChatBubbleLeftRightIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import api from '../../../utils/api';
import { showSuccess, showError, showConfirm } from '../../../utils/sweetAlert';

const AgentApplicationStatus = () => {
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [resubmitting, setResubmitting] = useState(false);

    const tabs = [
        { id: 'all', name: 'All Applications', color: 'gray' },
        { id: 'submitted', name: 'Submitted', color: 'blue' },
        { id: 'approved', name: 'Approved', color: 'green' },
        { id: 'rejected', name: 'Rejected', color: 'red' }
    ];

    useEffect(() => {
        fetchApplications();
    }, [activeTab]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            let endpoint = '/api/agents/my-submitted-applications';
            
            if (activeTab !== 'all') {
                endpoint += `?status=${activeTab.toUpperCase()}`;
            }

            const response = await api.get(endpoint);
            if (response.data?.success) {
                const applicationsData = response.data.data?.applications || response.data.data || [];
                setApplications(Array.isArray(applicationsData) ? applicationsData : []);
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
            const response = await api.get(`/api/verification/${applicationId}`);
            if (response.data?.success) {
                setSelectedApplication(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching application details:', error);
            showError('Failed to fetch application details');
        }
    };

    const handleResubmit = async () => {
        if (!selectedApplication) return;

        const result = await showConfirm(
            'Resubmit Application',
            `Are you sure you want to resubmit ${selectedApplication.personalDetails?.fullName}'s application?`,
            'Yes, Resubmit',
            'Cancel'
        );

        if (result.isConfirmed) {
            try {
                setResubmitting(true);
                const response = await api.put(`/api/verification/${selectedApplication.applicationId}/resubmit`, {
                    resubmissionReason: 'Application resubmitted after addressing rejection issues'
                });

                if (response.data?.success) {
                    showSuccess('Application resubmitted successfully');
                    await fetchApplicationDetails(selectedApplication.applicationId);
                    await fetchApplications();
                }
            } catch (error) {
                console.error('Error resubmitting application:', error);
                showError('Failed to resubmit application');
            } finally {
                setResubmitting(false);
            }
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

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED':
                return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
            case 'REJECTED':
                return <XCircleIcon className="h-5 w-5 text-red-600" />;
            case 'SUBMITTED':
            case 'UNDER_REVIEW':
                return <ClockIcon className="h-5 w-5 text-blue-600" />;
            default:
                return <ClockIcon className="h-5 w-5 text-gray-600" />;
        }
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
                        {application.contactDetails?.email || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Application ID: {application.applicationId}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    {getStatusIcon(application.status)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Student</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                        {application.personalDetails?.fullName || 'N/A'}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Course</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                        {application.courseDetails?.selectedCourse || 'N/A'}
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {new Date(application.submittedAt || application.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-2">
                    {application.resubmissionInfo?.isResubmission && (
                        <span className="px-2 py-1 rounded bg-orange-100 text-orange-800 text-xs">
                            Resubmission #{application.resubmissionInfo.resubmissionCount}
                        </span>
                    )}
                    <button className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Details
                    </button>
                </div>
            </div>
        </motion.div>
    );

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
                        Application Status
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Track the verification status of your submitted applications
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
                                            {selectedApplication.contactDetails?.email}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Application ID: {selectedApplication.applicationId}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(selectedApplication.status)}
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}>
                                            {selectedApplication.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Status-specific Actions */}
                                {selectedApplication.status === 'REJECTED' && (
                                    <div className="space-y-4">
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                                            <h5 className="font-medium text-red-900 dark:text-red-100 mb-2 flex items-center">
                                                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                                                Rejection Details
                                            </h5>
                                            <p className="text-red-800 dark:text-red-200 text-sm mb-2">
                                                {selectedApplication.reviewInfo?.rejectionMessage || 'Application was rejected'}
                                            </p>
                                            {selectedApplication.reviewInfo?.rejectionDetails?.length > 0 && (
                                                <div className="mt-2">
                                                    <h6 className="font-medium text-red-900 dark:text-red-100 text-xs mb-1">Specific Issues:</h6>
                                                    <ul className="text-xs text-red-800 dark:text-red-200 space-y-1">
                                                        {selectedApplication.reviewInfo.rejectionDetails.map((detail, index) => (
                                                            <li key={index} className="flex items-start">
                                                                <span className="mr-2">•</span>
                                                                <span>
                                                                    <strong>{detail.section}:</strong> {detail.message}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleResubmit}
                                            disabled={resubmitting}
                                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            <ArrowPathIcon className="h-4 w-4 mr-2" />
                                            {resubmitting ? 'Resubmitting...' : 'Resubmit Application'}
                                        </button>
                                    </div>
                                )}

                                {selectedApplication.status === 'APPROVED' && (
                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                                        <h5 className="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                                            Approval Details
                                        </h5>
                                        <p className="text-green-800 dark:text-green-200 text-sm">
                                            {selectedApplication.reviewInfo?.remarks || 'Application approved by staff'}
                                        </p>
                                        <p className="text-green-700 dark:text-green-300 text-xs mt-2">
                                            Approved on: {selectedApplication.reviewInfo?.reviewedAt ? 
                                                new Date(selectedApplication.reviewInfo.reviewedAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                )}

                                {selectedApplication.status === 'SUBMITTED' && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                                        <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                                            <ClockIcon className="h-5 w-5 mr-2" />
                                            Under Review
                                        </h5>
                                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                                            Your application is currently being reviewed by our staff. You will be notified once the review is complete.
                                        </p>
                                        <p className="text-blue-700 dark:text-blue-300 text-xs mt-2">
                                            Submitted on: {selectedApplication.submittedAt ? 
                                                new Date(selectedApplication.submittedAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Application Summary */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Application Summary
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Student Information</h5>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="text-gray-600 dark:text-gray-400">Name:</span> {selectedApplication.personalDetails?.fullName}</p>
                                            <p><span className="text-gray-600 dark:text-gray-400">Phone:</span> {selectedApplication.contactDetails?.primaryPhone}</p>
                                            <p><span className="text-gray-600 dark:text-gray-400">Email:</span> {selectedApplication.contactDetails?.email}</p>
                                            <p><span className="text-gray-600 dark:text-gray-400">Aadhar:</span> {selectedApplication.personalDetails?.aadharNumber}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Course Information</h5>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="text-gray-600 dark:text-gray-400">Course:</span> {selectedApplication.courseDetails?.selectedCourse}</p>
                                            <p><span className="text-gray-600 dark:text-gray-400">Stream:</span> {selectedApplication.courseDetails?.stream || 'N/A'}</p>
                                            <p><span className="text-gray-600 dark:text-gray-400">Campus:</span> {selectedApplication.courseDetails?.campus || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Documents Status */}
                                {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                                    <div className="mt-6">
                                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Documents Status</h5>
                                        <div className="space-y-2">
                                            {selectedApplication.documents.map((doc, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                                    <span className="text-sm text-gray-900 dark:text-gray-100">{doc.documentType}</span>
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        doc.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                        doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {doc.status || 'PENDING'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <DocumentTextIcon className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Select an Application
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Choose an application from the list to view its details and status
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentApplicationStatus;

