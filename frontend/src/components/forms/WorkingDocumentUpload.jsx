import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon, PlusIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { showSuccess, showError } from '../../utils/sweetAlert';

const WorkingDocumentUpload = ({
    onDocumentsChange,
    initialDocuments = {},
    isRequired = true,
    disabled = false
}) => {
    // Mock document types for testing
    const mockDocumentTypes = [
        {
            id: 'passport_photo',
            name: 'Passport Size Photo',
            description: 'Recent passport size photograph (2x2 inches)',
            category: 'identity',
            isRequired: true,
            maxSize: '2MB',
            allowedFormats: ['jpg', 'jpeg', 'png'],
            instructions: 'Photo should be clear, recent, and taken against a light background'
        },
        {
            id: 'aadhar_card',
            name: 'Aadhar Card',
            description: 'Front and back of Aadhar card',
            category: 'identity',
            isRequired: true,
            maxSize: '5MB',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            instructions: 'Both front and back sides required'
        },
        {
            id: 'birth_certificate',
            name: 'Birth Certificate',
            description: 'Official birth certificate',
            category: 'identity',
            isRequired: true,
            maxSize: '5MB',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            instructions: 'Must be issued by government authority'
        },
        {
            id: 'marksheet_10th',
            name: '10th Marksheet',
            description: 'Class 10th marksheet or equivalent',
            category: 'academic',
            isRequired: true,
            maxSize: '5MB',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            instructions: 'Must be attested if required'
        },
        {
            id: 'marksheet_12th',
            name: '12th Marksheet',
            description: 'Class 12th marksheet or equivalent',
            category: 'academic',
            isRequired: true,
            maxSize: '5MB',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            instructions: 'Must be attested if required'
        },
        {
            id: 'transfer_certificate',
            name: 'Transfer Certificate',
            description: 'Transfer certificate from previous institution',
            category: 'academic',
            isRequired: false,
            maxSize: '5MB',
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            instructions: 'Required for admission'
        }
    ];

    const mockCategories = {
        identity: {
            name: 'Identity Documents',
            description: 'Documents required for identity verification',
            color: 'blue'
        },
        academic: {
            name: 'Academic Documents',
            description: 'Educational certificates and marksheets',
            color: 'green'
        }
    };

    const [documents, setDocuments] = useState(initialDocuments);
    const [customDocuments, setCustomDocuments] = useState([]);
    const [uploading, setUploading] = useState({});
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customDocumentName, setCustomDocumentName] = useState('');
    const [customDocumentFile, setCustomDocumentFile] = useState(null);

    useEffect(() => {
        onDocumentsChange({ ...documents, custom: customDocuments });
    }, [documents, customDocuments]);

    const handleFileUpload = async (documentType, file) => {
        if (!file) return;

        const docType = mockDocumentTypes.find(doc => doc.id === documentType);
        if (!docType) {
            return;
        }

        // Validate file
        const fileSizeMB = file.size / (1024 * 1024);
        const maxSizeMB = parseFloat(docType.maxSize);

        if (fileSizeMB > maxSizeMB) {
            showError(`File size must be less than ${docType.maxSize}`);
            return;
        }

        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!docType.allowedFormats.includes(fileExtension)) {
            showError(`File format must be one of: ${docType.allowedFormats.join(', ')}`);
            return;
        }

        setUploading(prev => ({ ...prev, [documentType]: true }));

        try {
            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const documentData = {
                id: documentType,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                uploadedAt: new Date().toISOString(),
                status: 'uploaded',
                url: URL.createObjectURL(file) // For preview
            };

            setDocuments(prev => ({
                ...prev,
                [documentType]: documentData
            }));

            showSuccess(`${docType.name} uploaded successfully`);
        } catch (error) {
            console.error('Upload error:', error);
            showError('Failed to upload document');
        } finally {
            setUploading(prev => ({ ...prev, [documentType]: false }));
        }
    };

    const removeDocument = (documentType) => {
        setDocuments(prev => {
            const newDocs = { ...prev };
            delete newDocs[documentType];
            return newDocs;
        });
    };

    const getDocumentStatus = (documentType) => {
        const doc = documents[documentType];
        if (!doc) return 'missing';
        if (doc.status === 'uploaded') return 'uploaded';
        return 'pending';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'uploaded':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'missing':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'uploaded':
                return <CheckCircleIcon className="w-4 h-4" />;
            case 'pending':
                return <ExclamationTriangleIcon className="w-4 h-4" />;
            case 'missing':
                return <XMarkIcon className="w-4 h-4" />;
            default:
                return <DocumentIcon className="w-4 h-4" />;
        }
    };

    // Group documents by category
    const groupedDocuments = mockDocumentTypes.reduce((acc, doc) => {
        if (!acc[doc.category]) {
            acc[doc.category] = [];
        }
        acc[doc.category].push(doc);
        return acc;
    }, {});

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
                        <div className={`w-3 h-3 rounded-full bg-${mockCategories[categoryId]?.color || 'blue'}-500 mr-3`}></div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {mockCategories[categoryId]?.name || categoryId}
                        </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {mockCategories[categoryId]?.description}
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
                                    onClick={() => {
                                        setCustomDocuments(prev => prev.filter(d => d.id !== doc.id));
                                    }}
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
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
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
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (customDocumentName && customDocumentFile) {
                                                const newDoc = {
                                                    id: `custom_${Date.now()}`,
                                                    customName: customDocumentName,
                                                    fileName: customDocumentFile.name,
                                                    fileSize: customDocumentFile.size,
                                                    fileType: customDocumentFile.type,
                                                    uploadedAt: new Date().toISOString(),
                                                    status: 'uploaded',
                                                    url: URL.createObjectURL(customDocumentFile)
                                                };
                                                setCustomDocuments(prev => [...prev, newDoc]);
                                                setCustomDocumentName('');
                                                setCustomDocumentFile(null);
                                                setShowCustomForm(false);
                                                showSuccess('Custom document added successfully');
                                            }
                                        }}
                                        disabled={!customDocumentName || !customDocumentFile}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Add Document
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCustomDocumentName('');
                                            setCustomDocumentFile(null);
                                            setShowCustomForm(false);
                                        }}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
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
    const fileInputRef = useRef(null);


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
                <label
                    htmlFor={`file-${docType.id}`}
                    className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors block ${dragActive
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!disabled && fileInputRef.current) {
                            fileInputRef.current.click();
                        }
                    }}
                    style={{ pointerEvents: disabled ? 'none' : 'auto' }}
                >
                    <input
                        id={`file-${docType.id}`}
                        ref={fileInputRef}
                        type="file"
                        accept={docType.allowedFormats.map(f => `.${f}`).join(',')}
                        onChange={handleFileInput}
                        className="hidden"
                        disabled={disabled}
                        style={{ display: 'none' }}
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
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (fileInputRef.current) {
                                        fileInputRef.current.click();
                                    }
                                }}
                                className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Select File
                            </button>
                        </div>
                    )}
                </label>
            )}

            {docType.instructions && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    💡 {docType.instructions}
                </p>
            )}
        </div>
    );
};

export default WorkingDocumentUpload;
