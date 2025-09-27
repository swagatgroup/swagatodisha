import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CloudArrowUpIcon,
    DocumentIcon,
    XMarkIcon,
    PlusIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { showSuccess, showError } from '../../utils/sweetAlert';

const EnhancedDocumentUpload = ({
    documents = {},
    onDocumentsChange,
    applicationId = null,
    disabled = false
}) => {
    const [documentRequirements, setDocumentRequirements] = useState(null);
    const [uploading, setUploading] = useState({});
    const [uploadProgress, setUploadProgress] = useState({});
    const [customDocuments, setCustomDocuments] = useState([]);
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customFormData, setCustomFormData] = useState({ label: '', file: null });
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

    const handleFileUpload = async (file, documentType, isCustom = false, customLabel = '') => {
        if (!file) return;

        // Validate file
        const validation = validateFile(file, documentType, isCustom);
        if (!validation.valid) {
            showError(validation.message);
            return;
        }

        setUploading(prev => ({ ...prev, [documentType]: true }));
        setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));

        try {
            const formData = new FormData();
            formData.append('files', file);
            formData.append('documentType', documentType);
            if (isCustom) {
                formData.append('customLabel', customLabel);
                formData.append('isCustom', 'true');
            }

            const response = await api.post('/api/files/upload-multiple', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 30000, // 30 second timeout
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(prev => ({ ...prev, [documentType]: percentCompleted }));
                }
            });

            if (response.data?.success) {
                const uploaded = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;

                const fileObject = {
                    documentType,
                    name: uploaded?.originalName || file.name,
                    fileName: uploaded?.originalName || file.name,
                    size: uploaded?.fileSize || file.size,
                    fileSize: uploaded?.fileSize || file.size,
                    type: uploaded?.mimeType || file.type,
                    mimeType: uploaded?.mimeType || file.type,
                    uploadedAt: new Date().toISOString(),
                    status: 'uploaded',
                    downloadUrl: uploaded?.downloadUrl || uploaded?.filePath,
                    url: uploaded?.downloadUrl || uploaded?.filePath,
                    filePath: uploaded?.downloadUrl || uploaded?.filePath,
                    cloudinaryPublicId: uploaded?.cloudinaryPublicId,
                    public_id: uploaded?.cloudinaryPublicId,
                    isCustom: isCustom,
                    customLabel: customLabel || documentType
                };

                const newDocuments = {
                    ...documents,
                    [documentType]: fileObject
                };

                onDocumentsChange(newDocuments);
                showSuccess(`${isCustom ? customLabel : documentType} uploaded successfully!`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            showError(`Upload failed: ${error.response?.data?.message || 'Please try again'}`);
        } finally {
            setUploading(prev => ({ ...prev, [documentType]: false }));
            setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
        }
    };

    const validateFile = (file, documentType, isCustom) => {
        if (!documentRequirements) return { valid: true };

        const req = isCustom
            ? documentRequirements.requirements.custom
            : [...documentRequirements.requirements.required, ...documentRequirements.requirements.optional]
                .find(r => r.key === documentType);

        if (!req) return { valid: true };

        // Check file size
        if (file.size > req.maxSize) {
            return {
                valid: false,
                message: `File size must be less than ${Math.round(req.maxSize / (1024 * 1024))}MB`
            };
        }

        // Check file format
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!req.allowedFormats.includes(fileExtension)) {
            return {
                valid: false,
                message: `Invalid file format. Allowed: ${req.allowedFormats.join(', ')}`
            };
        }

        return { valid: true };
    };

    const handleFileRemove = (documentType) => {
        const newDocuments = { ...documents };
        delete newDocuments[documentType];
        onDocumentsChange(newDocuments);
    };

    const handleCustomDocumentAdd = () => {
        if (!customFormData.label.trim() || !customFormData.file) {
            showError('Please provide both label and file for custom document');
            return;
        }

        const customKey = `custom_${Date.now()}`;
        handleFileUpload(customFormData.file, customKey, true, customFormData.label);

        setCustomDocuments(prev => [...prev, { key: customKey, label: customFormData.label }]);
        setCustomFormData({ label: '', file: null });
        setShowCustomForm(false);
    };

    const getDocumentStatus = (documentType) => {
        const doc = documents[documentType];
        if (!doc) return 'missing';
        if (uploading[documentType]) return 'uploading';
        return 'uploaded';
    };

    const getDocumentInfo = (documentType) => {
        if (!documentRequirements) return null;

        return [...documentRequirements.requirements.required, ...documentRequirements.requirements.optional]
            .find(r => r.key === documentType);
    };

    const renderDocumentCard = (docType, isRequired = true) => {
        const docInfo = getDocumentInfo(docType);
        const status = getDocumentStatus(docType);
        const doc = documents[docType];
        const isUploading = uploading[docType];
        const progress = uploadProgress[docType] || 0;

        if (!docInfo) return null;

        return (
            <motion.div
                key={docType}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-lg p-4 ${isRequired ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'
                    } ${disabled ? 'opacity-50' : ''}`}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                            <DocumentIcon className="h-5 w-5 text-gray-600" />
                            <h3 className="font-medium text-gray-900">
                                {docInfo.label}
                                {isRequired && <span className="text-red-500 ml-1">*</span>}
                            </h3>
                            {status === 'uploaded' && (
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{docInfo.description}</p>

                        {docInfo.validation?.note && (
                            <div className="flex items-center space-x-1 mb-2">
                                <InformationCircleIcon className="h-4 w-4 text-blue-500" />
                                <p className="text-xs text-blue-600">{docInfo.validation.note}</p>
                            </div>
                        )}

                        <div className="text-xs text-gray-500 mb-2">
                            Allowed formats: {docInfo.allowedFormats.join(', ')} •
                            Max size: {Math.round(docInfo.maxSize / (1024 * 1024))}MB
                        </div>

                        {doc && (
                            <div className="mt-2 p-2 bg-white rounded border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {(doc.size / 1024).toFixed(1)} KB • {doc.type}
                                        </p>
                                    </div>
                                    {!disabled && (
                                        <button
                                            onClick={() => handleFileRemove(docType)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {isUploading && (
                            <div className="mt-2">
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-600">{progress}%</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {!disabled && (
                        <div className="ml-4">
                            {status === 'uploaded' ? (
                                <button
                                    onClick={() => handleFileRemove(docType)}
                                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded"
                                >
                                    Remove
                                </button>
                            ) : (
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        accept={docInfo.allowedFormats.map(f => `.${f}`).join(',')}
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) handleFileUpload(file, docType);
                                        }}
                                        className="hidden"
                                        disabled={isUploading}
                                    />
                                    <div className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded cursor-pointer">
                                        {isUploading ? 'Uploading...' : 'Upload'}
                                    </div>
                                </label>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    const renderCustomDocumentForm = () => (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-purple-200 bg-purple-50 rounded-lg p-4"
        >
            <h4 className="font-medium text-gray-900 mb-3">Add Custom Document</h4>
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Document Label
                    </label>
                    <input
                        type="text"
                        value={customFormData.label}
                        onChange={(e) => setCustomFormData(prev => ({ ...prev, label: e.target.value }))}
                        placeholder="e.g., Medical Certificate, Character Certificate"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        maxLength={50}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        File
                    </label>
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => setCustomFormData(prev => ({ ...prev, file: e.target.files[0] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={handleCustomDocumentAdd}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                        Add Document
                    </button>
                    <button
                        onClick={() => setShowCustomForm(false)}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!documentRequirements) {
        return (
            <div className="text-center p-8 text-gray-500">
                Failed to load document requirements
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Required Documents */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Required Documents
                </h3>
                <div className="space-y-4">
                    {documentRequirements.requirements.required.map(docType =>
                        renderDocumentCard(docType.key, true)
                    )}
                </div>
            </div>

            {/* Optional Documents */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Optional Documents
                </h3>
                <div className="space-y-4">
                    {documentRequirements.requirements.optional.map(docType =>
                        renderDocumentCard(docType.key, false)
                    )}
                </div>
            </div>

            {/* Custom Documents */}
            {documentRequirements.requirements.custom.enabled && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Custom Documents
                        </h3>
                        {!disabled && (
                            <button
                                onClick={() => setShowCustomForm(!showCustomForm)}
                                className="flex items-center space-x-1 px-3 py-1 text-sm text-purple-600 hover:text-purple-800 border border-purple-300 rounded"
                            >
                                <PlusIcon className="h-4 w-4" />
                                <span>Add Custom</span>
                            </button>
                        )}
                    </div>

                    <AnimatePresence>
                        {showCustomForm && renderCustomDocumentForm()}
                    </AnimatePresence>

                    {/* Display uploaded custom documents */}
                    {Object.entries(documents)
                        .filter(([key, doc]) => doc.isCustom)
                        .map(([key, doc]) => (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="border border-purple-200 bg-purple-50 rounded-lg p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{doc.customLabel}</h4>
                                        <p className="text-sm text-gray-600">{doc.name}</p>
                                    </div>
                                    {!disabled && (
                                        <button
                                            onClick={() => handleFileRemove(key)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                </div>
            )}

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                    <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• All required documents must be uploaded before submission</li>
                            <li>• Caste certificate should not be older than 5 years</li>
                            <li>• Income certificate should not be older than 1 year</li>
                            <li>• For OBC students, PM Kisan or CM Kisan enrollment certificates are required for free education</li>
                            <li>• 10th marksheet and certificate can be uploaded as a single combined document</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedDocumentUpload;