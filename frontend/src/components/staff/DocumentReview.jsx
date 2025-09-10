import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Eye, MessageSquare, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const DocumentReview = ({ document, onReviewComplete }) => {
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewAction, setReviewAction] = useState('');
    const [selectedRemarks, setSelectedRemarks] = useState('');
    const [customRemarks, setCustomRemarks] = useState('');
    const [isCustomRemarks, setIsCustomRemarks] = useState(false);
    const [loading, setLoading] = useState(false);

    const predefinedRemarks = {
        rejected: {
            'poor_quality': 'Document quality is not clear. Please upload a high-resolution, clearly visible document.',
            'incomplete_info': 'Required information is missing or incomplete. Please ensure all fields are properly filled.',
            'wrong_document': 'This appears to be the wrong document type. Please upload the correct document as requested.',
            'expired_document': 'The document appears to be expired. Please provide a valid, current document.',
            'illegible_text': 'Text in the document is not readable. Please provide a clearer version with legible text.'
        },
        resubmission_required: {
            'minor_corrections': 'Minor corrections needed. Please address the highlighted issues and resubmit.',
            'additional_info': 'Additional information required. Please provide the missing details.',
            'format_issue': 'Document format needs adjustment. Please follow the specified format guidelines.',
            'signature_missing': 'Signature or official stamp is missing. Please ensure proper authorization.',
            'date_discrepancy': 'Date discrepancy found. Please verify and correct the dates mentioned.'
        }
    };

    const handleReview = async () => {
        if (!reviewAction) {
            Swal.fire({
                icon: 'warning',
                title: 'Action Required',
                text: 'Please select an action (Approve, Reject, or Request Resubmission).'
            });
            return;
        }

        if (reviewAction !== 'approved' && !selectedRemarks && !customRemarks) {
            Swal.fire({
                icon: 'warning',
                title: 'Remarks Required',
                text: 'Please provide remarks for this action.'
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`/api/documents/${document._id}/review`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    action: reviewAction,
                    remarks: isCustomRemarks ? customRemarks : selectedRemarks,
                    isCustomRemarks,
                    remarkType: selectedRemarks
                })
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Review Complete!',
                    text: `Document has been ${reviewAction} successfully.`
                });
                setShowReviewModal(false);
                onReviewComplete?.(result.data);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Review error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Review Failed',
                text: error.message || 'Failed to submit review. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
            under_review: { color: 'bg-blue-100 text-blue-800', icon: Eye },
            approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
            resubmission_required: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle }
        };

        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {status.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const priorities = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-blue-100 text-blue-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800'
        };

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorities[priority] || priorities.medium}`}>
                {priority.toUpperCase()}
            </span>
        );
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-6 mb-4"
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold">{document.originalName}</h3>
                            {getStatusBadge(document.status)}
                            {getPriorityBadge(document.priority)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span><strong>Uploaded by:</strong> {document.uploadedBy.firstName} {document.uploadedBy.lastName}</span>
                            </div>
                            <div>
                                <span className="font-medium">Document Type:</span> {document.documentType.replace('_', ' ')}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span><strong>Upload Date:</strong> {new Date(document.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="font-medium">File Size:</span> {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                            </div>
                        </div>

                        {document.currentRemarks && (
                            <div className="bg-gray-50 p-3 rounded-md mb-4">
                                <span className="font-medium text-gray-700">Current Remarks:</span>
                                <p className="text-gray-600 mt-1">{document.currentRemarks}</p>
                            </div>
                        )}

                        {/* Verification History */}
                        {document.verificationHistory && document.verificationHistory.length > 0 && (
                            <div className="bg-blue-50 p-3 rounded-md mb-4">
                                <span className="font-medium text-blue-700">Verification History:</span>
                                <div className="mt-2 space-y-2">
                                    {document.verificationHistory.map((entry, index) => (
                                        <div key={index} className="text-sm">
                                            <span className="font-medium">{entry.reviewedByName}:</span> {entry.action} - {entry.remarks}
                                            <span className="text-gray-500 ml-2">
                                                ({new Date(entry.timestamp).toLocaleString()})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex space-x-3">
                    <a
                        href={document.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View Document
                    </a>

                    {(document.status === 'pending' || document.status === 'under_review') ? (
                        <button
                            onClick={() => setShowReviewModal(true)}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Review Document
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowReviewModal(true)}
                            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Update Review
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-6">Review Document</h3>

                            {/* Document Info */}
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <h4 className="font-semibold mb-2">Document Details</h4>
                                <p><span className="font-medium">File:</span> {document.originalName}</p>
                                <p><span className="font-medium">Uploaded by:</span> {document.uploadedBy.firstName} {document.uploadedBy.lastName}</p>
                                <p><span className="font-medium">Type:</span> {document.documentType.replace('_', ' ')}</p>
                                <p><span className="font-medium">Priority:</span> {document.priority}</p>
                            </div>

                            {/* Action Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Select Action</label>
                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="action"
                                            value="approved"
                                            checked={reviewAction === 'approved'}
                                            onChange={(e) => setReviewAction(e.target.value)}
                                            className="text-green-600 focus:ring-green-500"
                                        />
                                        <span className="ml-3 text-green-600 font-medium">Approve Document</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="action"
                                            value="rejected"
                                            checked={reviewAction === 'rejected'}
                                            onChange={(e) => setReviewAction(e.target.value)}
                                            className="text-red-600 focus:ring-red-500"
                                        />
                                        <span className="ml-3 text-red-600 font-medium">Reject Document</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="action"
                                            value="resubmission_required"
                                            checked={reviewAction === 'resubmission_required'}
                                            onChange={(e) => setReviewAction(e.target.value)}
                                            className="text-orange-600 focus:ring-orange-500"
                                        />
                                        <span className="ml-3 text-orange-600 font-medium">Request Resubmission</span>
                                    </label>
                                </div>
                            </div>

                            {/* Remarks Section */}
                            {reviewAction && reviewAction !== 'approved' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Remarks</label>

                                    {/* Custom Remarks Toggle */}
                                    <div className="mb-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={isCustomRemarks}
                                                onChange={(e) => setIsCustomRemarks(e.target.checked)}
                                                className="text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">Write custom remarks</span>
                                        </label>
                                    </div>

                                    {isCustomRemarks ? (
                                        <textarea
                                            value={customRemarks}
                                            onChange={(e) => setCustomRemarks(e.target.value)}
                                            placeholder="Enter your custom remarks..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            rows="4"
                                        />
                                    ) : (
                                        <div className="space-y-2">
                                            {Object.entries(predefinedRemarks[reviewAction] || {}).map(([key, remark]) => (
                                                <label key={key} className="flex items-start">
                                                    <input
                                                        type="radio"
                                                        name="predefinedRemarks"
                                                        value={remark}
                                                        checked={selectedRemarks === remark}
                                                        onChange={(e) => setSelectedRemarks(e.target.value)}
                                                        className="mt-1 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="ml-3 text-sm text-gray-700">{remark}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    disabled={loading}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReview}
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default DocumentReview;
