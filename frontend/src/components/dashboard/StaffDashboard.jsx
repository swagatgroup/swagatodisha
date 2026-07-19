import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSession } from '../../contexts/SessionContext';
import DashboardLayout from './DashboardLayout';
import StudentRegistration from './tabs/StudentRegistration';
import StudentRegistrationWorkflow from './tabs/StudentRegistrationWorkflow';
// StaffApplicationsReview removed - Socket.IO component
import ApplicationReview from './tabs/ApplicationReview';
import PaymentManagement from './tabs/PaymentManagement';
// RealTimeStudentTracking removed - Socket.IO component
import StudentTable from './components/StudentTable';
import StudentManagement from '../admin/StudentManagement';
import ProgressPieChart from './ProgressPieChart';
import api from '../../utils/api';
import ReferralDashboard from './tabs/ReferralDashboard';
import {
    showSuccess,
    showError,
    showLoading,
    closeLoading,
    handleApiError
} from '../../utils/sweetAlert';

const EnhancedStaffDashboard = () => {
    const { user } = useAuth();
    const { selectedSession } = useSession();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [studentTableFilter, setStudentTableFilter] = useState('all');
    const [students, setStudents] = useState([]);
    const [statModalOpen, setStatModalOpen] = useState(false);
    const [selectedStatKey, setSelectedStatKey] = useState(null);

    // Students table state (for dashboard table)
    const [dashboardStudents, setDashboardStudents] = useState([]);
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

    const [studentView, setStudentView] = useState('combined'); // 'combined' | 'direct' | 'our'
    const [processingStats, setProcessingStats] = useState({
        totalStudents: 0,
        pendingVerification: 0,
        approvedInSession: 0,
        rejectedInSession: 0,
        completedInSession: 0,
        draftInSession: 0,
        submittedInSession: 0,
        underReviewInSession: 0,
        session: 'Current',
        directStudents: { total: 0, draft: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0, complete: 0 },
        ourStudents:    { total: 0, draft: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0, complete: 0 },
    });
    const [agents, setAgents] = useState([]);

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
            id: 'student-management',
            name: 'Our Students',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13.5 4a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
            )
        },
        {
            id: 'direct-students',
            name: 'Direct Students',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            id: 'applications',
            name: 'Applications Review',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
            id: 'payment-management',
            name: 'Payments',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 'referrals',
            name: 'Refer & Earn',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
            )
        }
    ];

    const handleStatClick = (filterKey) => {
        if (studentView === 'combined' && filterKey !== 'all') {
            setSelectedStatKey(filterKey);
            setStatModalOpen(true);
            return;
        }

        // Navigate to student-management tab with the filter applied
        const newFilter = filterKey === 'all' ? 'all' : filterKey;
        setStudentTableFilter(newFilter);
        setFilterStatus(newFilter);
        setCurrentPage(1); // Reset to first page when filter changes
        setActiveTab('student-management');
    };

    // Reset filter when returning to dashboard
    useEffect(() => {
        if (activeTab === 'dashboard') {
            setStudentTableFilter('all');
            setFilterStatus('all');
        }
    }, [activeTab]);

    const refreshStats = async (session = selectedSession) => {
        try {
            console.log('🔄 Fetching stats for session:', session);
            const statsRes = await api.get(`/api/staff/processing-stats?session=${encodeURIComponent(session)}`);
            console.log('📊 Stats API Response:', statsRes.data);
            if (statsRes.data.success) {
                console.log('✅ Stats data:', statsRes.data.data);
                setProcessingStats(statsRes.data.data);
            } else {
                console.error('❌ Stats API returned success=false:', statsRes.data);
            }
        } catch (error) {
            console.error('❌ Error refreshing stats:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
        }
    };

    const loadDashboardData = async (session = selectedSession) => {
        try {
            setLoading(true);
            const [studentsRes, statsRes, agentsRes] = await Promise.all([
                api.get(`/api/staff/students?session=${encodeURIComponent(session)}`),
                api.get(`/api/staff/processing-stats?session=${encodeURIComponent(session)}`),
                api.get('/api/staff/agents')
            ]);

            if (studentsRes.data.success) {
                const studentsData = studentsRes.data.data.students || studentsRes.data.data;
                setStudents(Array.isArray(studentsData) ? studentsData : []);
            }

            if (statsRes.data.success) {
                setProcessingStats(statsRes.data.data);
            }

            if (agentsRes.data.success) {
                setAgents(agentsRes.data.data);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStudentUpdate = (updatedStudent) => {
        setStudents(prev => {
            if (!Array.isArray(prev)) return [];
            return prev.map(student =>
                student._id === updatedStudent._id ? updatedStudent : student
            );
        });

        // Refresh stats when student is updated
        refreshStats();
    };

    useEffect(() => {
        loadDashboardData(selectedSession);
    }, [selectedSession]);

    // Refresh stats when switching back to dashboard tab
    useEffect(() => {
        if (activeTab === 'dashboard') {
            refreshStats(selectedSession);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, selectedSession]);

    // Reset to page 1 when session changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedSession]);

    // Fetch students for the dashboard table
    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchDashboardStudents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm, filterStatus, filterCourse, filterSubmitterRole, selectedSession, activeTab]);

    const fetchDashboardStudents = async () => {
        try {
            setStudentsLoading(true);

            if (!selectedSession) {
                console.error('❌ No session selected!');
                setDashboardStudents([]);
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

                setDashboardStudents(studentsData);
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
            setDashboardStudents([]);
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
            setSelectedStudents(dashboardStudents.map(student => student._id));
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
            fetchDashboardStudents();
        } catch (error) {
            closeLoading();
            handleApiError(error);
        }
    };


    const renderDashboardContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <>
                        {/* Welcome Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white mb-6"
                        >
                            <div>
                                <h2 className="text-2xl font-bold mb-2">
                                    Welcome back, {user?.fullName}! 👋
                                </h2>
                                <p className="text-green-100">
                                    Process student applications, verify documents, and manage academic content.
                                </p>
                            </div>
                        </motion.div>



                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="mb-8 w-full lg:w-1/2 mx-auto"
                        >
                        {/* ── Student View Toggle ── */}
                        {(() => {
                            const viewData = {
                                combined: {
                                    total:       processingStats.totalStudents,
                                    draft:       processingStats.draftInSession,
                                    submitted:   processingStats.submittedInSession,
                                    underReview: processingStats.underReviewInSession,
                                    approved:    processingStats.approvedInSession,
                                    rejected:    processingStats.rejectedInSession,
                                    complete:    processingStats.completedInSession,
                                },
                                direct: processingStats.directStudents || {},
                                our:    processingStats.ourStudents    || {},
                            };
                            const active = viewData[studentView] || {};
                            return (
                                <div>
                                    {/* View Toggle Tabs */}
                                    <div className="flex gap-2 mb-4 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl w-fit">
                                        {[['combined','Dashboard'],['our','Our Students'],['direct','Direct Students']].map(([key, label]) => (
                                            <button
                                                key={key}
                                                onClick={() => setStudentView(key)}
                                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                                    studentView === key
                                                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-md'
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>

                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                        {studentView === 'combined' && 'All students in this session.'}
                                        {studentView === 'direct'   && 'Students who self-registered or used a student referral code.'}
                                        {studentView === 'our'      && 'Students registered via dashboard or via staff/agent/admin referral codes.'}
                                    </p>

                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center shadow-sm">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{active.total || 0}</p>
                                        </div>
                                        <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3 border border-teal-200 dark:border-teal-800 text-center shadow-sm">
                                            <p className="text-xs text-teal-600 dark:text-teal-400">Approved</p>
                                            <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{active.approved || 0}</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-800 text-center shadow-sm">
                                            <p className="text-xs text-blue-600 dark:text-blue-400">Submitted</p>
                                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{active.submitted || 0}</p>
                                        </div>
                                    </div>

                                    {/* Pie Chart */}
                                    <div className="mb-8 w-full lg:w-1/2 mx-auto">
                                        <ProgressPieChart
                                            chartData={[
                                                { label: 'Draft',        value: active.draft       || 0, color: '#6B7280', filterKey: 'DRAFT' },
                                                { label: 'Submitted',    value: active.submitted   || 0, color: '#6366F1', filterKey: 'SUBMITTED' },
                                                { label: 'Rejected',     value: active.rejected    || 0, color: '#EF4444', filterKey: 'REJECTED' },
                                                { label: 'Under Review', value: active.underReview || 0, color: '#EAB308', filterKey: 'UNDER_REVIEW' },
                                                { label: 'Approved',     value: active.approved    || 0, color: '#14B8A6', filterKey: 'APPROVED' },
                                                { label: 'Completed',    value: active.complete    || 0, color: '#22C55E', filterKey: 'COMPLETE' },
                                            ]}
                                            onSectionClick={handleStatClick}
                                        />
                                    </div>

                                    {/* Status Filter Buttons */}
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3 mt-2">
                                        {[
                                            { key: 'DRAFT',        label: 'Draft',        count: active.draft,        activeClass: 'bg-gray-600 text-white',   inactiveClass: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200' },
                                            { key: 'SUBMITTED',    label: 'Submitted',    count: active.submitted,    activeClass: 'bg-indigo-600 text-white',   inactiveClass: 'bg-indigo-100 dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200' },
                                            { key: 'REJECTED',     label: 'Rejected',     count: active.rejected,     activeClass: 'bg-red-600 text-white',    inactiveClass: 'bg-red-100 dark:bg-gray-700 text-red-700 dark:text-red-300 hover:bg-red-200' },
                                            { key: 'UNDER_REVIEW', label: 'Under Review', count: active.underReview,  activeClass: 'bg-yellow-600 text-white', inactiveClass: 'bg-yellow-100 dark:bg-gray-700 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200' },
                                            { key: 'APPROVED',     label: 'Approved',     count: active.approved,     activeClass: 'bg-teal-500 text-white',  inactiveClass: 'bg-teal-100 dark:bg-gray-700 text-teal-700 dark:text-teal-300 hover:bg-teal-200' },
                                            { key: 'COMPLETE',     label: 'Complete',     count: active.complete,     activeClass: 'bg-green-600 text-white',inactiveClass: 'bg-green-100 dark:bg-gray-700 text-green-800 dark:text-green-200 hover:bg-green-200' },
                                        ].map(({ key, label, count, activeClass, inactiveClass }) => (
                                            <button
                                                key={key}
                                                onClick={() => handleStatClick(key)}
                                                className={`px-2 py-2 rounded-lg font-medium transition-all duration-200 text-sm shadow-sm ${
                                                    filterStatus === key ? activeClass + ' shadow-lg' : inactiveClass
                                                }`}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-medium mb-0.5">{label}</span>
                                                    <span className="text-base font-semibold">{count || 0}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                        </motion.div>

                        {/* Students Table */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
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
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="all">All Courses</option>
                                        {(filters.courses || []).map(course => (
                                            <option key={course} value={course}>{course}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={filterSubmitterRole}
                                        onChange={(e) => setFilterSubmitterRole(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                                    <td colSpan="9" className="px-6 py-12 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : dashboardStudents.length === 0 ? (
                                                <tr>
                                                    <td colSpan="9" className="px-6 py-12 text-center">
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
                                                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                                                >
                                                                    Clear Filters
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                dashboardStudents.map((student, index) => {
                                                    const serialNumber = ((currentPage - 1) * itemsPerPage) + index + 1;
                                                    return (
                                                        <motion.tr
                                                            key={student._id}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                                                                {serialNumber}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="flex-shrink-0 h-10 w-10">
                                                                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                                                            <span className="text-sm font-medium text-green-600 dark:text-green-300">
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

                                                                    {/* Staff can only edit when status is UNDER_REVIEW */}
                                                                    {student.status === 'UNDER_REVIEW' && (
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
                                                                    )}
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
                                                                ? 'bg-green-600 text-white border-green-600'
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
                    </>
                );
            case 'student-management':
                return <StudentManagement initialFilter={studentTableFilter} listType="main" />;
            case 'direct-students':
                return <StudentManagement initialFilter={studentTableFilter} listType="direct" />;
            case 'applications':
                return <ApplicationReview />;
            case 'payment-management':
                return <PaymentManagement />;
            case 'new-registration':
                return <StudentRegistrationWorkflow onStudentUpdate={handleStudentUpdate} />;
            case 'referrals':
                return <ReferralDashboard />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <DashboardLayout
                title="Staff Dashboard"
                sidebarItems={sidebarItems}
                activeItem={activeTab}
                onItemClick={setActiveTab}
            >
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Staff Dashboard"
            sidebarItems={sidebarItems}
            activeItem={activeTab}
            onItemClick={setActiveTab}
        >
            {renderDashboardContent()}
            
            {/* Stat Split Modal */}
            {statModalOpen && selectedStatKey && (
                <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setStatModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4" id="modal-title">
                                            Select Category for {selectedStatKey.replace('_', ' ')}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button 
                                                onClick={() => {
                                                    setStudentView('direct');
                                                    setFilterStatus(selectedStatKey);
                                                    setCurrentPage(1);
                                                    setActiveTab('direct-students');
                                                    setStatModalOpen(false);
                                                }}
                                                className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                    {processingStats.directStudents[selectedStatKey === 'UNDER_REVIEW' ? 'underReview' : selectedStatKey.toLowerCase()] || 0}
                                                </span>
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">Direct Students</span>
                                            </button>
                                            
                                            <button 
                                                onClick={() => {
                                                    setStudentView('our');
                                                    setFilterStatus(selectedStatKey);
                                                    setCurrentPage(1);
                                                    setActiveTab('student-management');
                                                    setStatModalOpen(false);
                                                }}
                                                className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                    {processingStats.ourStudents[selectedStatKey === 'UNDER_REVIEW' ? 'underReview' : selectedStatKey.toLowerCase()] || 0}
                                                </span>
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">Our Students</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button 
                                    type="button" 
                                    onClick={() => setStatModalOpen(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default EnhancedStaffDashboard;
