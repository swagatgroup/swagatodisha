import {useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert';

const AgentDraftManager = () => {
    const { user } = useAuth();
    const [drafts, setDrafts] = useState([]);
    const [submitted, setSubmitted] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('drafts');
    const [selectedDrafts, setSelectedDrafts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchDrafts();
        fetchSubmitted();
    }, []);

    const fetchDrafts = async () => {
        try {
            const response = await api.get('/api/agent/drafts');
            if (response.data.success) {
                setDrafts(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching drafts:', error);
            // Mock data for demo
            setDrafts([
                {
                    _id: '1',
                    studentName: 'Rajesh Kumar',
                    course: 'B.Tech Computer Science',
                    campus: 'Sargiguda',
                    status: 'draft',
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    completionPercentage: 75
                },
                {
                    _id: '2',
                    studentName: 'Priya Sharma',
                    course: 'MBA',
                    campus: 'Ghantiguda',
                    status: 'draft',
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    completionPercentage: 60
                },
                {
                    _id: '3',
                    studentName: 'Amit Singh',
                    course: 'BCA',
                    campus: 'Sargiguda',
                    status: 'draft',
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    completionPercentage: 90
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmitted = async () => {
        try {
            const response = await api.get('/api/agent/submissions');
            if (response.data.success) {
                setSubmitted(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching submitted:', error);
            // Mock data for demo
            setSubmitted([
                {
                    _id: '4',
                    studentName: 'Suresh Patel',
                    course: 'B.Tech Mechanical Engineering',
                    campus: 'Ghantiguda',
                    status: 'submitted',
                    submittedAt: new Date().toISOString(),
                    applicationStatus: 'under_review'
                },
                {
                    _id: '5',
                    studentName: 'Neha Gupta',
                    course: 'MCA',
                    campus: 'Sargiguda',
                    status: 'submitted',
                    submittedAt: new Date().toISOString(),
                    applicationStatus: 'approved'
                }
            ]);
        }
    };

    const handleSelectDraft = (draftId) => {
        setSelectedDrafts(prev =>
            prev.includes(draftId)
                ? prev.filter(id => id !== draftId)
                : [...prev, draftId]
        );
    };

    const handleSelectAll = () => {
        const currentList = activeTab === 'drafts' ? drafts : submitted;
        if (selectedDrafts.length === currentList.length) {
            setSelectedDrafts([]);
        } else {
            setSelectedDrafts(currentList.map(item => item._id));
        }
    };

    const handleEditDraft = (draftId) => {
        // Navigate to edit form
        // TODO: Implement edit draft functionality
    };

    const handleDuplicateDraft = async (draftId) => {
        try {
            const response = await api.post(`/api/agent/drafts/${draftId}/duplicate`);
            if (response.data.success) {
                showSuccess('Draft Duplicated', 'Draft has been duplicated successfully');
                fetchDrafts();
            }
        } catch (error) {
            console.error('Error duplicating draft:', error);
            showError('Duplication Failed', 'Failed to duplicate draft');
        }
    };

    const handleDeleteDraft = async (draftId) => {
        const confirmed = await showConfirm(
            'Delete Draft',
            'Are you sure you want to delete this draft? This action cannot be undone.',
            'Yes, Delete',
            'Cancel'
        );

        if (confirmed) {
            try {
                const response = await api.delete(`/api/agent/drafts/${draftId}`);
                if (response.data.success) {
                    showSuccess('Draft Deleted', 'Draft has been deleted successfully');
                    fetchDrafts();
                }
            } catch (error) {
                console.error('Error deleting draft:', error);
                showError('Deletion Failed', 'Failed to delete draft');
            }
        }
    };

    const handleSubmitDraft = async (draftId) => {
        const confirmed = await showConfirm(
            'Submit Application',
            'Are you sure you want to submit this application? You cannot edit it after submission.',
            'Yes, Submit',
            'Cancel'
        );

        if (confirmed) {
            try {
                const response = await api.put(`/api/agent/drafts/${draftId}/submit`);
                if (response.data.success) {
                    showSuccess('Application Submitted', 'Application has been submitted successfully');
                    fetchDrafts();
                    fetchSubmitted();
                }
            } catch (error) {
                console.error('Error submitting draft:', error);
                showError('Submission Failed', 'Failed to submit application');
            }
        }
    };

    const handleBulkSubmit = async () => {
        if (selectedDrafts.length === 0) {
            showError('No Selection', 'Please select drafts to submit');
            return;
        }

        const confirmed = await showConfirm(
            'Bulk Submit',
            `Are you sure you want to submit ${selectedDrafts.length} selected applications?`,
            'Yes, Submit All',
            'Cancel'
        );

        if (confirmed) {
            try {
                const promises = selectedDrafts.map(draftId =>
                    api.put(`/api/agent/drafts/${draftId}/submit`)
                );
                await Promise.all(promises);
                showSuccess('Bulk Submit', 'All selected applications have been submitted');
                setSelectedDrafts([]);
                fetchDrafts();
                fetchSubmitted();
            } catch (error) {
                console.error('Error in bulk submit:', error);
                showError('Bulk Submit Failed', 'Failed to submit some applications');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedDrafts.length === 0) {
            showError('No Selection', 'Please select drafts to delete');
            return;
        }

        const confirmed = await showConfirm(
            'Bulk Delete',
            `Are you sure you want to delete ${selectedDrafts.length} selected drafts? This action cannot be undone.`,
            'Yes, Delete All',
            'Cancel'
        );

        if (confirmed) {
            try {
                const promises = selectedDrafts.map(draftId =>
                    api.delete(`/api/agent/drafts/${draftId}`)
                );
                await Promise.all(promises);
                showSuccess('Bulk Delete', 'All selected drafts have been deleted');
                setSelectedDrafts([]);
                fetchDrafts();
            } catch (error) {
                console.error('Error in bulk delete:', error);
                showError('Bulk Delete Failed', 'Failed to delete some drafts');
            }
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'draft': 'bg-gray-100 text-gray-800',
            'submitted': 'bg-blue-100 text-blue-800',
            'under_review': 'bg-yellow-100 text-yellow-800',
            'approved': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'draft': 'Draft',
            'submitted': 'Submitted',
            'under_review': 'Under Review',
            'approved': 'Approved',
            'rejected': 'Rejected'
        };
        return labels[status] || status;
    };

    const filteredDrafts = drafts.filter(draft => {
        if (!searchTerm) return true;
        return draft.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            draft.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
            draft.campus.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const filteredSubmitted = submitted.filter(item => {
        if (!searchTerm) return true;
        return item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.campus.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Draft & Submit Manager</h2>
                <p className="text-gray-600">
                    Manage your student application drafts and track submitted applications.
                </p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('drafts')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'drafts'
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Drafts ({drafts.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('submitted')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'submitted'
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Submitted ({submitted.length})
                        </button>
                    </nav>
                </div>

                {/* Search and Actions */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search applications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {activeTab === 'drafts' && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleBulkSubmit}
                                    disabled={selectedDrafts.length === 0}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit Selected ({selectedDrafts.length})
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={selectedDrafts.length === 0}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Delete Selected ({selectedDrafts.length})
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'drafts' ? (
                        <div className="space-y-4">
                            {filteredDrafts.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No drafts found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {searchTerm ? 'No drafts match your search criteria.' : 'Get started by creating your first draft.'}
                                    </p>
                                </div>
                            ) : (
                                filteredDrafts.map((draft) => (
                                    <motion.div
                                        key={draft._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedDrafts.includes(draft._id)}
                                                onChange={() => handleSelectDraft(draft._id)}
                                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                            />

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {draft.studentName}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {draft.course} • {draft.campus}
                                                </p>
                                                <div className="flex items-center space-x-4 mt-1">
                                                    <span className="text-xs text-gray-400">
                                                        Created: {new Date(draft.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        Modified: {new Date(draft.lastModified).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {draft.completionPercentage}% Complete
                                                    </div>
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-green-600 h-2 rounded-full"
                                                            style={{ width: `${draft.completionPercentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleEditDraft(draft._id)}
                                                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDuplicateDraft(draft._id)}
                                                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                                            >
                                                Duplicate
                                            </button>
                                            <button
                                                onClick={() => handleSubmitDraft(draft._id)}
                                                disabled={draft.completionPercentage < 100}
                                                className="text-green-600 hover:text-green-900 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Submit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDraft(draft._id)}
                                                className="text-red-600 hover:text-red-900 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredSubmitted.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No submitted applications</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {searchTerm ? 'No applications match your search criteria.' : 'Submitted applications will appear here.'}
                                    </p>
                                </div>
                            ) : (
                                filteredSubmitted.map((item) => (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {item.studentName}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {item.course} • {item.campus}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Submitted: {new Date(item.submittedAt).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.applicationStatus)}`}>
                                                    {getStatusLabel(item.applicationStatus)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                                                View
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentDraftManager;
