import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const DocumentUpload = ({ onUploadSuccess, existingDocuments = [] }) => {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [documents, setDocuments] = useState(existingDocuments);

    const documentTypes = [
        '10th Mark Sheet',
        '12th Mark Sheet',
        '+2 Marksheet',
        '+2 Certificate',
        'Graduation Marksheet',
        'Graduation Certificate',
        'Aadhaar Card',
        'Passport Size Photo',
        'Signature',
        'Transfer Certificate',
        'Character Certificate',
        'Income Certificate',
        'Caste Certificate',
        'Other'
    ];

    const handleFileUpload = async (file, documentType) => {
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', documentType);

            const response = await api.post('/api/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                const newDocument = {
                    ...response.data.data,
                    documentType,
                    uploadedAt: new Date()
                };

                setDocuments(prev => [...prev, newDocument]);
                onUploadSuccess?.(newDocument);
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Error uploading document. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            const file = files[0];
            const documentType = prompt('Please select document type:', documentTypes[0]);
            if (documentType && documentTypes.includes(documentType)) {
                handleFileUpload(file, documentType);
            }
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) {
            const documentType = prompt('Please select document type:', documentTypes[0]);
            if (documentType && documentTypes.includes(documentType)) {
                handleFileUpload(file, documentType);
            }
        }
    };

    const removeDocument = (index) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    onChange={handleFileInput}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                />

                <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>

                    <div>
                        <p className="text-lg font-medium text-gray-900">
                            {uploading ? 'Uploading...' : 'Upload Documents'}
                        </p>
                        <p className="text-sm text-gray-500">
                            Drag and drop files here, or click to select files
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                        </p>
                    </div>
                </div>
            </div>

            {/* Document List */}
            {documents.length > 0 && (
                <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Uploaded Documents</h4>
                    <div className="space-y-3">
                        {documents.map((doc, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                                        <p className="text-xs text-gray-500">
                                            {doc.documentType} • {formatFileSize(doc.fileSize)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${doc.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                        doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {doc.status || 'PENDING'}
                                    </span>

                                    <button
                                        onClick={() => removeDocument(index)}
                                        className="p-1 text-red-600 hover:text-red-800"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Progress */}
            {uploading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-blue-800">Uploading document...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentUpload;