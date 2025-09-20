import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../../utils/api";
import {
    showSuccess,
    showErrorToast,
    showConfirm,
} from "../../../utils/sweetAlert";

const MySubmittedApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalApplications, setTotalApplications] = useState(0);

    const statusOptions = [
        { value: "all", label: "All Applications", color: "gray" },
        { value: "SUBMITTED", label: "Submitted", color: "blue" },
        { value: "UNDER_REVIEW", label: "Under Review", color: "yellow" },
        { value: "APPROVED", label: "Approved", color: "green" },
        { value: "REJECTED", label: "Rejected", color: "red" },
    ];

    useEffect(() => {
        fetchApplications();
    }, [statusFilter, currentPage]);

    const fetchApplications = async () => {
        try {
            setLoading(true);

            // Determine the correct API endpoint based on user role
            const userRole = localStorage.getItem('userRole') || 'student';
            let endpoint = '';

            switch (userRole) {
                case 'agent':
                    endpoint = '/api/agents/my-submitted-applications';
                    break;
                case 'staff':
                    endpoint = '/api/staff/my-submitted-applications';
                    break;
                case 'super_admin':
                    endpoint = '/api/admin/my-submitted-applications';
                    break;
                default:
                    endpoint = '/api/students/applications';
            }

            const response = await api.get(`${endpoint}?status=${statusFilter}&page=${currentPage}&limit=10`);
            const data = response.data.data;

            if (data.applications) {
                setApplications(data.applications);
                setTotalPages(data.pagination?.pages || 1);
                setTotalApplications(data.pagination?.total || 0);
            } else {
                setApplications(data || []);
                setTotalPages(1);
                setTotalApplications(data?.length || 0);
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
            setApplications([]);
            if (error?.response?.status && error.response.status !== 404) {
                showErrorToast("Failed to load applications");
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "SUBMITTED":
                return "bg-blue-100 text-blue-800";
            case "UNDER_REVIEW":
                return "bg-yellow-100 text-yellow-800";
            case "APPROVED":
                return "bg-green-100 text-green-800";
            case "REJECTED":
                return "bg-red-100 text-red-800";
            case "DRAFT":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "SUBMITTED":
                return "📤";
            case "UNDER_REVIEW":
                return "👀";
            case "APPROVED":
                return "✅";
            case "REJECTED":
                return "❌";
            case "DRAFT":
                return "📝";
            default:
                return "❓";
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            My Submitted Applications
                        </h2>
                        <p className="text-gray-600">
                            Track applications you have submitted for students
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Total: {totalApplications} applications
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Status Filter */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow p-6"
            >
                <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setStatusFilter(option.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === option.value
                                    ? `bg-${option.color}-100 text-${option.color}-800 border-2 border-${option.color}-300`
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Applications List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow"
            >
                {applications.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {applications.map((application, index) => (
                            <motion.div
                                key={application._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 hover:bg-gray-50"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {application.personalDetails?.fullName || application.user?.fullName || 'N/A'}
                                            </h3>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                    application.status
                                                )}`}
                                            >
                                                <span className="mr-1">
                                                    {getStatusIcon(application.status)}
                                                </span>
                                                {application.status?.replace("_", " ")}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Student:</span> {application.user?.fullName || 'N/A'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Email:</span> {application.user?.email || 'N/A'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Phone:</span> {application.user?.phoneNumber || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Course:</span> {application.courseDetails?.selectedCourse || 'N/A'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Campus:</span> {application.courseDetails?.campus || 'N/A'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Application ID:</span> {application.applicationId}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span>
                                                Submitted: {formatDate(application.submittedAt || application.createdAt)}
                                            </span>
                                            {application.submittedBy && (
                                                <span>
                                                    Submitted by: {application.submittedBy?.fullName || 'You'}
                                                </span>
                                            )}
                                        </div>

                                        {application.reviewInfo?.remarks && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                <p className="text-sm font-medium text-blue-900">
                                                    Review Notes:
                                                </p>
                                                <p className="text-sm text-blue-800">
                                                    {application.reviewInfo.remarks}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                            <svg
                                className="h-6 w-6 text-purple-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No applications submitted yet
                        </h3>
                        <p className="text-gray-500">
                            You haven't submitted any applications for students yet.
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-lg shadow p-6"
                >
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing page {currentPage} of {totalPages} ({totalApplications} total applications)
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default MySubmittedApplications;
