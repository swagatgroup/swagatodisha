import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSession } from '../../contexts/SessionContext';
import DashboardLayout from './DashboardLayout';
import UserManagement from '../admin/UserManagement';
import StudentManagement from '../admin/StudentManagement';
import WebsiteManagement from '../admin/WebsiteManagement';
import ErrorBoundary from '../common/ErrorBoundary';
// RealTimeStudentTracking removed - Socket.IO component
// WebsiteManagementSystem removed - Socket.IO component
import StudentRegistrationWorkflow from './tabs/StudentRegistrationWorkflow';
import ApplicationReview from './tabs/ApplicationReview';
import {
    showSuccess,
    showError,
    showConfirm,
    showLoading,
    closeLoading,
    handleApiError,
    showSuccessToast,
    showErrorToast
} from '../../utils/sweetAlert';
import api from '../../utils/api';

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const { selectedSession } = useSession();
    const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalAgents: 0,
        totalStaff: 0,
        totalApplications: 0,
        pendingApplications: 0,
        draftApplications: 0,
        submittedApplications: 0,
        underReviewApplications: 0,
        rejectedApplications: 0
    });
    const [studentTableFilter, setStudentTableFilter] = useState('all');

    // Students table state (copied from StudentManagement)
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCourse, setFilterCourse] = useState('all');
    const [filterSubmitterRole, setFilterSubmitterRole] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({});
    const [statusData, setStatusData] = useState({
        status: '',
        notes: '',
        rejectionReason: '',
        rejectionMessage: '',
        rejectionDetails: []
    });
    const [showRejectionForm, setShowRejectionForm] = useState(false);
    const [filters, setFilters] = useState({
        statuses: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETE'],
        courses: ['Bachelor of Technology', 'Bachelor of Commerce', 'Bachelor of Arts', 'Bachelor of Science'],
        submitters: []
    });
    const [selectedStudents, setSelectedStudents] = useState([]);
    const isSuperAdmin = user?.role === 'super_admin';

    const sidebarItems = [
        {
            id: 'dashboard',
            name: 'Dashboard',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
            )
        },
        {
            id: 'students',
            name: 'Students',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
            )
        },
        {
            id: 'agents',
            name: 'Agents',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            id: 'staff',
            name: 'Staff',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            id: 'new-registration',
            name: 'New Registration',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            )
        },
        {
            id: 'application-review',
            name: 'Application Review',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 'website-management',
            name: 'Website Management',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
            )
        }
    ];

    useEffect(() => {
        const fetchAdminData = async (session = selectedSession) => {
            try {
                setLoading(true);
                const statsRes = await api.get(`/api/admin/dashboard/stats?session=${encodeURIComponent(session)}`);

                if (statsRes.data?.success) {
                    setStats(statsRes.data.data);
                }
            } catch (error) {
                console.error('Error fetching admin data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData(selectedSession);
    }, [selectedSession]);

    // Reset to page 1 when session changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedSession]);

    // Fetch students for the table
    useEffect(() => {
        if (activeSidebarItem === 'dashboard') {
            fetchStudents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm, filterStatus, filterCourse, filterSubmitterRole, selectedSession, activeSidebarItem]);

    const fetchStudents = async () => {
        try {
            setStudentsLoading(true);

            if (!selectedSession) {
                console.error('❌ No session selected!');
                setStudents([]);
                setTotalItems(0);
                return;
            }

            const params = new URLSearchParams({
                page: currentPage,
                limit: 20,
                session: selectedSession,
                sortBy: 'createdAt',
                sortOrder: 'desc', // Latest first (newest on top)
                ...(searchTerm && { search: searchTerm }),
                ...(filterStatus !== 'all' && { status: filterStatus }),
                ...(filterCourse !== 'all' && { course: filterCourse }),
                ...(filterSubmitterRole !== 'all' && { submitterRole: filterSubmitterRole })
            });

            const response = await api.get(`/api/admin/students?${params}`);

            if (response.data.success) {
                let studentsData = response.data.data.students || [];

                // Frontend sorting fallback: Sort by latest time (newest first)
                studentsData = [...studentsData].sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0);
                    const dateB = new Date(b.createdAt || 0);
                    return dateB - dateA; // Descending (newest first)
                });

                setStudents(studentsData);
                const pagination = response.data.data.pagination || {};
                setTotalPages(pagination.totalPages || 1);
                setTotalItems(pagination.totalItems || 0);
                setItemsPerPage(pagination.itemsPerPage || 20);
                setFilters(response.data.data.filters || {
                    statuses: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
                    courses: [],
                    categories: [],
                    submitters: []
                });
            } else {
                throw new Error(response.data.message || 'Failed to fetch students');
            }
        } catch (error) {
            console.error('❌ Error fetching students:', error);
            setStudents([]);
            setTotalPages(1);
            setTotalItems(0);
            setItemsPerPage(20);
        } finally {
            setStudentsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'SUBMITTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'DRAFT': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
            case 'CANCELLED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
            case 'COMPLETE': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedStudents(students.map(student => student._id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (studentId, checked) => {
        if (checked) {
            setSelectedStudents([...selectedStudents, studentId]);
        } else {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        }
    };

    const handleAcceptApplication = async (student) => {
        try {
            showLoading('Accepting application...');
            const response = await api.put(`/api/admin/students/${student._id}/status`, {
                status: 'APPROVED',
                notes: 'Application approved by admin'
            });
            closeLoading();
            showSuccess(`${student.fullName}'s application has been approved!`);
            fetchStudents();
        } catch (error) {
            closeLoading();
            handleApiError(error);
        }
    };

    const handleStudentUpdate = (updatedStudent) => {
        // Refresh dashboard stats when a new student is registered
        if (updatedStudent) {
            showSuccessToast('Student registered successfully!');

            // Refresh stats
            const fetchAdminData = async () => {
                try {
                    const statsRes = await api.get(`/api/admin/dashboard/stats?session=${encodeURIComponent(selectedSession)}`);
                    if (statsRes.data?.success) {
                        setStats(statsRes.data.data);
                    }
                } catch (error) {
                    console.error('Error refreshing admin data:', error);
                }
            };

            fetchAdminData();

            // Optionally switch to students tab to see the new registration
            // setActiveSidebarItem('students');
        }
    };

    const handleStatClick = (filter) => {
        setStudentTableFilter(filter);
    };

    const renderSidebarContent = () => {
        switch (activeSidebarItem) {
            case 'dashboard':
                return (
                    <div className="space-y-6 bg-transparent">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Super Admin Dashboard</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.fullName || 'Admin'}</p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div
                                onClick={() => setActiveSidebarItem('students')}
                                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                            >
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</p>
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalStudents}</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                onClick={() => setActiveSidebarItem('agents')}
                                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all duration-200"
                            >
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Agents</p>
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalAgents}</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                onClick={() => setActiveSidebarItem('staff')}
                                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200"
                            >
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Staff</p>
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalStaff}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center">
                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                        <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Applications</p>
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.pendingApplications}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filter Buttons */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3 mt-6">
                            <button
                                onClick={() => handleStatClick('DRAFT')}
                                className={`px-2 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${studentTableFilter === 'DRAFT'
                                    ? 'bg-gray-600 text-white shadow-lg'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-medium mb-0.5">Draft</span>
                                    <span className="text-base font-semibold">{stats.draftApplications || 0}</span>
                                </div>
                            </button>

                            <button
                                onClick={() => handleStatClick('SUBMITTED')}
                                className={`px-2 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${studentTableFilter === 'SUBMITTED'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-blue-100 dark:bg-gray-700 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-medium mb-0.5">Submitted</span>
                                    <span className="text-base font-semibold">{stats.submittedApplications || 0}</span>
                                </div>
                            </button>

                            <button
                                onClick={() => handleStatClick('UNDER_REVIEW')}
                                className={`px-2 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${studentTableFilter === 'UNDER_REVIEW'
                                    ? 'bg-yellow-600 text-white shadow-lg'
                                    : 'bg-yellow-100 dark:bg-gray-700 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-medium mb-0.5">Under Review</span>
                                    <span className="text-base font-semibold">{stats.underReviewApplications || 0}</span>
                                </div>
                            </button>

                            <button
                                onClick={() => handleStatClick('APPROVED')}
                                className={`px-2 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${studentTableFilter === 'APPROVED'
                                    ? 'bg-green-600 text-white shadow-lg'
                                    : 'bg-green-100 dark:bg-gray-700 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-medium mb-0.5">Approved</span>
                                    <span className="text-base font-semibold">{stats.approvedApplications || 0}</span>
                                </div>
                            </button>

                            <button
                                onClick={() => handleStatClick('REJECTED')}
                                className={`px-2 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${studentTableFilter === 'REJECTED'
                                    ? 'bg-red-600 text-white shadow-lg'
                                    : 'bg-red-100 dark:bg-gray-700 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-medium mb-0.5">Rejected</span>
                                    <span className="text-base font-semibold">{stats.rejectedApplications || 0}</span>
                                </div>
                            </button>

                            <button
                                onClick={() => handleStatClick('COMPLETE')}
                                className={`px-2 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${studentTableFilter === 'COMPLETE'
                                    ? 'bg-emerald-600 text-white shadow-lg'
                                    : 'bg-emerald-100 dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-medium mb-0.5">Complete</span>
                                    <span className="text-base font-semibold">{stats.completeApplications || 0}</span>
                                </div>
                            </button>
                        </div>

                        {/* Students Table - Step One */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            Recent Students
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            View and manage all student applications
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {totalItems > 0 ? (
                                            <>
                                                {totalItems} {totalItems === 1 ? 'Student' : 'Students'}
                                                {totalPages > 1 && (
                                                    <span className="ml-2 text-gray-400">
                                                        (Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems})
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            'No students found'
                                        )}
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    <input
                                        type="text"
                                        placeholder="Search by name, Aadhar, phone, email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="all">Total Students</option>
                                        {(filters.statuses || []).map(status => {
                                            const statusLabels = {
                                                'DRAFT': 'Draft',
                                                'SUBMITTED': 'Submitted',
                                                'UNDER_REVIEW': 'Under Review',
                                                'APPROVED': 'Approved',
                                                'REJECTED': 'Rejected',
                                                'COMPLETE': 'Complete'
                                            };
                                            return (
                                                <option key={status} value={status}>{statusLabels[status] || status}</option>
                                            );
                                        })}
                                    </select>
                                    <select
                                        value={filterCourse}
                                        onChange={(e) => setFilterCourse(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="all">All Courses</option>
                                        {(filters.courses || []).map(course => (
                                            <option key={course} value={course}>{course}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={filterSubmitterRole}
                                        onChange={(e) => setFilterSubmitterRole(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="all">All Submitters</option>
                                        <option value="student">Student</option>
                                        <optgroup label="Agents">
                                            {(filters.submitters || [])
                                                .filter(s => s.role === 'agent')
                                                .map(submitter => (
                                                    <option key={submitter.id} value={submitter.id}>
                                                        {submitter.name} ({submitter.count} submissions)
                                                    </option>
                                                ))}
                                        </optgroup>
                                        <optgroup label="Staff">
                                            {(filters.submitters || [])
                                                .filter(s => s.role === 'staff')
                                                .map(submitter => (
                                                    <option key={submitter.id} value={submitter.id}>
                                                        {submitter.name} ({submitter.count} submissions)
                                                    </option>
                                                ))}
                                        </optgroup>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>

                                {/* Students Table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                {isSuperAdmin && (
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStudents.length === students.length && students.length > 0}
                                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                        />
                                                    </th>
                                                )}
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    S.No
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Student
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Aadhar
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Phone
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Course
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Submitted By
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {studentsLoading ? (
                                                <tr>
                                                    <td colSpan={isSuperAdmin ? "10" : "9"} className="px-6 py-12 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : students.length === 0 ? (
                                                <tr>
                                                    <td colSpan={isSuperAdmin ? "10" : "9"} className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <svg className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                            </svg>
                                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                                No students found
                                                            </h3>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                                {searchTerm || filterStatus !== 'all' || filterCourse !== 'all' || filterSubmitterRole !== 'all'
                                                                    ? 'Try adjusting your search criteria or filters.'
                                                                    : selectedSession
                                                                        ? `No admissions found for the ${selectedSession} academic session.`
                                                                        : 'No student applications have been submitted yet.'}
                                                            </p>
                                                            {(searchTerm || filterStatus !== 'all' || filterCourse !== 'all' || filterSubmitterRole !== 'all') && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSearchTerm('');
                                                                        setFilterStatus('all');
                                                                        setFilterCourse('all');
                                                                        setFilterSubmitterRole('all');
                                                                    }}
                                                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                                                >
                                                                    Clear Filters
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                students.map((student, index) => {
                                                    const serialNumber = ((currentPage - 1) * itemsPerPage) + index + 1;
                                                    return (
                                                        <motion.tr
                                                            key={student._id}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                        >
                                                            {isSuperAdmin && (
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedStudents.includes(student._id)}
                                                                        onChange={(e) => handleSelectStudent(student._id, e.target.checked)}
                                                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                                    />
                                                                </td>
                                                            )}
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                                                                {serialNumber}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="flex-shrink-0 h-10 w-10">
                                                                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                                                            <span className="text-sm font-medium text-purple-600 dark:text-purple-300">
                                                                                {student.fullName?.split(' ').map(n => n[0]).join('') || 'S'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="ml-4">
                                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                            {student.fullName}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                            ID: {student.applicationId}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono">
                                                                {student.aadharNumber}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                {student.phone}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                {student.email}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                {student.course}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                                                                    {student.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                <div className="text-sm">
                                                                    {(() => {
                                                                        let submitterName = 'Direct';
                                                                        if (student.referredBy && student.referredBy !== 'Direct' && student.referredBy !== 'Unknown' && student.referredBy.trim() !== '') {
                                                                            submitterName = student.referredBy.trim();
                                                                        } else if (student.submittedBy && student.submittedBy.fullName) {
                                                                            submitterName = student.submittedBy.fullName.trim();
                                                                        }
                                                                        const role = student.submitterRole || 'student';
                                                                        const roleCapitalized = role.charAt(0).toUpperCase() + role.slice(1);
                                                                        return submitterName && submitterName !== 'Direct' && submitterName !== 'Unknown' && submitterName.trim() !== ''
                                                                            ? `${submitterName} (${roleCapitalized})`
                                                                            : `Direct (${roleCapitalized})`;
                                                                    })()}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedStudent(student);
                                                                            setShowDetailsModal(true);
                                                                        }}
                                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                                        title="View Details"
                                                                    >
                                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                        </svg>
                                                                    </button>
                                                                    {(student.status === 'SUBMITTED' || student.status === 'UNDER_REVIEW') && (
                                                                        <button
                                                                            onClick={() => handleAcceptApplication(student)}
                                                                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                                            title="Accept Application"
                                                                        >
                                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        </button>
                                                                    )}
                                                                    {(student.status === 'SUBMITTED' || student.status === 'UNDER_REVIEW') && (
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedStudent(student);
                                                                                setStatusData({
                                                                                    status: 'REJECTED',
                                                                                    notes: '',
                                                                                    rejectionReason: '',
                                                                                    rejectionMessage: '',
                                                                                    rejectionDetails: []
                                                                                });
                                                                                setShowRejectionForm(true);
                                                                                setShowStatusModal(true);
                                                                            }}
                                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                                            title="Reject Application"
                                                                        >
                                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                            </svg>
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedStudent(student);
                                                                            setStatusData({ status: student.status, notes: '' });
                                                                            setShowStatusModal(true);
                                                                        }}
                                                                        className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                                                                        title="Update Status"
                                                                    >
                                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedStudent(student);
                                                                            setEditData({
                                                                                personalDetails: student.personalDetails || {},
                                                                                contactDetails: student.contactDetails || {},
                                                                                courseDetails: student.courseDetails || {},
                                                                                guardianDetails: student.guardianDetails || {}
                                                                            });
                                                                            setShowEditModal(true);
                                                                        }}
                                                                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                                        title="Edit"
                                                                    >
                                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} students
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                                            >
                                                Previous
                                            </button>
                                            <div className="flex space-x-1">
                                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i;
                                                    } else {
                                                        pageNum = currentPage - 2 + i;
                                                    }
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => setCurrentPage(pageNum)}
                                                            className={`px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm ${currentPage === pageNum
                                                                ? 'bg-purple-600 text-white border-purple-600'
                                                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                    </div>
                );
            case 'students':
                return (
                    <div className="dark:text-gray-100">
                        <ErrorBoundary>
                            <StudentManagement />
                        </ErrorBoundary>
                    </div>
                );
            case 'agents':
                return (
                    <div className="dark:text-gray-100">
                        <UserManagement userType="agents" rowHoverClass="dark:hover:bg-gray-700 hover:bg-gray-50" />
                    </div>
                );
            case 'staff':
                return (
                    <div className="dark:text-gray-100">
                        <UserManagement userType="staff" rowHoverClass="dark:hover:bg-gray-700 hover:bg-gray-50" />
                    </div>
                );
            case 'new-registration':
                return (
                    <ErrorBoundary>
                        <StudentRegistrationWorkflow onStudentUpdate={handleStudentUpdate} />
                    </ErrorBoundary>
                );
            case 'application-review':
                return <ApplicationReview />;
            case 'website-management':
                return (
                    <ErrorBoundary>
                        <WebsiteManagement />
                    </ErrorBoundary>
                );
            default:
                return <div>Coming Soon...</div>;
        }
    };

    if (loading) {
        return (
            <DashboardLayout
                activeItem={activeSidebarItem}
                onItemClick={setActiveSidebarItem}
                sidebarItems={sidebarItems}
            >
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            activeItem={activeSidebarItem}
            onItemClick={setActiveSidebarItem}
            sidebarItems={sidebarItems}
        >
            {renderSidebarContent()}
        </DashboardLayout>
    );
};

export default SuperAdminDashboard;