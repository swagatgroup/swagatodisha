import { useState } from 'react';
import { motion } from 'framer-motion';

const AgentApplicationsTab = ({ applications = [] }) => {
    const [selectedApplication, setSelectedApplication] = useState(null);

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
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const ApplicationCard = ({ application }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedApplication(application)}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {application.user?.fullName || 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Application ID: {application.applicationId}
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {application.status}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Student Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {application.user?.email || 'N/A'}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {application.user?.phoneNumber || 'N/A'}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Submitted Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(application.submittedAt || application.createdAt)}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Stage</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {application.currentStage || 'N/A'}
                    </p>
                </div>
            </div>

            {application.personalDetails && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Personal Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Date of Birth:</span>
                            <span className="ml-2 text-gray-900 dark:text-gray-100">
                                {application.personalDetails.dateOfBirth ?
                                    new Date(application.personalDetails.dateOfBirth).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Aadhar:</span>
                            <span className="ml-2 text-gray-900 dark:text-gray-100">
                                {application.personalDetails.aadharNumber || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Gender:</span>
                            <span className="ml-2 text-gray-900 dark:text-gray-100">
                                {application.personalDetails.gender || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Father's Name:</span>
                            <span className="ml-2 text-gray-900 dark:text-gray-100">
                                {application.personalDetails.fatherName || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {application.courseDetails && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Course Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Course:</span>
                            <span className="ml-2 text-gray-900 dark:text-gray-100">
                                {application.courseDetails.courseName || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Class:</span>
                            <span className="ml-2 text-gray-900 dark:text-gray-100">
                                {application.courseDetails.className || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );

    const ApplicationDetailModal = ({ application, onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Application Details - {application.applicationId}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status and Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(application.status)}`}>
                                {application.status}
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Stage</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{application.currentStage || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Submitted Date</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                {formatDate(application.submittedAt || application.createdAt)}
                            </p>
                        </div>
                    </div>

                    {/* Student Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Student Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{application.user?.fullName || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{application.user?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{application.user?.phoneNumber || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Personal Details */}
                    {application.personalDetails && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Personal Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                        {application.personalDetails.dateOfBirth ?
                                            new Date(application.personalDetails.dateOfBirth).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aadhar Number</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{application.personalDetails.aadharNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{application.personalDetails.gender || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Father's Name</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{application.personalDetails.fatherName || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mother's Name</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{application.personalDetails.motherName || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Course Details */}
                    {application.courseDetails && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Course Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course Name</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{application.courseDetails.courseName || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{application.courseDetails.className || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Details */}
                    {application.contactDetails && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Contact Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{application.contactDetails.address || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{application.contactDetails.city || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{application.contactDetails.state || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pincode</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{application.contactDetails.pincode || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    My Submitted Applications
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total: {applications.length} applications
                </div>
            </div>

            {applications.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No applications submitted</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Start by registering a new student to submit applications.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {applications.map((application) => (
                        <ApplicationCard key={application._id} application={application} />
                    ))}
                </div>
            )}

            {selectedApplication && (
                <ApplicationDetailModal
                    application={selectedApplication}
                    onClose={() => setSelectedApplication(null)}
                />
            )}
        </div>
    );
};

export default AgentApplicationsTab;
