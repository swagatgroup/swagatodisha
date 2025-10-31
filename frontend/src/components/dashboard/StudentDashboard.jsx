import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';
import ProfileCompletionModal from '../modals/ProfileCompletionModal';
import InteractivePieChart from '../analytics/InteractivePieChart';
import DetailModal from '../analytics/DetailModal';
import StudentApplications from './tabs/StudentApplications';
import api from '../../utils/api';
import StudentRegistrationWorkflow from './tabs/StudentRegistrationWorkflow';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [studentData, setStudentData] = useState(null);
    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        enrolledPrograms: 0
    });

    // New state for enhanced features
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileCompletion, setProfileCompletion] = useState(0);
    const [applicationStage, setApplicationStage] = useState('PROFILE_COMPLETION');
    const [analyticsData, setAnalyticsData] = useState({});
    const [selectedChartData, setSelectedChartData] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const [activeSidebarItem, setActiveSidebarItem] = useState('registration');

    const sidebarItems = [
        {
            id: 'registration',
            name: 'Dashboard',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
            )
        },
        {
            id: 'applications',
            name: 'Applications',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        }
    ];

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get('/api/auth/me');
                setStudentData(response.data.data.user);

                // Check if profile completion is needed
                if ((response.data.data.user.role === 'student' || response.data.data.user.role === 'user') && response.data.data.user._id) {
                    const profileResponse = await api.get(`/api/workflow/stages/${response.data.data.user._id}`);
                    if (profileResponse.data.success) {
                        const profileData = profileResponse.data.data;
                        setProfileCompletion(profileData.student.profileCompletion);
                        setApplicationStage(profileData.student.currentStage);

                        // Show profile modal if profile is not complete
                        if (profileData.student.profileCompletion < 100) {
                            setShowProfileModal(true);
                        }
                    }
                }

                // Load analytics data
                await loadAnalyticsData();

                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const loadAnalyticsData = async () => {
        try {
            const response = await api.get('/api/analytics/dashboard/student');
            if (response.data.success) {
                setAnalyticsData(response.data.data);
            }
        } catch (error) {
            console.error('Error loading analytics data:', error);
            // Set mock data for demo
            setAnalyticsData({
                applicationProgress: [
                    { name: 'Profile Complete', value: 75, total: 100 },
                    { name: 'Documents Uploaded', value: 60, total: 100 },
                    { name: 'Under Review', value: 25, total: 100 },
                    { name: 'Approved', value: 15, total: 100 }
                ],
                documentStatus: [
                    { name: 'Approved', value: 8, total: 12 },
                    { name: 'Pending', value: 3, total: 12 },
                    { name: 'Rejected', value: 1, total: 12 }
                ],
                referralActivity: [
                    { name: 'Students Referred', value: 5, total: 10 },
                    { name: 'Bonus Earned', value: 2500, total: 5000 }
                ]
            });
        }
    };

    const renderSidebarContent = () => {
        switch (activeSidebarItem) {
            case 'registration':
                return <StudentRegistrationWorkflow onStudentUpdate={() => setActiveSidebarItem('documents')} />;
            case 'dashboard':
                return (
                    <>
                        {profileCompletion < 100 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6"
                            >
                                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-9-3a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">Complete your profile to proceed</h3>
                                            <div className="mt-2 text-sm text-red-700">
                                                <p>Your profile is {profileCompletion}% complete. Please complete your personal details to continue with applications and document uploads.</p>
                                            </div>
                                            <div className="mt-4">
                                                <button
                                                    onClick={() => setShowProfileModal(true)}
                                                    className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
                                                >
                                                    Complete Profile Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {/* Welcome Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white mb-6"
                        >
                            <h2 className="text-2xl font-bold mb-2">
                                Welcome back, {user?.firstName} {user?.lastName}! 👋
                            </h2>
                            <p className="text-purple-100">
                                Track your applications, manage documents, and stay updated with your academic journey.
                            </p>
                        </motion.div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                            >
                                <div className="flex items-center">
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalApplications}</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                            >
                                <div className="flex items-center">
                                    <div className="p-3 bg-yellow-100 rounded-full">
                                        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.pendingApplications}</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                            >
                                <div className="flex items-center">
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.approvedApplications}</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                            >
                                <div className="flex items-center">
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Enrolled</p>
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.enrolledPrograms}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setActiveSidebarItem('applications')}
                                    className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors duration-200"
                                >
                                    <svg className="h-8 w-8 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span className="text-gray-600 dark:text-gray-300 font-medium">View Applications</span>
                                </button>

                                <button
                                    onClick={() => setActiveSidebarItem('applications')}
                                    className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors duration-200"
                                >
                                    <svg className="h-8 w-8 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-600 dark:text-gray-300 font-medium">Track Progress</span>
                                </button>
                            </div>
                        </motion.div>

                        {/* Application Progress Timeline */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8"
                        >
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Application Progress</h3>
                            </div>
                            <div className="p-6">
                                <div className="relative">
                                    <div className="flex items-center justify-between">
                                        {[
                                            { stage: 'Profile', status: profileCompletion >= 100 ? 'completed' : 'current', label: 'Complete Profile' },
                                            { stage: 'Documents', status: applicationStage === 'DOCUMENT_UPLOAD' ? 'current' : applicationStage === 'VERIFICATION_PENDING' ? 'completed' : 'pending', label: 'Upload Documents' },
                                            { stage: 'Review', status: applicationStage === 'VERIFICATION_PENDING' ? 'current' : applicationStage === 'APPROVED' ? 'completed' : 'pending', label: 'Staff Review' },
                                            { stage: 'Approval', status: applicationStage === 'APPROVED' ? 'completed' : 'pending', label: 'Final Approval' }
                                        ].map((step, index) => (
                                            <div key={step.stage} className="flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    step.status === 'current' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-gray-100 text-gray-400'
                                                    }`}>
                                                    {step.status === 'completed' ? '✓' : index + 1}
                                                </div>
                                                <span className="text-xs mt-2 text-center text-gray-600">{step.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-10">
                                        <div className="h-full bg-purple-600 transition-all duration-500" style={{ width: `${(profileCompletion / 100) * 75}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Analytics Charts */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
                        >
                            <InteractivePieChart
                                data={analyticsData.documentStatus || []}
                                title="Document Status"
                                onSegmentClick={(data) => {
                                    setSelectedChartData(data);
                                    setShowDetailModal(true);
                                }}
                            />
                            <InteractivePieChart
                                data={analyticsData.applicationProgress || []}
                                title="Application Progress"
                                onSegmentClick={(data) => {
                                    setSelectedChartData(data);
                                    setShowDetailModal(true);
                                }}
                            />
                        </motion.div>

                        {/* Recent Applications */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow"
                        >
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Applications</h3>
                            </div>
                            <div className="p-6">
                                {admissions.length > 0 ? (
                                    <div className="space-y-4">
                                        {admissions.map((admission) => (
                                            <div key={admission._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{admission.course?.name}</h4>
                                                    <p className="text-sm text-gray-500">{admission.institution?.name}</p>
                                                    <p className="text-xs text-gray-400">Applied on {new Date(admission.applicationDate).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${admission.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    admission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        admission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {admission.status.charAt(0).toUpperCase() + admission.status.slice(1)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
                                        <p className="mt-1 text-sm text-gray-500">Get started by creating your first application.</p>
                                        <div className="mt-6">
                                            <button
                                                onClick={() => setActiveSidebarItem('applications')}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                            >
                                                View Applications
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                );
            case 'applications':
                return <StudentApplications />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Student Dashboard" sidebarItems={sidebarItems} activeItem={activeSidebarItem} onItemClick={setActiveSidebarItem} showSessionSelector={false}>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <>
            <DashboardLayout title="Student Dashboard" sidebarItems={sidebarItems} activeItem={activeSidebarItem} onItemClick={setActiveSidebarItem} showSessionSelector={false}>
                {renderSidebarContent()}
            </DashboardLayout>

            {/* Profile Completion Modal */}
            <ProfileCompletionModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                onComplete={(newAppId) => {
                    setShowProfileModal(false);
                    setProfileCompletion(100);
                    setApplicationStage('DOCUMENT_UPLOAD');
                    setActiveSidebarItem('documents');
                    loadAnalyticsData();
                }}
            />

            {/* Detail Modal for Analytics */}
            <DetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                data={selectedChartData?.details || []}
                title={selectedChartData?.name || 'Details'}
                type="analytics"
            />
        </>
    );
};

export default StudentDashboard;
