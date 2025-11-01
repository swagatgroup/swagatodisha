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
import { getDocumentUrl } from '../../../utils/documentUtils';

const ApplicationReview = ({ initialTab = 'submitted' }) => {
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [showDocumentViewer, setShowDocumentViewer] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [documentDecisions, setDocumentDecisions] = useState({});
    const [tabStats, setTabStats] = useState({
        submitted: 0,
        under_review: 0,
        approved: 0,
        rejected: 0
    });
    const [documentReviewStats, setDocumentReviewStats] = useState({
        total: 0,
        notReviewed: 0,
        partiallyReviewed: 0,
        fullyReviewed: 0,
        allApproved: 0,
        hasRejected: 0,
        noDocuments: 0
    });
    const [showDocumentSelectionModal, setShowDocumentSelectionModal] = useState(false);
    const [selectedDocumentsForGeneration, setSelectedDocumentsForGeneration] = useState([]);
    const [generationType, setGenerationType] = useState(null); // 'pdf' or 'zip'
    const [generating, setGenerating] = useState(false);

    // Make tabs reactive to state changes
    const getTabs = () => [
        { id: 'submitted', name: 'Not Reviewed', count: documentReviewStats.notReviewed, color: 'blue' },
        { id: 'under_review', name: 'Partially Reviewed', count: documentReviewStats.partiallyReviewed, color: 'yellow' },
        { id: 'approved', name: 'All Approved', count: documentReviewStats.allApproved, color: 'green' },
        { id: 'rejected', name: 'Has Rejected', count: documentReviewStats.hasRejected, color: 'red' },
        { id: 'no_documents', name: 'No Documents', count: documentReviewStats.noDocuments, color: 'gray' }
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


    const suggestedApproveRemarks = [
        'Document is clear and valid',
        'Matches application details',
        'Official copy verified'
    ];

    const suggestedRejectRemarks = [
        'Blurry or unreadable',
        'Incorrect document uploaded',
        'Details do not match application'
    ];

    useEffect(() => {
        fetchAllApplicationsForStats();
        fetchApplications();
    }, [activeTab]);

    // Note: Auto-refresh removed to prevent rate limiting issues
    // Staff can use the manual "Refresh" button to get latest data

    // Debug: Log when documentReviewStats changes
    useEffect(() => {
        console.log('Document review stats updated:', documentReviewStats);
    }, [documentReviewStats]);

    const fetchAllApplicationsForStats = async () => {
        try {
            // First try the dedicated stats endpoint
            const response = await api.get('/api/student-application/document-review-stats');
            if (response.data?.success) {
                setDocumentReviewStats(response.data.data);
                return;
            }
        } catch (error) {
            console.log('Stats endpoint not available, calculating from applications data');
            console.error('Stats endpoint error:', error);
        }

        // Fallback: fetch all applications and calculate stats
        try {
            const response = await api.get('/api/student-application/applications');
            if (response.data?.success) {
                const allApplications = response.data.data.applications || [];
                calculateStatsFromApplicationsData(allApplications);
            }
        } catch (error) {
            console.error('Error fetching applications for stats:', error);
        }
    };


    const calculateStatsFromApplicationsData = (applicationsData) => {
        let notReviewed = 0;
        let partiallyReviewed = 0;
        let allApproved = 0;
        let hasRejected = 0;
        let noDocuments = 0;

        applicationsData.forEach(app => {
            const documents = app.documents || [];
            const totalDocs = documents.length;
            const reviewedDocs = documents.filter(doc => doc.status && doc.status !== 'PENDING').length;
            const approvedDocs = documents.filter(doc => doc.status === 'APPROVED').length;
            const rejectedDocs = documents.filter(doc => doc.status === 'REJECTED').length;

            if (totalDocs === 0) {
                noDocuments++;
            } else if (reviewedDocs === 0) {
                notReviewed++;
            } else if (reviewedDocs === totalDocs) {
                if (rejectedDocs === 0) {
                    allApproved++;
                } else {
                    hasRejected++;
                }
            } else {
                partiallyReviewed++;
            }
        });

        console.log('Calculated stats:', { notReviewed, partiallyReviewed, allApproved, hasRejected, noDocuments });

        setDocumentReviewStats(prev => {
            const newStats = {
                ...prev,
                notReviewed,
                partiallyReviewed,
                allApproved,
                hasRejected,
                noDocuments
            };
            console.log('Setting document review stats:', newStats);
            return newStats;
        });
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);

            // Map tab IDs to review filters
            const reviewFilterMap = {
                'submitted': 'not_reviewed',
                'under_review': 'partially_reviewed',
                'approved': 'all_approved',
                'rejected': 'has_rejected',
                'no_documents': 'no_documents'
            };

            const reviewFilter = reviewFilterMap[activeTab];
            const queryParams = reviewFilter ? `?reviewFilter=${reviewFilter}` : '';

            const response = await api.get(`/api/student-application/applications${queryParams}`);

            if (response.data?.success) {
                const applicationsData = response.data.data.applications || [];
                console.log(`Fetched applications for ${activeTab} (${reviewFilter}):`, applicationsData.length, applicationsData);
                setApplications(applicationsData);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
            console.error('Error details:', error.response?.data);
            showError('Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicationDetails = async (applicationId) => {
        try {
            console.log('🔍 Fetching latest application details for:', applicationId);
            const response = await api.get(`/api/student-application/${applicationId}/review`);

            if (response.data?.success) {
                const appData = response.data.data;
                console.log('✅ Application details loaded');
                console.log('📄 Documents count:', appData.documents?.length || 0);
                console.log('📊 Review Status:', appData.reviewStatus);

                // Log each document's current status
                if (appData.documents && appData.documents.length > 0) {
                    console.log('📋 Document Statuses:');
                    appData.documents.forEach(doc => {
                        console.log(`  - ${doc.documentType}: ${doc.status || 'PENDING'}${doc.uploadedAt ? ` (Uploaded: ${new Date(doc.uploadedAt).toLocaleString()})` : ''}${doc.remarks ? ` - "${doc.remarks.substring(0, 50)}"` : ''}`);
                    });
                }

                setSelectedApplication(appData);
            }
        } catch (error) {
            console.error('❌ Error fetching application details:', error);
            console.error('❌ Error response:', error.response?.data);
            showError('Failed to fetch application details');
        }
    };

    const handleVerification = async (verificationType, isVerified) => {
        if (!selectedApplication) return;

        try {
            setVerifying(true);
            const response = await api.put(`/api/student-application/${selectedApplication.applicationId}/verify`, {
                verificationType,
                isVerified
            });

            if (response.data?.success) {
                showSuccess(response.data.message);
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
        // For approvals, don't require remarks. For rejections, require remarks.
        const finalRemarks = decision === 'approve' ? (remarks || 'Document approved') : remarks;
        setDocumentDecisions(prev => ({
            ...prev,
            [documentType]: { decision, remarks: finalRemarks }
        }));

        // Show visual feedback with toast
        if (decision === 'approve') {
            console.log(`✅ Marked ${documentType} for APPROVAL`);
            // Short success message
            showSuccess(`✓ Marked for approval`);
        } else {
            console.log(`⚠️ Marked ${documentType} for REJECTION - Add remarks and click "Submit Document Reviews"`);
            // Warning message with instructions
            showError(`⚠️ Marked for rejection - Add remarks below, then click "Submit Document Reviews"`);
        }
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

        // Validate that rejected documents have remarks
        const rejectedDecisions = Object.entries(documentDecisions).filter(([_, { decision }]) => decision === 'reject');
        const rejectedWithoutRemarks = rejectedDecisions.filter(([_, { remarks }]) => !remarks || remarks.trim() === '');

        if (rejectedWithoutRemarks.length > 0) {
            showError('Please provide remarks for all rejected documents before submitting');
            return;
        }

        const decisions = Object.entries(documentDecisions).map(([documentType, { decision, remarks }]) => ({
            documentType,
            status: decision === 'approve' ? 'APPROVED' : 'REJECTED',
            remarks: decision === 'approve' ? (remarks || 'Document approved') : remarks
        }));

        if (decisions.length === 0) {
            showError('Please review at least one document before submitting');
            return;
        }

        // Generate mixed feedback summary
        const approvedDocs = decisions.filter(d => d.status === 'APPROVED');
        const rejectedDocs = decisions.filter(d => d.status === 'REJECTED');

        let feedbackMessage = '';
        if (approvedDocs.length > 0 && rejectedDocs.length > 0) {
            feedbackMessage = `${approvedDocs.length} approved, ${rejectedDocs.length} rejected`;
        } else if (approvedDocs.length > 0) {
            feedbackMessage = `${approvedDocs.length} documents approved`;
        } else if (rejectedDocs.length > 0) {
            feedbackMessage = `${rejectedDocs.length} documents rejected`;
        }

        // Show confirmation dialog
        const result = await showConfirm(
            'Confirm Document Review',
            `Are you sure you want to submit these document reviews?\n\n${feedbackMessage}\n\nThis will notify the agent/student about the review results.`,
            {
                confirmButtonText: 'Yes, Submit Review',
                cancelButtonText: 'No, Cancel'
            }
        );

        // Check if user confirmed (clicked Yes) - SweetAlert2 returns { isConfirmed: true } on confirm
        // Explicitly check that user clicked "Yes" - if they clicked "No" or dismissed, isConfirmed will be false
        if (!result || result.isConfirmed !== true) {
            console.log('❌ User cancelled document review submission', { result });
            return; // Exit early - do not submit
        }

        console.log('✅ User confirmed document review submission', { result });

        try {
            setVerifying(true);

            console.log('📤 Submitting document reviews:', {
                applicationId: selectedApplication.applicationId,
                decisions,
                feedbackSummary: feedbackMessage
            });

            const response = await api.put(`/api/student-application/${selectedApplication.applicationId}/verify`, {
                decisions,
                feedbackSummary: feedbackMessage
            });

            console.log('✅ Verification response:', response.data);

            if (response.data?.success) {
                showSuccess(`✅ Documents reviewed successfully! ${feedbackMessage}`);
                setDocumentDecisions({});

                console.log('🔄 Refreshing application details...');
                await fetchApplicationDetails(selectedApplication.applicationId);

                console.log('🔄 Refreshing applications list...');
                await fetchApplications();

                console.log('✅ All data refreshed - changes persisted');
            } else {
                console.error('❌ Verification failed:', response.data);
                showError(response.data?.message || 'Failed to review documents');
            }
        } catch (error) {
            console.error('❌ Error reviewing documents:', error);
            console.error('❌ Error response:', error.response?.data);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to review documents';
            showError(`Failed to review documents: ${errorMessage}`);
        } finally {
            setVerifying(false);
        }
    };


    // Check if all documents are approved
    const areAllDocumentsApproved = () => {
        if (!selectedApplication || !selectedApplication.documents) return false;

        const documents = Array.isArray(selectedApplication.documents)
            ? selectedApplication.documents
            : Object.values(selectedApplication.documents);

        if (documents.length === 0) return false;

        return documents.every(doc => doc.status === 'APPROVED');
    };

    const handleGeneratePDF = async () => {
        if (!selectedApplication) return;

        // Check if all documents are approved
        if (!areAllDocumentsApproved()) {
            showError('Please approve all documents before generating PDF');
            return;
        }

        // Initialize with all approved documents selected
        const documents = Array.isArray(selectedApplication.documents)
            ? selectedApplication.documents
            : Object.values(selectedApplication.documents || {});
        const approvedDocs = documents.filter(doc => doc.status === 'APPROVED');
        setSelectedDocumentsForGeneration(approvedDocs.map(doc => doc._id?.toString() || doc.documentType));

        // Show document selection modal
        setGenerationType('pdf');
        setShowDocumentSelectionModal(true);
    };

    const handleGenerateZIP = async () => {
        if (!selectedApplication) return;

        // Check if all documents are approved
        if (!areAllDocumentsApproved()) {
            showError('Please approve all documents before generating ZIP');
            return;
        }

        // Initialize with all approved documents selected
        const documents = Array.isArray(selectedApplication.documents)
            ? selectedApplication.documents
            : Object.values(selectedApplication.documents || {});
        const approvedDocs = documents.filter(doc => doc.status === 'APPROVED');
        setSelectedDocumentsForGeneration(approvedDocs.map(doc => doc._id?.toString() || doc.documentType));

        // Show document selection modal
        setGenerationType('zip');
        setShowDocumentSelectionModal(true);
    };

    const handleConfirmGeneration = async () => {
        if (selectedDocumentsForGeneration.length === 0) {
            showError('Please select at least one document');
            return;
        }

        try {
            setGenerating(true);
            const endpoint = generationType === 'pdf'
                ? `/api/student-application/${selectedApplication.applicationId}/combined-pdf`
                : `/api/student-application/${selectedApplication.applicationId}/documents-zip`;

            const response = await api.post(endpoint, {
                selectedDocuments: selectedDocumentsForGeneration
            });

            if (response.data?.success) {
                showSuccess(`${generationType.toUpperCase()} generated successfully!`);

                // Download the file using fetch with authentication to prevent session loss
                const fileUrl = response.data.data.url || response.data.data.pdfUrl || response.data.data.zipUrl;
                if (fileUrl) {
                    // Use API base URL if available, otherwise fallback to window.location.origin
                    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
                    const baseUrl = API_BASE_URL || window.location.origin;
                    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${baseUrl}${fileUrl}`;

                    try {
                        // Fetch with credentials to include auth token
                        const fileResponse = await fetch(fullUrl, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            },
                            credentials: 'include'
                        });

                        if (!fileResponse.ok) {
                            throw new Error(`Download failed: ${fileResponse.status}`);
                        }

                        // Create blob and download
                        const blob = await fileResponse.blob();
                        const blobUrl = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = fullUrl.split('/').pop() || `file.${generationType === 'pdf' ? 'pdf' : 'zip'}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(blobUrl);
                    } catch (downloadError) {
                        console.error('Download error:', downloadError);
                        showError('File generated but download failed. You can try accessing it directly.');
                        // Fallback: open in new tab
                        window.open(fullUrl, '_blank');
                    }
                }

                setShowDocumentSelectionModal(false);
                setSelectedDocumentsForGeneration([]);
                setGenerationType(null);
            }
        } catch (error) {
            console.error(`Error generating ${generationType}:`, error);
            const errorMessage = error.response?.data?.message || error.message || `Failed to generate ${generationType.toUpperCase()}`;
            showError(errorMessage);

            // Check if it's an authentication error
            if (error.response?.status === 401) {
                console.error('Authentication error - session may have expired');
                // Don't redirect, just show error - let user stay on page
            }
        } finally {
            setGenerating(false);
        }
    };

    const toggleDocumentSelection = (documentId) => {
        setSelectedDocumentsForGeneration(prev =>
            prev.includes(documentId)
                ? prev.filter(id => id !== documentId)
                : [...prev, documentId]
        );
    };

    const selectAllDocuments = () => {
        if (!selectedApplication || !selectedApplication.documents) return;

        const documents = Array.isArray(selectedApplication.documents)
            ? selectedApplication.documents
            : Object.values(selectedApplication.documents);

        const approvedDocs = documents.filter(doc => doc.status === 'APPROVED');
        setSelectedDocumentsForGeneration(approvedDocs.map(doc => doc._id || doc.documentType));
    };

    const clearDocumentSelection = () => {
        setSelectedDocumentsForGeneration([]);
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
                <div className="flex items-center space-x-2">
                    {application.documentStats && (
                        <div className="flex items-center space-x-1 text-xs">
                            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                                {application.documentStats.reviewed}/{application.documentStats.total} reviewed
                            </span>
                            {application.documentStats.approved > 0 && (
                                <span className="px-2 py-1 rounded bg-green-100 text-green-800">
                                    {application.documentStats.approved} approved
                                </span>
                            )}
                            {application.documentStats.rejected > 0 && (
                                <span className="px-2 py-1 rounded bg-red-100 text-red-800">
                                    {application.documentStats.rejected} rejected
                                </span>
                            )}
                        </div>
                    )}
                    <button className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Review
                    </button>
                </div>
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
                                            src={selectedDocument.filePath} // Already converted to full URL
                                            alt={selectedDocument.fileName}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                console.error('❌ Failed to load image:', selectedDocument.filePath);
                                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="10" y="50">Failed to load</text></svg>';
                                            }}
                                        />
                                    ) : (
                                        <iframe
                                            src={selectedDocument.filePath} // Already converted to full URL
                                            className="w-full h-full"
                                            title={selectedDocument.fileName}
                                            onError={(e) => {
                                                console.error('❌ Failed to load document in iframe:', selectedDocument.filePath);
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                            {!selectedDocument.filePath && (
                                <div className="text-center text-gray-500 py-8">
                                    <p>Document preview not available</p>
                                </div>
                            )}
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
                    {getTabs().map((tab) => (
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
                                        onClick={async () => {
                                            console.log('🔄 Manually refreshing application details...');
                                            await fetchApplicationDetails(selectedApplication.applicationId);
                                            await fetchApplications();
                                            showSuccess('✅ Application data refreshed!');
                                        }}
                                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                        title="Refresh to see latest document updates"
                                    >
                                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Refresh
                                    </button>
                                    <button
                                        onClick={handleGeneratePDF}
                                        disabled={!areAllDocumentsApproved()}
                                        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${areAllDocumentsApproved()
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            }`}
                                        title={areAllDocumentsApproved() ? 'Generate combined PDF of selected documents' : 'Please approve all documents first'}
                                    >
                                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                                        Generate PDF
                                    </button>
                                    <button
                                        onClick={handleGenerateZIP}
                                        disabled={!areAllDocumentsApproved()}
                                        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${areAllDocumentsApproved()
                                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                                            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            }`}
                                        title={areAllDocumentsApproved() ? 'Generate ZIP of selected documents' : 'Please approve all documents first'}
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
                                                publicId: doc.cloudinaryPublicId,
                                                status: doc.status, // Add actual database status
                                                uploadedAt: doc.uploadedAt,
                                                reviewedAt: doc.reviewedAt,
                                                remarks: doc.remarks
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
                                            const documentUrl = getDocumentUrl(item.url);

                                            // Use actual database status for display
                                            const actualStatus = item.status || 'PENDING';
                                            const isApproved = actualStatus === 'APPROVED';
                                            const isRejected = actualStatus === 'REJECTED';
                                            const isPending = actualStatus === 'PENDING';

                                            return (
                                                <div key={item.key} className={`flex flex-col p-4 border rounded-lg ${isRejected ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' :
                                                    isApproved ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' :
                                                        'border-gray-200 dark:border-gray-600'
                                                    }`}>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center space-x-3 flex-1">
                                                            <DocumentIcon className={`h-8 w-8 ${isApproved ? 'text-green-600' :
                                                                isRejected ? 'text-red-600' :
                                                                    'text-blue-600'
                                                                }`} />
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {label}
                                                                </p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {item.name || 'Uploaded Document'}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {item.size ? `${(item.size / 1024).toFixed(1)} KB` : ''} {item.type ? `• ${item.type}` : ''}
                                                                </p>

                                                                {/* Upload timestamp */}
                                                                {item.uploadedAt && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                        📅 Uploaded: {new Date(item.uploadedAt).toLocaleString()}
                                                                    </p>
                                                                )}

                                                                {/* Current database status badge - PROMINENT */}
                                                                <div className="mt-2">
                                                                    <span className={`inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg shadow-sm ${isApproved ? 'bg-green-500 text-white' :
                                                                        isRejected ? 'bg-red-500 text-white' :
                                                                            'bg-yellow-500 text-white'
                                                                        }`}>
                                                                        {isApproved ? '✓ APPROVED' : isRejected ? '✗ REJECTED' : '⏳ PENDING'}
                                                                    </span>
                                                                    {item.reviewedAt && (
                                                                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                                            • Reviewed: {new Date(item.reviewedAt).toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Existing remarks from database */}
                                                                {item.remarks && (
                                                                    <div className={`mt-2 p-2 rounded text-xs ${isRejected ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
                                                                        isApproved ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
                                                                            'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                                                                        }`}>
                                                                        <strong>
                                                                            {isRejected ? '⚠️ Previous Rejection: ' :
                                                                                isApproved ? '✓ Approval Note: ' :
                                                                                    'Review Note: '}
                                                                        </strong>
                                                                        {item.remarks}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => {
                                                                    const fullUrl = getDocumentUrl(item.url);
                                                                    console.log('👁️ Previewing document:', {
                                                                        label,
                                                                        originalUrl: item.url,
                                                                        fullUrl: fullUrl,
                                                                        fileName: item.name,
                                                                        mimeType: item.type
                                                                    });
                                                                    handleDocumentView({
                                                                        documentType: label,
                                                                        fileName: item.name,
                                                                        filePath: fullUrl, // Use full URL
                                                                        mimeType: item.type
                                                                    });
                                                                }}
                                                                className="flex items-center px-3 py-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                                                                title="Preview document in modal"
                                                            >
                                                                <EyeIcon className="h-4 w-4 mr-1" />
                                                                Preview
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const fullUrl = getDocumentUrl(item.url);
                                                                    console.log('📄 Opening document in new tab:', {
                                                                        label,
                                                                        originalUrl: item.url,
                                                                        fullUrl: fullUrl,
                                                                        documentUrl: documentUrl,
                                                                        mimeType: item.type
                                                                    });

                                                                    if (fullUrl) {
                                                                        window.open(fullUrl, '_blank', 'noopener,noreferrer');
                                                                    } else {
                                                                        showError('Document URL not available');
                                                                        console.error('❌ Unable to construct document URL from:', item.url);
                                                                    }
                                                                }}
                                                                className="flex items-center px-3 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                                                title="Open document in new tab"
                                                            >
                                                                <EyeIcon className="h-4 w-4 mr-1" />
                                                                View
                                                            </button>
                                                            {docStatus !== 'approve' && (
                                                                <button
                                                                    onClick={() => handleDocumentDecision(item.documentType, 'approve')}
                                                                    className="flex items-center px-3 py-1 text-green-600 hover:text-green-800 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                                                    title="Click to mark for approval"
                                                                >
                                                                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                                    Approve
                                                                </button>
                                                            )}
                                                            {docStatus !== 'reject' && (
                                                                <button
                                                                    onClick={() => {
                                                                        handleDocumentDecision(item.documentType, 'reject');
                                                                        // Scroll to remarks field after clicking reject
                                                                        setTimeout(() => {
                                                                            const remarksField = document.querySelector(`textarea[placeholder*="rejection"]`);
                                                                            if (remarksField) {
                                                                                remarksField.focus();
                                                                                remarksField.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                                                            }
                                                                        }, 100);
                                                                    }}
                                                                    className="flex items-center px-3 py-1 text-red-600 hover:text-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                                    title="Click to mark for rejection - then add remarks below"
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
                                                                {docStatus === 'reject' ? 'Remarks for REJECTION (Required):' : 'Remarks for APPROVAL (Optional):'}
                                                            </label>
                                                            <textarea
                                                                value={docRemarks}
                                                                onChange={(e) => handleDocumentRemarksChange(item.documentType, e.target.value)}
                                                                rows={2}
                                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm ${docStatus === 'reject' && !docRemarks.trim()
                                                                    ? 'border-red-300 dark:border-red-600'
                                                                    : 'border-gray-300 dark:border-gray-600'
                                                                    }`}
                                                                placeholder={docStatus === 'reject' ? 'Please provide reason for rejection...' : 'Optional remarks for approval...'}
                                                                required={docStatus === 'reject'}
                                                            />
                                                            {docStatus === 'reject' && !docRemarks.trim() && (
                                                                <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                                                                    Remarks are required for rejected documents
                                                                </p>
                                                            )}
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
                                                    onClick={() => window.open(getDocumentUrl(selectedApplication.applicationPdfUrl), '_blank')}
                                                    className="flex items-center px-3 py-1 text-purple-600 hover:text-purple-800 dark:text-purple-400"
                                                >
                                                    <EyeIcon className="h-4 w-4 mr-1" />
                                                    View PDF
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.href = getDocumentUrl(selectedApplication.applicationPdfUrl);
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
                                    {selectedApplication.documents && (Array.isArray(selectedApplication.documents) ? selectedApplication.documents.length > 0 : Object.keys(selectedApplication.documents).length > 0) && (
                                        <div className="space-y-4">
                                            {/* Review Summary */}
                                            {Object.keys(documentDecisions).length > 0 && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                                                    <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Review Summary</h5>
                                                    <div className="space-y-2">
                                                        {Object.entries(documentDecisions).map(([docType, { decision, remarks }]) => (
                                                            <div key={docType} className="flex items-center justify-between text-sm">
                                                                <span className="text-blue-800 dark:text-blue-200">{docType}:</span>
                                                                <div className="flex items-center space-x-2">
                                                                    <span className={`px-2 py-1 rounded text-xs ${decision === 'approve'
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                                        }`}>
                                                                        {decision.toUpperCase()}
                                                                    </span>
                                                                    {remarks && (
                                                                        <span className="text-blue-600 dark:text-blue-300 text-xs">
                                                                            "{remarks}"
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center">
                                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                                    <span className="font-medium">Quick Actions:</span>
                                                    <span className="ml-2">Approve All → </span>
                                                    <button onClick={() => {
                                                        // Approve all pending documents without remarks
                                                        const pendingDocs = Object.keys(selectedApplication.documents || {});
                                                        pendingDocs.forEach(docType => {
                                                            if (!documentDecisions[docType]) {
                                                                handleDocumentDecision(docType, 'approve');
                                                            }
                                                        });
                                                    }} className="mx-1 px-2 py-1 text-xs rounded bg-green-100 text-green-800 hover:bg-green-200">
                                                        Approve All
                                                    </button>
                                                    <span className="ml-4">Reject with Remarks → </span>
                                                    {suggestedRejectRemarks.map((r) => (
                                                        <button key={r} onClick={() => {
                                                            // Apply to all pending documents
                                                            const pendingDocs = Object.keys(selectedApplication.documents || {});
                                                            pendingDocs.forEach(docType => {
                                                                if (!documentDecisions[docType]) {
                                                                    handleDocumentDecision(docType, 'reject', r);
                                                                }
                                                            });
                                                        }} className="mx-1 px-2 py-1 text-xs rounded bg-red-100 text-red-800 hover:bg-red-200">
                                                            {r}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => setDocumentDecisions({})}
                                                        className="px-3 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    >
                                                        Clear All
                                                    </button>
                                                    <button
                                                        onClick={handleBulkDocumentVerification}
                                                        disabled={verifying || Object.keys(documentDecisions).length === 0}
                                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                                                        title={Object.keys(documentDecisions).length === 0 ? 'Review at least one document first' : 'Click to save all document reviews to database'}
                                                    >
                                                        {verifying ? (
                                                            <span className="flex items-center">
                                                                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Saving Reviews...
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center">
                                                                <CheckBadgeIcon className="h-5 w-5 mr-2" />
                                                                Submit Document Reviews ({Object.keys(documentDecisions).length})
                                                            </span>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {selectedApplication.reviewStatus?.documentCounts && (
                                                <div className="flex items-center space-x-3 text-sm">
                                                    <span className="px-2 py-1 rounded bg-green-100 text-green-800">Approved: {selectedApplication.reviewStatus.documentCounts.approved}</span>
                                                    <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">Pending: {selectedApplication.reviewStatus.documentCounts.pending}</span>
                                                    <span className="px-2 py-1 rounded bg-red-100 text-red-800">Rejected: {selectedApplication.reviewStatus.documentCounts.rejected}</span>
                                                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-800">Total: {selectedApplication.reviewStatus.documentCounts.total}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
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

            {/* Modals */}
            {renderDocumentViewer()}

            {/* Document Selection Modal */}
            <AnimatePresence>
                {showDocumentSelectionModal && selectedApplication && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => !generating && setShowDocumentSelectionModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                        Select Documents for {generationType === 'pdf' ? 'PDF' : 'ZIP'}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Choose which documents to include in the {generationType === 'pdf' ? 'combined PDF' : 'ZIP file'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => !generating && setShowDocumentSelectionModal(false)}
                                    disabled={generating}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                                >
                                    <XCircleIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[60vh]">
                                {(() => {
                                    const documents = Array.isArray(selectedApplication.documents)
                                        ? selectedApplication.documents
                                        : Object.entries(selectedApplication.documents || {}).map(([docType, d]) => ({
                                            _id: docType,
                                            documentType: docType,
                                            fileName: d.name || d.fileName,
                                            status: d.status || 'PENDING'
                                        }));

                                    const approvedDocs = documents.filter(doc => doc.status === 'APPROVED');

                                    if (approvedDocs.length === 0) {
                                        return (
                                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                                                <p>No approved documents available</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {approvedDocs.length} approved document{approvedDocs.length !== 1 ? 's' : ''} available
                                                </span>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={selectAllDocuments}
                                                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                                    >
                                                        Select All
                                                    </button>
                                                    <button
                                                        onClick={clearDocumentSelection}
                                                        className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400"
                                                    >
                                                        Clear All
                                                    </button>
                                                </div>
                                            </div>

                                            {approvedDocs.map((doc) => {
                                                const label = formatDocumentLabel(doc.documentType, doc.fileName);
                                                const docId = doc._id || doc.documentType;
                                                const isSelected = selectedDocumentsForGeneration.includes(docId);

                                                return (
                                                    <div
                                                        key={docId}
                                                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${isSelected
                                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                                                            : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                            }`}
                                                        onClick={() => toggleDocumentSelection(docId)}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleDocumentSelection(docId)}
                                                            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <div className="ml-4 flex-1">
                                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                {label}
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {doc.fileName || doc.documentType}
                                                            </p>
                                                            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                                APPROVED
                                                            </span>
                                                        </div>
                                                        <CheckCircleIcon className={`h-6 w-6 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <button
                                    onClick={() => !generating && setShowDocumentSelectionModal(false)}
                                    disabled={generating}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmGeneration}
                                    disabled={generating || selectedDocumentsForGeneration.length === 0}
                                    className={`px-6 py-2 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed ${generationType === 'pdf'
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-purple-600 hover:bg-purple-700'
                                        }`}
                                >
                                    {generating ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating...
                                        </span>
                                    ) : (
                                        `Generate ${generationType === 'pdf' ? 'PDF' : 'ZIP'} (${selectedDocumentsForGeneration.length})`
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ApplicationReview;
