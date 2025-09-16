import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';

const DocumentsUpload = ({ onStudentUpdate }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [students, setStudents] = useState([]);

    const documentCategories = [
        { id: 'educational', name: 'Educational Certificates', required: true, maxFiles: 5 },
        { id: 'identity', name: 'Identity Proofs', required: true, maxFiles: 3 },
        { id: 'income', name: 'Income Certificates', required: false, maxFiles: 2 },
        { id: 'category', name: 'Category Certificates', required: false, maxFiles: 2 },
        { id: 'medical', name: 'Medical Certificates', required: false, maxFiles: 2 },
        { id: 'other', name: 'Other Documents', required: false, maxFiles: 3 }
    ];

    const documentTypes = {
        educational: [
            '10th Mark Sheet',
            '10th Certificate',
            '12th Mark Sheet',
            '12th Certificate',
            'Graduation Mark Sheet',
            'Graduation Certificate',
            'Post Graduation Mark Sheet',
            'Post Graduation Certificate',
            'Other Educational Certificate'
        ],
        identity: [
            'Aadhaar Card',
            'PAN Card',
            'Voter ID',
            'Driving License',
            'Passport',
            'Other Identity Proof'
        ],
        income: [
            'Income Certificate',
            'Salary Certificate',
            'Bank Statement',
            'ITR (Income Tax Return)',
            'Other Income Proof'
        ],
        category: [
            'SC Certificate',
            'ST Certificate',
            'OBC Certificate',
            'EWS Certificate',
            'Other Category Certificate'
        ],
        medical: [
            'Medical Fitness Certificate',
            'Blood Group Certificate',
            'Other Medical Certificate'
        ],
        other: [
            'Passport Size Photo',
            'Signature',
            'Other Document'
        ]
    };

    useEffect(() => {
        loadStudents();
        loadDocuments();
    }, []);

    const loadStudents = async () => {
        try {
            const response = await api.get('/api/agents/students');
            if (response.data.success) {
                const list = response.data.data?.students ?? response.data.data ?? [];
                setStudents(Array.isArray(list) ? list : []);
            } else {
                setStudents([]);
            }
        } catch (error) {
            console.error('Error loading students:', error);
            setStudents([]);
        }
    };

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/documents');
            if (response.data.success) {
                const list = response.data.data?.documents ?? response.data.data ?? [];
                setDocuments(Array.isArray(list) ? list : []);
            } else {
                setDocuments([]);
            }
        } catch (error) {
            console.error('Error loading documents:', error);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (category, type, files) => {
        if (!selectedStudent) {
            alert('Please select a student first');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();

            Array.from(files).forEach((file, index) => {
                formData.append(`files`, file);
            });

            formData.append('studentId', selectedStudent);
            formData.append('category', category);
            formData.append('type', type);

            const response = await api.post('/api/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                alert('Documents uploaded successfully!');
                loadDocuments();
                onStudentUpdate();
            }
        } catch (error) {
            console.error('Error uploading documents:', error);
            alert('Error uploading documents. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (documentId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            const response = await api.delete(`/api/documents/${documentId}`);
            if (response.data.success) {
                alert('Document deleted successfully!');
                loadDocuments();
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Error deleting document. Please try again.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'pending':
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
            case 'pending':
                return 'Pending';
            case 'under_review':
                return 'Under Review';
            default:
                return 'Unknown';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Student Selection */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Upload</h3>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
                        <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Choose a student...</option>
                            {(Array.isArray(students) ? students : []).map(student => (
                                <option key={student._id} value={student._id}>
                                    {student.personalDetails?.fullName} - {student.studentId}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Document Categories */}
            <div className="space-y-6">
                {documentCategories.map((category, categoryIndex) => (
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: categoryIndex * 0.1 }}
                        className="bg-white rounded-lg shadow"
                    >
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h4 className="text-md font-semibold text-gray-900">
                                    {category.name}
                                    {category.required && <span className="text-red-500 ml-1">*</span>}
                                </h4>
                                <span className="text-sm text-gray-500">
                                    Max {category.maxFiles} files
                                </span>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {documentTypes[category.id].map((type) => (
                                    <div key={type} className="border border-gray-200 rounded-lg p-4">
                                        <h5 className="font-medium text-gray-900 mb-3">{type}</h5>

                                        <input
                                            type="file"
                                            multiple
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            onChange={(e) => {
                                                if (e.target.files.length > 0) {
                                                    handleFileUpload(category.id, type, e.target.files);
                                                }
                                            }}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            disabled={!selectedStudent || uploading}
                                        />

                                        <p className="text-xs text-gray-500 mt-2">
                                            Supported: PDF, JPG, PNG, DOC, DOCX (Max 5MB each)
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Uploaded Documents */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900">Uploaded Documents</h4>
                </div>

                <div className="p-6">
                    {(!Array.isArray(documents) || documents.length === 0) ? (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</h3>
                            <p className="mt-1 text-sm text-gray-500">Upload documents for the selected student.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {(Array.isArray(documents) ? documents : []).map((document, index) => (
                                <motion.div
                                    key={document._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>

                                            <div>
                                                <h5 className="font-medium text-gray-900">{document.type}</h5>
                                                <p className="text-sm text-gray-500">
                                                    {document.student?.personalDetails?.fullName} • {document.student?.studentId}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {formatFileSize(document.fileSize)} • {new Date(document.uploadedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                                                {getStatusText(document.status)}
                                            </span>

                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        // Download file
                                                        window.open(`/api/documents/${document._id}/download`, '_blank');
                                                    }}
                                                    className="p-1 text-blue-600 hover:text-blue-800"
                                                    title="Download"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(document._id)}
                                                    className="p-1 text-red-600 hover:text-red-800"
                                                    title="Delete"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {document.remarks && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded">
                                            <p className="text-sm text-gray-600">
                                                <strong>Remarks:</strong> {document.remarks}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentsUpload;
