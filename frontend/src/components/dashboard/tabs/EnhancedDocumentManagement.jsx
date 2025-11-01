import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';

const EnhancedDocumentManagement = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');

    const documentCategories = [
        { id: 'educational', name: 'Educational Certificates', required: true },
        { id: 'identity', name: 'Identity Proofs', required: true },
        { id: 'income', name: 'Income Certificates', required: false },
        { id: 'category', name: 'Category Certificates', required: false },
        { id: 'medical', name: 'Medical Certificates', required: false },
        { id: 'other', name: 'Other Documents', required: false }
    ];

    const documentTypes = {
        educational: [
            '10th Certificate', '12th Certificate', '+2 Marksheet', '+2 Certificate', 'Graduation Marksheet', 'Graduation Certificate',
            'Post Graduation Certificate', 'Diploma Certificate', 'Other Educational'
        ],
        identity: [
            'Aadhaar Card', 'PAN Card', 'Voter ID', 'Driving License',
            'Passport', 'Other Identity Proof'
        ],
        income: [
            'Salary Certificate', 'Income Tax Return', 'Bank Statement',
            'Other Income Proof'
        ],
        category: [
            'SC Certificate', 'ST Certificate', 'OBC Certificate',
            'EWS Certificate', 'Other Category Certificate'
        ],
        medical: [
            'Medical Fitness Certificate', 'Blood Group Certificate',
            'Other Medical Certificate'
        ],
        other: [
            'Character Certificate', 'Migration Certificate',
            'Other Supporting Document'
        ]
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/documents');
            if (response.data.success) {
                setDocuments(response.data.data);
            }
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                alert('Please select a PDF, JPEG, or PNG file.');
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB.');
                return;
            }

            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !selectedCategory) {
            alert('Please select a file and category.');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('category', selectedCategory);
            formData.append('type', documentTypes[selectedCategory][0]); // Default to first type

            const response = await api.post('/api/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setSelectedFile(null);
                setSelectedCategory('');
                document.getElementById('fileInput').value = '';
                loadDocuments();
                alert('Document uploaded successfully!');
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Error uploading document. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <span className="text-green-500 text-xl">✅</span>;
            case 'rejected':
                return <span className="text-red-500 text-xl">❌</span>;
            case 'processing':
                return <span className="text-yellow-500 text-xl">🟡</span>;
            case 'under_review':
                return <span className="text-blue-500 text-xl">🔍</span>;
            default:
                return <span className="text-gray-500 text-xl">⏳</span>;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'under_review':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'approved':
                return 'Approved';
            case 'rejected':
                return 'Rejected';
            case 'processing':
                return 'Processing';
            case 'under_review':
                return 'Under Review';
            default:
                return 'Pending';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Upload Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Upload Documents</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">Select document category</option>
                            {documentCategories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name} {category.required && '*'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
                        <input
                            id="fileInput"
                            type="file"
                            onChange={handleFileSelect}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                {selectedFile && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <strong>Selected File:</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                    </div>
                )}

                <div className="mt-6">
                    <button
                        onClick={handleUpload}
                        disabled={uploading || !selectedFile || !selectedCategory}
                        className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? 'Uploading...' : 'Upload Document'}
                    </button>
                </div>
            </motion.div>

            {/* Document Status Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Document Status Overview</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {documentCategories.map(category => {
                        const categoryDocs = documents.filter(doc => doc.category === category.id);
                        const approvedCount = categoryDocs.filter(doc => doc.status === 'approved').length;
                        const totalCount = categoryDocs.length;

                        return (
                            <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                                    {category.required && <span className="text-red-500 text-sm">*</span>}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-2xl font-bold text-purple-600">{approvedCount}</span>
                                    <span className="text-gray-500">/ {totalCount}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                        style={{ width: totalCount > 0 ? `${(approvedCount / totalCount) * 100}%` : '0%' }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Document List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow"
            >
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Your Documents</h3>
                </div>

                <div className="p-6">
                    {documents.length === 0 ? (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by uploading your first document.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {documents.map((doc) => (
                                <div key={doc._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            {getStatusIcon(doc.status)}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{doc.type}</h4>
                                            <p className="text-sm text-gray-500">
                                                {doc.category.charAt(0).toUpperCase() + doc.category.slice(1)} •
                                                Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                            </p>
                                            {doc.remarks && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    <strong>Remarks:</strong> {doc.remarks}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                                            {getStatusText(doc.status)}
                                        </span>
                                        <div className="flex space-x-2">
                                            <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                                                View
                                            </button>
                                            <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                                                Download
                                            </button>
                                            {doc.status === 'rejected' && (
                                                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                                                    Re-upload
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Required Documents Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-6"
            >
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Required Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-medium text-blue-800 mb-2">Educational Certificates *</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• 10th Certificate</li>
                            <li>• 12th Certificate</li>
                            <li>• Graduation Certificate (if applicable)</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-blue-800 mb-2">Identity Proofs *</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Aadhaar Card</li>
                            <li>• PAN Card</li>
                            <li>• Voter ID or Driving License</li>
                        </ul>
                    </div>
                </div>
                <p className="text-sm text-blue-600 mt-4">
                    <strong>Note:</strong> All documents must be clear, legible, and in PDF, JPEG, or PNG format.
                    Maximum file size is 5MB per document.
                </p>
            </motion.div>
        </div>
    );
};

export default EnhancedDocumentManagement;
