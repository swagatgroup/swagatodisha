import { useState } from 'react';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SimpleDocumentUpload = ({ onDocumentsChange, initialDocuments = {}, isRequired = true, disabled = false }) => {
    const [documents, setDocuments] = useState(initialDocuments);
    const [uploading, setUploading] = useState({});

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
            id: 'birth_certificate',
            name: 'Birth Certificate',
            description: 'Birth certificate or equivalent',
            isRequired: true,
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            maxSize: '5MB',
            instructions: 'Clear copy of birth certificate'
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
            id: 'marksheet_12th',
            name: '12th Marksheet',
            description: 'Class 12th marksheet',
            isRequired: true,
            allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
            maxSize: '5MB',
            instructions: 'All pages of marksheet'
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

        const docType = mockDocumentTypes.find(doc => doc.id === documentType);
        if (!docType) return;

        // Validate file
        const fileSizeMB = file.size / (1024 * 1024);
        const maxSizeMB = parseFloat(docType.maxSize);

        if (fileSizeMB > maxSizeMB) {
            alert(`File size must be less than ${docType.maxSize}`);
            return;
        }

        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!docType.allowedFormats.includes(fileExtension)) {
            alert(`File format must be one of: ${docType.allowedFormats.join(', ')}`);
            return;
        }

        setUploading(prev => ({ ...prev, [documentType]: true }));

        try {
            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create file object
            const fileObject = {
                file: file,
                name: file.name,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString(),
                status: 'uploaded'
            };

            setDocuments(prev => ({
                ...prev,
                [documentType]: fileObject
            }));

            // Notify parent
            onDocumentsChange({
                ...documents,
                [documentType]: fileObject
            });

        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(prev => ({ ...prev, [documentType]: false }));
        }
    };

    const handleFileRemove = (documentType) => {
        setDocuments(prev => {
            const newDocs = { ...prev };
            delete newDocs[documentType];
            return newDocs;
        });

        // Notify parent
        const newDocs = { ...documents };
        delete newDocs[documentType];
        onDocumentsChange(newDocs);
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

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Document Upload</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Upload all required documents for your application. Please ensure documents are clear and valid.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockDocumentTypes.map((docType) => {
                    const document = documents[docType.id];
                    const status = document?.status || 'pending';
                    const isUploading = uploading[docType.id];

                    return (
                        <div key={docType.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {docType.name}
                                        {docType.isRequired && (
                                            <span className="text-red-500 ml-1">*</span>
                                        )}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {docType.description}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {docType.allowedFormats.join(', ').toUpperCase()} up to {docType.maxSize}
                                    </p>
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
                                        onClick={() => handleFileRemove(docType.id)}
                                        disabled={disabled || isUploading}
                                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                                    <input
                                        type="file"
                                        multiple
                                        accept={docType.allowedFormats.map(f => `.${f}`).join(',')}
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                // Handle multiple files
                                                Array.from(e.target.files).forEach(file => {
                                                    handleFileUpload(docType.id, file);
                                                });
                                                // Clear the input after upload
                                                e.target.value = '';
                                            }
                                        }}
                                        className="hidden"
                                        id={`file-${docType.id}`}
                                        disabled={disabled || isUploading}
                                    />
                                    <label
                                        htmlFor={`file-${docType.id}`}
                                        className="cursor-pointer block"
                                    >
                                        <div className="flex flex-col items-center">
                                            <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Click to upload multiple files or drag and drop
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
