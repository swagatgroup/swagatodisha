import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert';

const EnhancedDocumentManagement = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filter, setFilter] = useState('all');

    const documentCategories = [
        'Academic Certificates',
        'Identity Proof (Aadhar Card)',
        'Address Proof',
        'Income Certificate',
        'Caste Certificate',
        'Medical Certificate',
        'Transfer Certificate',
        'Character Certificate',
        'Passport Size Photos',
        'Bank Details',
        'Guardian Documents',
        'Other Certificates'
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
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/documents/my-documents');
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

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                showError('Invalid File Type', 'Please upload PDF, JPEG, PNG, or WebP files only');
                return;
            }

            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                showError('File Too Large', 'File size must be less than 10MB');
                return;
            }

            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !selectedCategory) {
            showError('Missing Information', 'Please select a file and category');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('category', selectedCategory);
            formData.append('submissionStage', 'DRAFT');

            const response = await api.post('/api/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                showSuccess('Upload Successful', 'Document uploaded successfully');
                setSelectedFile(null);
                setSelectedCategory('');
                document.getElementById('file-input').value = '';
                fetchDocuments();
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            showError('Upload Failed', 'Failed to upload document. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmitDocument = async (documentId) => {
        const confirmed = await showConfirm(
            'Submit Document',
            'Are you sure you want to submit this document for review? You cannot edit it after submission.',
            'Yes, Submit',
            'Cancel'
        );

        if (confirmed) {
            try {
                const response = await api.put(`/api/documents/${documentId}/submit`);
                if (response.data.success) {
                    showSuccess('Document Submitted', 'Document submitted for review');
                    fetchDocuments();
                }
            } catch (error) {
                console.error('Error submitting document:', error);
                showError('Submission Failed', 'Failed to submit document');
            }
        }
    };

    const handleDeleteDocument = async (documentId) => {
        const confirmed = await showConfirm(
            'Delete Document',
            'Are you sure you want to delete this document? This action cannot be undone.',
            'Yes, Delete',
            'Cancel'
        );

        if (confirmed) {
            try {
                const response = await api.delete(`/api/documents/${documentId}`);
                if (response.data.success) {
                    showSuccess('Document Deleted', 'Document deleted successfully');
                    fetchDocuments();
                }
            } catch (error) {
                console.error('Error deleting document:', error);
                showError('Deletion Failed', 'Failed to delete document');
            }
        }
    };

    const filteredDocuments = documents.filter(doc => {
        if (filter === 'all') return true;
        return doc.status === filter;
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Document Management</h2>
                <p className="text-gray-600">
                    Upload and manage your documents. Make sure all required documents are uploaded and submitted for review.
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

            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Document</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Document Category *
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">Select Category</option>
                            {documentCategories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select File *
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-purple-400 transition-colors">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-input" className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                                        <span>Upload a file</span>
                                        <input
                                            id="file-input"
                                            name="file-input"
                                            type="file"
                                            className="sr-only"
                                            onChange={handleFileSelect}
                                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                                        />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PDF, PNG, JPG, WebP up to 10MB</p>
                            </div>
                        </div>
                        {selectedFile && (
                            <div className="mt-2 text-sm text-gray-600">
                                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile || !selectedCategory || uploading}
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Uploading...' : 'Upload Document'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter and Documents List */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">My Documents</h3>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Documents</option>
                            <option value="PENDING">Pending</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="p-6">
                    {filteredDocuments.length === 0 ? (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {filter === 'all' ? 'Get started by uploading your first document.' : `No documents with status "${filter.toLowerCase()}".`}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredDocuments.map((document) => (
                                <motion.div
                                    key={document._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <div className="flex items-center space-x-4">
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
                                                Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                                            </p>
                                            {document.status === 'REJECTED' && document.remarks && (
                                                <div className="mt-2 p-2 rounded bg-red-50 text-red-800 text-sm">
                                                    <span className="font-medium">Remarks: </span>{document.remarks}
                                                </div>
                                            )}
                                            {document.status === 'UNDER_REVIEW' && document.reviewer && (
                                                <p className="text-xs text-blue-700 mt-1">Reviewer: {document.reviewer}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[document.status]}`}>
                                            {statusLabels[document.status]}
                                        </span>

                                        <div className="flex space-x-2">
                                            {document.status === 'PENDING' && document.submissionStage === 'DRAFT' && (
                                                <button
                                                    onClick={() => handleSubmitDocument(document._id)}
                                                    className="text-green-600 hover:text-green-900 text-sm font-medium"
                                                >
                                                    Submit
                                                </button>
                                            )}

                                            {document.status === 'REJECTED' && (
                                                <button
                                                    onClick={() => handleSubmitDocument(document._id)}
                                                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                                >
                                                    Resubmit
                                                </button>
                                            )}

                                            <a
                                                href={document.url || document.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                                            >
                                                View
                                            </a>
                                            <button
                                                onClick={() => handleDeleteDocument(document._id)}
                                                className="text-red-600 hover:text-red-900 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EnhancedDocumentManagement;
