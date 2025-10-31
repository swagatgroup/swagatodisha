import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';
import StudentRegistration from './tabs/StudentRegistration';
import StudentRegistrationWorkflow from './tabs/StudentRegistrationWorkflow';
// StaffApplicationsReview removed - Socket.IO component
import ApplicationReview from './tabs/ApplicationReview';
// RealTimeStudentTracking removed - Socket.IO component
import StudentTable from './components/StudentTable';
import ProcessingStats from './components/ProcessingStats';
import StudentManagement from '../admin/StudentManagement';
import api from '../../utils/api';

const EnhancedStaffDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [students, setStudents] = useState([]);
    const [processingStats, setProcessingStats] = useState({
        totalStudents: 0,
        pendingVerification: 0,
        approvedToday: 0,
        rejectedToday: 0,
        averageProcessingTime: 0
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
            name: 'Student Management',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13.5 4a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
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
        }
    ];

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [studentsRes, statsRes, agentsRes] = await Promise.all([
                api.get('/api/staff/students'),
                api.get('/api/staff/processing-stats'),
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
                            <h2 className="text-2xl font-bold mb-2">
                                Welcome back, {user?.fullName}! 👋
                            </h2>
                            <p className="text-green-100">
                                Process student applications, verify documents, and manage academic content.
                            </p>
                        </motion.div>

                        {/* Processing Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mb-8"
                        >
                            <ProcessingStats data={processingStats} />
                        </motion.div>

                        {/* Recent Students */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow"
                        >
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Students</h3>
                            </div>
                            <div className="p-6">
                                <StudentTable
                                    students={Array.isArray(students) ? students.slice(0, 10) : []}
                                    onStudentUpdate={handleStudentUpdate}
                                    showActions={true}
                                />
                            </div>
                        </motion.div>
                    </>
                );
            case 'student-management':
                return <StudentManagement />;
            case 'applications':
                return <ApplicationReview />;
            case 'new-registration':
                return <StudentRegistrationWorkflow onStudentUpdate={handleStudentUpdate} />;
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
        </DashboardLayout>
    );
};

export default EnhancedStaffDashboard;
