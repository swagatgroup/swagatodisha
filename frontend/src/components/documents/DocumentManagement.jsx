import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useSocket } from '../../contexts/SocketContext';
import {
    showSuccess,
    showError,
    showConfirm,
    showDeleteConfirm,
    showFileUploadError,
    showLoading,
    closeLoading,
    handleApiError,
    showSuccessToast,
    showErrorToast
} from '../../utils/sweetAlert';

const DocumentManagement = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadData, setUploadData] = useState({
        documentType: '',
        documentName: ''
    });
    const { socket, connected } = useSocket();

    const documentTypes = [
        { value: 'aadhar_card', label: 'Aadhar Card', required: true },
        { value: 'birth_certificate', label: 'Birth Certificate', required: true },
        { value: 'marksheet_10th', label: '10th Marksheet', required: true },
        { value: 'marksheet_12th', label: '12th Marksheet', required: true },
        { value: 'transfer_certificate', label: 'Transfer Certificate', required: true },
        { value: 'migration_certificate', label: 'Migration Certificate', required: false },
        { value: 'character_certificate', label: 'Character Certificate', required: false },
        { value: 'passport_photo', label: 'Passport Photo', required: true },
        { value: 'guardian_id', label: 'Guardian ID Proof', required: true },
        { value: 'income_certificate', label: 'Income Certificate', required: false },
        { value: 'caste_certificate', label: 'Caste Certificate', required: false },
        { value: 'medical_certificate', label: 'Medical Certificate', required: false }
    ];

    useEffect(() => {
        fetchDocuments();
    }, []);

    // Real-time document status updates
    useEffect(() => {
        if (socket && connected) {
            const handleDocumentStatusChange = (data) => {
                // Document status changed
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

            socket.on('document_status_changed', handleDocumentStatusChange);

            return () => {
                socket.off('document_status_changed', handleDocumentStatusChange);
            };
        }
    }, [socket, connected]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/documents/student');
            setDocuments(response.data.data.documents);
        } catch (error) {
            console.error('Error fetching documents:', error);
            await handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                showFileUploadError('Invalid file type. Please select a PDF, JPEG, PNG, or WebP file.');
                return;
            }

            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                showFileUploadError('File size must be less than 10MB.');
                return;
            }

            setSelectedFile(file);
            setUploadData(prev => ({
                ...prev,
                documentName: file.name
            }));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !uploadData.documentType || !uploadData.documentName) {
            await showError('Validation Error', 'Please fill in all required fields.');
            return;
        }

        try {
            setUploading(true);
            showLoading('Uploading Document...', 'Please wait while we upload your document');

            const formData = new FormData();
            formData.append('document', selectedFile);
            formData.append('documentType', uploadData.documentType);
            formData.append('documentName', uploadData.documentName);

            await api.post('/api/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            closeLoading();

            // Reset form and close modal
            setSelectedFile(null);
            setUploadData({ documentType: '', documentName: '' });
            setShowUploadModal(false);

            // Refresh documents list
            await fetchDocuments();

            await showSuccess('Document Uploaded!', 'Your document has been uploaded successfully and is now under review.');
        } catch (error) {
            console.error('Upload error:', error);
            closeLoading();
            await handleApiError(error);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (documentId) => {
        const result = await showDeleteConfirm(
            'Delete Document',
            'Are you sure you want to delete this document? This action cannot be undone.'
        );

        if (!result.isConfirmed) {
            return;
        }

        try {
            showLoading('Deleting Document...', 'Please wait while we delete your document');

            await api.delete(`/api/documents/${documentId}`);
            await fetchDocuments();

            closeLoading();
            await showSuccess('Document Deleted!', 'Your document has been deleted successfully.');
        } catch (error) {
            console.error('Delete error:', error);
            closeLoading();
            await handleApiError(error);
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

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">My Documents</h3>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Upload Document
                </button>
            </div>

            {/* Document Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                        <div className="text-blue-600 text-2xl mr-3">📄</div>
                        <div>
                            <p className="text-sm text-blue-600">Total Documents</p>
                            <p className="text-xl font-semibold text-blue-900">{documents.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                        <div className="text-green-600 text-2xl mr-3">✓</div>
                        <div>
                            <p className="text-sm text-green-600">Approved</p>
                            <p className="text-xl font-semibold text-green-900">
                                {documents.filter(d => d.status === 'approved').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center">
                        <div className="text-yellow-600 text-2xl mr-3">⏳</div>
                        <div>
                            <p className="text-sm text-yellow-600">Pending</p>
                            <p className="text-xl font-semibold text-yellow-900">
                                {documents.filter(d => d.status === 'pending').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center">
                        <div className="text-red-600 text-2xl mr-3">✗</div>
                        <div>
                            <p className="text-sm text-red-600">Rejected</p>
                            <p className="text-xl font-semibold text-red-900">
                                {documents.filter(d => d.status === 'rejected').length}
                            </p>
                        </div>
                    </div>
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                    <p className="text-gray-500 mb-4">Upload your documents to get started with the admission process.</p>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                    >
                        Upload Your First Document
                    </button>
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
                                    <p className="text-sm text-gray-600 mb-2">{document.documentName}</p>
                                    <p className="text-xs text-gray-500">
                                        Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                                        {document.reviewedAt && (
                                            <span className="ml-4">
                                                Reviewed: {new Date(document.reviewedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </p>
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download
                                    </button>
                                    <button
                                        onClick={() => handleDelete(document.id)}
                                        className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                                    >
                                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Document Type *
                                    </label>
                                    <select
                                        value={uploadData.documentType}
                                        onChange={(e) => setUploadData(prev => ({ ...prev, documentType: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Select document type</option>
                                        {documentTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label} {type.required ? '*' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Document Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={uploadData.documentName}
                                        onChange={(e) => setUploadData(prev => ({ ...prev, documentName: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Enter document name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select File *
                                    </label>
                                    <input
                                        type="file"
                                        onChange={handleFileSelect}
                                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Supported formats: PDF, JPEG, PNG, WebP (Max 10MB)
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading || !selectedFile || !uploadData.documentType || !uploadData.documentName}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentManagement;
