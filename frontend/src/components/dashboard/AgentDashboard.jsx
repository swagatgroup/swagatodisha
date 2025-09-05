import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';
import BackToMainWebsite from '../BackToMainWebsite';
import api from '../../utils/api';

const AgentDashboard = () => {
    const { user } = useAuth();
    const [referredStudents, setReferredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalReferrals: 0,
        activeReferrals: 0,
        totalCommission: 0,
        thisMonthReferrals: 0
    });

    const sidebarItems = [
        {
            name: 'Dashboard',
            href: '/dashboard/agent',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
            )
        },
        {
            name: 'My Referrals',
            href: '/dashboard/agent/referrals',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            name: 'Commission',
            href: '/dashboard/agent/commission',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            )
        },
        {
            name: 'Profile',
            href: '/dashboard/agent/profile',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        }
    ];

    useEffect(() => {
        const fetchAgentData = async () => {
            try {
                // Fetch referred students data
                const response = await api.get('/api/auth/me');
                if (response.data.success) {
                    // Mock data for now - replace with actual API call
                    const mockReferrals = [
                        {
                            _id: '1',
                            studentName: 'Rahul Kumar',
                            course: 'Class 12 Science',
                            institution: 'Swagat College',
                            status: 'enrolled',
                            referralDate: '2024-01-15',
                            commission: 5000
                        },
                        {
                            _id: '2',
                            studentName: 'Priya Singh',
                            course: 'Class 10',
                            institution: 'Swagat School',
                            status: 'pending',
                            referralDate: '2024-01-20',
                            commission: 3000
                        }
                    ];
                    setReferredStudents(mockReferrals);

                    // Update stats
                    setStats({
                        totalReferrals: mockReferrals.length,
                        activeReferrals: mockReferrals.filter(r => r.status === 'enrolled').length,
                        totalCommission: mockReferrals.reduce((sum, r) => sum + r.commission, 0),
                        thisMonthReferrals: mockReferrals.filter(r => {
                            const referralDate = new Date(r.referralDate);
                            const now = new Date();
                            return referralDate.getMonth() === now.getMonth() &&
                                referralDate.getFullYear() === now.getFullYear();
                        }).length
                    });
                }
            } catch (error) {
                console.error('Error fetching agent data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAgentData();
    }, []);

    if (loading) {
        return (
            <DashboardLayout title="Agent Dashboard" sidebarItems={sidebarItems}>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <>
            <BackToMainWebsite variant="outline" position="top-left" />
            <DashboardLayout title="Agent Dashboard" sidebarItems={sidebarItems}>
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white mb-6"
                >
                    <h2 className="text-2xl font-bold mb-2">
                        Welcome back, {user?.firstName} {user?.lastName}! 🎯
                    </h2>
                    <p className="text-green-100">
                        Your referral code: <span className="font-mono font-bold text-yellow-300">{user?.referralCode}</span>
                    </p>
                    <p className="text-green-100 mt-2">
                        Track your referrals and earnings in real-time.
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-lg shadow p-6"
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalReferrals}</p>
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active Referrals</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.activeReferrals}</p>
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
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Commission</p>
                                <p className="text-2xl font-semibold text-gray-900">₹{stats.totalCommission.toLocaleString()}</p>
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">This Month</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.thisMonthReferrals}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-lg shadow p-6 mb-8"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors duration-200">
                            <svg className="h-8 w-8 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="text-gray-600 font-medium">Add New Referral</span>
                        </button>

                        <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors duration-200">
                            <svg className="h-8 w-8 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-gray-600 font-medium">View Reports</span>
                        </button>

                        <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors duration-200">
                            <svg className="h-8 w-8 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span className="text-gray-600 font-medium">Withdraw Earnings</span>
                        </button>
                    </div>
                </motion.div>

                {/* Recent Referrals */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-lg shadow"
                >
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Referrals</h3>
                    </div>
                    <div className="p-6">
                        {referredStudents.length > 0 ? (
                            <div className="space-y-4">
                                {referredStudents.map((referral) => (
                                    <div key={referral._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{referral.studentName}</h4>
                                            <p className="text-sm text-gray-500">{referral.course} • {referral.institution}</p>
                                            <p className="text-xs text-gray-400">Referred on {new Date(referral.referralDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${referral.status === 'enrolled' ? 'bg-green-100 text-green-800' :
                                                referral.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    referral.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                                            </span>
                                            <p className="text-sm font-medium text-gray-900 mt-1">₹{referral.commission.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No referrals yet</h3>
                                <p className="mt-1 text-sm text-gray-500">Start referring students to earn commissions.</p>
                                <div className="mt-6">
                                    <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                        Add Referral
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </DashboardLayout>
        </>
    );
};

export default AgentDashboard;
