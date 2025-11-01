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
    DocumentTextIcon,
    CloudArrowUpIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import api from '../../../utils/api';
import { showSuccess, showError, showConfirm, showLoading, closeLoading } from '../../../utils/sweetAlert';
import { getDocumentUrl } from '../../../utils/documentUtils';

const AgentApplicationStatus = ({ initialTab = 'all' }) => {
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [resubmitting, setResubmitting] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({});
    const [documentRequirements, setDocumentRequirements] = useState(null);
    const [uploadingDocs, setUploadingDocs] = useState({});
    const [uploadProgress, setUploadProgress] = useState({});
    const [visibleDocFields, setVisibleDocFields] = useState([]);

    const tabs = [
        { id: 'all', name: 'All Applications', color: 'gray' },
        { id: 'submitted', name: 'Submitted', color: 'blue' },
        { id: 'approved', name: 'Approved', color: 'green' },
        { id: 'rejected', name: 'Rejected', color: 'red' }
    ];

    useEffect(() => {
        fetchApplications();
        fetchDocumentRequirements();
    }, [activeTab]);

    const fetchDocumentRequirements = async () => {
        try {
            const response = await api.get('/api/student-application/document-requirements');
            if (response.data?.success) {
                setDocumentRequirements(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching document requirements:', error);
        }
    };

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
            console.log('🔍 Fetching application details for:', applicationId);
            // Try agent-specific endpoint first
            const response = await api.get(`/api/agents/submitted-applications/${applicationId}`);
            if (response.data?.success) {
                const appData = response.data.data;
                console.log('✅ Application details loaded');
                console.log('📄 Documents:', appData.documents);
                console.log('📊 Review Status:', appData.reviewStatus);
                setSelectedApplication(appData);
                
                // Log document statuses for debugging
                if (appData.documents && appData.documents.length > 0) {
                    console.log('📋 Document Statuses:');
                    appData.documents.forEach(doc => {
                        console.log(`  - ${doc.documentType}: ${doc.status || 'PENDING'} ${doc.remarks ? `(${doc.remarks})` : ''}`);
                    });
                }
            }
        } catch (error) {
            console.error('❌ Error fetching application details:', error);
            // Fallback: Use the applications we already have in state
            const application = applications.find(app => app.applicationId === applicationId);
            if (application) {
                setSelectedApplication(application);
                console.log('✅ Using cached application data');
            } else {
                showError('Failed to fetch application details');
            }
        }
    };

    const handleResubmit = async () => {
        if (!selectedApplication) return;

        // Check if already submitted
        if (selectedApplication.status === 'SUBMITTED' || selectedApplication.status === 'UNDER_REVIEW' || selectedApplication.status === 'APPROVED') {
            showError('This application is already submitted and under review');
            return;
        }

        const result = await showConfirm(
            'Resubmit Application',
            `Have you made all the necessary corrections? This will resubmit ${selectedApplication.personalDetails?.fullName}'s application for admin approval.`,
            'Yes, I\'ve Fixed Everything',
            'Cancel'
        );

        if (result.isConfirmed) {
            try {
                setResubmitting(true);
                console.log('📤 Resubmitting application:', selectedApplication._id);
                
                // Use agent-specific endpoint
                const response = await api.post(`/api/agents/students/${selectedApplication._id}/resubmit`);
                console.log('✅ Resubmit response:', response.data);

                if (response.data?.success) {
                    showSuccess('Application resubmitted successfully! It will be reviewed by admin again.');
                    await fetchApplications();
                    // Clear selected application to show updated list
                    setSelectedApplication(null);
                }
            } catch (error) {
                console.error('❌ Error resubmitting application:', error);
                const errorMsg = error.response?.data?.message || 'Failed to resubmit application';
                showError(errorMsg);
            } finally {
                setResubmitting(false);
            }
        }
    };

    const handleEditApplication = (application) => {
        console.log('📝 Editing application:', application);
        setEditData({
            personalDetails: {
                fullName: application.personalDetails?.fullName || '',
                fathersName: application.personalDetails?.fathersName || '',
                mothersName: application.personalDetails?.mothersName || '',
                gender: application.personalDetails?.gender || '',
                dateOfBirth: application.personalDetails?.dateOfBirth || '',
                aadharNumber: application.personalDetails?.aadharNumber || '',
                status: application.personalDetails?.status || ''
            },
            contactDetails: {
                primaryPhone: application.contactDetails?.primaryPhone || '',
                secondaryPhone: application.contactDetails?.secondaryPhone || '',
                email: application.contactDetails?.email || '',
                address: application.contactDetails?.address || '',
                city: application.contactDetails?.city || '',
                state: application.contactDetails?.state || '',
                pincode: application.contactDetails?.pincode || ''
            },
            courseDetails: {
                selectedCourse: application.courseDetails?.selectedCourse || '',
                preferredLanguage: application.courseDetails?.preferredLanguage || ''
            },
            guardianDetails: {
                guardianName: application.guardianDetails?.guardianName || '',
                guardianPhone: application.guardianDetails?.guardianPhone || '',
                guardianRelation: application.guardianDetails?.guardianRelation || ''
            },
            documents: application.documents || {}
        });
        
        // Initialize with first required document only
        if (documentRequirements?.requirements?.required?.length > 0) {
            setVisibleDocFields([documentRequirements.requirements.required[0].key]);
        } else {
            setVisibleDocFields([]);
        }
        
        setShowEditModal(true);
    };

    const addDocumentField = () => {
        if (!documentRequirements) return;
        
        const allDocs = [
            ...(documentRequirements.requirements?.required || []),
            ...(documentRequirements.requirements?.optional || [])
        ];
        
        const nextDoc = allDocs.find(doc => !visibleDocFields.includes(doc.key));
        if (nextDoc) {
            setVisibleDocFields([...visibleDocFields, nextDoc.key]);
        }
    };

    const removeDocumentField = (docKey) => {
        setVisibleDocFields(visibleDocFields.filter(key => key !== docKey));
        // Also remove the document data if not uploaded
        if (!editData.documents?.[docKey]) {
            return;
        }
    };

    const handleDocumentUpload = async (docKey, file) => {
        if (!file || !selectedApplication) {
            console.log('❌ Upload cancelled: file or application missing');
            return;
        }

        try {
            console.log('📤 Starting upload:', {
                docKey,
                fileName: file.name,
                fileSize: file.size,
                applicationId: selectedApplication._id,
                applicationIdString: selectedApplication.applicationId
            });

            setUploadingDocs(prev => ({ ...prev, [docKey]: true }));
            setUploadProgress(prev => ({ ...prev, [docKey]: 0 }));

            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', docKey);
            formData.append('studentId', selectedApplication._id);

            console.log('📤 FormData prepared, sending to /api/documents/upload');

            const response = await api.post('/api/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(prev => ({ ...prev, [docKey]: percentCompleted }));
                }
            });

            console.log('✅ Upload response:', response.data);

            if (response.data?.success) {
                const uploadedDocData = response.data.data;
                console.log('📄 Uploaded document data:', uploadedDocData);
                
                setEditData(prev => ({
                    ...prev,
                    documents: {
                        ...prev.documents,
                        [docKey]: {
                            url: uploadedDocData?.filePath || uploadedDocData?.url || response.data.url,
                            uploadedAt: new Date().toISOString(),
                            status: 'PENDING' // Valid enum: PENDING, APPROVED, REJECTED
                        }
                    }
                }));
                
                showSuccess(`✅ ${docKey} uploaded successfully! Previous document replaced. Status: PENDING (awaiting review)`);
                console.log(`✅ ${docKey} saved - Status reset to PENDING`);
                
                // Refresh application details to get updated document status
                // Use a single combined refresh with slight delay to avoid rate limiting
                console.log('🔄 Refreshing data after upload (with delay to avoid rate limit)...');
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
                
                await fetchApplicationDetails(selectedApplication.applicationId);
                console.log('✅ Upload complete - UI refreshed with latest data');
            }
        } catch (error) {
            console.error('❌ Error uploading document:', error);
            console.error('❌ Error response:', error.response?.data);
            showError('Failed to upload document');
        } finally {
            setUploadingDocs(prev => ({ ...prev, [docKey]: false }));
            setUploadProgress(prev => ({ ...prev, [docKey]: 0 }));
        }
    };

    const handleDocumentDelete = (docKey) => {
        setEditData(prev => ({
            ...prev,
            documents: {
                ...prev.documents,
                [docKey]: null
            }
        }));
        showSuccess('Document removed');
    };

    const handleSaveEdit = async () => {
        try {
            console.log('💾 Saving edits for application:', selectedApplication._id);
            const response = await api.put(`/api/agents/students/${selectedApplication._id}`, editData);
            
            if (response.data.success) {
                showSuccess('Application updated successfully!');
                setShowEditModal(false);
                setEditData({});
                
                // Refresh applications list
                await fetchApplications();
                
                // Update selected application
                const updatedApp = applications.find(app => app._id === selectedApplication._id);
                if (updatedApp) {
                    setSelectedApplication({ ...selectedApplication, ...editData });
                }
                
                // Ask if they want to resubmit
                if (selectedApplication.status === 'REJECTED') {
                    const shouldResubmit = await showConfirm(
                        'Resubmit Application?',
                        'Application updated successfully! Would you like to resubmit it for admin review?',
                        'Yes, Resubmit',
                        'No, Later'
                    );
                    
                    if (shouldResubmit) {
                        await handleResubmit();
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error updating application:', error);
            showError('Failed to update application');
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
                                    <div className="flex-1">
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
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => {
                                                console.log('🔄 Refreshing application data...');
                                                fetchApplicationDetails(selectedApplication.applicationId);
                                                showSuccess('Application data refreshed');
                                            }}
                                            className="flex items-center px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                            title="Refresh to see latest document review status"
                                        >
                                            <ArrowPathIcon className="h-4 w-4 mr-1" />
                                            Refresh
                                        </button>
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(selectedApplication.status)}
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}>
                                                {selectedApplication.status}
                                            </span>
                                        </div>
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

                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditApplication(selectedApplication)}
                                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                <DocumentTextIcon className="h-4 w-4 mr-2" />
                                                Edit Application
                                            </button>
                                            <button
                                                onClick={handleResubmit}
                                                disabled={resubmitting}
                                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                            >
                                                <ArrowPathIcon className="h-4 w-4 mr-2" />
                                                {resubmitting ? 'Resubmitting...' : 'Resubmit Application'}
                                            </button>
                                        </div>
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
                                        <div className="flex items-center justify-between mb-3">
                                            <h5 className="font-medium text-gray-900 dark:text-gray-100">Documents Status</h5>
                                            {selectedApplication.documents.some(doc => doc.status === 'REJECTED') && (
                                                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded">
                                                    ⚠️ Action Required
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            {selectedApplication.documents.map((doc, index) => {
                                                const documentUrl = getDocumentUrl(doc.filePath || doc.url);
                                                const hasUrl = doc.filePath || doc.url;
                                                const isRejected = doc.status === 'REJECTED';
                                                const isApproved = doc.status === 'APPROVED';
                                                const isPending = !doc.status || doc.status === 'PENDING';
                                                
                                                return (
                                                    <div 
                                                        key={index} 
                                                        className={`p-3 rounded-lg border ${
                                                            isRejected ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' :
                                                            isApproved ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' :
                                                            'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                                                        } hover:shadow-sm transition-all`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    {hasUrl ? (
                                                                        <button
                                                                            onClick={() => {
                                                                                console.log('📄 Opening document:', {
                                                                                    type: doc.documentType,
                                                                                    url: documentUrl,
                                                                                    fileName: doc.fileName
                                                                                });
                                                                                window.open(documentUrl, '_blank', 'noopener,noreferrer');
                                                                            }}
                                                                            className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline cursor-pointer"
                                                                            title={`Click to view ${doc.documentType}`}
                                                                        >
                                                                            {doc.documentType}
                                                                        </button>
                                                                    ) : (
                                                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{doc.documentType}</span>
                                                                    )}
                                                                    {hasUrl && (
                                                                        <EyeIcon className="h-4 w-4 text-gray-400" />
                                                                    )}
                                                                </div>
                                                                
                                                                {/* Upload timestamp */}
                                                                {doc.uploadedAt && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                        📅 Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                                                                    </p>
                                                                )}
                                                                
                                                                {/* Document remarks */}
                                                                {doc.remarks && (
                                                                    <div className={`mt-2 p-2 rounded text-xs ${
                                                                        isRejected ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
                                                                        isApproved ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
                                                                        'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                                                                    }`}>
                                                                        <strong>
                                                                            {isRejected ? '⚠️ Rejection Reason: ' : 
                                                                             isApproved ? '✓ Approval Note: ' : 
                                                                             'Review Note: '}
                                                                        </strong>
                                                                        {doc.remarks}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            <div className="flex flex-col items-end space-y-2">
                                                                {/* Status Badge - More Prominent */}
                                                                <div className="flex flex-col items-end space-y-1">
                                                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide shadow-sm ${
                                                                        isApproved ? 'bg-green-500 text-white dark:bg-green-600' :
                                                                        isRejected ? 'bg-red-500 text-white dark:bg-red-600' :
                                                                        'bg-yellow-500 text-white dark:bg-yellow-600'
                                                                    }`}>
                                                                        {isApproved ? '✓ APPROVED' : isRejected ? '✗ REJECTED' : '⏳ PENDING'}
                                                                    </span>
                                                                    
                                                                    {/* Review timestamp */}
                                                                    {doc.reviewedAt && (
                                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                            {new Date(doc.reviewedAt).toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                
                                                                {/* Reupload button for rejected documents */}
                                                                {isRejected && (
                                                                    <div className="relative">
                                                                        <input
                                                                            type="file"
                                                                            id={`reupload-${doc.documentType}-${index}`}
                                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                                            onChange={(e) => {
                                                                                const file = e.target.files[0];
                                                                                if (file) handleDocumentUpload(doc.documentType, file);
                                                                            }}
                                                                            className="hidden"
                                                                        />
                                                                        <label
                                                                            htmlFor={`reupload-${doc.documentType}-${index}`}
                                                                            className="cursor-pointer inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                                                                            title="Upload a new version of this document"
                                                                        >
                                                                            <CloudArrowUpIcon className="h-4 w-4 mr-1" />
                                                                            Reupload
                                                                        </label>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        {/* Summary counts */}
                                        <div className="mt-4 flex items-center justify-between text-xs">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    Total: {selectedApplication.documents.length}
                                                </span>
                                                <span className="text-green-600 dark:text-green-400">
                                                    ✓ {selectedApplication.documents.filter(d => d.status === 'APPROVED').length} Approved
                                                </span>
                                                <span className="text-red-600 dark:text-red-400">
                                                    ✗ {selectedApplication.documents.filter(d => d.status === 'REJECTED').length} Rejected
                                                </span>
                                                <span className="text-yellow-600 dark:text-yellow-400">
                                                    ⏳ {selectedApplication.documents.filter(d => !d.status || d.status === 'PENDING').length} Pending
                                                </span>
                                            </div>
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

            {/* Edit Modal */}
            {showEditModal && selectedApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Edit Application - {selectedApplication.personalDetails?.fullName || 'Student'}
                                </h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Personal Details */}
                                <div>
                                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Personal Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={editData.personalDetails?.fullName || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    personalDetails: { ...editData.personalDetails, fullName: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Father's Name</label>
                                            <input
                                                type="text"
                                                value={editData.personalDetails?.fathersName || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    personalDetails: { ...editData.personalDetails, fathersName: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mother's Name</label>
                                            <input
                                                type="text"
                                                value={editData.personalDetails?.mothersName || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    personalDetails: { ...editData.personalDetails, mothersName: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                                            <select
                                                value={editData.personalDetails?.gender || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    personalDetails: { ...editData.personalDetails, gender: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                                            <input
                                                type="date"
                                                value={editData.personalDetails?.dateOfBirth || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    personalDetails: { ...editData.personalDetails, dateOfBirth: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aadhar Number</label>
                                            <input
                                                type="text"
                                                value={editData.personalDetails?.aadharNumber || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    personalDetails: { ...editData.personalDetails, aadharNumber: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div>
                                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Contact Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Phone</label>
                                            <input
                                                type="text"
                                                value={editData.contactDetails?.primaryPhone || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    contactDetails: { ...editData.contactDetails, primaryPhone: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={editData.contactDetails?.email || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    contactDetails: { ...editData.contactDetails, email: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                            <textarea
                                                value={editData.contactDetails?.address || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    contactDetails: { ...editData.contactDetails, address: e.target.value }
                                                })}
                                                rows="2"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                                            <input
                                                type="text"
                                                value={editData.contactDetails?.city || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    contactDetails: { ...editData.contactDetails, city: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                                            <input
                                                type="text"
                                                value={editData.contactDetails?.state || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    contactDetails: { ...editData.contactDetails, state: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
                                            <input
                                                type="text"
                                                value={editData.contactDetails?.pincode || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    contactDetails: { ...editData.contactDetails, pincode: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Course Details */}
                                <div>
                                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Course Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selected Course</label>
                                            <input
                                                type="text"
                                                value={editData.courseDetails?.selectedCourse || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    courseDetails: { ...editData.courseDetails, selectedCourse: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Language</label>
                                            <input
                                                type="text"
                                                value={editData.courseDetails?.preferredLanguage || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    courseDetails: { ...editData.courseDetails, preferredLanguage: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Guardian Details */}
                                <div>
                                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Guardian Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guardian Name</label>
                                            <input
                                                type="text"
                                                value={editData.guardianDetails?.guardianName || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    guardianDetails: { ...editData.guardianDetails, guardianName: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guardian Phone</label>
                                            <input
                                                type="text"
                                                value={editData.guardianDetails?.guardianPhone || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    guardianDetails: { ...editData.guardianDetails, guardianPhone: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Relation</label>
                                            <select
                                                value={editData.guardianDetails?.guardianRelation || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData,
                                                    guardianDetails: { ...editData.guardianDetails, guardianRelation: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                            >
                                                <option value="">Select Relation</option>
                                                <option value="Father">Father</option>
                                                <option value="Mother">Mother</option>
                                                <option value="Guardian">Guardian</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Document Upload Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                                            <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                                            Document Uploads
                                        </h4>
                                        <button
                                            onClick={addDocumentField}
                                            type="button"
                                            className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                            disabled={!documentRequirements || visibleDocFields.length >= (documentRequirements?.requirements?.required?.length || 0) + (documentRequirements?.requirements?.optional?.length || 0)}
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add More
                                        </button>
                                    </div>
                                    {documentRequirements ? (
                                        <div className="space-y-3">
                                            {visibleDocFields.map((docKey) => {
                                                const allDocs = [
                                                    ...(documentRequirements.requirements?.required || []),
                                                    ...(documentRequirements.requirements?.optional || [])
                                                ];
                                                const doc = allDocs.find(d => d.key === docKey);
                                                if (!doc) return null;
                                                
                                                return (
                                                            <div key={doc.key} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 relative">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                        {doc.label}
                                                                        {doc.required && <span className="text-red-500 ml-1">*</span>}
                                                                    </label>
                                                                    <div className="flex items-center space-x-2">
                                                                        {editData.documents?.[doc.key] && (
                                                                            <button
                                                                                onClick={() => handleDocumentDelete(doc.key)}
                                                                                type="button"
                                                                                className="text-red-500 hover:text-red-700"
                                                                                title="Remove uploaded document"
                                                                            >
                                                                                <TrashIcon className="h-4 w-4" />
                                                                            </button>
                                                                        )}
                                                                        {visibleDocFields.length > 1 && (
                                                                            <button
                                                                                onClick={() => removeDocumentField(doc.key)}
                                                                                type="button"
                                                                                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                                                                title="Remove this field"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                                </svg>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                
                                                                {doc.description && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                                        {doc.description}
                                                                    </p>
                                                                )}

                                                                {editData.documents?.[doc.key] ? (
                                                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded p-2">
                                                                        <div className="flex items-center text-sm text-green-700 dark:text-green-300">
                                                                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                                                                            <span>Document uploaded</span>
                                                                        </div>
                                                                        {editData.documents[doc.key].url && (
                                                                            <a
                                                                                href={getDocumentUrl(editData.documents[doc.key].url)}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-xs text-blue-600 hover:underline mt-1 block"
                                                                            >
                                                                                View document
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <input
                                                                            type="file"
                                                                            accept={doc.acceptedFormats?.join(',') || '.pdf,.jpg,.jpeg,.png'}
                                                                            onChange={(e) => {
                                                                                const file = e.target.files[0];
                                                                                if (file) handleDocumentUpload(doc.key, file);
                                                                            }}
                                                                            disabled={uploadingDocs[doc.key]}
                                                                            className="block w-full text-sm text-gray-500 dark:text-gray-400
                                                                                file:mr-4 file:py-2 file:px-4
                                                                                file:rounded-md file:border-0
                                                                                file:text-sm file:font-semibold
                                                                                file:bg-blue-50 file:text-blue-700
                                                                                hover:file:bg-blue-100
                                                                                dark:file:bg-blue-900/20 dark:file:text-blue-300
                                                                                disabled:opacity-50"
                                                                        />
                                                                        {uploadingDocs[doc.key] && (
                                                                            <div className="mt-2">
                                                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                                                    <div
                                                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                                        style={{ width: `${uploadProgress[doc.key] || 0}%` }}
                                                                                    />
                                                                                </div>
                                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                                    Uploading... {uploadProgress[doc.key] || 0}%
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {doc.maxSize && (
                                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                                        Max size: {doc.maxSize}
                                                                    </p>
                                                                )}
                                                            </div>
                                                );
                                            })}
                                            
                                            {visibleDocFields.length === 0 && (
                                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                    <CloudArrowUpIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                    <p>Click "Add More" to add document fields</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                            Loading document requirements...
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentApplicationStatus;



