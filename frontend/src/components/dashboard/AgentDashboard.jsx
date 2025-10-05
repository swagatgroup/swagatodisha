import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import DashboardLayout from "./DashboardLayout";
import StudentRegistrationWorkflow from "./tabs/StudentRegistrationWorkflow";
import AgentApplicationsTab from "./tabs/AgentApplicationsTab";
import AgentApplicationStatus from "./tabs/AgentApplicationStatus";
import StudentTable from "./components/StudentTable";
import api from "../../utils/api";

const EnhancedAgentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingStudents: 0,
    completedStudents: 0,
    thisMonthRegistrations: 0,
  });
  const isLoadingRef = useRef(false);

  const sidebarItems = [
    {
      id: "dashboard",
      name: "Dashboard & Students",
      icon: (
        <svg
          className="mr-3 h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
        </svg>
      ),
    },
    {
      id: "registration",
      name: "New Registration",
      icon: (
        <svg
          className="mr-3 h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
    },
    {
      id: "application-status",
      name: "Application Status",
      icon: (
        <svg
          className="mr-3 h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (showLoading = true) => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) {
      return;
    }

    try {
      isLoadingRef.current = true;
      if (showLoading) {
        setLoading(true);
      }
      const [studentsRes, statsRes, applicationsRes] = await Promise.all([
        api.get("/api/agents/my-students"),
        api.get("/api/agents/stats"),
        api.get("/api/agents/my-submitted-applications"),
      ]);

      if (studentsRes.data.success) {
        const list =
          studentsRes.data.data?.students ?? studentsRes.data.data ?? [];
        setStudents(Array.isArray(list) ? list : []);
      }

      if (applicationsRes.data.success) {
        // The API returns { success: true, data: { applications: [...], pagination: {...} } }
        const applicationsData = applicationsRes.data.data?.applications || applicationsRes.data.data || [];
        setApplications(Array.isArray(applicationsData) ? applicationsData : []);
      }

      if (statsRes.data.success) {
        console.log('📊 AgentDashboard - Stats response:', statsRes.data.data);
        const statsData = statsRes.data.data;
        
        // Map backend field names to frontend field names
        setStats({
          totalStudents: statsData.total || 0,
          pendingStudents: statsData.pending || 0,
          completedStudents: statsData.completed || 0,
          thisMonthRegistrations: statsData.thisMonth || 0,
        });
        console.log('📊 AgentDashboard - Stats mapped:', {
          totalStudents: statsData.total || 0,
          pendingStudents: statsData.pending || 0,
          completedStudents: statsData.completed || 0,
          thisMonthRegistrations: statsData.thisMonth || 0,
        });
      } else {
        console.error('📊 AgentDashboard - Stats not successful:', statsRes.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  const handleStudentUpdate = (updatedStudent) => {
    setStudents((prev) => {
      if (!Array.isArray(prev)) return [];
      return prev.map((student) =>
        student._id === updatedStudent._id ? updatedStudent : student
      );
    });
  };

  const renderDashboardContent = () => {
    switch (activeTab) {
      case "dashboard":
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

            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Students
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {stats.totalStudents}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pending
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {stats.pendingStudents}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Completed
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {stats.completedStudents}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This Month
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {stats.thisMonthRegistrations}
                </p>
              </div>
            </motion.div>

            {/* Commission panel removed as requested */}

            {/* Student List Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  My Students
                </h3>
              </div>
              <div className="p-6">
                <StudentTable
                  students={students}
                  onStudentUpdate={handleStudentUpdate}
                  showActions={true}
                />
              </div>
            </motion.div>

            {/* Applications Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow mt-6"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Recent Applications
                </h3>
              </div>
              <div className="p-6">
                <AgentApplicationsTab applications={applications} onRefresh={() => loadDashboardData(false)} />
              </div>
            </motion.div>
          </>
        );
      case "registration":
        return (
          <StudentRegistrationWorkflow onStudentUpdate={handleStudentUpdate} />
        );
      case "application-status":
        return (
          <AgentApplicationStatus />
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
