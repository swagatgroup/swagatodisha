import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Users,
    CheckCircle,
    Clock,
    AlertTriangle,
    Upload,
    Bell,
    BarChart3,
    TrendingUp,
    Activity
} from 'lucide-react';
import DocumentUpload from '../shared/DocumentUpload';
import DocumentReview from '../staff/DocumentReview';
import NotificationSystem from '../shared/NotificationSystem';
import ReferralManagement from '../admin/ReferralManagement';

const EnhancedDashboard = ({ userRole, user }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, [userRole]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dashboard', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const result = await response.json();
            if (result.success) {
                setDashboardData(result.data);
            }
        } catch (error) {
            console.error('Fetch dashboard data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRoleSpecificTabs = () => {
        const baseTabs = [
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'notifications', label: 'Notifications', icon: Bell }
        ];

        if (userRole === 'admin' || userRole === 'super_admin') {
            baseTabs.push({ id: 'referrals', label: 'Referral Management', icon: Users });
        }

        if (userRole === 'staff' || userRole === 'admin' || userRole === 'super_admin') {
            baseTabs.push({ id: 'review', label: 'Document Review', icon: CheckCircle });
        }

        return baseTabs;
    };

    const renderOverview = () => {
        if (!dashboardData) return <div>Loading...</div>;

        const stats = dashboardData.statistics || {};
        const recentActivity = dashboardData.recentActivity || [];

        return (
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-lg shadow-md"
                    >
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments || 0}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-lg shadow-md"
                    >
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.approvedDocuments || 0}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-6 rounded-lg shadow-md"
                    >
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingDocuments || 0}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white p-6 rounded-lg shadow-md"
                    >
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Rejected</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.rejectedDocuments || 0}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Activity className="h-5 w-5 mr-2" />
                        Recent Activity
                    </h3>
                    <div className="space-y-3">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="p-2 bg-blue-100 rounded-full">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">No recent activity</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderDocuments = () => {
        return (
            <div className="space-y-6">
                <DocumentUpload
                    userRole={userRole}
                    onUploadSuccess={fetchDashboardData}
                />

                {/* Document List would go here */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Your Documents</h3>
                    <p className="text-gray-500">Document list component would be integrated here</p>
                </div>
            </div>
        );
    };

    const renderDocumentReview = () => {
        // This would show assigned documents for staff review
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Assigned Documents for Review</h3>
                    <p className="text-gray-500">Document review list would be integrated here</p>
                </div>
            </div>
        );
    };

    const renderReferralManagement = () => {
        return <ReferralManagement />;
    };

    const renderNotifications = () => {
        return <NotificationSystem />;
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverview();
            case 'documents':
                return renderDocuments();
            case 'review':
                return renderDocumentReview();
            case 'referrals':
                return renderReferralManagement();
            case 'notifications':
                return renderNotifications();
            default:
                return renderOverview();
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user?.fullName || 'User'}!
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage your {userRole} dashboard and stay updated with the latest information.
                    </p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {getRoleSpecificTabs().map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderTabContent()}
                </motion.div>
            </div>
        </div>
    );
};

export default EnhancedDashboard;
