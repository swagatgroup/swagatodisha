import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useSocket } from '../../contexts/SocketContext';

const DocumentReview = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const { socket, connected } = useSocket();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({
        action: '',
        remarks: ''
    });
    const [reviewing, setReviewing] = useState(false);

    const documentTypes = [
        { value: 'aadhar_card', label: 'Aadhar Card' },
        { value: 'birth_certificate', label: 'Birth Certificate' },
        { value: 'marksheet_10th', label: '10th Marksheet' },
        { value: 'marksheet_12th', label: '12th Marksheet' },
        { value: 'transfer_certificate', label: 'Transfer Certificate' },
        { value: 'migration_certificate', label: 'Migration Certificate' },
        { value: 'character_certificate', label: 'Character Certificate' },
        { value: 'passport_photo', label: 'Passport Photo' },
        { value: 'guardian_id', label: 'Guardian ID Proof' },
        { value: 'income_certificate', label: 'Income Certificate' },
        { value: 'caste_certificate', label: 'Caste Certificate' },
        { value: 'medical_certificate', label: 'Medical Certificate' }
    ];

    useEffect(() => {
        fetchDocuments();
    }, [filter, currentPage]);

    // Real-time document updates
    useEffect(() => {
        if (socket && connected) {
            const handleNewDocumentUpload = (data) => {
                // New document uploaded
                // Refresh documents list to show new upload
                fetchDocuments();
            };

            const handleDocumentReviewed = (data) => {
                // Document reviewed
                // Update the specific document in the list
                setDocuments(prevDocs =>
                    prevDocs.map(doc =>
                        doc._id === data.documentId
                            ? {
                                ...doc,
                                status: data.status,
                                staffRemarks: data.remarks,
                                reviewedAt: data.timestamp
                            }
                            : doc
                    )
                );
            };

            socket.on('new_document_uploaded', handleNewDocumentUpload);
            socket.on('document_reviewed', handleDocumentReviewed);

            return () => {
                socket.off('new_document_uploaded', handleNewDocumentUpload);
                socket.off('document_reviewed', handleDocumentReviewed);
            };
        }
    }, [socket, connected]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/documents/review?status=${filter}&page=${currentPage}&limit=10`);
            setDocuments(response.data.data.documents);
            setTotalPages(response.data.data.pagination.pages);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = (document) => {
        setSelectedDocument(document);
        setReviewData({ action: '', remarks: '' });
        setShowReviewModal(true);
    };

    const handleReviewSubmit = async () => {
        if (!reviewData.action) {
            alert('Please select an action.');
            return;
        }

        if ((reviewData.action === 'reject' || reviewData.action === 'request_revision') && !reviewData.remarks.trim()) {
            alert('Please provide remarks for rejection or revision request.');
            return;
        }

        try {
            setReviewing(true);
            await api.put(`/api/documents/${selectedDocument.id}/review`, reviewData);

            setShowReviewModal(false);
            setSelectedDocument(null);
            setReviewData({ action: '', remarks: '' });

            // Refresh documents list
            await fetchDocuments();

            alert(`Document ${reviewData.action}d successfully!`);
        } catch (error) {
            console.error('Review error:', error);
            alert('Error reviewing document. Please try again.');
        } finally {
            setReviewing(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'under_review': return 'bg-blue-100 text-blue-800';
            case 'needs_revision': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return '✓';
            case 'rejected': return '✗';
            case 'pending': return '⏳';
            case 'under_review': return '👁';
            case 'needs_revision': return '🔄';
            default: return '?';
        }
    };

    const getDocumentTypeLabel = (type) => {
        const docType = documentTypes.find(dt => dt.value === type);
        return docType ? docType.label : type;
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'approve': return 'bg-green-600 hover:bg-green-700';
            case 'reject': return 'bg-red-600 hover:bg-red-700';
            case 'request_revision': return 'bg-orange-600 hover:bg-orange-700';
            default: return 'bg-gray-600 hover:bg-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Document Review</h3>
                <div className="flex space-x-2">
                    <select
                        value={filter}
                        onChange={(e) => {
                            setFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="pending">Pending Review</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="needs_revision">Needs Revision</option>
                        <option value="all">All Documents</option>
                    </select>
                </div>
            </div>

            {/* Documents List */}
            {documents.length === 0 ? (
                <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                    <p className="text-gray-500">No documents match the current filter criteria.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {documents.map((document) => (
                        <motion.div
                            key={document.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <h4 className="text-lg font-medium text-gray-900">
                                            {getDocumentTypeLabel(document.documentType)}
                                        </h4>
                                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                                            {getStatusIcon(document.status)} {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                                        </span>
                                    </div>

                                    <div className="mb-2">
                                        <p className="text-sm text-gray-600">
                                            <strong>Student:</strong> {document.student.name} ({document.student.email})
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Document:</strong> {document.documentName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                                            {document.reviewedAt && (
                                                <span className="ml-4">
                                                    Reviewed: {new Date(document.reviewedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {document.staffRemarks && (
                                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                                            <strong>Staff Remarks:</strong> {document.staffRemarks}
                                        </div>
                                    )}

                                    {document.rejectionReason && (
                                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800">
                                            <strong>Rejection Reason:</strong> {document.rejectionReason}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => window.open(`/api/documents/${document.id}/download`, '_blank')}
                                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        View
                                    </button>

                                    {document.status === 'pending' && (
                                        <button
                                            onClick={() => handleReview(document)}
                                            className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                        >
                                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Review
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <nav className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 border rounded-md text-sm font-medium ${page === currentPage
                                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && selectedDocument && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Review Document: {getDocumentTypeLabel(selectedDocument.documentType)}
                            </h3>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600">
                                    <strong>Student:</strong> {selectedDocument.student.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Document:</strong> {selectedDocument.documentName}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Action *
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="action"
                                                value="approve"
                                                checked={reviewData.action === 'approve'}
                                                onChange={(e) => setReviewData(prev => ({ ...prev, action: e.target.value }))}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-green-700">✓ Approve</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="action"
                                                value="reject"
                                                checked={reviewData.action === 'reject'}
                                                onChange={(e) => setReviewData(prev => ({ ...prev, action: e.target.value }))}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-red-700">✗ Reject</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="action"
                                                value="request_revision"
                                                checked={reviewData.action === 'request_revision'}
                                                onChange={(e) => setReviewData(prev => ({ ...prev, action: e.target.value }))}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-orange-700">🔄 Request Revision</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Remarks
                                        {(reviewData.action === 'reject' || reviewData.action === 'request_revision') && (
                                            <span className="text-red-500"> *</span>
                                        )}
                                    </label>
                                    <textarea
                                        value={reviewData.remarks}
                                        onChange={(e) => setReviewData(prev => ({ ...prev, remarks: e.target.value }))}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your remarks..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReviewSubmit}
                                    disabled={reviewing || !reviewData.action}
                                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${getActionColor(reviewData.action)} disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {reviewing ? 'Processing...' : `${reviewData.action.charAt(0).toUpperCase() + reviewData.action.slice(1)} Document`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentReview;
