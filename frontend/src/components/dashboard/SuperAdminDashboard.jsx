import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';
import UserManagement from '../admin/UserManagement';
import PasswordManagement from '../admin/PasswordManagement';
// import StudentsTab from './tabs/StudentsTab';
// import AgentsTab from './tabs/AgentsTab';
// import StaffTab from './tabs/StaffTab';
// import PasswordsTab from './tabs/PasswordsTab';
// import ContentTab from './tabs/ContentTab';
import DocumentManagement from '../documents/DocumentManagement';
import RealTimeStudentTracking from './tabs/RealTimeStudentTracking';
import WebsiteContentManagement from './tabs/WebsiteContentManagement';
import CourseManagement from './tabs/CourseManagement';
import NotificationManagement from './tabs/NotificationManagement';
import GalleryManagement from './tabs/GalleryManagement';
import StudentRegistrationWorkflow from './tabs/StudentRegistrationWorkflow';
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
    const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [categoryCounts, setCategoryCounts] = useState({ A: 0, B1: 0, B2: 0, B3: 0, B4: 0, C1: 0, C2: 0, C3: 0 });
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalAgents: 0,
        totalStaff: 0,
        totalApplications: 0,
        pendingApplications: 0
    });

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
            name: 'All Students',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
            )
        },
        {
            id: 'tracking',
            name: 'Real-Time Tracking',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        },
        {
            id: 'website-content',
            name: 'Website Content',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            )
        },
        {
            id: 'courses',
            name: 'Course Management',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            )
        },
        {
            id: 'notifications',
            name: 'Notifications',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
            )
        },
        {
            id: 'gallery',
            name: 'Gallery Management',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
            id: 'passwords',
            name: 'Passwords',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            )
        },
    ];

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                setLoading(true);
                const [statsRes, studentsRes] = await Promise.all([
                    api.get('/api/admin/dashboard/stats'),
                    api.get('/api/admin/students?limit=100')
                ]);

                if (statsRes.data?.success) {
                    setStats(statsRes.data.data);
                }

                if (studentsRes.data?.success) {
                    const list = studentsRes.data.data.students || studentsRes.data.data || [];
                    setStudents(list);
                    const counts = { A: 0, B1: 0, B2: 0, B3: 0, B4: 0, C1: 0, C2: 0, C3: 0 };
                    list.forEach(s => {
                        const cat = s.registrationCategory || 'A';
                        if (counts[cat] !== undefined) counts[cat] += 1;
                    });
                    setCategoryCounts(counts);
                }
            } catch (error) {
                console.error('Error fetching admin data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

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
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
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

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
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

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
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

                        {/* Category Breakdown */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Registration Categories</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                                {[
                                    { key: 'A', label: 'A - Direct' },
                                    { key: 'B1', label: 'B1 - Student Ref' },
                                    { key: 'B2', label: 'B2 - Agent Ref' },
                                    { key: 'B3', label: 'B3 - Staff Ref' },
                                    { key: 'B4', label: 'B4 - SA Ref' },
                                    { key: 'C1', label: 'C1 - Agent Dash' },
                                    { key: 'C2', label: 'C2 - Staff Dash' },
                                    { key: 'C3', label: 'C3 - SA Dash' }
                                ].map(item => (
                                    <div key={item.key} className="text-center border border-gray-200 dark:border-gray-600 rounded p-3 bg-gray-50 dark:bg-gray-700">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</div>
                                        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{categoryCounts[item.key] || 0}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Students Current Status */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Students - Current Status</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Student</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Current Stage</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Assigned Agent</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Assigned Staff</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {students.map(s => (
                                            <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">{s.personalDetails?.fullName || s.user?.fullName || 'N/A'}</div>
                                                    <div className="text-gray-500 dark:text-gray-400 text-xs">{s.studentId}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{s.registrationCategory || 'A'}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">{s.workflowStatus?.currentStage || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{s.workflowStatus?.assignedAgent?.fullName || '—'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{s.workflowStatus?.assignedStaff?.fullName || '—'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                                    <div>
                                        <h5 className="font-medium text-gray-900 dark:text-gray-100">New Student Registration</h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Rahul Kumar registered for Class 12 Science</p>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</span>
                                </div>
                                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                                    <div>
                                        <h5 className="font-medium text-gray-900 dark:text-gray-100">Agent Performance Update</h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Priya Sharma completed 5 successful referrals</p>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">4 hours ago</span>
                                </div>
                                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                                    <div>
                                        <h5 className="font-medium text-gray-900 dark:text-gray-100">Staff Login</h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Dr. Amit Singh logged in</p>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">6 hours ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'students':
                return <UserManagement userType="students" />;
            case 'tracking':
                return <RealTimeStudentTracking />;
            case 'website-content':
                return <WebsiteContentManagement />;
            case 'courses':
                return <CourseManagement />;
            case 'notifications':
                return <NotificationManagement />;
            case 'gallery':
                return <GalleryManagement />;
            case 'new-registration':
                return <StudentRegistrationWorkflow onStudentUpdate={handleStudentUpdate} />;
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
            case 'passwords':
                return <PasswordManagement />;
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