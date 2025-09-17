import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon, PlusIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { showSuccess, showError } from '../../utils/sweetAlert';

const EnhancedDocumentUpload = ({
    onDocumentsChange,
    initialDocuments = {},
    isRequired = true,
    disabled = false
}) => {
    const [documentTypes, setDocumentTypes] = useState([]);
    const [categories, setCategories] = useState({});
    const [documents, setDocuments] = useState(initialDocuments);
    const [customDocuments, setCustomDocuments] = useState([]);
    const [uploading, setUploading] = useState({});
    const [loading, setLoading] = useState(true);
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customDocumentName, setCustomDocumentName] = useState('');
    const [customDocumentFile, setCustomDocumentFile] = useState(null);

    useEffect(() => {
        loadDocumentTypes();
    }, []);

    useEffect(() => {
        onDocumentsChange({ ...documents, custom: customDocuments });
    }, [documents, customDocuments, onDocumentsChange]);

    const loadDocumentTypes = async () => {
        try {
            console.log('EnhancedDocumentUpload: Loading document types...');
            const response = await api.get('/api/document-types');
            console.log('EnhancedDocumentUpload: Document types response:', response.data);

            if (response.data.success) {
                setDocumentTypes(response.data.data.documentTypes);
                setCategories(response.data.data.categories);
                console.log('EnhancedDocumentUpload: Document types loaded:', response.data.data.documentTypes);
                console.log('EnhancedDocumentUpload: Categories loaded:', response.data.data.categories);
            } else {
                console.error('EnhancedDocumentUpload: Failed to load document types:', response.data.message);
                showError('Failed to load document types');
            }
        } catch (error) {
            console.error('EnhancedDocumentUpload: Error loading document types:', error);
            showError('Failed to load document types');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (documentType, file, isCustom = false) => {
        if (!file) return;

        const docType = documentTypes.find(doc => doc.id === documentType);
        if (!docType) return;

        // Validate file
        const validation = validateFile(file, docType);
        if (!validation.valid) {
            showError(validation.error);
            return;
        }

        setUploading(prev => ({ ...prev, [documentType]: true }));

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', documentType);
            formData.append('isCustom', isCustom);
            if (isCustom) {
                formData.append('customName', customDocumentName);
            }

            const response = await api.post('/api/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                const newDocument = {
                    id: response.data.data.id,
                    fileName: response.data.data.fileName,
                    filePath: response.data.data.filePath,
                    fileSize: response.data.data.fileSize,
                    mimeType: response.data.data.mimeType,
                    uploadedAt: new Date(),
                    status: 'PENDING'
                };

                if (isCustom) {
                    setCustomDocuments(prev => [...prev, {
                        ...newDocument,
                        customName: customDocumentName,
                        documentType: 'custom'
                    }]);
                    setCustomDocumentName('');
                    setCustomDocumentFile(null);
                    setShowCustomForm(false);
                } else {
                    setDocuments(prev => ({
                        ...prev,
                        [documentType]: newDocument
                    }));
                }

                showSuccess('Document uploaded successfully!');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showError('Failed to upload document. Please try again.');
        } finally {
            setUploading(prev => ({ ...prev, [documentType]: false }));
        }
    };

    const validateFile = (file, docType) => {
        // Check file size
        const maxSize = parseInt(docType.maxSize) * 1024 * 1024; // Convert MB to bytes
        if (file.size > maxSize) {
            return { valid: false, error: `File size exceeds ${docType.maxSize} limit` };
        }

        // Check file format
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!docType.allowedFormats.includes(fileExtension)) {
            return { valid: false, error: `File format not allowed. Allowed formats: ${docType.allowedFormats.join(', ')}` };
        }

        return { valid: true };
    };

    const removeDocument = (documentType, isCustom = false) => {
        if (isCustom) {
            setCustomDocuments(prev => prev.filter(doc => doc.id !== documentType));
        } else {
            setDocuments(prev => {
                const newDocs = { ...prev };
                delete newDocs[documentType];
                return newDocs;
            });
        }
    };

    const getDocumentStatus = (documentType) => {
        const doc = documents[documentType];
        if (!doc) return 'missing';
        return doc.status || 'uploaded';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'uploaded':
            case 'APPROVED':
                return 'text-green-600 bg-green-100';
            case 'PENDING':
                return 'text-yellow-600 bg-yellow-100';
            case 'REJECTED':
                return 'text-red-600 bg-red-100';
            case 'missing':
                return 'text-gray-600 bg-gray-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'uploaded':
            case 'APPROVED':
                return <CheckCircleIcon className="w-4 h-4" />;
            case 'PENDING':
                return <ExclamationTriangleIcon className="w-4 h-4" />;
            case 'REJECTED':
                return <XMarkIcon className="w-4 h-4" />;
            case 'missing':
                return <DocumentIcon className="w-4 h-4" />;
            default:
                return <DocumentIcon className="w-4 h-4" />;
        }
    };

    const groupedDocuments = documentTypes.reduce((acc, doc) => {
        if (!acc[doc.category]) {
            acc[doc.category] = [];
        }
        acc[doc.category].push(doc);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2">Loading document types...</span>
            </div>
        );
    }

    console.log('EnhancedDocumentUpload: Rendering with documentTypes:', documentTypes);
    console.log('EnhancedDocumentUpload: Categories:', categories);

    return (
        <div className="space-y-6">
            {/* Document Categories */}
            {Object.entries(groupedDocuments).map(([categoryId, docs]) => (
                <motion.div
                    key={categoryId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center mb-4">
                        <div className={`w-3 h-3 rounded-full bg-${categories[categoryId]?.color || 'blue'}-500 mr-3`}></div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {categories[categoryId]?.name || categoryId}
                        </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {categories[categoryId]?.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {docs.map((docType) => (
                            <DocumentUploadCard
                                key={docType.id}
                                docType={docType}
                                document={documents[docType.id]}
                                status={getDocumentStatus(docType.id)}
                                onUpload={(file) => handleFileUpload(docType.id, file)}
                                onRemove={() => removeDocument(docType.id)}
                                uploading={uploading[docType.id]}
                                disabled={disabled}
                                getStatusColor={getStatusColor}
                                getStatusIcon={getStatusIcon}
                            />
                        ))}
                    </div>
                </motion.div>
            ))}

            {/* Custom Documents */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Additional Documents
                    </h3>
                    <button
                        type="button"
                        onClick={() => setShowCustomForm(true)}
                        disabled={disabled}
                        className="flex items-center px-3 py-2 text-sm font-medium text-purple-600 bg-purple-100 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Custom Document
                    </button>
                </div>

                {/* Custom Documents List */}
                {customDocuments.length > 0 && (
                    <div className="space-y-2">
                        {customDocuments.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center">
                                    <DocumentIcon className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {doc.customName}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {doc.fileName}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeDocument(doc.id, true)}
                                    disabled={disabled}
                                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Custom Document Form */}
                <AnimatePresence>
                    {showCustomForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Document Name
                                    </label>
                                    <input
                                        type="text"
                                        value={customDocumentName}
                                        onChange={(e) => setCustomDocumentName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Enter document name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Select File
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => setCustomDocumentFile(e.target.files[0])}
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (customDocumentName && customDocumentFile) {
                                                handleFileUpload('custom', customDocumentFile, true);
                                            }
                                        }}
                                        disabled={!customDocumentName || !customDocumentFile || disabled}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Upload
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCustomForm(false);
                                            setCustomDocumentName('');
                                            setCustomDocumentFile(null);
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

const DocumentUploadCard = ({
    docType,
    document,
    status,
    onUpload,
    onRemove,
    uploading,
    disabled,
    getStatusColor,
    getStatusIcon
}) => {
    const [dragActive, setDragActive] = useState(false);

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

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {docType.name}
                        </h4>
                        {docType.isRequired && (
                            <span className="ml-2 px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                                Required
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {docType.description}
                    </p>
                    {docType.validityCondition && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 mb-2">
                            ⚠️ {docType.validityCondition}
                        </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        Max size: {docType.maxSize} | Formats: {docType.allowedFormats.join(', ')}
                    </p>
                </div>
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {getStatusIcon(status)}
                    <span className="ml-1 capitalize">{status}</span>
                </div>
            </div>

            {document ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                        <DocumentIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {document.fileName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onRemove}
                        disabled={disabled}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${dragActive
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !disabled && document.getElementById(`file-${docType.id}`)?.click()}
                >
                    <input
                        id={`file-${docType.id}`}
                        type="file"
                        accept={docType.allowedFormats.map(f => `.${f}`).join(',')}
                        onChange={handleFileInput}
                        className="hidden"
                        disabled={disabled}
                    />
                    {uploading ? (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {docType.allowedFormats.join(', ').toUpperCase()} up to {docType.maxSize}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {docType.instructions && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    💡 {docType.instructions}
                </p>
            )}
        </div>
    );
};

export default EnhancedDocumentUpload;
