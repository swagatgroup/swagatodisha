import {useState, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { showSuccess, showError, showConfirm, showLoading, closeLoading } from '../../utils/sweetAlert';

const DocumentVerificationInterface = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [filter, setFilter] = useState('PENDING');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showViewer, setShowViewer] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [customRemarks, setCustomRemarks] = useState('');
    const [isCustomRemark, setIsCustomRemark] = useState(false);
    const [sortBy, setSortBy] = useState('uploadedAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [batchProcessing, setBatchProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [dateFilter, setDateFilter] = useState('');
    const [documentTypeFilter, setDocumentTypeFilter] = useState('');
    const [uploaderFilter, setUploaderFilter] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const [bulkActionType, setBulkActionType] = useState('');
    const [showBulkActionModal, setShowBulkActionModal] = useState(false);

    const predefinedApprovalRemarks = [
        "All documents are verified and approved. Well done!",
        "Documents are in perfect order. Approved for next stage.",
        "Excellent documentation. Application approved.",
        "All requirements met successfully. Approved.",
        "Documents verified and found satisfactory. Approved."
    ];

    const predefinedRejectionRemarks = [
        "Document quality is poor. Please upload clearer images.",
        "Missing required information. Please resubmit with complete details.",
        "Document appears to be invalid or tampered. Please provide original.",
        "File format not supported. Please upload PDF or JPG format.",
        "Document expired. Please provide current/valid document."
    ];

    const statusColors = {
        'PENDING': 'bg-yellow-100 text-yellow-800',
        'UNDER_REVIEW': 'bg-blue-100 text-blue-800',
        'APPROVED': 'bg-green-100 text-green-800',
        'REJECTED': 'bg-red-100 text-red-800',
        'RESUBMITTED': 'bg-orange-100 text-orange-800'
    };

    const statusLabels = {
        'PENDING': 'Awaiting Review',
        'UNDER_REVIEW': 'Being Reviewed',
        'APPROVED': 'Approved',
        'REJECTED': 'Rejected',
        'RESUBMITTED': 'Resubmitted'
    };

    useEffect(() => {
        fetchDocuments();
    }, [filter]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/documents/pending?status=${filter}`);
            if (response.data.success) {
                setDocuments(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            showError('Error', 'Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectDocument = (documentId) => {
        setSelectedDocuments(prev =>
            prev.includes(documentId)
                ? prev.filter(id => id !== documentId)
                : [...prev, documentId]
        );
    };

    const handleSelectAll = () => {
        if (selectedDocuments.length === documents.length) {
            setSelectedDocuments([]);
        } else {
            setSelectedDocuments(documents.map(doc => doc._id));
        }
    };

    const handleViewDocument = (document) => {
        setSelectedDocument(document);
        setShowViewer(true);
    };

    const handleApproveDocument = async (documentId, isBulk = false) => {
        const selectedRemark = isCustomRemark ? customRemarks : remarks;

        if (!selectedRemark && !isBulk) {
            showError('Missing Remarks', 'Please select or enter remarks for approval');
            return;
        }

        try {
            const response = await api.put(`/api/documents/${documentId}/approve`, {
                remarks: selectedRemark,
                isCustom: isCustomRemark
            });

            if (response.data.success) {
                showSuccess('Document Approved', 'Document has been approved successfully');
                fetchDocuments();
                if (!isBulk) {
                    setShowViewer(false);
                }
            }
        } catch (error) {
            console.error('Error approving document:', error);
            showError('Approval Failed', 'Failed to approve document');
        }
    };

    const handleRejectDocument = async (documentId, isBulk = false) => {
        const selectedRemark = isCustomRemark ? customRemarks : remarks;

        if (!selectedRemark && !isBulk) {
            showError('Missing Remarks', 'Please select or enter remarks for rejection');
            return;
        }

        try {
            const response = await api.put(`/api/documents/${documentId}/reject`, {
                remarks: selectedRemark,
                isCustom: isCustomRemark
            });

            if (response.data.success) {
                showSuccess('Document Rejected', 'Document has been rejected with remarks');
                fetchDocuments();
                if (!isBulk) {
                    setShowViewer(false);
                }
            }
        } catch (error) {
            console.error('Error rejecting document:', error);
            showError('Rejection Failed', 'Failed to reject document');
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedDocuments.length === 0) {
            showError('No Selection', 'Please select documents to perform bulk action');
            return;
        }

        const confirmed = await showConfirm(
            `Bulk ${action}`,
            `Are you sure you want to ${action.toLowerCase()} ${selectedDocuments.length} selected documents?`,
            `Yes, ${action}`,
            'Cancel'
        );

        if (confirmed) {
            setBatchProcessing(true);
            setProcessingProgress(0);
            showLoading(`Processing ${action}...`, `Processing ${selectedDocuments.length} documents`);

            try {
                const total = selectedDocuments.length;
                let processed = 0;

                for (const docId of selectedDocuments) {
                    if (action === 'Approve') {
                        await handleApproveDocument(docId, true);
                    } else if (action === 'Reject') {
                        await handleRejectDocument(docId, true);
                    }

                    processed++;
                    setProcessingProgress((processed / total) * 100);

                    // Small delay to show progress
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                setSelectedDocuments([]);
                closeLoading();
                showSuccess(`Bulk ${action}`, `${action} completed for ${processed} documents`);
            } catch (error) {
                console.error(`Error in bulk ${action}:`, error);
                closeLoading();
                showError(`Bulk ${action} Failed`, `Failed to ${action.toLowerCase()} documents`);
            } finally {
                setBatchProcessing(false);
                setProcessingProgress(0);
            }
        }
    };

    const filteredDocuments = documents.filter(doc => {
        // Search term filter
        if (searchTerm && !doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !doc.uploadedBy.fullName.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // Date filter
        if (dateFilter) {
            const docDate = new Date(doc.uploadedAt).toDateString();
            const filterDate = new Date(dateFilter).toDateString();
            if (docDate !== filterDate) return false;
        }

        // Document type filter
        if (documentTypeFilter && doc.documentType !== documentTypeFilter) {
            return false;
        }

        // Uploader filter
        if (uploaderFilter && !doc.uploadedBy.fullName.toLowerCase().includes(uploaderFilter.toLowerCase())) {
            return false;
        }

        return true;
    }).sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'uploadedAt') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const getDocumentStats = () => {
        const stats = {
            total: documents.length,
            pending: documents.filter(doc => doc.status === 'PENDING').length,
            underReview: documents.filter(doc => doc.status === 'UNDER_REVIEW').length,
            approved: documents.filter(doc => doc.status === 'APPROVED').length,
            rejected: documents.filter(doc => doc.status === 'REJECTED').length
        };
        return stats;
    };

    const stats = getDocumentStats();

    const getUniqueDocumentTypes = () => {
        const types = [...new Set(documents.map(doc => doc.documentType))];
        return types;
    };

    const getUniqueUploaders = () => {
        const uploaders = [...new Set(documents.map(doc => doc.uploadedBy.fullName))];
        return uploaders;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setDateFilter('');
        setDocumentTypeFilter('');
        setUploaderFilter('');
        setSortBy('uploadedAt');
        setSortOrder('desc');
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
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Document Verification</h2>
                <p className="text-gray-600">
                    Review and verify student documents. Use bulk actions for efficient processing.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow p-4"
                >
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Total</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-lg shadow p-4"
                >
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-full">
                            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-lg shadow p-4"
                >
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Under Review</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.underReview}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-lg shadow p-4"
                >
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-full">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Approved</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-lg shadow p-4"
                >
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-full">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Rejected</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col space-y-4">
                    {/* Basic Filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full sm:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="PENDING">Pending</option>
                                <option value="UNDER_REVIEW">Under Review</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="all">All Documents</option>
                            </select>

                            <button
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
                            </button>
                        </div>

                        <div className="flex space-x-2">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                            </div>

                            <button
                                onClick={() => handleBulkAction('Approve')}
                                disabled={selectedDocuments.length === 0 || batchProcessing}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {batchProcessing ? 'Processing...' : `Approve Selected (${selectedDocuments.length})`}
                            </button>
                            <button
                                onClick={() => handleBulkAction('Reject')}
                                disabled={selectedDocuments.length === 0 || batchProcessing}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {batchProcessing ? 'Processing...' : `Reject Selected (${selectedDocuments.length})`}
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    <AnimatePresence>
                        {showAdvancedFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t border-gray-200 pt-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Filter</label>
                                        <input
                                            type="date"
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                                        <select
                                            value={documentTypeFilter}
                                            onChange={(e) => setDocumentTypeFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">All Types</option>
                                            {getUniqueDocumentTypes().map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Uploader</label>
                                        <input
                                            type="text"
                                            placeholder="Filter by uploader..."
                                            value={uploaderFilter}
                                            onChange={(e) => setUploaderFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                        <div className="flex space-x-2">
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="uploadedAt">Upload Date</option>
                                                <option value="documentType">Document Type</option>
                                                <option value="status">Status</option>
                                                <option value="originalName">File Name</option>
                                            </select>
                                            <button
                                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                                className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Processing Progress */}
                    {batchProcessing && (
                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Processing documents...</span>
                                <span className="text-sm text-gray-500">{Math.round(processingProgress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${processingProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                                onChange={handleSelectAll}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-600">Select All</span>
                        </div>
                    </div>
                </div>

                {viewMode === 'list' ? (
                    <div className="divide-y divide-gray-200">
                        {filteredDocuments.length === 0 ? (
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm ? 'No documents match your search criteria.' : 'No documents available for review.'}
                                </p>
                            </div>
                        ) : (
                            filteredDocuments.map((document) => (
                                <motion.div
                                    key={document._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 hover:bg-gray-50"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedDocuments.includes(document._id)}
                                                onChange={() => handleSelectDocument(document._id)}
                                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                            />

                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {document.documentType}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {document.originalName} • {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Uploaded by {document.uploadedBy.fullName} on {new Date(document.uploadedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[document.status]}`}>
                                                {statusLabels[document.status]}
                                            </span>

                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleViewDocument(document)}
                                                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                                >
                                                    View
                                                </button>

                                                {document.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApproveDocument(document._id)}
                                                            className="text-green-600 hover:text-green-900 text-sm font-medium"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectDocument(document._id)}
                                                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="p-6">
                        {filteredDocuments.length === 0 ? (
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm ? 'No documents match your search criteria.' : 'No documents available for review.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredDocuments.map((document) => (
                                    <motion.div
                                        key={document._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDocuments.includes(document._id)}
                                                    onChange={() => handleSelectDocument(document._id)}
                                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                />
                                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[document.status]}`}>
                                                {statusLabels[document.status]}
                                            </span>
                                        </div>

                                        <div className="mb-3">
                                            <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                                                {document.documentType}
                                            </h4>
                                            <p className="text-xs text-gray-500 truncate">
                                                {document.originalName}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>

                                        <div className="text-xs text-gray-400 mb-4">
                                            <p>By: {document.uploadedBy.fullName}</p>
                                            <p>{new Date(document.uploadedAt).toLocaleDateString()}</p>
                                        </div>

                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleViewDocument(document)}
                                                className="flex-1 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                                            >
                                                View
                                            </button>

                                            {document.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApproveDocument(document._id)}
                                                        className="flex-1 px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded hover:bg-green-100"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectDocument(document._id)}
                                                        className="flex-1 px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Document Viewer Modal */}
            {showViewer && selectedDocument && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowViewer(false)} />

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {selectedDocument.documentType}
                                    </h3>
                                    <button
                                        onClick={() => setShowViewer(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Document Preview */}
                                <div className="mb-6">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-600">
                                            Document preview would be displayed here
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {selectedDocument.originalName} ({(selectedDocument.fileSize / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                    </div>
                                </div>

                                {/* Remarks Section */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Predefined Remarks
                                        </label>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="remarkType"
                                                    checked={!isCustomRemark}
                                                    onChange={() => setIsCustomRemark(false)}
                                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                                />
                                                <label className="ml-2 text-sm text-gray-700">Use predefined remarks</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="remarkType"
                                                    checked={isCustomRemark}
                                                    onChange={() => setIsCustomRemark(true)}
                                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                                />
                                                <label className="ml-2 text-sm text-gray-700">Write custom remarks</label>
                                            </div>
                                        </div>
                                    </div>

                                    {!isCustomRemark ? (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Approval Remarks
                                            </label>
                                            <select
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="">Select remarks...</option>
                                                {predefinedApprovalRemarks.map((remark, index) => (
                                                    <option key={index} value={remark}>{remark}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Custom Remarks
                                            </label>
                                            <textarea
                                                value={customRemarks}
                                                onChange={(e) => setCustomRemarks(e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="Enter your remarks..."
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => setShowViewer(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleRejectDocument(selectedDocument._id)}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleApproveDocument(selectedDocument._id)}
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentVerificationInterface;
