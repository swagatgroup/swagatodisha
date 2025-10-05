import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentTextIcon,
    UserIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    ChatBubbleLeftRightIcon,
    CheckBadgeIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import api from '../../../utils/api';
import { showSuccess, showError, showConfirm } from '../../../utils/sweetAlert';

const ApplicationVerification = () => {
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [stats, setStats] = useState({
        totalApplications: 0,
        pendingVerification: 0,
        approved: 0,
        rejected: 0,
        agentApplications: 0,
        studentApplications: 0
    });
    const [filters, setFilters] = useState({
        submitterRole: 'all',
        course: 'all',
        search: ''
    });
    const [availableFilters, setAvailableFilters] = useState({
        submitterRoles: [],
        courses: [],
        statuses: []
    });
    const [rejectionForm, setRejectionForm] = useState({
        rejectionReason: '',
        rejectionMessage: '',
        rejectionDetails: []
    });

    const tabs = [
        { id: 'all', name: 'All Students', count: stats.totalApplications, color: 'gray' },
        { id: 'submitted', name: 'Pending Verification', count: stats.pendingVerification, color: 'blue' },
        { id: 'approved', name: 'Approved', count: stats.approved, color: 'green' },
        { id: 'rejected', name: 'Rejected', count: stats.rejected, color: 'red' }
    ];

    const rejectionReasons = [
        'Incomplete Documents',
        'Invalid Documents',
        'Incorrect Information',
        'Missing Required Information',
        'Document Quality Issues',
        'Other'
    ];

    const rejectionSections = [
        { id: 'documents', name: 'Documents', description: 'Document-related issues' },
        { id: 'personalDetails', name: 'Personal Details', description: 'Personal information issues' },
        { id: 'academicDetails', name: 'Academic Details', description: 'Academic information issues' },
        { id: 'guardianDetails', name: 'Guardian Details', description: 'Guardian information issues' },
        { id: 'financialDetails', name: 'Financial Details', description: 'Financial information issues' }
    ];

    useEffect(() => {
        fetchStats();
        fetchApplications();
    }, [activeTab, filters]);

    const fetchStats = async () => {
        try {
            const response = await api.get('/api/verification/stats/overview');
            if (response.data?.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching verification stats:', error);
        }
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);
            
            // Build query parameters
            const queryParams = new URLSearchParams();
            
            if (activeTab !== 'all') {
                queryParams.append('status', activeTab.toUpperCase());
            }
            
            if (filters.submitterRole !== 'all') {
                queryParams.append('submitterRole', filters.submitterRole);
            }
            
            if (filters.course !== 'all') {
                queryParams.append('course', filters.course);
            }
            
            if (filters.search) {
                queryParams.append('search', filters.search);
            }
            
            const endpoint = `/api/verification/pending?${queryParams.toString()}`;
            const response = await api.get(endpoint);
            
            if (response.data?.success) {
                setApplications(response.data.data.applications || []);
                setAvailableFilters({
                    submitterRoles: response.data.data.filters?.submitterRoles || [],
                    courses: response.data.data.filters?.courses || [],
                    statuses: response.data.data.filters?.statuses || []
                });
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

    const handleApprove = async () => {
        if (!selectedApplication) return;

        const result = await showConfirm(
            'Approve Application',
            `Are you sure you want to approve ${selectedApplication.personalDetails?.fullName}'s application?`,
            'Yes, Approve',
            'Cancel'
        );

        if (result.isConfirmed) {
            try {
                setVerifying(true);
                const response = await api.put(`/api/verification/${selectedApplication.applicationId}/approve`, {
                    remarks: 'Application approved by staff'
                });

                if (response.data?.success) {
                    showSuccess('Application approved successfully');
                    await fetchApplicationDetails(selectedApplication.applicationId);
                    await fetchApplications();
                    await fetchStats();
                }
            } catch (error) {
                console.error('Error approving application:', error);
                showError('Failed to approve application');
            } finally {
                setVerifying(false);
            }
        }
    };

    const handleReject = async () => {
        if (!selectedApplication) return;

        if (!rejectionForm.rejectionReason || !rejectionForm.rejectionMessage) {
            showError('Please provide rejection reason and message');
            return;
        }

        const result = await showConfirm(
            'Reject Application',
            `Are you sure you want to reject ${selectedApplication.personalDetails?.fullName}'s application?`,
            'Yes, Reject',
            'Cancel'
        );

        if (result.isConfirmed) {
            try {
                setVerifying(true);
                const response = await api.put(`/api/verification/${selectedApplication.applicationId}/reject`, {
                    rejectionReason: rejectionForm.rejectionReason,
                    rejectionMessage: rejectionForm.rejectionMessage,
                    rejectionDetails: rejectionForm.rejectionDetails,
                    remarks: 'Application rejected by staff'
                });

                if (response.data?.success) {
                    showSuccess('Application rejected successfully');
                    setRejectionForm({
                        rejectionReason: '',
                        rejectionMessage: '',
                        rejectionDetails: []
                    });
                    await fetchApplicationDetails(selectedApplication.applicationId);
                    await fetchApplications();
                    await fetchStats();
                }
            } catch (error) {
                console.error('Error rejecting application:', error);
                showError('Failed to reject application');
            } finally {
                setVerifying(false);
            }
        }
    };

    const addRejectionDetail = () => {
        setRejectionForm(prev => ({
            ...prev,
            rejectionDetails: [...prev.rejectionDetails, {
                section: '',
                issue: '',
                message: '',
                requiresResubmission: true
            }]
        }));
    };

    const updateRejectionDetail = (index, field, value) => {
        setRejectionForm(prev => ({
            ...prev,
            rejectionDetails: prev.rejectionDetails.map((detail, i) => 
                i === index ? { ...detail, [field]: value } : detail
            )
        }));
    };

    const removeRejectionDetail = (index) => {
        setRejectionForm(prev => ({
            ...prev,
            rejectionDetails: prev.rejectionDetails.filter((_, i) => i !== index)
        }));
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
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {application.status}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Submitted by</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                        {application.submittedBy?.fullName || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {application.submitterRole || 'N/A'}
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
                        Review
                    </button>
                </div>
            </div>
        </motion.div>
    );

    const renderRejectionForm = () => (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Rejection Details
            </h4>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rejection Reason *
                    </label>
                    <select
                        value={rejectionForm.rejectionReason}
                        onChange={(e) => setRejectionForm(prev => ({ ...prev, rejectionReason: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">Select rejection reason</option>
                        {rejectionReasons.map(reason => (
                            <option key={reason} value={reason}>{reason}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rejection Message *
                    </label>
                    <textarea
                        value={rejectionForm.rejectionMessage}
                        onChange={(e) => setRejectionForm(prev => ({ ...prev, rejectionMessage: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Provide detailed rejection message for the agent..."
                        required
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Specific Issues (Optional)
                        </label>
                        <button
                            onClick={addRejectionDetail}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Add Issue
                        </button>
                    </div>
                    
                    {rejectionForm.rejectionDetails.map((detail, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-2">
                            <div className="flex justify-between items-start mb-3">
                                <h5 className="font-medium text-gray-900 dark:text-gray-100">Issue #{index + 1}</h5>
                                <button
                                    onClick={() => removeRejectionDetail(index)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Section
                                    </label>
                                    <select
                                        value={detail.section}
                                        onChange={(e) => updateRejectionDetail(index, 'section', e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Select section</option>
                                        {rejectionSections.map(section => (
                                            <option key={section.id} value={section.id}>{section.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Issue Type
                                    </label>
                                    <input
                                        type="text"
                                        value={detail.issue}
                                        onChange={(e) => updateRejectionDetail(index, 'issue', e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="e.g., Missing document"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Message
                                    </label>
                                    <input
                                        type="text"
                                        value={detail.message}
                                        onChange={(e) => updateRejectionDetail(index, 'message', e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Specific message"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
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
                        Application Verification
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Review and verify agent-submitted student applications
                    </p>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Filter Applications</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Filter by Submitter
                        </label>
                        <select
                            value={filters.submitterRole}
                            onChange={(e) => setFilters(prev => ({ ...prev, submitterRole: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">All Submitters</option>
                            <option value="agent">Agent Submissions</option>
                            <option value="student">Student Submissions</option>
                            <option value="staff">Staff Submissions</option>
                            <option value="super_admin">Super Admin Submissions</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Filter by Course
                        </label>
                        <select
                            value={filters.course}
                            onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">All Courses</option>
                            {availableFilters.courses.map(course => (
                                <option key={course} value={course}>{course}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Search
                        </label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            placeholder="Search by name, email, phone, or ID..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    
                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ submitterRole: 'all', course: 'all', search: '' })}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Applications</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalApplications}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Verification</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.pendingVerification}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.approved}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejected</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.rejected}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Type Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <UserIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Agent Submissions</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.agentApplications}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <DocumentTextIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Direct Student Submissions</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.studentApplications}</p>
                        </div>
                    </div>
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
                                {tab.count}
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
                                            {selectedApplication.contactDetails?.email}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Application ID: {selectedApplication.applicationId}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Submitted by: {selectedApplication.submittedBy?.fullName} ({selectedApplication.submitterRole})
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}>
                                        {selectedApplication.status}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                {selectedApplication.status === 'SUBMITTED' || selectedApplication.status === 'UNDER_REVIEW' ? (
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handleApprove}
                                            disabled={verifying}
                                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                        >
                                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={handleReject}
                                            disabled={verifying}
                                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                        >
                                            <XCircleIcon className="h-4 w-4 mr-2" />
                                            Reject
                                        </button>
                                    </div>
                                ) : selectedApplication.status === 'REJECTED' && selectedApplication.reviewInfo?.rejectionMessage ? (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                                        <h5 className="font-medium text-red-900 dark:text-red-100 mb-2">Rejection Details</h5>
                                        <p className="text-red-800 dark:text-red-200 text-sm">
                                            {selectedApplication.reviewInfo.rejectionMessage}
                                        </p>
                                        {selectedApplication.reviewInfo.rejectionDetails?.length > 0 && (
                                            <div className="mt-2">
                                                <h6 className="font-medium text-red-900 dark:text-red-100 text-xs">Specific Issues:</h6>
                                                <ul className="text-xs text-red-800 dark:text-red-200 mt-1">
                                                    {selectedApplication.reviewInfo.rejectionDetails.map((detail, index) => (
                                                        <li key={index}>• {detail.section}: {detail.message}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : selectedApplication.status === 'APPROVED' ? (
                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                                        <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">Approval Details</h5>
                                        <p className="text-green-800 dark:text-green-200 text-sm">
                                            {selectedApplication.reviewInfo?.remarks || 'Application approved by staff'}
                                        </p>
                                    </div>
                                ) : null}
                            </div>

                            {/* Rejection Form */}
                            {selectedApplication.status === 'SUBMITTED' || selectedApplication.status === 'UNDER_REVIEW' ? (
                                renderRejectionForm()
                            ) : null}

                            {/* Application Details */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Application Details
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Personal Information</h5>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="text-gray-600 dark:text-gray-400">Name:</span> {selectedApplication.personalDetails?.fullName}</p>
                                            <p><span className="text-gray-600 dark:text-gray-400">Father:</span> {selectedApplication.personalDetails?.fathersName}</p>
                                            <p><span className="text-gray-600 dark:text-gray-400">Mother:</span> {selectedApplication.personalDetails?.mothersName}</p>
                                            <p><span className="text-gray-600 dark:text-gray-400">DOB:</span> {selectedApplication.personalDetails?.dateOfBirth ? new Date(selectedApplication.personalDetails.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                            <p><span className="text-gray-600 dark:text-gray-400">Gender:</span> {selectedApplication.personalDetails?.gender}</p>
                                            <p><span className="text-gray-600 dark:text-gray-400">Aadhar:</span> {selectedApplication.personalDetails?.aadharNumber}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Contact Information</h5>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="text-gray-600 dark:text-gray-400">Phone:</span> {selectedApplication.contactDetails?.primaryPhone}</p>
                                            <p><span className="text-gray-600 dark:text-gray-400">Email:</span> {selectedApplication.contactDetails?.email}</p>
                                            <p><span className="text-gray-600 dark:text-gray-400">Address:</span> {selectedApplication.contactDetails?.permanentAddress ? 
                                                `${selectedApplication.contactDetails.permanentAddress.street}, ${selectedApplication.contactDetails.permanentAddress.city}, ${selectedApplication.contactDetails.permanentAddress.state} - ${selectedApplication.contactDetails.permanentAddress.pincode}` : 'N/A'}</p>
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

                                    <div>
                                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Guardian Information</h5>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="text-gray-600 dark:text-gray-400">Name:</span> {selectedApplication.guardianDetails?.guardianName}</p>
                                            <p><span className="text-gray-600 dark:text-gray-400">Relationship:</span> {selectedApplication.guardianDetails?.relationship}</p>
                                            <p><span className="text-gray-600 dark:text-gray-400">Phone:</span> {selectedApplication.guardianDetails?.guardianPhone}</p>
                                            <p><span className="text-gray-600 dark:text-gray-400">Email:</span> {selectedApplication.guardianDetails?.guardianEmail || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
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

export default ApplicationVerification;
