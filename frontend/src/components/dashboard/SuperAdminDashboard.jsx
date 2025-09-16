import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';
import UserManagement from '../admin/UserManagement';
import SecurityDashboard from '../admin/SecurityDashboard';
import PerformanceDashboard from '../admin/PerformanceDashboard';
import PasswordManagement from '../admin/PasswordManagement';
import WebsiteContentManagement from '../admin/WebsiteContentManagement';
// import StudentsTab from './tabs/StudentsTab';
// import AgentsTab from './tabs/AgentsTab';
// import StaffTab from './tabs/StaffTab';
// import PasswordsTab from './tabs/PasswordsTab';
// import ContentTab from './tabs/ContentTab';
import DocumentManagement from '../documents/DocumentManagement';
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
            id: 'passwords',
            name: 'Passwords',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            )
        },
        {
            id: 'content',
            name: 'Website Content',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            )
        },
        {
            id: 'security',
            name: 'Security Dashboard',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            )
        },
        {
            id: 'performance',
            name: 'Performance Dashboard',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        {
            id: 'profile',
            name: 'Profile',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            id: 'settings',
            name: 'Settings',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        }
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
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
                            <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.fullName || 'Admin'}</p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Students</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Agents</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats.totalAgents}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Staff</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats.totalStaff}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Pending Applications</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats.pendingApplications}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Category Breakdown */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Categories</h3>
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
                                    <div key={item.key} className="text-center border rounded p-3">
                                        <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                                        <div className="text-xl font-semibold">{categoryCounts[item.key] || 0}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Students Current Status */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Students - Current Status</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stage</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Agent</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Staff</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {students.map(s => (
                                            <tr key={s._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="font-medium text-gray-900">{s.personalDetails?.fullName || s.user?.fullName || 'N/A'}</div>
                                                    <div className="text-gray-500 text-xs">{s.studentId}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{s.registrationCategory || 'A'}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">{s.workflowStatus?.currentStage || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{s.workflowStatus?.assignedAgent?.fullName || '—'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{s.workflowStatus?.assignedStaff?.fullName || '—'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                    <div>
                                        <h5 className="font-medium text-gray-900">New Student Registration</h5>
                                        <p className="text-sm text-gray-500">Rahul Kumar registered for Class 12 Science</p>
                                    </div>
                                    <span className="text-xs text-gray-500">2 hours ago</span>
                                </div>
                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                    <div>
                                        <h5 className="font-medium text-gray-900">Agent Performance Update</h5>
                                        <p className="text-sm text-gray-500">Priya Sharma completed 5 successful referrals</p>
                                    </div>
                                    <span className="text-xs text-gray-500">4 hours ago</span>
                                </div>
                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                    <div>
                                        <h5 className="font-medium text-gray-900">Staff Login</h5>
                                        <p className="text-sm text-gray-500">Dr. Amit Singh logged in</p>
                                    </div>
                                    <span className="text-xs text-gray-500">6 hours ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'students':
                return <UserManagement userType="students" />;
            case 'agents':
                return <UserManagement userType="agents" />;
            case 'staff':
                return <UserManagement userType="staff" />;
            case 'passwords':
                return <PasswordManagement />;
            case 'content':
                return <WebsiteContentManagement />;
            case 'security':
                return <SecurityDashboard />;
            case 'performance':
                return <PerformanceDashboard />;
            case 'profile':
                return (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-28 relative">
                            <div className="absolute -bottom-10 left-6">
                                <div className="h-20 w-20 rounded-full ring-4 ring-white flex items-center justify-center bg-white shadow-lg">
                                    <div className="h-18 w-18 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                                        <span className="text-white font-semibold text-xl">
                                            {(user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`)?.trim().split(' ').map(n => n[0]).slice(0, 2).join('')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="pt-14 px-6 pb-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`}
                                    </h3>
                                    <p className="text-sm text-gray-500">Super Administrator</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg">Edit Profile</button>
                                    <button className="px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg">Update Password</button>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="text-xs font-medium text-gray-500 mb-1">Email</div>
                                    <div className="text-gray-900">{user?.email || '—'}</div>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="text-xs font-medium text-gray-500 mb-1">Phone</div>
                                    <div className="text-gray-900">{user?.phoneNumber || '—'}</div>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="text-xs font-medium text-gray-500 mb-1">Department</div>
                                    <div className="text-gray-900">{user?.department || 'Administration'}</div>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="text-xs font-medium text-gray-500 mb-1">Designation</div>
                                    <div className="text-gray-900">{user?.designation || 'Super Administrator'}</div>
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="mt-6 flex flex-wrap gap-2">
                                <span className="px-2.5 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Super Admin</span>
                                <span className="px-2.5 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                                <span className="px-2.5 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Verified</span>
                            </div>
                        </div>
                    </div>
                );
            case 'settings':
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Settings</h3>
                        <div className="space-y-6">
                            {/* Account Settings */}
                            <div className="border-b border-gray-200 pb-6">
                                <h4 className="text-md font-medium text-gray-900 mb-4">Account Settings</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                                            <p className="text-sm text-gray-500">Receive email updates about system activities</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                                            <p className="text-sm text-gray-500">Receive SMS updates about critical system events</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* System Settings */}
                            <div className="border-b border-gray-200 pb-6">
                                <h4 className="text-md font-medium text-gray-900 mb-4">System Settings</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
                                            <p className="text-sm text-gray-500">Enable maintenance mode for system updates</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Security Settings */}
                            <div>
                                <h4 className="text-md font-medium text-gray-900 mb-4">Security Settings</h4>
                                <div className="space-y-4">
                                    <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                        Change Password
                                    </button>
                                    <button className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 ml-2">
                                        Enable Two-Factor Authentication
                                    </button>
                                    <button className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ml-2">
                                        Force Logout All Sessions
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
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