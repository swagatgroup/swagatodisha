import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CloudArrowUpIcon,
    DocumentIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { showSuccess, showError } from '../../utils/sweetAlert';

const BatchDocumentUpload = ({
    documents = {},
    onDocumentsChange,
    applicationId = null,
    disabled = false
}) => {
    const [documentRequirements, setDocumentRequirements] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadQueue, setUploadQueue] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocumentRequirements();
    }, []);

    const fetchDocumentRequirements = async () => {
        try {
            const response = await api.get('/api/student-application/document-requirements');
            if (response.data?.success) {
                setDocumentRequirements(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching document requirements:', error);
            showError('Failed to load document requirements');
        } finally {
            setLoading(false);
        }
    };

    const handleBatchUpload = async (files) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        setUploadProgress(0);
        setUploadQueue(files);

        try {
            const formData = new FormData();

            // Add all files to form data
            Array.from(files).forEach((file, index) => {
                formData.append('files', file);
                formData.append(`documentTypes`, file.documentType || 'general');
            });

            const response = await api.post('/api/files/upload-multiple', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 60000, // 60 second timeout for batch upload
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            if (response.data?.success) {
                const uploadedFiles = response.data.data;
                const newDocuments = { ...documents };

                // Process each uploaded file
                uploadedFiles.forEach((uploaded, index) => {
                    const file = files[index];
                    const documentType = file.documentType || 'general';

                    const fileObject = {
                        documentType,
                        name: uploaded?.originalName || file.name,
                        fileName: uploaded?.originalName || file.name,
                        size: uploaded?.fileSize || file.size,
                        fileSize: uploaded?.fileSize || file.size,
                        type: uploaded?.mimeType || file.type,
                        mimeType: uploaded?.mimeType || file.type,
                        uploadedAt: new Date().toISOString(),
                        status: 'PENDING', // Valid enum: PENDING, APPROVED, REJECTED
                        downloadUrl: uploaded?.downloadUrl || uploaded?.filePath,
                        url: uploaded?.downloadUrl || uploaded?.filePath,
                        filePath: uploaded?.downloadUrl || uploaded?.filePath,
                        cloudinaryPublicId: uploaded?.cloudinaryPublicId,
                        public_id: uploaded?.cloudinaryPublicId,
                    };

                    newDocuments[documentType] = fileObject;
                });

                onDocumentsChange(newDocuments);
                showSuccess(`${uploadedFiles.length} documents uploaded successfully!`);
            }
        } catch (error) {
            console.error('Batch upload error:', error);
            showError(`Batch upload failed: ${error.response?.data?.message || 'Please try again'}`);
        } finally {
            setUploading(false);
            setUploadProgress(0);
            setUploadQueue([]);
        }
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        // Validate files
        const validFiles = files.filter(file => {
            const fileSizeMB = file.size / (1024 * 1024);
            const fileExtension = file.name.split('.').pop()?.toLowerCase();

            // Basic validation
            if (fileSizeMB > 10) {
                showError(`File ${file.name} is too large. Maximum size is 10MB.`);
                return false;
            }

            const allowedFormats = ['jpg', 'jpeg', 'png', 'pdf'];
            if (!allowedFormats.includes(fileExtension)) {
                showError(`File ${file.name} has invalid format. Allowed: ${allowedFormats.join(', ')}`);
                return false;
            }

            return true;
        });

        if (validFiles.length > 0) {
            handleBatchUpload(validFiles);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Batch Document Upload
                </h3>
                <p className="text-gray-600 text-sm">
                    Upload multiple documents at once for faster processing
                </p>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileSelect}
                    disabled={disabled || uploading}
                    className="hidden"
                    id="batch-upload"
                />

                <label
                    htmlFor="batch-upload"
                    className={`cursor-pointer block ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <div className="flex flex-col items-center">
                        {uploading ? (
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        ) : (
                            <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mb-4" />
                        )}

                        <p className="text-lg font-medium text-gray-900 mb-2">
                            {uploading ? 'Uploading...' : 'Click to select multiple files'}
                        </p>

                        <p className="text-sm text-gray-500 mb-4">
                            Select multiple documents (JPG, PNG, PDF) up to 10MB each
                        </p>

                        {uploading && (
                            <div className="w-full max-w-xs">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Progress</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </label>
            </div>

            {/* Upload Queue */}
            {uploadQueue.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Uploading Files:</h4>
                    {uploadQueue.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                            <DocumentIcon className="h-4 w-4" />
                            <span>{file.name}</span>
                            <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Uploaded Documents Summary */}
            {Object.keys(documents).length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Uploaded Documents:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(documents).map(([docType, doc]) => (
                            <div key={docType} className="flex items-center space-x-2 p-2 bg-green-50 rounded border">
                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-gray-700">{doc.name}</span>
                                <span className="text-xs text-gray-500">({(doc.size / 1024).toFixed(1)} KB)</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Performance Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Performance Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Upload multiple files at once for faster processing</li>
                    <li>• Use compressed images when possible</li>
                    <li>• PDF files are processed faster than large images</li>
                    <li>• Ensure stable internet connection for best results</li>
                </ul>
            </div>
        </div>
    );
};

export default BatchDocumentUpload;
