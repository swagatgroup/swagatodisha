import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';
import { io } from 'socket.io-client';

const RealTimeStudentTracking = () => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        stage: '',
        search: ''
    });
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        // 8 Categories for Super Admin Dashboard
        newRegistrations: 0,
        documentVerification: 0,
        applicationReview: 0,
        paymentPending: 0,
        enrollmentComplete: 0,
        academicStarted: 0,
        graduated: 0,
        droppedOut: 0
    });

    useEffect(() => {
        initializeSocket();
        loadStudents();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    const initializeSocket = () => {
        const token = localStorage.getItem('token');
        const apiBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
            ? import.meta.env.VITE_API_URL
            : (typeof window !== 'undefined'
                ? (window.location.origin.includes('localhost:3000')
                    ? 'http://localhost:5000'
                    : window.location.origin)
                : 'http://localhost:5000');
        const newSocket = io(apiBase, {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            // Connected to real-time updates
        });

        newSocket.on('new_application_created', (data) => {
            // New application created
            loadStudents(); // Refresh the list
        });

        newSocket.on('application_updated', (data) => {
            // Application updated
            updateStudentInList(data);
        });

        newSocket.on('application_submitted', (data) => {
            // Application submitted
            updateStudentInList(data);
        });

        newSocket.on('application_approved', (data) => {
            // Application approved
            updateStudentInList(data);
        });

        newSocket.on('application_rejected', (data) => {
            // Application rejected
            updateStudentInList(data);
        });

        newSocket.on('new_document_uploaded', (data) => {
            // New document uploaded
            loadStudents(); // Refresh to show updated document count
        });

        newSocket.on('document_status_changed', (data) => {
            // Document status changed
            loadStudents(); // Refresh to show updated document status
        });

        setSocket(newSocket);
    };

    const loadStudents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/student-application/applications', {
                params: {
                    status: filters.status || undefined,
                    stage: filters.stage || undefined
                }
            });

            if (response.data.success) {
                const applications = response.data.data.applications || [];
                setStudents(applications);
                updateStats(applications);
            }
        } catch (error) {
            console.error('Error loading students:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStudentInList = (data) => {
        setStudents(prev => prev.map(student =>
            student.applicationId === data.applicationId
                ? { ...student, ...data }
                : student
        ));
    };

    const updateStats = (applications) => {
        const stats = {
            total: applications.length,
            pending: applications.filter(app => app.status === 'DRAFT').length,
            inProgress: applications.filter(app => ['SUBMITTED', 'UNDER_REVIEW'].includes(app.status)).length,
            completed: applications.filter(app => ['APPROVED', 'REJECTED'].includes(app.status)).length,
            // 8 Categories for Super Admin Dashboard
            newRegistrations: applications.filter(app => app.status === 'DRAFT' && app.currentStage === 'REGISTRATION').length,
            documentVerification: applications.filter(app => app.currentStage === 'DOCUMENTS' || app.status === 'DOCUMENT_VERIFICATION').length,
            applicationReview: applications.filter(app => app.status === 'UNDER_REVIEW' || app.currentStage === 'APPLICATION_PDF').length,
            paymentPending: applications.filter(app => app.status === 'PAYMENT_PENDING' || app.currentStage === 'PAYMENT').length,
            enrollmentComplete: applications.filter(app => app.status === 'ENROLLED' || app.currentStage === 'ENROLLMENT').length,
            academicStarted: applications.filter(app => app.status === 'ACADEMIC_STARTED' || app.currentStage === 'ACADEMIC').length,
            graduated: applications.filter(app => app.status === 'GRADUATED' || app.currentStage === 'GRADUATION').length,
            droppedOut: applications.filter(app => app.status === 'DROPPED_OUT' || app.status === 'WITHDRAWN').length
        };
        setStats(stats);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'DRAFT':
                return 'bg-gray-100 text-gray-800';
            case 'SUBMITTED':
                return 'bg-blue-100 text-blue-800';
            case 'UNDER_REVIEW':
                return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStageColor = (stage) => {
        switch (stage) {
            case 'REGISTRATION':
                return 'bg-blue-100 text-blue-800';
            case 'DOCUMENTS':
                return 'bg-purple-100 text-purple-800';
            case 'APPLICATION_PDF':
                return 'bg-indigo-100 text-indigo-800';
            case 'TERMS_CONDITIONS':
                return 'bg-pink-100 text-pink-800';
            case 'SUBMITTED':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getProgressPercentage = (progress) => {
        const safe = progress || {};
        let completed = 0;
        let total = 4; // Total steps

        if (safe.registrationComplete) completed++;
        if (safe.documentsComplete) completed++;
        if (safe.applicationPdfGenerated) completed++;
        if (safe.termsAccepted) completed++;

        return Math.round((completed / total) * 100);
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = !filters.search ||
            student.user?.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
            student.applicationId?.toLowerCase().includes(filters.search.toLowerCase());

        const matchesStatus = !filters.status || student.status === filters.status;
        const matchesStage = !filters.stage || student.currentStage === filters.stage;

        return matchesSearch && matchesStatus && matchesStage;
    });

    const handleStatusUpdate = async (applicationId, newStatus, remarks = '') => {
        try {
            const endpoint = newStatus === 'APPROVED'
                ? `/api/student-application/${applicationId}/approve`
                : `/api/student-application/${applicationId}/reject`;

            await api.put(endpoint, { remarks });
            loadStudents(); // Refresh the list
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating status. Please try again.');
        }
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
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Real-Time Student Tracking</h3>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Live Updates</span>
                </div>
            </div>

            {/* 8 Categories Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">New Registrations</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.newRegistrations}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Document Verification</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.documentVerification}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Application Review</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.applicationReview}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Payment Pending</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.paymentPending}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Enrollment Complete</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.enrollmentComplete}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Academic Started</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.academicStarted}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Graduated</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.graduated}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Dropped Out</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.droppedOut}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Search by name or application ID"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        >
                            <option value="">All Statuses</option>
                            <option value="DRAFT">Draft</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
                        <select
                            value={filters.stage}
                            onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        >
                            <option value="">All Stages</option>
                            <option value="REGISTRATION">Registration</option>
                            <option value="DOCUMENTS">Documents</option>
                            <option value="APPLICATION_PDF">Application PDF</option>
                            <option value="TERMS_CONDITIONS">Terms & Conditions</option>
                            <option value="SUBMITTED">Submitted</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={loadStudents}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Student List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                        Students ({filteredStudents.length})
                    </h4>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    <AnimatePresence>
                        {filteredStudents.map((student, index) => (
                            <motion.div
                                key={student._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 dark:text-blue-300 font-semibold">
                                                {student.user?.fullName?.charAt(0) || 'S'}
                                            </span>
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                                {student.user?.fullName || 'Unknown Student'}
                                            </h5>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {student.applicationId} • {student.courseDetails?.selectedCourse}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                                Last updated: {student.lastModified ? new Date(student.lastModified).toLocaleString() : '—'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        {/* Progress Bar */}
                                        <div className="w-32">
                                            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                                                <span>Progress</span>
                                                <span>{getProgressPercentage(student.progress)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${getProgressPercentage(student.progress)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
                                            {student.status}
                                        </span>

                                        {/* Stage Badge */}
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStageColor(student.currentStage || '')}`}>
                                            {(student.currentStage || '—').replace('_', ' ')}
                                        </span>

                                        {/* Actions */}
                                        <div className="flex space-x-2">
                                            {student.status === 'SUBMITTED' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(student.applicationId, 'APPROVED')}
                                                        className="px-3 py-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-sm font-medium"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt('Rejection reason:');
                                                            if (reason) {
                                                                handleStatusUpdate(student.applicationId, 'REJECTED', reason);
                                                            }
                                                        }}
                                                        className="px-3 py-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => {
                                                    // View application details
                                                    alert('View application details functionality would be implemented here');
                                                }}
                                                className="px-3 py-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Details */}
                                <div className="mt-4 grid grid-cols-4 gap-4 text-xs">
                                    <div className={`text-center p-2 rounded ${student.progress?.registrationComplete ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                        Registration
                                    </div>
                                    <div className={`text-center p-2 rounded ${student.progress?.documentsComplete ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                        Documents
                                    </div>
                                    <div className={`text-center p-2 rounded ${student.progress?.applicationPdfGenerated ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                        PDF Generated
                                    </div>
                                    <div className={`text-center p-2 rounded ${student.progress?.termsAccepted ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                        Terms Accepted
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default RealTimeStudentTracking;
