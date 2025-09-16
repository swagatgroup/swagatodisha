import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';
import StudentRegistration from './tabs/StudentRegistration';
import DocumentsUpload from './tabs/DocumentsUpload';
import StudentApplication from './tabs/StudentApplication';
import StudentManagement from './tabs/StudentManagement';
import ReferralManagement from '../agents/ReferralManagement';
import StudentTable from './components/StudentTable';
import api from '../../utils/api';

const EnhancedAgentDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({
        totalStudents: 0,
        pendingStudents: 0,
        completedStudents: 0,
        thisMonthRegistrations: 0
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
            id: 'referrals',
            name: 'Referrals',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
        }
    ];

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [studentsRes, statsRes] = await Promise.all([
                api.get('/api/agents/students'),
                api.get('/api/agents/stats')
            ]);

            if (studentsRes.data.success) {
                const list = studentsRes.data.data?.students ?? studentsRes.data.data ?? [];
                setStudents(Array.isArray(list) ? list : []);
            }

            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStudentUpdate = (updatedStudent) => {
        setStudents(prev => prev.map(student =>
            student._id === updatedStudent._id ? updatedStudent : student
        ));
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
                            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-6"
                        >
                            <h2 className="text-2xl font-bold mb-2">
                                Welcome back, {user?.fullName}! 👋
                            </h2>
                            <p className="text-blue-100">
                                Manage your students and registrations.
                            </p>
                        </motion.div>

                        {/* Commission panel removed as requested */}

                        {/* Student List Table */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white rounded-lg shadow"
                        >
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Students</h3>
                            </div>
                            <div className="p-6">
                                <StudentTable
                                    students={students}
                                    onStudentUpdate={handleStudentUpdate}
                                    showActions={true}
                                />
                            </div>
                        </motion.div>
                    </>
                );
            case 'students':
                return <StudentManagement onStudentUpdate={handleStudentUpdate} />;
            case 'referrals':
                return <ReferralManagement />;
            case 'profile':
                return (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-28 relative">
                            <div className="absolute -bottom-10 left-6">
                                <div className="h-20 w-20 rounded-full ring-4 ring-white flex items-center justify-center bg-white shadow-lg">
                                    <div className="h-18 w-18 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                                        <span className="text-white font-semibold text-xl">
                                            {(user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`)?.trim().split(' ').map(n => n[0]).slice(0, 2).join('')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="pt-14 px-6 pb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`}
                                    </h3>
                                    <p className="text-sm text-gray-500">Agent</p>
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
                                    <div className="text-xs font-medium text-gray-500 mb-1">Referral Code</div>
                                    <div className="text-gray-900">{user?.referralCode || '—'}</div>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="text-xs font-medium text-gray-500 mb-1">Assigned Staff</div>
                                    <div className="text-gray-900">{user?.assignedStaff?.fullName || '—'}</div>
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="mt-6 flex flex-wrap gap-2">
                                <span className="px-2.5 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Verified</span>
                                <span className="px-2.5 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <DashboardLayout
                title="Agent Dashboard"
                sidebarItems={sidebarItems}
                activeItem={activeTab}
                onItemClick={setActiveTab}
            >
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Agent Dashboard"
            sidebarItems={sidebarItems}
            activeItem={activeTab}
            onItemClick={setActiveTab}
        >
            {renderDashboardContent()}
        </DashboardLayout>
    );
};

export default EnhancedAgentDashboard;
