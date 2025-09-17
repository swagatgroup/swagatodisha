import {useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';

const DocumentVerification = ({ onStudentUpdate }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showViewer, setShowViewer] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const documentCategories = [
        { id: 'educational', name: 'Educational Certificates', color: 'blue' },
        { id: 'identity', name: 'Identity Proofs', color: 'green' },
        { id: 'income', name: 'Income Certificates', color: 'yellow' },
        { id: 'category', name: 'Category Certificates', color: 'purple' },
        { id: 'medical', name: 'Medical Certificates', color: 'red' },
        { id: 'other', name: 'Other Documents', color: 'gray' }
    ];

    const rejectionReasons = [
        'Document not clear/readable',
        'Document expired',
        'Wrong document type',
        'Document damaged',
        'Incomplete information',
        'Invalid format',
        'Other (specify in remarks)'
    ];

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/staff/documents/pending');
            if (response.data.success) {
                setDocuments(response.data.data);
            }
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (documentId, studentId) => {
        try {
            const response = await api.put(`/api/staff/documents/${documentId}/approve`, {
                remarks: 'Document approved by staff'
            });

            if (response.data.success) {
                setDocuments(prev => prev.filter(doc => doc._id !== documentId));
                onStudentUpdate();
                alert('Document approved successfully!');
            }
        } catch (error) {
            console.error('Error approving document:', error);
            alert('Error approving document. Please try again.');
        }
    };

    const handleReject = async (documentId, studentId, reason, customRemarks) => {
        try {
            const response = await api.put(`/api/staff/documents/${documentId}/reject`, {
                reason,
                remarks: customRemarks || reason
            });

            if (response.data.success) {
                setDocuments(prev => prev.filter(doc => doc._id !== documentId));
                onStudentUpdate();
                alert('Document rejected successfully!');
            }
        } catch (error) {
            console.error('Error rejecting document:', error);
            alert('Error rejecting document. Please try again.');
        }
    };

    const handleBulkAction = async (action, documentIds) => {
        try {
            const response = await api.post('/api/staff/documents/bulk-action', {
                action,
                documentIds,
                remarks: `Bulk ${action} by staff`
            });

            if (response.data.success) {
                setDocuments(prev => prev.filter(doc => !documentIds.includes(doc._id)));
                onStudentUpdate();
                alert(`Bulk ${action} completed successfully!`);
            }
        } catch (error) {
            console.error('Error performing bulk action:', error);
            alert('Error performing bulk action. Please try again.');
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesFilter = filter === 'all' || doc.category === filter;
        const matchesSearch =
            doc.student?.personalDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.student?.studentId?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const getCategoryColor = (category) => {
        const cat = documentCategories.find(c => c.id === category);
        return cat ? cat.color : 'gray';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'under_review':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Filters */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <h3 className="text-lg font-semibold text-gray-900">Document Verification</h3>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Search by student name, type, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />

                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Categories</option>
                            {documentCategories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Document List */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium text-gray-900">
                            Pending Documents ({filteredDocuments.length})
                        </h4>
                        {filteredDocuments.length > 0 && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        const selectedIds = filteredDocuments.map(doc => doc._id);
                                        handleBulkAction('approve', selectedIds);
                                    }}
                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                >
                                    Approve All
                                </button>
                                <button
                                    onClick={() => {
                                        const selectedIds = filteredDocuments.map(doc => doc._id);
                                        handleBulkAction('reject', selectedIds);
                                    }}
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                >
                                    Reject All
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    {filteredDocuments.length === 0 ? (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents pending verification</h3>
                            <p className="mt-1 text-sm text-gray-500">All documents have been processed.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredDocuments.map((document, index) => (
                                <motion.div
                                    key={document._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-3 h-3 rounded-full bg-${getCategoryColor(document.category)}-500`}></div>
                                            <div>
                                                <h5 className="font-medium text-gray-900">{document.type}</h5>
                                                <p className="text-sm text-gray-500">
                                                    {document.student?.personalDetails?.fullName} • {document.student?.studentId}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                                                {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                                            </span>

                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedDocument(document);
                                                        setShowViewer(true);
                                                    }}
                                                    className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    View
                                                </button>

                                                <button
                                                    onClick={() => handleApprove(document._id, document.student?._id)}
                                                    className="px-3 py-1 text-green-600 hover:text-green-800 text-sm font-medium"
                                                >
                                                    Approve
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        const reason = prompt('Rejection reason:', rejectionReasons[0]);
                                                        if (reason) {
                                                            const customRemarks = prompt('Additional remarks (optional):');
                                                            handleReject(document._id, document.student?._id, reason, customRemarks);
                                                        }
                                                    }}
                                                    className="px-3 py-1 text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Document Viewer Modal */}
            {showViewer && selectedDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full mx-4">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {selectedDocument.type} - {selectedDocument.student?.personalDetails?.fullName}
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

                        <div className="p-6">
                            <div className="bg-gray-100 rounded-lg p-8 text-center">
                                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="mt-2 text-gray-600">Document preview would be displayed here</p>
                                <p className="text-sm text-gray-500">File: {selectedDocument.fileName}</p>
                            </div>

                            <div className="mt-6 flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowViewer(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        handleApprove(selectedDocument._id, selectedDocument.student?._id);
                                        setShowViewer(false);
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => {
                                        const reason = prompt('Rejection reason:', rejectionReasons[0]);
                                        if (reason) {
                                            const customRemarks = prompt('Additional remarks (optional):');
                                            handleReject(selectedDocument._id, selectedDocument.student?._id, reason, customRemarks);
                                            setShowViewer(false);
                                        }
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentVerification;
