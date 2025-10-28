import { useState, useRef, useEffect } from 'react';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';

const SimpleDocumentUpload = ({ onDocumentsChange, initialDocuments = {}, isRequired = true, disabled = false }) => {
    const [documents, setDocuments] = useState(initialDocuments);
    const [uploading, setUploading] = useState({});
    const [dragActive, setDragActive] = useState({});
    const [documentRequirements, setDocumentRequirements] = useState(null);
    const [loading, setLoading] = useState(true);
    const fileInputRefs = useRef({});

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
        } finally {
            setLoading(false);
        }
    };

    const getDocumentTypes = () => {
        if (!documentRequirements) return [];

        const allDocs = [
            ...documentRequirements.requirements.required.map(doc => ({ ...doc, isRequired: true })),
            ...documentRequirements.requirements.optional.map(doc => ({ ...doc, isRequired: false }))
        ];

        return allDocs;
    };

    const mockDocumentTypes = [
        {
            id: 'passport_photo',
            name: 'Passport Photo',
            description: 'Recent passport size photograph',
            isRequired: true,
            allowedFormats: ['jpg', 'jpeg', 'png'],
            maxSize: '2MB',
            instructions: 'Photo should be clear and recent'
        },
        {
            id: 'aadhar_card',
            name: 'Aadhar Card',
            description: 'Front and back of Aadhar card',
            isRequired: true,
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            maxSize: '5MB',
            instructions: 'Both sides of the card'
        },
        {
            id: 'caste_certificate',
            name: 'Caste Certificate',
            description: 'Caste certificate for reservation',
            isRequired: true,
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            maxSize: '5MB',
            instructions: 'Caste certificate not older than 5 years'
        },
        {
            id: 'income_certificate',
            name: 'Income Certificate',
            description: 'Family income certificate',
            isRequired: true,
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            maxSize: '5MB',
            instructions: 'Income certificate not older than 1 year'
        },
        {
            id: 'marksheet_10th',
            name: '10th Marksheet',
            description: 'Class 10th marksheet',
            isRequired: true,
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            maxSize: '5MB',
            instructions: 'All pages of marksheet'
        },
        {
            id: 'resident_certificate',
            name: 'Resident Certificate',
            description: 'Resident/Domicile certificate',
            isRequired: false,
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            maxSize: '5MB',
            instructions: 'Certificate of residence/domicile'
        },
        {
            id: 'transfer_certificate',
            name: 'Transfer Certificate',
            description: 'Transfer certificate from previous institution',
            isRequired: false,
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            maxSize: '5MB',
            instructions: 'If available'
        }
    ];

    const handleFileUpload = async (documentType, file) => {
        if (!file) return;

        const docTypes = getDocumentTypes().length > 0 ? getDocumentTypes() : mockDocumentTypes;
        const docType = docTypes.find(doc => doc.id === documentType || doc.key === documentType);
        if (!docType) return;

        // Validate file
        const fileSizeMB = file.size / (1024 * 1024);
        const maxSizeMB = docType.maxSize ? parseFloat(docType.maxSize) : parseFloat(docType.maxSize || '10');

        if (fileSizeMB > maxSizeMB) {
            alert(`File size must be less than ${docType.maxSize || '10MB'}`);
            return;
        }

        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!docType.allowedFormats.includes(fileExtension)) {
            alert(`File format must be one of: ${docType.allowedFormats.join(', ')}`);
            return;
        }

        setUploading(prev => ({ ...prev, [documentType]: true }));

        try {
            const formData = new FormData();
            formData.append('files', file);
            formData.append('documentType', documentType);

            // Use original upload endpoint
            const response = await api.post('/api/files/upload-multiple', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 30000, // 30 second timeout
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    // You can add progress tracking here if needed
                }
            });

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
                status: 'PENDING', // Valid enum: PENDING, APPROVED, REJECTED
                downloadUrl: uploaded?.downloadUrl || uploaded?.filePath,
                url: uploaded?.downloadUrl || uploaded?.filePath,
                filePath: uploaded?.downloadUrl || uploaded?.filePath,
                cloudinaryPublicId: uploaded?.cloudinaryPublicId,
                public_id: uploaded?.cloudinaryPublicId,
            };

            setDocuments(prev => {
                const newDocs = {
                    ...prev,
                    [documentType]: fileObject
                };
                
                console.log(`📄 Document uploaded: ${documentType}`, fileObject);
                console.log('📄 Updated documents state:', newDocs);
                console.log('📄 Document count:', Object.keys(newDocs).length);
                
                // Notify parent with the updated documents
                onDocumentsChange(newDocs);
                
                return newDocs;
            });

        } catch (error) {
            console.error('Upload error:', error);
            alert(`Upload failed: ${error.response?.data?.message || 'Please try again'}`);
        } finally {
            setUploading(prev => ({ ...prev, [documentType]: false }));
        }
    };

    const handleFileRemove = (documentType) => {
        setDocuments(prev => {
            const newDocs = { ...prev };
            delete newDocs[documentType];
            
            // Notify parent with the updated documents
            onDocumentsChange(newDocs);
            
            return newDocs;
        });
    };

    const handleDrag = (e, documentType) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragIn = (e, documentType) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(prev => ({ ...prev, [documentType]: true }));
    };

    const handleDragOut = (e, documentType) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(prev => ({ ...prev, [documentType]: false }));
    };

    const handleDrop = (e, documentType) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(prev => ({ ...prev, [documentType]: false }));

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(documentType, e.dataTransfer.files[0]);
        }
    };

    const handleFileInputChange = (e, documentType) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(documentType, e.target.files[0]);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'uploaded': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
            case 'uploading': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
            case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'uploaded': return <DocumentIcon className="w-4 h-4" />;
            case 'uploading': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />;
            case 'error': return <XMarkIcon className="w-4 h-4" />;
            default: return <CloudArrowUpIcon className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Render uploaded documents section (always show if there are any)
    const renderUploadedDocuments = () => {
        const hasUploadedDocuments = Object.keys(documents).length > 0;
        
        if (!hasUploadedDocuments) return null;
        
        return (
            <div className="space-y-4 mb-8">
                <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Uploaded Documents</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Documents successfully uploaded ({Object.keys(documents).length})
                    </p>
                </div>

                <div className="space-y-3">
                    {Object.entries(documents).map(([docId, doc]) => {
                        const docTypes = getDocumentTypes().length > 0 ? getDocumentTypes() : mockDocumentTypes;
                        const docType = docTypes.find(dt => (dt.id || dt.key) === docId);
                        const docName = docType?.name || docType?.label || docId.replace(/_/g, ' ').toUpperCase();
                        const fileName = doc.name || doc.fileName;
                        const fileSize = (doc.size / 1024).toFixed(1);
                        
                        return (
                            <div key={docId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-3">
                                    <DocumentIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{docName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{fileSize} KB</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <a 
                                        href={doc.downloadUrl || doc.filePath || '#'} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium underline"
                                    >
                                        {fileName}
                                    </a>
                                    <button
                                        onClick={() => handleFileRemove(docId)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        title="Remove document"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Show uploaded documents section */}
            {renderUploadedDocuments()}
            
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Document Upload</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Upload all required documents for your application. Please ensure documents are clear and valid.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(getDocumentTypes().length > 0 ? getDocumentTypes() : mockDocumentTypes).map((docType) => {
                    const docId = docType.id || docType.key;
                    const document = documents[docId];
                    const status = document?.status || 'pending';
                    const isUploading = uploading[docId];

                    return (
                        <div key={docId} className={`border rounded-lg p-4 ${
                            document ? 'border-green-300 bg-green-50 dark:bg-green-900/10 dark:border-green-700' : 'border-gray-200 dark:border-gray-700'
                        }`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            {docType.name || docType.label}
                                            {(docType.isRequired || docType.required) && (
                                                <span className="text-red-500 ml-1">*</span>
                                            )}
                                        </h4>
                                        {document ? (
                                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                                                ✓ Uploaded
                                            </span>
                                        ) : (
                                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                                                Not Uploaded
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {docType.description}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {docType.allowedFormats.join(', ').toUpperCase()} up to {docType.maxSize || '10MB'}
                                    </p>
                                    {docType.validation?.note && (
                                        <div className="flex items-center space-x-1 mt-1">
                                            <InformationCircleIcon className="h-4 w-4 text-blue-500" />
                                            <p className="text-xs text-blue-600">{docType.validation.note}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {document ? (
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-full ${getStatusColor(status)}`}>
                                            {getStatusIcon(status)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {document.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {(document.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleFileRemove(docId)}
                                        disabled={disabled || isUploading}
                                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${dragActive[docId]
                                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    onDragEnter={(e) => handleDragIn(e, docId)}
                                    onDragLeave={(e) => handleDragOut(e, docId)}
                                    onDragOver={(e) => handleDrag(e, docId)}
                                    onDrop={(e) => handleDrop(e, docId)}
                                >
                                    <input
                                        ref={(el) => fileInputRefs.current[docId] = el}
                                        type="file"
                                        accept={docType.allowedFormats.map(f => `.${f}`).join(',')}
                                        onChange={(e) => handleFileInputChange(e, docId)}
                                        className="hidden"
                                        id={`file-${docId}`}
                                        disabled={disabled || isUploading}
                                    />
                                    <label
                                        htmlFor={`file-${docId}`}
                                        className="cursor-pointer block"
                                    >
                                        <div className="flex flex-col items-center">
                                            <CloudArrowUpIcon className={`w-8 h-8 mb-2 ${dragActive[docId] ? 'text-blue-500' : 'text-gray-400'
                                                }`} />
                                            <p className={`text-sm ${dragActive[docId]
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-gray-600 dark:text-gray-400'
                                                }`}>
                                                {dragActive[docId]
                                                    ? 'Drop file here'
                                                    : 'Click to upload or drag and drop'
                                                }
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {docType.allowedFormats.join(', ').toUpperCase()} up to {docType.maxSize}
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            )}

                            {docType.instructions && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                    💡 {docType.instructions}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SimpleDocumentUpload;
