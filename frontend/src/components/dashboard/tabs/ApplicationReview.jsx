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
    CheckBadgeIcon,
    DocumentIcon,
    EyeSlashIcon,
    ExclamationTriangleIcon
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
    const [showDocumentViewer, setShowDocumentViewer] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [documentDecisions, setDocumentDecisions] = useState({});
    const [showRemarksModal, setShowRemarksModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

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

    const defaultRemarks = {
        approve: [
            'All documents verified and approved',
            'Application meets all requirements',
            'Documents are clear and valid',
            'Information verified successfully'
        ],
        reject: [
            'Document quality is poor/unreadable',
            'Missing required documents',
            'Invalid or expired documents',
            'Information mismatch found',
            'Documents do not meet requirements'
        ]
    };

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

    const handleDocumentView = (document) => {
        setSelectedDocument(document);
        setShowDocumentViewer(true);
    };

    const handleDocumentDecision = (documentType, decision, remarks = '') => {
        setDocumentDecisions(prev => ({
            ...prev,
            [documentType]: { decision, remarks }
        }));
    };

    const handleDocumentRemarksChange = (documentType, remarks) => {
        setDocumentDecisions(prev => ({
            ...prev,
            [documentType]: {
                ...prev[documentType],
                remarks
            }
        }));
    };

    const handleBulkDocumentVerification = async () => {
        if (!selectedApplication) return;

        const decisions = Object.entries(documentDecisions).map(([documentType, { decision, remarks }]) => ({
            documentType,
            status: decision.toUpperCase(),
            remarks: remarks || (decision === 'approve' ? 'Document approved' : 'Document rejected')
        }));

        if (decisions.length === 0) {
            showError('Please review at least one document');
            return;
        }

        try {
            setVerifying(true);
            const response = await api.put(`/api/student-application/${selectedApplication.applicationId}/verify`, {
                decisions
            });

            if (response.data?.success) {
                showSuccess('Documents reviewed successfully');
                setDocumentDecisions({});
                await fetchApplicationDetails(selectedApplication.applicationId);
                await fetchApplications();
            }
        } catch (error) {
            console.error('Error reviewing documents:', error);
            showError('Failed to review documents');
        } finally {
            setVerifying(false);
        }
    };

    const handleApplicationApproval = async (action) => {
        if (!selectedApplication) return;

        setPendingAction(action);
        setShowRemarksModal(true);
    };

    const confirmApplicationAction = async (remarks) => {
        if (!selectedApplication || !pendingAction) return;

        try {
            setVerifying(true);
            let response;

            if (pendingAction === 'approve') {
                response = await api.put(`/api/student-application/${selectedApplication.applicationId}/approve`, {
                    remarks: remarks || 'Application approved by staff'
                });
            } else {
                response = await api.put(`/api/student-application/${selectedApplication.applicationId}/reject`, {
                    rejectionReason: 'Document verification failed',
                    remarks: remarks || 'Application rejected due to document issues'
                });
            }

            if (response.data?.success) {
                showSuccess(response.data.message);
                await fetchApplicationDetails(selectedApplication.applicationId);
                await fetchApplications();
            }
        } catch (error) {
            console.error('Error processing application:', error);
            showError('Failed to process application');
        } finally {
            setVerifying(false);
            setShowRemarksModal(false);
            setPendingAction(null);
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

    // Helper: format document labels from type or filename
    const formatDocumentLabel = (rawType = '', fileName = '', publicId = '') => {
        const type = (rawType || '').toString().toLowerCase();
        const name = (fileName || '').toString().toLowerCase();
        const pid = (publicId || '').toString().toLowerCase();
        const source = `${type} ${name} ${pid}`;

        const patterns = [
            { re: /(aadhar|aadhaar)/, label: 'Aadhar Card' },
            { re: /(passport).*photo|\bphoto\b/, label: 'Passport Photo' },
            { re: /(signature|sign)/, label: 'Signature' },
            { re: /(10th|tenth).*marksheet|\btenth\b|\bssc\b/, label: '10th Marksheet' },
            { re: /(12th|twelfth).*marksheet|\btwelfth\b|\bhssc\b/, label: '12th Marksheet' },
            { re: /(marksheet|grade|result)/, label: 'Marksheet' },
            { re: /(transfer).*certificate|\btc\b/, label: 'Transfer Certificate' },
            { re: /(migration).*certificate/, label: 'Migration Certificate' },
            { re: /(character).*certificate/, label: 'Character Certificate' },
            { re: /(income).*certificate/, label: 'Income Certificate' },
            { re: /(caste).*certificate/, label: 'Caste Certificate' },
            { re: /(id).*card|identity/, label: 'ID Card' },
            { re: /(address|residence|proof)/, label: 'Address Proof' },
            { re: /(fee|receipt|payment)/, label: 'Fee Receipt' },
            { re: /(birth).*certificate|\bdob\b/, label: 'Birth Certificate' },
            { re: /(diploma)/, label: 'Diploma Certificate' },
            { re: /(degree)/, label: 'Degree Certificate' },
            { re: /(pdf)/, label: 'PDF Document' },
            { re: /(image|jpg|jpeg|png)/, label: 'Image Document' },
        ];

        for (const p of patterns) {
            if (p.re.test(source)) return p.label;
        }

        const fromType = rawType
            ? rawType.replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
            : '';
        if (fromType && fromType !== 'pdf document' && fromType !== 'uploaded file') {
            return fromType.replace(/\b\w/g, c => c.toUpperCase());
        }

        if (fileName) return fileName;
        return 'Uploaded Document';
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

    const renderDocumentViewer = () => (
        <AnimatePresence>
            {showDocumentViewer && selectedDocument && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowDocumentViewer(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {selectedDocument.documentType} - {selectedDocument.fileName}
                            </h3>
                            <button
                                onClick={() => setShowDocumentViewer(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-4">
                            {selectedDocument.filePath && (
                                <div className="w-full h-96">
                                    {selectedDocument.mimeType?.includes('image') ? (
                                        <img
                                            src={selectedDocument.filePath.startsWith('http') ? selectedDocument.filePath : selectedDocument.filePath}
                                            alt={selectedDocument.fileName}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <iframe
                                            src={selectedDocument.filePath.startsWith('http') ? selectedDocument.filePath : selectedDocument.filePath}
                                            className="w-full h-full"
                                            title={selectedDocument.fileName}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const renderRemarksModal = () => (
        <AnimatePresence>
            {showRemarksModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowRemarksModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            {pendingAction === 'approve' ? 'Approve Application' : 'Reject Application'}
                        </h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Default Remark:
                            </label>
                            <select
                                onChange={(e) => {
                                    if (e.target.value) {
                                        confirmApplicationAction(e.target.value);
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">Choose a remark...</option>
                                {defaultRemarks[pendingAction]?.map((remark, index) => (
                                    <option key={index} value={remark}>{remark}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Or enter custom remark:
                            </label>
                            <textarea
                                id="customRemark"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="Enter your custom remark..."
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    const customRemark = document.getElementById('customRemark').value;
                                    confirmApplicationAction(customRemark);
                                }}
                                className={`flex-1 px-4 py-2 rounded-lg text-white ${pendingAction === 'approve'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {pendingAction === 'approve' ? 'Approve' : 'Reject'}
                            </button>
                            <button
                                onClick={() => setShowRemarksModal(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
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

                            {/* Documents Review Section */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Document Review
                                </h4>
                                <div className="space-y-4">
                                    {/* Uploaded Documents from Registration */}
                                    {selectedApplication.documents && (Array.isArray(selectedApplication.documents) ? selectedApplication.documents.length > 0 : Object.keys(selectedApplication.documents).length > 0) ? (
                                        (Array.isArray(selectedApplication.documents)
                                            ? selectedApplication.documents.map((doc) => ({
                                                key: doc._id || `${doc.documentType}_${doc.fileName}`,
                                                documentType: doc.documentType,
                                                name: doc.fileName,
                                                size: doc.fileSize,
                                                type: doc.mimeType,
                                                url: doc.filePath || doc.url,
                                                publicId: doc.cloudinaryPublicId
                                            }))
                                            : Object.entries(selectedApplication.documents).map(([docType, d]) => ({
                                                key: docType,
                                                documentType: docType,
                                                name: d.name,
                                                size: d.size,
                                                type: d.type,
                                                url: d.downloadUrl || d.filePath || d.url,
                                                publicId: d.cloudinaryPublicId
                                            }))
                                        ).map((item) => {
                                            const docStatus = documentDecisions[item.documentType]?.decision || 'pending';
                                            const docRemarks = documentDecisions[item.documentType]?.remarks || '';
                                            const label = formatDocumentLabel(item.documentType, item.name, item.publicId);

                                            return (
                                                <div key={item.key} className="flex flex-col p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <DocumentIcon className="h-8 w-8 text-blue-600" />
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {label}
                                                                </p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {item.name || 'Uploaded Document'}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {item.size ? `${(item.size / 1024).toFixed(1)} KB` : ''} {item.type ? `• ${item.type}` : ''}
                                                                </p>
                                                                <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${docStatus === 'approve' ? 'bg-green-100 text-green-800' : docStatus === 'reject' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                    {docStatus === 'approve' ? 'APPROVED' : docStatus === 'reject' ? 'REJECTED' : 'PENDING'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => handleDocumentView({
                                                                    documentType: label,
                                                                    fileName: item.name,
                                                                    filePath: item.url,
                                                                    mimeType: item.type
                                                                })}
                                                                className="flex items-center px-3 py-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                                                            >
                                                                <EyeIcon className="h-4 w-4 mr-1" />
                                                                Preview
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (item.url) {
                                                                        window.open(item.url, '_blank', 'noopener,noreferrer');
                                                                    } else {
                                                                        handleDocumentView({
                                                                            documentType: label,
                                                                            fileName: item.name,
                                                                            filePath: item.url,
                                                                            mimeType: item.type
                                                                        });
                                                                    }
                                                                }}
                                                                className="flex items-center px-3 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                                            >
                                                                <EyeIcon className="h-4 w-4 mr-1" />
                                                                View
                                                            </button>
                                                            {docStatus !== 'approve' && (
                                                                <button
                                                                    onClick={() => handleDocumentDecision(item.documentType, 'approve')}
                                                                    className="flex items-center px-3 py-1 text-green-600 hover:text-green-800 dark:text-green-400"
                                                                >
                                                                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                                    Approve
                                                                </button>
                                                            )}
                                                            {docStatus !== 'reject' && (
                                                                <button
                                                                    onClick={() => handleDocumentDecision(item.documentType, 'reject')}
                                                                    className="flex items-center px-3 py-1 text-red-600 hover:text-red-800 dark:text-red-400"
                                                                >
                                                                    <XCircleIcon className="h-4 w-4 mr-1" />
                                                                    Reject
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {docStatus !== 'pending' && (
                                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                Remarks for {docStatus.toUpperCase()}:
                                                            </label>
                                                            <textarea
                                                                value={docRemarks}
                                                                onChange={(e) => handleDocumentRemarksChange(item.documentType, e.target.value)}
                                                                rows={2}
                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                                                                placeholder={`Enter remarks for ${docStatus}...`}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                            No documents uploaded during registration
                                        </div>
                                    )}

                                    {/* Generated Application PDF */}
                                    {selectedApplication.applicationPdfUrl && (
                                        <div className="flex items-center justify-between p-4 border border-purple-200 dark:border-purple-600 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                            <div className="flex items-center space-x-3">
                                                <DocumentTextIcon className="h-8 w-8 text-purple-600" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                        Generated Application PDF
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Complete application form with all details
                                                    </p>
                                                    <span className="inline-block px-2 py-1 text-xs rounded-full mt-1 bg-purple-100 text-purple-800">
                                                        GENERATED PDF
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => window.open(selectedApplication.applicationPdfUrl, '_blank')}
                                                    className="flex items-center px-3 py-1 text-purple-600 hover:text-purple-800 dark:text-purple-400"
                                                >
                                                    <EyeIcon className="h-4 w-4 mr-1" />
                                                    View PDF
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.href = selectedApplication.applicationPdfUrl;
                                                        link.download = `application-${selectedApplication.personalDetails?.fullName || 'form'}.pdf`;
                                                        link.click();
                                                    }}
                                                    className="flex items-center px-3 py-1 text-green-600 hover:text-green-800 dark:text-green-400"
                                                >
                                                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                                                    Download
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Document Review Actions */}
                                    {selectedApplication.documents && Object.keys(selectedApplication.documents).length > 0 && (
                                        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
                                            <button
                                                onClick={handleBulkDocumentVerification}
                                                disabled={verifying || Object.keys(documentDecisions).length === 0}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {verifying ? 'Processing...' : 'Submit Document Reviews'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Application Status Actions */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Application Status
                                </h4>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleApplicationApproval('approve')}
                                        disabled={verifying || selectedApplication.status === 'APPROVED'}
                                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                                        Approve Application
                                    </button>
                                    <button
                                        onClick={() => handleApplicationApproval('reject')}
                                        disabled={verifying || selectedApplication.status === 'REJECTED'}
                                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <XCircleIcon className="h-4 w-4 mr-2" />
                                        Reject Application
                                    </button>
                                </div>
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

            {/* Modals */}
            {renderDocumentViewer()}
            {renderRemarksModal()}
        </div>
    );
};

export default ApplicationReview;
