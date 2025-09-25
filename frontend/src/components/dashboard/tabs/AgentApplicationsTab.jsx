import { useState } from 'react';
import { motion } from 'framer-motion';

const AgentApplicationsTab = ({ applications = [], onRefresh }) => {
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('submittedAt');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedApplications, setExpandedApplications] = useState(new Set());

    const getStatusColor = (status) => {
        switch (status) {
            case 'SUBMITTED':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'UNDER_REVIEW':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'APPROVED':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'REJECTED':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'DRAFT':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filter and sort applications
    const filteredAndSortedApplications = applications
        .filter(app => {
            // Status filter
            let statusMatch = true;
            if (filterStatus === 'not_reviewed') {
                statusMatch = app.reviewStatus?.overallDocumentReviewStatus === 'UNDER_REVIEW';
            } else if (filterStatus === 'partially_approved') {
                statusMatch = app.reviewStatus?.overallDocumentReviewStatus === 'PARTIALLY_APPROVED';
            } else if (filterStatus === 'all_approved') {
                statusMatch = app.reviewStatus?.overallDocumentReviewStatus === 'ALL_APPROVED';
            } else if (filterStatus === 'has_rejected') {
                statusMatch = app.reviewStatus?.overallDocumentReviewStatus === 'ALL_REJECTED' ||
                    (app.documentStats?.rejected > 0);
            }

            // Search filter
            let searchMatch = true;
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                searchMatch =
                    (app.personalDetails?.fullName || '').toLowerCase().includes(query) ||
                    (app.applicationId || '').toLowerCase().includes(query) ||
                    (app.user?.email || '').toLowerCase().includes(query) ||
                    (app.contactDetails?.primaryPhone || '').includes(query) ||
                    (app.courseDetails?.selectedCourse || '').toLowerCase().includes(query) ||
                    (app.status || '').toLowerCase().includes(query) ||
                    (app.reviewStatus?.overallDocumentReviewStatus || '').toLowerCase().includes(query);
            }

            return statusMatch && searchMatch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'submittedAt':
                    return new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt);
                case 'name':
                    return (a.personalDetails?.fullName || '').localeCompare(b.personalDetails?.fullName || '');
                case 'status':
                    return (a.status || '').localeCompare(b.status || '');
                case 'reviewStatus':
                    return (a.reviewStatus?.overallDocumentReviewStatus || '').localeCompare(b.reviewStatus?.overallDocumentReviewStatus || '');
                default:
                    return 0;
            }
        });

    // Toggle expand/collapse for application details
    const toggleExpanded = (applicationId) => {
        setExpandedApplications(prev => {
            const newSet = new Set(prev);
            if (newSet.has(applicationId)) {
                newSet.delete(applicationId);
            } else {
                newSet.add(applicationId);
            }
            return newSet;
        });
    };

    const ApplicationCard = ({ application }) => {
        const isExpanded = expandedApplications.has(application._id);
        const documentStats = application.documentStats || { total: 0, approved: 0, rejected: 0, pending: 0 };

        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {application.personalDetails?.fullName || application.user?.fullName || 'N/A'}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                {application.status}
                            </span>
                            {application.reviewStatus?.overallDocumentReviewStatus && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${application.reviewStatus.overallDocumentReviewStatus === 'ALL_APPROVED'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : application.reviewStatus.overallDocumentReviewStatus === 'ALL_REJECTED'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        : application.reviewStatus.overallDocumentReviewStatus === 'PARTIALLY_APPROVED'
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    }`}>
                                    {application.reviewStatus.overallDocumentReviewStatus === 'ALL_APPROVED'
                                        ? 'DOCUMENTS APPROVED'
                                        : application.reviewStatus.overallDocumentReviewStatus === 'ALL_REJECTED'
                                            ? 'DOCUMENTS REJECTED'
                                            : application.reviewStatus.overallDocumentReviewStatus === 'PARTIALLY_APPROVED'
                                                ? 'PARTIALLY REVIEWED'
                                                : 'UNDER REVIEW'}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>ID: {application.applicationId}</span>
                            <span>•</span>
                            <span>{formatDate(application.submittedAt || application.createdAt)}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>{documentStats.approved} approved, {documentStats.rejected} rejected</span>
                            {documentStats.total > 0 && (
                                <div className="flex items-center space-x-2">
                                    <span>Progress:</span>
                                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${(documentStats.approved + documentStats.rejected) / documentStats.total * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs">
                                        {Math.round((documentStats.approved + documentStats.rejected) / documentStats.total * 100)}%
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpanded(application._id);
                                }}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                {expandedApplications.has(application._id) ? 'Hide Details' : 'View Details'}
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <svg
                                    className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Expandable Details */}
                <motion.div
                    initial={false}
                    animate={{
                        height: isExpanded ? 'auto' : 0,
                        opacity: isExpanded ? 1 : 0
                    }}
                    transition={{
                        duration: 0.3,
                        ease: 'easeInOut'
                    }}
                    className="overflow-hidden"
                >
                    {isExpanded && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700">
                            {/* Overall Review Status */}
                            {application.reviewStatus && (
                                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                                    <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Overall Status:</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${application.reviewStatus.overallDocumentReviewStatus === 'ALL_APPROVED'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : application.reviewStatus.overallDocumentReviewStatus === 'ALL_REJECTED'
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                : application.reviewStatus.overallDocumentReviewStatus === 'PARTIALLY_APPROVED'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                            }`}>
                                            {application.reviewStatus.overallDocumentReviewStatus === 'ALL_APPROVED'
                                                ? 'DOCUMENTS APPROVED'
                                                : application.reviewStatus.overallDocumentReviewStatus === 'ALL_REJECTED'
                                                    ? 'DOCUMENTS REJECTED'
                                                    : application.reviewStatus.overallDocumentReviewStatus === 'PARTIALLY_APPROVED'
                                                        ? 'PARTIALLY REVIEWED'
                                                        : 'UNDER REVIEW'}
                                        </span>
                                    </div>
                                    {application.reviewStatus.reviewedAt && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Reviewed: {formatDate(application.reviewStatus.reviewedAt)}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Personal Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Personal Information</h4>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Father's Name:</span>
                                            <span className="ml-2 text-gray-900 dark:text-gray-100">{application.personalDetails?.fathersName || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Mother's Name:</span>
                                            <span className="ml-2 text-gray-900 dark:text-gray-100">{application.personalDetails?.mothersName || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Date of Birth:</span>
                                            <span className="ml-2 text-gray-900 dark:text-gray-100">{application.personalDetails?.dateOfBirth || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Contact Information</h4>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                            <span className="ml-2 text-gray-900 dark:text-gray-100">{application.user?.email || application.contactDetails?.email || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                                            <span className="ml-2 text-gray-900 dark:text-gray-100">{application.contactDetails?.primaryPhone || application.user?.phoneNumber || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Address:</span>
                                            <span className="ml-2 text-gray-900 dark:text-gray-100">{application.contactDetails?.address || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Course Information */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Course Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Course:</span>
                                        <span className="ml-2 text-gray-900 dark:text-gray-100">{application.courseDetails?.selectedCourse || application.courseDetails?.courseName || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Academic Year:</span>
                                        <span className="ml-2 text-gray-900 dark:text-gray-100">{application.courseDetails?.academicYear || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Document Status */}
                            {application.documents && application.documents.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Document Status</h4>
                                    <div className="space-y-2">
                                        {application.documents.map((doc, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded border">
                                                <span className="text-sm text-gray-900 dark:text-gray-100">{doc.documentType}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${doc.status === 'APPROVED'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : doc.status === 'REJECTED'
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                    }`}>
                                                    {doc.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    My Submitted Applications
                </h2>
                <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {filteredAndSortedApplications.length} of {applications.length} applications
                    </div>
                    <button
                        onClick={() => {
                            if (expandedApplications.size === filteredAndSortedApplications.length) {
                                setExpandedApplications(new Set());
                            } else {
                                setExpandedApplications(new Set(filteredAndSortedApplications.map(app => app._id)));
                            }
                        }}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                        {expandedApplications.size === filteredAndSortedApplications.length ? 'Collapse All' : 'Expand All'}
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search applications by name, ID, email, phone, course, or status..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by:</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                            >
                                <option value="all">All Applications</option>
                                <option value="not_reviewed">Under Review</option>
                                <option value="partially_approved">Partially Reviewed</option>
                                <option value="all_approved">All Approved</option>
                                <option value="has_rejected">Has Rejected</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort by:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                            >
                                <option value="submittedAt">Submission Date</option>
                                <option value="name">Name</option>
                                <option value="status">Status</option>
                                <option value="reviewStatus">Review Status</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Applications List */}
            {filteredAndSortedApplications.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No applications match your filter</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your filter criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredAndSortedApplications.map((application) => (
                        <ApplicationCard key={application._id} application={application} />
                    ))}
                </div>
            )}

        </div>
    );
};

export default AgentApplicationsTab;