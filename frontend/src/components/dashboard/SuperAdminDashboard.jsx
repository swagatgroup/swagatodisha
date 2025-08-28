import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';
import axios from 'axios';

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('students');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalAgents: 0,
        totalStaff: 0,
        totalApplications: 0,
        pendingApplications: 0
    });

    const sidebarItems = [
        {
            name: 'Dashboard',
            href: '/dashboard/admin',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
            )
        },
        {
            name: 'Students',
            href: '/dashboard/admin/students',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
            )
        },
        {
            name: 'Agents',
            href: '/dashboard/admin/agents',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            name: 'Staff',
            href: '/dashboard/admin/staff',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            name: 'Passwords',
            href: '/dashboard/admin/passwords',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            )
        },
        {
            name: 'Website Content',
            href: '/dashboard/admin/content',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
            )
        }
    ];

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                // Mock data for now - replace with actual API call
                setStats({
                    totalStudents: 1250,
                    totalAgents: 45,
                    totalStaff: 12,
                    totalApplications: 1890,
                    pendingApplications: 156
                });
            } catch (error) {
                console.error('Error fetching admin data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    const renderStudentsTab = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Student Management</h3>
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    <button className="px-3 py-1 text-sm font-medium bg-white text-gray-900 rounded-md shadow-sm">
                        All Students
                    </button>
                    <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                        Referral Based
                    </button>
                    <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                        Direct Enrollments
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900">Recent Students</h4>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                        Add New Student
                    </button>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                            <h5 className="font-medium text-gray-900">Rahul Kumar</h5>
                            <p className="text-sm text-gray-500">Class 12 Science • Applied: 2024-01-15</p>
                        </div>
                        <div className="flex space-x-2">
                            <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md">View</button>
                            <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md">Edit</button>
                            <button className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAgentsTab = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Agent Management</h3>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    Add New Agent
                </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900">Total Agents</h4>
                        <p className="text-3xl font-bold text-green-600">{stats.totalAgents}</p>
                    </div>
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900">Active Agents</h4>
                        <p className="text-3xl font-bold text-blue-600">42</p>
                    </div>
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900">Total Referrals</h4>
                        <p className="text-3xl font-bold text-purple-600">890</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStaffTab = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Staff Management</h3>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Add New Staff
                </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900">Total Staff</h4>
                        <p className="text-3xl font-bold text-indigo-600">{stats.totalStaff}</p>
                    </div>
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900">Active Staff</h4>
                        <p className="text-3xl font-bold text-green-600">11</p>
                    </div>
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900">Departments</h4>
                        <p className="text-3xl font-bold text-purple-600">5</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPasswordsTab = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Password Management</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Students</h4>
                    <div className="space-y-3">
                        <input type="email" placeholder="Student Email" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        <input type="password" placeholder="New Password" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Reset Password
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Agents</h4>
                    <div className="space-y-3">
                        <input type="email" placeholder="Agent Email" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        <input type="password" placeholder="New Password" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                            Reset Password
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Staff</h4>
                    <div className="space-y-3">
                        <input type="email" placeholder="Staff Email" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        <input type="password" placeholder="New Password" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                            Reset Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContentTab = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Website Content Management</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Hero Section</h4>
                    <div className="space-y-3">
                        <input type="text" placeholder="Main Heading" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        <textarea placeholder="Sub Heading" rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                        <input type="file" className="w-full" />
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Update Hero
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h4 className="font-medium text-gray-900 mb-4">About Us Section</h4>
                    <div className="space-y-3">
                        <input type="text" placeholder="Section Title" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        <textarea placeholder="Content" rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                        <input type="file" className="w-full" />
                        <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                            Update About
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <DashboardLayout title="Super Admin Dashboard" sidebarItems={sidebarItems}>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Super Admin Dashboard" sidebarItems={sidebarItems}>
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-red-600 to-purple-600 rounded-lg p-6 text-white mb-6"
            >
                <h2 className="text-2xl font-bold mb-2">
                    Welcome back, {user?.firstName} {user?.lastName}! 👑
                </h2>
                <p className="text-red-100">
                    You have full administrative access to manage the entire system.
                </p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-lg shadow p-6"
                >
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Students</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-lg shadow p-6"
                >
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-full">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Agents</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalAgents}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-lg shadow p-6"
                >
                    <div className="flex items-center">
                        <div className="p-3 bg-indigo-100 rounded-full">
                            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Staff</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalStaff}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-lg shadow p-6"
                >
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-full">
                            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Applications</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalApplications}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-lg shadow p-6"
                >
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.pendingApplications}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Main Content Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-lg shadow"
            >
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'students', name: 'Students' },
                            { id: 'agents', name: 'Agents' },
                            { id: 'staff', name: 'Staff' },
                            { id: 'passwords', name: 'Passwords' },
                            { id: 'content', name: 'Website Content' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'students' && renderStudentsTab()}
                    {activeTab === 'agents' && renderAgentsTab()}
                    {activeTab === 'staff' && renderStaffTab()}
                    {activeTab === 'passwords' && renderPasswordsTab()}
                    {activeTab === 'content' && renderContentTab()}
                </div>
            </motion.div>
        </DashboardLayout>
    );
};

export default SuperAdminDashboard;
