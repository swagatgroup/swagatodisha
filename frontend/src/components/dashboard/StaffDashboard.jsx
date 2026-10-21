import { useState, useEffect } from 'react';
import StatusFilterRow from './components/StatusFilterRow';
import { APPLICATION_STATUS_OPTIONS, buildStatusChartData, getApplicationStatusLabel } from '../../utils/applicationStatuses';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Squares2X2Icon, UsersIcon, UserGroupIcon, UserPlusIcon, ClipboardDocumentCheckIcon, CreditCardIcon, KeyIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContextSimple';
import { useSession } from '../../contexts/SessionContext';
import DashboardLayout from './DashboardLayout';
import UserManagement from '../admin/UserManagement';
import StudentManagement from '../admin/StudentManagement';
import StudentPasswordReset from '../admin/StudentPasswordReset';
import ErrorBoundary from '../common/ErrorBoundary';
import StudentRegistrationWorkflow from './tabs/StudentRegistrationWorkflow';
import ApplicationReview from './tabs/ApplicationReview';
import PaymentManagement from './tabs/PaymentManagement';
import ProgressPieChart from './ProgressPieChart';
import PaymentPieChart from './PaymentPieChart';
import {
    showSuccess,
    showError,
    showLoading,
    closeLoading,
    handleApiError,
    showSuccessToast,
} from '../../utils/sweetAlert';
import api from '../../utils/api';

const EnhancedStaffDashboard = () => {
    const { user } = useAuth();
    const { isDarkMode } = useDarkMode();
    const { selectedSession, courseFilterKey, courseFilterParams } = useSession();
    const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [studentView, setStudentView] = useState('combined');
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalAgents: 0,
        totalApplications: 0,
        pendingApplications: 0,
        draftApplications: 0,
        submittedApplications: 0,
        underReviewApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        completeApplications: 0,
        directStudents: { total: 0, draft: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0, complete: 0 },
        ourStudents:    { total: 0, draft: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0, complete: 0 },
        referralStats: null,
        paymentStats: null,
        agentMembers: [],
    });
    const [studentTableFilter, setStudentTableFilter] = useState('all');
    const [scopedAgentId, setScopedAgentId] = useState(null);
    const [statModalOpen, setStatModalOpen] = useState(false);
    const [selectedStatKey, setSelectedStatKey] = useState(null);

    // Dashboard table state
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCourse, setFilterCourse] = useState('all');
    const [filterSubmitterRole, setFilterSubmitterRole] = useState('all');
    const [filterAgentId, setFilterAgentId] = useState(null);
    const [filterReferralType, setFilterReferralType] = useState('all');
    const [sortBy, setSortBy] = useState('latest');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showRejectionForm, setShowRejectionForm] = useState(false);
    const [statusData, setStatusData] = useState({
        status: '',
        notes: '',
        rejectionReason: '',
        rejectionMessage: '',
        rejectionDetails: []
    });
    const [editData, setEditData] = useState({});
    const [filters, setFilters] = useState({
        statuses: ['DRAFT', 'SUBMITTED', 'REJECTED', 'UNDER_REVIEW', 'APPROVED', 'COMPLETE'],
        courses: [],
        submitters: []
    });

    const sidebarItems = [
        { id: 'dashboard',              name: 'Dashboard',              icon: <Squares2X2Icon className="mr-3 h-5 w-5" /> },
        { id: 'students',               name: 'Our Students',           icon: <UsersIcon className="mr-3 h-5 w-5" /> },
        { id: 'direct-students',        name: 'Direct Students',        icon: <UserPlusIcon className="mr-3 h-5 w-5" /> },
        { id: 'agents',                 name: 'Agents',                 icon: <UserGroupIcon className="mr-3 h-5 w-5" /> },
        { id: 'new-registration',       name: 'New Registration',       icon: <DocumentTextIcon className="mr-3 h-5 w-5" /> },
        { id: 'application-review',     name: 'Application Review',     icon: <ClipboardDocumentCheckIcon className="mr-3 h-5 w-5" /> },
        { id: 'payment-management',     name: 'Payments',               icon: <CreditCardIcon className="mr-3 h-5 w-5" /> },
        { id: 'student-password-reset', name: 'Student Password Reset', icon: <KeyIcon className="mr-3 h-5 w-5" /> },
    ];

    const fetchStats = async (session) => {
        try {
            setLoading(true);
            const statsRes = await api.get(`/api/admin/dashboard/stats?session=${encodeURIComponent(session)}${courseFilterKey ? `&${courseFilterKey}` : ''}`);
            if (statsRes.data && statsRes.data.success) {
                setStats(statsRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching staff dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedSession) fetchStats(selectedSession);
    }, [selectedSession, courseFilterKey]);

    useEffect(() => { setCurrentPage(1); }, [selectedSession, courseFilterKey]);

    useEffect(() => {
        if (activeSidebarItem === 'dashboard') {
            fetchStudents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm, filterStatus, filterCourse, filterSubmitterRole, filterAgentId, filterReferralType, sortBy, selectedSession, courseFilterKey, activeSidebarItem, studentView]);

    useEffect(() => {
        if (activeSidebarItem === 'dashboard') {
            setStudentTableFilter('all');
            setFilterStatus('all');
        }
    }, [activeSidebarItem]);

    const fetchStudents = async () => {
        try {
            setStudentsLoading(true);
            if (!selectedSession) { setStudents([]); setTotalItems(0); return; }

            let backendSortBy = 'createdAt';
            let backendSortOrder = 'desc';
            if (sortBy === 'oldest') { backendSortOrder = 'asc'; }
            else if (sortBy === 'name_asc') { backendSortBy = 'personalDetails.fullName'; backendSortOrder = 'asc'; }
            else if (sortBy === 'name_desc') { backendSortBy = 'personalDetails.fullName'; backendSortOrder = 'desc'; }

            const params = new URLSearchParams({
                page: currentPage,
                limit: 20,
                session: selectedSession,
                sortBy: backendSortBy,
                sortOrder: backendSortOrder,
            });
            if (searchTerm) params.append('search', searchTerm);
            if (filterStatus !== 'all') params.append('status', filterStatus);
            if (filterCourse !== 'all') params.append('course', filterCourse);
            if (filterSubmitterRole !== 'all' && !filterAgentId) params.append('submitterRole', filterSubmitterRole);
            if (filterAgentId) params.append('agentId', filterAgentId);
            if (filterReferralType !== 'all') params.append('referralType', filterReferralType);
            if (studentView === 'our') params.append('listType', 'main');
            if (studentView === 'direct') params.append('listType', 'direct');
            Object.entries(courseFilterParams).forEach(([k, v]) => params.append(k, v));

            const response = await api.get('/api/admin/students?' + params.toString());
            if (response.data.success) {
                setStudents(response.data.data.students || []);
                const pagination = response.data.data.pagination || {};
                setTotalPages(pagination.totalPages || 1);
                setTotalItems(pagination.totalItems || 0);
                setItemsPerPage(pagination.itemsPerPage || 20);
                setFilters(response.data.data.filters || {
                    statuses: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETE'],
                    courses: [],
                    submitters: []
                });
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setStudents([]);
            setTotalPages(1);
            setTotalItems(0);
        } finally {
            setStudentsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED':     return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400';
            case 'SUBMITTED':    return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-[#60A5FA]';
            case 'UNDER_REVIEW': return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400';
            case 'REJECTED':     return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400';
            case 'DRAFT':        return 'bg-gray-100 dark:bg-gray-800/60 text-gray-800 dark:text-gray-300';
            case 'COMPLETE':     return 'bg-[#F0E6FA] text-purple-800 dark:bg-[#231A2E]/20 dark:text-[#9B6FCC]';
            default:             return 'bg-gray-100 dark:bg-gray-800/60 text-gray-800 dark:text-gray-300';
        }
    };

    const handleStatClick = (filter) => {
        if (studentView === 'combined') {
            setSelectedStatKey(filter);
            setStatModalOpen(true);
            return;
        }
        setStudentTableFilter(filter === 'all' ? 'all' : filter);
        setFilterStatus(filter === 'all' ? 'all' : filter);
        setSortBy('latest');
        setCurrentPage(1);
        if (studentView === 'our')    setActiveSidebarItem('students');
        if (studentView === 'direct') setActiveSidebarItem('direct-students');
    };

    const handleStudentUpdate = () => {
        showSuccessToast('Student registered successfully!');
        if (selectedSession) fetchStats(selectedSession);
        if (activeSidebarItem === 'dashboard') fetchStudents();
    };

    const handleEdit = async () => {
        try {
            showLoading('Updating student...');
            await api.put('/api/admin/students/' + selectedStudent._id, {
                personalDetails: editData.personalDetails || {},
                contactDetails:  editData.contactDetails  || {},
                courseDetails:   editData.courseDetails   || {},
                guardianDetails: editData.guardianDetails || {},
            });
            setShowEditModal(false);
            setEditData({});
            setSelectedStudent(null);
            closeLoading();
            showSuccess('Student updated successfully!');
            await fetchStudents();
            if (selectedSession) fetchStats(selectedSession);
        } catch (error) {
            closeLoading();
            handleApiError(error);
        }
    };

    const handleAcceptApplication = async (student) => {
        try {
            showLoading('Approving application...');
            await api.put(`/api/admin/students/${student._id}/status`, {
                status: 'APPROVED',
                notes: 'Application approved by staff'
            });
            closeLoading();
            showSuccess(`${student.fullName || (student.personalDetails && student.personalDetails.fullName) || 'Student'}'s application has been approved!`);
            fetchStudents();
            if (selectedSession) fetchStats(selectedSession);
        } catch (error) {
            closeLoading();
            handleApiError(error);
        }
    };

    const handleSubmitApplication = async (student) => {
        try {
            showLoading('Submitting application...');
            await api.put(`/api/admin/students/${student._id}/status`, {
                status: 'SUBMITTED',
                notes: 'Application moved to Submitted by staff'
            });
            closeLoading();
            showSuccess(`${student.fullName || (student.personalDetails && student.personalDetails.fullName) || 'Student'}'s application has been moved to Submitted!`);
            fetchStudents();
            if (selectedSession) fetchStats(selectedSession);
        } catch (error) {
            closeLoading();
            handleApiError(error);
        }
    };

    const handleCompleteApplication = async (student) => {
        try {
            showLoading('Marking application as complete...');
            await api.put(`/api/admin/students/${student._id}/status`, {
                status: 'COMPLETE',
                notes: 'Application marked as complete by staff'
            });
            closeLoading();
            showSuccess(`${student.fullName || (student.personalDetails && student.personalDetails.fullName) || 'Student'}'s application has been marked as Complete!`);
            fetchStudents();
            if (selectedSession) fetchStats(selectedSession);
        } catch (error) {
            closeLoading();
            handleApiError(error);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedStudent) return;
        if (!statusData.status) {
            showError('Please select a status');
            return;
        }
        if (statusData.status === 'REJECTED') {
            if (!statusData.rejectionReason) {
                showError('Please select a rejection reason');
                return;
            }
            if (!statusData.rejectionMessage) {
                showError('Please provide a rejection message');
                return;
            }
        }
        try {
            showLoading('Updating application status...');
            await api.put(`/api/admin/students/${selectedStudent._id}/status`, statusData);
            setShowStatusModal(false);
            setStatusData({
                status: '',
                notes: '',
                rejectionReason: '',
                rejectionMessage: '',
                rejectionDetails: []
            });
            setShowRejectionForm(false);
            setSelectedStudent(null);
            closeLoading();
            showSuccess(`Application status updated to ${statusData.status}!`);
            fetchStudents();
            if (selectedSession) fetchStats(selectedSession);
        } catch (error) {
            closeLoading();
            handleApiError(error);
        }
    };

    const addRejectionDetail = () => {
        setStatusData({
            ...statusData,
            rejectionDetails: [
                ...statusData.rejectionDetails,
                { issue: '', documentType: '', actionRequired: '', priority: 'High', specificFeedback: '' }
            ]
        });
    };

    const removeRejectionDetail = (index) => {
        setStatusData({
            ...statusData,
            rejectionDetails: statusData.rejectionDetails.filter((_, i) => i !== index)
        });
    };

    const updateRejectionDetail = (index, field, value) => {
        const newDetails = [...statusData.rejectionDetails];
        newDetails[index] = { ...newDetails[index], [field]: value };
        setStatusData({ ...statusData, rejectionDetails: newDetails });
    };

    const renderSidebarContent = () => {
        switch (activeSidebarItem) {

            case 'dashboard': {
                const viewData = {
                    combined: {
                        total: stats.totalStudents,
                        draft: stats.draftApplications,
                        submitted: stats.submittedApplications,
                        underReview: stats.underReviewApplications,
                        approved: stats.approvedApplications,
                        rejected: stats.rejectedApplications,
                        complete: stats.completeApplications,
                    },
                    direct: stats.directStudents || {},
                    our:    stats.ourStudents    || {},
                };
                const active = viewData[studentView] || viewData.combined;

                return (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Staff Dashboard</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Welcome back, {user && user.fullName ? user.fullName : 'Staff'}</p>
                        </div>

                        {/* Stats Cards - No "Total Staff" card for staff role */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div onClick={() => setActiveSidebarItem('students')} className="bg-white dark:bg-[#231A2E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer hover:shadow-md transition-all duration-300">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                        <svg className="h-6 w-6 text-[#4A1D7A] dark:text-[#9B6FCC]" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Students</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalStudents}</p>
                                    </div>
                                </div>
                            </div>

                            <div onClick={() => setActiveSidebarItem('agents')} className="bg-white dark:bg-[#231A2E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer hover:shadow-md transition-all duration-300">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                        <svg className="h-6 w-6 text-[#4A1D7A] dark:text-[#9B6FCC]" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
                                            <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 016.576-3.036c.32.32.61.666.868 1.042l-3.874-2.052z" />
                                            <path d="M18.918 14.254a8.287 8.287 0 011.308 5.135 9.687 9.687 0 001.764-.44l.115-.04a.563.563 0 00.373-.487l.01-.121a3.75 3.75 0 00-6.576-3.036c-.32.32-.61.666-.868 1.042l3.874-2.052z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">My Agents</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.agentMembers ? stats.agentMembers.length : 0}</p>
                                        <p className="text-xs text-gray-400 mt-1">Assigned to you</p>
                                    </div>
                                </div>
                            </div>

                            <div onClick={() => { setActiveSidebarItem('students'); setStudentView('our'); }} className="bg-white dark:bg-[#231A2E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer hover:shadow-md transition-all duration-300">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                        <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Referral Students</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                            {((stats.referralStats && stats.referralStats.agentReferred) || 0) + ((stats.referralStats && stats.referralStats.staffReferred) || 0) + ((stats.referralStats && stats.referralStats.superAdminReferred) || 0)}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-300 mt-1">
                                            {(stats.referralStats && stats.referralStats.agentReferred) || 0} agent &middot; {(stats.referralStats && stats.referralStats.staffReferred) || 0} staff
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* View Toggle */}
                        <div className="mt-2">
                            <div className="flex gap-2 mb-4 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl w-fit">
                                {[['combined','Dashboard'],['our','Our Students'],['direct','Direct Students']].map(function(item) {
                                    const key = item[0];
                                    const label = item[1];
                                    return (
                                        <button key={key} onClick={() => setStudentView(key)} className={'px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ' + (studentView === key ? 'bg-white dark:bg-[#231A2E] text-[#387B95] dark:text-[#60A5FA] shadow-md' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100')}>
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-300 mb-3">
                                {studentView === 'combined' ? 'Showing all students in this session.' : studentView === 'direct' ? 'Students who self-registered or used a student referral code.' : 'Students registered via dashboard by Staff or Agent.'}
                            </p>

                            {/* Status Filter Buttons */}
                            <StatusFilterRow counts={active} activeKey={filterStatus} onSelect={handleStatClick} />

                            {/* Charts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white dark:bg-[#231A2E] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 w-full text-center">Application Progress</h3>
                                    <div className="w-full max-w-sm">
                                        <ProgressPieChart
                                            chartData={buildStatusChartData(active)}
                                            onSectionClick={handleStatClick}
                                        />
                                    </div>
                                </div>
                                <div className="w-full flex justify-center items-center">
                                    <div className="w-full max-w-sm">
                                        <PaymentPieChart
                                            paymentStats={stats.paymentStats}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Referral Statistics */}
                        {stats.referralStats && studentView !== 'direct' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-4 mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Registration &amp; Referral Tracking</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    <div className={'bg-white dark:bg-[#231A2E] p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col justify-center items-center cursor-pointer hover:shadow-lg transition-shadow ' + (filterReferralType === 'self' ? 'ring-2 ring-orange-500' : '')} onClick={() => { setFilterReferralType(filterReferralType === 'self' ? 'all' : 'self'); setCurrentPage(1); }}>
                                        <p className="text-sm text-gray-500 dark:text-gray-300 font-medium text-center leading-tight">Direct/Self<br/>Registered</p>
                                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{(stats.referralStats && stats.referralStats.selfRegistered) || 0}</p>
                                    </div>
                                    <div className={'bg-white dark:bg-[#231A2E] p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col justify-center items-center cursor-pointer hover:shadow-lg transition-shadow ' + (filterReferralType === 'student' ? 'ring-2 ring-green-500' : '')} onClick={() => { setFilterReferralType(filterReferralType === 'student' ? 'all' : 'student'); setCurrentPage(1); }}>
                                        <p className="text-sm text-gray-500 dark:text-gray-300 font-medium text-center">Student</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{(stats.referralStats && stats.referralStats.studentReferred) || 0}</p>
                                    </div>
                                    <div className={'bg-white dark:bg-[#231A2E] p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col justify-center items-center cursor-pointer hover:shadow-lg transition-shadow ' + (filterReferralType === 'agent' ? 'ring-2 ring-blue-500' : '')} onClick={() => { setFilterReferralType(filterReferralType === 'agent' ? 'all' : 'agent'); setCurrentPage(1); }}>
                                        <p className="text-sm text-gray-500 dark:text-gray-300 font-medium text-center">Agent</p>
                                        <p className="text-2xl font-bold text-[#387B95] dark:text-[#60A5FA] mt-1">{(stats.referralStats && stats.referralStats.agentReferred) || 0}</p>
                                    </div>
                                    <div className={'bg-white dark:bg-[#231A2E] p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col justify-center items-center cursor-pointer hover:shadow-lg transition-shadow ' + (filterReferralType === 'staff' ? 'ring-2 ring-[#4A1D7A]' : '')} onClick={() => { setFilterReferralType(filterReferralType === 'staff' ? 'all' : 'staff'); setCurrentPage(1); }}>
                                        <p className="text-sm text-gray-500 dark:text-gray-300 font-medium text-center">Staff</p>
                                        <p className="text-2xl font-bold text-[#4A1D7A] dark:text-[#9B6FCC] mt-1">{(stats.referralStats && stats.referralStats.staffReferred) || 0}</p>
                                    </div>
                                    <div className={'bg-white dark:bg-[#231A2E] p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col justify-center items-center cursor-pointer hover:shadow-lg transition-shadow ' + (filterReferralType === 'super_admin' ? 'ring-2 ring-gray-900' : '')} onClick={() => { setFilterReferralType(filterReferralType === 'super_admin' ? 'all' : 'super_admin'); setCurrentPage(1); }}>
                                        <p className="text-sm text-gray-500 dark:text-gray-300 font-medium text-center">Super Admin</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{(stats.referralStats && stats.referralStats.superAdminReferred) || 0}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Agent Filter Buttons (only agents assigned to this staff) */}
                        {stats.agentMembers && stats.agentMembers.length > 0 && (
                            <div className="mt-8 mb-6">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3 uppercase tracking-wider">Filter by Agent</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {stats.agentMembers.map(function(agent) {
                                            const isActive = scopedAgentId === agent._id;
                                            return (
                                                <button
                                                    key={agent._id}
                                                    onClick={() => {
                                                        setScopedAgentId(isActive ? null : agent._id);
                                                        setStudentView('our');
                                                        setActiveSidebarItem('students');
                                                    }}
                                                    className={'flex-1 min-w-[140px] px-4 py-4 rounded-xl text-sm font-medium transition-all shadow-sm border ' + (isActive ? 'bg-[#387B95] text-white border-[#387B95] shadow-md' : 'bg-white dark:bg-[#231A2E] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 hover:border-blue-300')}
                                                >
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className={'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ' + (isActive ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600')}>
                                                            {agent.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-center text-xs leading-tight font-semibold line-clamp-2">{agent.name}</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* Recent Students - reuses the Our/Direct Students table */}
                        <ErrorBoundary>
                            <StudentManagement
                                listType={studentView === 'direct' ? 'direct' : studentView === 'our' ? 'main' : 'all'}
                                showListTypeFilter
                                pageSize={10}
                                title="Recent Students"
                                subtitle="Last registered students"
                            />
                        </ErrorBoundary>
                    </div>
                );
            }

            case 'students':
                return (
                    <div className="dark:text-gray-100">
                        {scopedAgentId && (
                            <div className="mb-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-2">
                                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Showing students scoped to selected agent</span>
                                <button onClick={function() { setScopedAgentId(null); }} className="text-xs text-blue-600 dark:text-blue-300 hover:underline ml-4">Clear filter</button>
                            </div>
                        )}
                        <ErrorBoundary>
                            <StudentManagement initialFilter={studentTableFilter} listType="main" agentId={scopedAgentId} />
                        </ErrorBoundary>
                    </div>
                );

            case 'direct-students':
                return (
                    <div className="dark:text-gray-100">
                        <ErrorBoundary>
                            <StudentManagement initialFilter={studentTableFilter} listType="direct" />
                        </ErrorBoundary>
                    </div>
                );

            case 'agents':
                return (
                    <div className="dark:text-gray-100">
                        <UserManagement
                            userType="agents"
                            rowHoverClass="dark:hover:bg-gray-700 hover:bg-gray-50"
                            onViewStudents={function(id) { setScopedAgentId(id); setActiveSidebarItem('students'); }}
                        />
                    </div>
                );

            case 'new-registration':
                return (
                    <ErrorBoundary>
                        <StudentRegistrationWorkflow onStudentUpdate={handleStudentUpdate} />
                    </ErrorBoundary>
                );

            case 'application-review':
                return <ApplicationReview userRole="staff" />;

            case 'payment-management':
                return <PaymentManagement />;

            case 'student-password-reset':
                return (
                    <div className="dark:text-gray-100">
                        <ErrorBoundary><StudentPasswordReset /></ErrorBoundary>
                    </div>
                );

            default:
                return <div className="text-gray-500 dark:text-gray-400 p-6">Coming Soon...</div>;
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Staff Dashboard" sidebarItems={sidebarItems} activeItem={activeSidebarItem} onItemClick={setActiveSidebarItem}>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A1D7A]"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Staff Dashboard" sidebarItems={sidebarItems} activeItem={activeSidebarItem} onItemClick={setActiveSidebarItem}>
            {renderSidebarContent()}

            {/* Stat Split Modal */}
            {statModalOpen && selectedStatKey && (
                <div className="fixed inset-0 z-[100] overflow-y-auto" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={function() { setStatModalOpen(false); }}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-[#231A2E] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white dark:bg-[#231A2E] px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                                    Select Category for {selectedStatKey === 'all' ? 'Total Students' : selectedStatKey.replace('_', ' ')}
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={function() { setStudentView('our'); setFilterStatus(selectedStatKey); setStudentTableFilter(selectedStatKey); setCurrentPage(1); setActiveSidebarItem('students'); setStatModalOpen(false); }} className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-[#D0E8F0] dark:hover:bg-gray-700 transition-colors">
                                        <span className="text-2xl font-bold text-[#387B95] dark:text-[#60A5FA]">{selectedStatKey === 'all' ? (stats.ourStudents && stats.ourStudents.total || 0) : (stats.ourStudents && stats.ourStudents[selectedStatKey === 'UNDER_REVIEW' ? 'underReview' : selectedStatKey.toLowerCase()] || 0)}</span>
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">Our Students</span>
                                    </button>
                                    <button onClick={function() { setStudentView('direct'); setFilterStatus(selectedStatKey); setStudentTableFilter(selectedStatKey); setCurrentPage(1); setActiveSidebarItem('direct-students'); setStatModalOpen(false); }} className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-[#F0E6FA] dark:hover:bg-gray-700 transition-colors">
                                        <span className="text-2xl font-bold text-[#4A1D7A] dark:text-[#9B6FCC]">{selectedStatKey === 'all' ? (stats.directStudents && stats.directStudents.total || 0) : (stats.directStudents && stats.directStudents[selectedStatKey === 'UNDER_REVIEW' ? 'underReview' : selectedStatKey.toLowerCase()] || 0)}</span>
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">Direct Students</span>
                                    </button>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button type="button" onClick={function() { setStatModalOpen(false); }} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-[#231A2E] text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Student Details Modal */}
            {showDetailsModal && selectedStudent && (
                <div className="fixed inset-0 z-50 overflow-y-auto" onClick={function() { setShowDetailsModal(false); }}>
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
                        <div className="relative bg-white dark:bg-[#231A2E] rounded-lg shadow-xl max-w-2xl w-full p-6 z-10" onClick={function(e) { e.stopPropagation(); }}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Student Details</h3>
                                <button onClick={function() { setShowDetailsModal(false); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="font-medium text-gray-500 dark:text-gray-400">Name:</span><p className="text-gray-900 dark:text-gray-100 mt-1">{selectedStudent.fullName || (selectedStudent.personalDetails && selectedStudent.personalDetails.fullName) || 'N/A'}</p></div>
                                <div><span className="font-medium text-gray-500 dark:text-gray-400">Application ID:</span><p className="text-gray-900 dark:text-gray-100 mt-1">{selectedStudent.applicationId}</p></div>
                                <div><span className="font-medium text-gray-500 dark:text-gray-400">Email:</span><p className="text-gray-900 dark:text-gray-100 mt-1">{selectedStudent.email}</p></div>
                                <div><span className="font-medium text-gray-500 dark:text-gray-400">Phone:</span><p className="text-gray-900 dark:text-gray-100 mt-1">{selectedStudent.phone}</p></div>
                                <div><span className="font-medium text-gray-500 dark:text-gray-400">Course:</span><p className="text-gray-900 dark:text-gray-100 mt-1">{selectedStudent.course || (selectedStudent.courseDetails && selectedStudent.courseDetails.selectedCourse) || 'N/A'}</p></div>
                                <div><span className="font-medium text-gray-500 dark:text-gray-400">Aadhar:</span><p className="text-gray-900 dark:text-gray-100 mt-1 font-mono">{selectedStudent.aadharNumber}</p></div>
                                <div><span className="font-medium text-gray-500 dark:text-gray-400">Status:</span><p className="mt-1"><span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' + getStatusColor(selectedStudent.status)}>{getApplicationStatusLabel(selectedStudent.status)}</span></p></div>
                            </div>
                            <div className="mt-6 flex flex-wrap gap-2 justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change Stage:</span>
                                    {selectedStudent.status === 'DRAFT' && (
                                        <button
                                            onClick={() => {
                                                setShowDetailsModal(false);
                                                handleSubmitApplication(selectedStudent);
                                            }}
                                            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm"
                                        >
                                            Submit Application
                                        </button>
                                    )}
                                    {(selectedStudent.status === 'SUBMITTED' || selectedStudent.status === 'UNDER_REVIEW') && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setShowDetailsModal(false);
                                                    handleAcceptApplication(selectedStudent);
                                                }}
                                                className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowDetailsModal(false);
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
                                                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {selectedStudent.status === 'APPROVED' && (
                                        <button
                                            onClick={() => {
                                                setShowDetailsModal(false);
                                                handleCompleteApplication(selectedStudent);
                                            }}
                                            className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm"
                                        >
                                            Mark Complete
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            setStatusData({
                                                status: selectedStudent.status,
                                                notes: '',
                                                rejectionReason: '',
                                                rejectionMessage: '',
                                                rejectionDetails: []
                                            });
                                            setShowRejectionForm(selectedStudent.status === 'REJECTED');
                                            setShowStatusModal(true);
                                        }}
                                        className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-sm"
                                    >
                                        Update Status...
                                    </button>
                                </div>
                                <button onClick={function() { setShowDetailsModal(false); }} className="px-4 py-2 bg-[#4A1D7A] text-white rounded-md hover:bg-[#351458]">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {showStatusModal && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => {
                    setShowStatusModal(false);
                    setShowRejectionForm(false);
                    setStatusData({
                        status: '',
                        notes: '',
                        rejectionReason: '',
                        rejectionMessage: '',
                        rejectionDetails: []
                    });
                }}>
                    <div className="bg-white dark:bg-[#231A2E] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Update Status - {selectedStudent.fullName || (selectedStudent.personalDetails && selectedStudent.personalDetails.fullName)}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={statusData.status}
                                        onChange={(e) => {
                                            const newStatus = e.target.value;
                                            setStatusData({
                                                ...statusData,
                                                status: newStatus,
                                                rejectionReason: '',
                                                rejectionMessage: '',
                                                rejectionDetails: []
                                            });
                                            setShowRejectionForm(newStatus === 'REJECTED');
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Select Status</option>
                                        {APPLICATION_STATUS_OPTIONS.map(function(o) { return <option key={o.key} value={o.key}>{o.key === 'COMPLETE' ? 'Complete (Graduated)' : o.label}</option>; })}
                                    </select>
                                </div>

                                {/* Rejection Form */}
                                {showRejectionForm && (
                                    <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                                        <h4 className="text-md font-semibold text-red-800 dark:text-red-200 mb-4">
                                            Rejection Details
                                        </h4>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Rejection Reason *
                                                </label>
                                                <select
                                                    value={statusData.rejectionReason}
                                                    onChange={(e) => setStatusData({ ...statusData, rejectionReason: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                >
                                                    <option value="">Select Rejection Reason</option>
                                                    <option value="incomplete_documents">Incomplete Documents</option>
                                                    <option value="invalid_documents">Invalid Documents</option>
                                                    <option value="eligibility_criteria">Does Not Meet Eligibility Criteria</option>
                                                    <option value="document_quality">Poor Document Quality</option>
                                                    <option value="missing_information">Missing Required Information</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Rejection Message *
                                                </label>
                                                <textarea
                                                    value={statusData.rejectionMessage}
                                                    onChange={(e) => setStatusData({ ...statusData, rejectionMessage: e.target.value })}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    placeholder="Explain what the student needs to do to fix the issues..."
                                                />
                                            </div>

                                            {/* Rejection Details */}
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Specific Issues
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={addRejectionDetail}
                                                        className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                    >
                                                        + Add Issue
                                                    </button>
                                                </div>

                                                {statusData.rejectionDetails.map((detail, index) => (
                                                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 bg-white dark:bg-gray-800">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                Issue #{index + 1}
                                                            </h5>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeRejectionDetail(index)}
                                                                className="text-red-600 hover:text-red-800 text-sm"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Issue Description
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={detail.issue || ''}
                                                                    onChange={(e) => updateRejectionDetail(index, 'issue', e.target.value)}
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                    placeholder="e.g., Certificate is too old"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Document Type
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={detail.documentType || ''}
                                                                    onChange={(e) => updateRejectionDetail(index, 'documentType', e.target.value)}
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                    placeholder="e.g., 10th Grade Certificate"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Action Required
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={detail.actionRequired || ''}
                                                                    onChange={(e) => updateRejectionDetail(index, 'actionRequired', e.target.value)}
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                    placeholder="e.g., Provide recent certificate"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Priority
                                                                </label>
                                                                <select
                                                                    value={detail.priority || 'High'}
                                                                    onChange={(e) => updateRejectionDetail(index, 'priority', e.target.value)}
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                >
                                                                    <option value="High">High</option>
                                                                    <option value="Medium">Medium</option>
                                                                    <option value="Low">Low</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="mt-2">
                                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                Specific Feedback
                                                            </label>
                                                            <textarea
                                                                value={detail.specificFeedback || ''}
                                                                onChange={(e) => updateRejectionDetail(index, 'specificFeedback', e.target.value)}
                                                                rows={2}
                                                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                placeholder="Additional specific feedback for this issue..."
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={statusData.notes || ''}
                                        onChange={(e) => setStatusData({ ...statusData, notes: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Add any notes about this status change..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowStatusModal(false);
                                        setShowRejectionForm(false);
                                        setStatusData({
                                            status: '',
                                            notes: '',
                                            rejectionReason: '',
                                            rejectionMessage: '',
                                            rejectionDetails: []
                                        });
                                    }}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateStatus}
                                    className="px-4 py-2 bg-[#4A1D7A] text-white rounded-md hover:bg-[#351458]"
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedStudent && (
                <div className="fixed inset-0 z-50 overflow-y-auto" onClick={function() { setShowEditModal(false); }}>
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
                        <div className="relative bg-white dark:bg-[#231A2E] rounded-lg shadow-xl max-w-2xl w-full p-6 z-10 max-h-[90vh] overflow-y-auto" onClick={function(e) { e.stopPropagation(); }}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Student</h3>
                                <button onClick={function() { setShowEditModal(false); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Personal Details</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[['fullName','Full Name'],['fathersName',"Father's Name"],['mothersName',"Mother's Name"],['gender','Gender'],['aadharNumber','Aadhar Number']].map(function(item) {
                                            var field = item[0]; var label = item[1];
                                            return (
                                                <div key={field}>
                                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                                                    <input type="text" value={(editData.personalDetails && editData.personalDetails[field]) || ''} onChange={function(e) { var val = e.target.value; setEditData(function(prev) { return Object.assign({}, prev, { personalDetails: Object.assign({}, prev.personalDetails, { [field]: val }) }); }); }} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A1D7A]" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Contact Details</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[['email','Email'],['primaryPhone','Phone']].map(function(item) {
                                            var field = item[0]; var label = item[1];
                                            return (
                                                <div key={field}>
                                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                                                    <input type="text" value={(editData.contactDetails && editData.contactDetails[field]) || ''} onChange={function(e) { var val = e.target.value; setEditData(function(prev) { return Object.assign({}, prev, { contactDetails: Object.assign({}, prev.contactDetails, { [field]: val }) }); }); }} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A1D7A]" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button onClick={function() { setShowEditModal(false); }} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                                <button onClick={handleEdit} className="px-4 py-2 bg-[#4A1D7A] text-white rounded-md hover:bg-[#351458]">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default EnhancedStaffDashboard;
