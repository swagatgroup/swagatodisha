import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSession } from '../../contexts/SessionContext';
import DashboardLayout from './DashboardLayout';
import UserManagement from '../admin/UserManagement';
import StudentManagement from '../admin/StudentManagement';
import WebsiteManagement from '../admin/WebsiteManagement';
import RecentStudentsTable from './components/RecentStudentsTable';
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

                        {/* Recent Students */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow"
                        >
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Students</h3>
                            </div>
                            <div className="p-6">
                                <RecentStudentsTable initialFilter={studentTableFilter} />
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