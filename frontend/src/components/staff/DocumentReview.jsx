import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { showSuccess, showError } from '../../utils/sweetAlert';

const DocumentReview = ({ studentId, onClose }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [remarks, setRemarks] = useState('');
    const [remarkType, setRemarkType] = useState('');
    const [isCustomRemarks, setIsCustomRemarks] = useState(false);

    useEffect(() => {
        if (studentId) {
            fetchStudentDocuments();
        }
    }, [studentId]);

    const fetchStudentDocuments = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/documents/student/${studentId}`);
            if (response.data.success) {
                setDocuments(response.data.data.documents);
            }
        } catch (error) {
            console.error('Error fetching student documents:', error);
            showError('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleDocumentSelect = (documentId) => {
        setSelectedDocuments(prev =>
            prev.includes(documentId)
                ? prev.filter(id => id !== documentId)
                : [...prev, documentId]
        );
    };

    const handleSelectAll = () => {
        if (selectedDocuments.length === documents.length) {
            setSelectedDocuments([]);
        } else {
            setSelectedDocuments(documents.map(doc => doc._id));
        }
    };

    const handleBulkAction = async () => {
        if (selectedDocuments.length === 0) {
            showError('Please select at least one document');
            return;
        }

        if (!bulkAction) {
            showError('Please select an action');
            return;
        }

        if (bulkAction !== 'approved' && !remarks.trim()) {
            showError('Please provide remarks for this action');
            return;
        }

        try {
            setLoading(true);
            const promises = selectedDocuments.map(documentId =>
                api.put(`/api/documents/${documentId}/review`, {
                    action: bulkAction,
                    remarks: remarks.trim(),
                    isCustomRemarks,
                    remarkType
                })
            );

            await Promise.all(promises);
            showSuccess(`${bulkAction} ${selectedDocuments.length} document(s) successfully`);
            setSelectedDocuments([]);
            setBulkAction('');
            setRemarks('');
            fetchStudentDocuments();
        } catch (error) {
            console.error('Error performing bulk action:', error);
            showError('Failed to perform action');
        } finally {
            setLoading(false);
        }
    };

    const handleIndividualAction = async (documentId, action) => {
        try {
            setLoading(true);
            await api.put(`/api/documents/${documentId}/review`, {
                action,
                remarks: action === 'approved' ? '' : remarks,
                isCustomRemarks: action !== 'approved',
                remarkType
            });
            showSuccess(`Document ${action} successfully`);
            fetchStudentDocuments();
        } catch (error) {
            console.error('Error performing action:', error);
            showError('Failed to perform action');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'resubmission_required': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getDocumentTypeLabel = (type) => {
        const labels = {
            'aadhar_card': 'Aadhar Card',
            'academic_certificate': 'Academic Certificate',
            'identity_proof': 'Identity Proof',
            'address_proof': 'Address Proof',
            'income_certificate': 'Income Certificate',
            'caste_certificate': 'Caste Certificate',
            'photo': 'Photo',
            'signature': 'Signature',
            'migration_certificate': 'Migration Certificate',
            'tc': 'Transfer Certificate',
            'mark_sheet': 'Mark Sheet',
            'entrance_exam_card': 'Entrance Exam Card',
            'birth_certificate': 'Birth Certificate',
            'marksheet_10th': '10th Mark Sheet',
            'marksheet_12th': '12th Mark Sheet',
            'transfer_certificate': 'Transfer Certificate',
            'character_certificate': 'Character Certificate',
            'passport_photo': 'Passport Photo',
            'guardian_id': 'Guardian ID',
            'medical_certificate': 'Medical Certificate',
            'other': 'Other'
        };
        return labels[type] || type.replace('_', ' ').toUpperCase();
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading documents...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Document Review</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Bulk Actions */}
                    {documents.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <div className="flex items-center space-x-4 mb-4">
                                <input
                                    type="checkbox"
                                    checked={selectedDocuments.length === documents.length}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Select All ({selectedDocuments.length}/{documents.length})
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center space-x-4">
                                <select
                                    value={bulkAction}
                                    onChange={(e) => setBulkAction(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">Select Action</option>
                                    <option value="approved">Approve All</option>
                                    <option value="rejected">Reject All</option>
                                    <option value="resubmission_required">Request Resubmission</option>
                                </select>

                                {bulkAction && bulkAction !== 'approved' && (
                                    <>
                                        <select
                                            value={remarkType}
                                            onChange={(e) => setRemarkType(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="">Select Remark Type</option>
                                            <option value="poor_quality">Poor Quality</option>
                                            <option value="incomplete_info">Incomplete Information</option>
                                            <option value="wrong_document">Wrong Document</option>
                                            <option value="expired_document">Expired Document</option>
                                            <option value="illegible_text">Illegible Text</option>
                                        </select>

                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={isCustomRemarks}
                                                onChange={(e) => setIsCustomRemarks(e.target.checked)}
                                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Custom Remarks</span>
                                        </label>

                                        <textarea
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            placeholder="Enter remarks..."
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            rows="2"
                                        />
                                    </>
                                )}

                                <button
                                    onClick={handleBulkAction}
                                    disabled={!bulkAction || (bulkAction !== 'approved' && !remarks.trim())}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Apply to Selected
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Documents List */}
                    <div className="space-y-4">
                        {documents.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No documents found for this student.</p>
                            </div>
                        ) : (
                            documents.map((document) => (
                                <div key={document._id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedDocuments.includes(document._id)}
                                                onChange={() => handleDocumentSelect(document._id)}
                                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                                            />

                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {getDocumentTypeLabel(document.documentType)}
                                                    </h3>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                                                        {document.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-gray-600 mb-2">
                                                    Original Name: {document.originalName}
                                                </p>

                                                <p className="text-sm text-gray-500">
                                                    Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                                                </p>

                                                {document.currentRemarks && (
                                                    <div className="mt-2 p-2 bg-gray-50 rounded">
                                                        <p className="text-sm text-gray-700">
                                                            <strong>Current Remarks:</strong> {document.currentRemarks}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Verification History */}
                                                {document.verificationHistory && document.verificationHistory.length > 0 && (
                                                    <div className="mt-3">
                                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Verification History:</h4>
                                                        <div className="space-y-1">
                                                            {document.verificationHistory.map((history, index) => (
                                                                <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                                                    <strong>{history.action.replace('_', ' ').toUpperCase()}</strong> by {history.reviewedByName} - {new Date(history.timestamp).toLocaleString()}
                                                                    {history.remarks && <p className="mt-1">{history.remarks}</p>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <a
                                                href={document.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                                            >
                                                View
                                            </a>

                                            {document.status !== 'approved' && (
                                                <button
                                                    onClick={() => handleIndividualAction(document._id, 'approved')}
                                                    className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                                                >
                                                    Approve
                                                </button>
                                            )}

                                            {document.status !== 'rejected' && (
                                                <button
                                                    onClick={() => handleIndividualAction(document._id, 'rejected')}
                                                    className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                                                >
                                                    Reject
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleIndividualAction(document._id, 'resubmission_required')}
                                                className="px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
                                            >
                                                Resubmit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentReview;