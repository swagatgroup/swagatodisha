import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useSession } from "../../contexts/SessionContext";
import DashboardLayout from "./DashboardLayout";
import StudentRegistrationWorkflow from "./tabs/StudentRegistrationWorkflow";
import AgentApplicationsTab from "./tabs/AgentApplicationsTab";
import AgentApplicationStatus from "./tabs/AgentApplicationStatus";
import StudentTable from "./components/StudentTable";
import api from "../../utils/api";

const EnhancedAgentDashboard = () => {
  const { user } = useAuth();
  const { selectedSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [studentTableFilter, setStudentTableFilter] = useState("all");
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingStudents: 0,
    underReviewStudents: 0,
    approvedStudents: 0,
    rejectedStudents: 0,
  });
  const isLoadingRef = useRef(false);

  const handleStatClick = (filterKey) => {
    // Stay on dashboard and set the student table filter
    setStudentTableFilter(filterKey);
    setActiveTab("dashboard");
  };

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
    loadDashboardData(selectedSession);
  }, [selectedSession]);

  const loadDashboardData = async (session = selectedSession, showLoading = true) => {
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
        api.get("/api/agents/my-students", {
          params: {
            page: 1,
            limit: 1000, // Get all students (increase limit to show all submissions)
            sortBy: 'createdAt',
            sortOrder: 'desc',
            session: session // Pass session parameter
          }
        }),
        api.get("/api/agents/stats", {
          params: {
            session: session // Pass session parameter
          }
        }),
        api.get("/api/agents/my-submitted-applications", {
          params: {
            session: session // Pass session parameter
          }
        }),
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
          underReviewStudents: statsData.underReview || 0,
          approvedStudents: statsData.approved || 0,
          rejectedStudents: statsData.rejected || 0,
        });
        console.log('📊 AgentDashboard - Stats mapped:', {
          totalStudents: statsData.total || 0,
          pendingStudents: statsData.pending || 0,
          underReviewStudents: statsData.underReview || 0,
          approvedStudents: statsData.approved || 0,
          rejectedStudents: statsData.rejected || 0,
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

  const handleStudentDelete = (studentId) => {
    setStudents((prev) => {
      if (!Array.isArray(prev)) return [];
      return prev.filter((student) => student._id !== studentId);
    });
    // Refresh dashboard data
    loadDashboardData(selectedSession, false);
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

            {/* Processing Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Processing Statistics</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Total Students - Clickable */}
                <div
                  className={`bg-blue-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow ${studentTableFilter === 'all' ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => handleStatClick('all')}
                >
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Students</p>
                  <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{stats.totalStudents}</p>
                </div>

                {/* Pending - Clickable */}
                <div
                  className={`bg-yellow-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow ${studentTableFilter === 'SUBMITTED' ? 'ring-2 ring-yellow-500' : ''}`}
                  onClick={() => handleStatClick('SUBMITTED')}
                >
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</p>
                  <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">{stats.pendingStudents}</p>
                </div>

                {/* Under Review - Clickable */}
                <div
                  className={`bg-orange-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow ${studentTableFilter === 'UNDER_REVIEW' ? 'ring-2 ring-orange-500' : ''}`}
                  onClick={() => handleStatClick('UNDER_REVIEW')}
                >
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Under Review</p>
                  <p className="text-2xl font-semibold text-orange-600 dark:text-orange-400">{stats.underReviewStudents}</p>
                </div>

                {/* Approved - Clickable */}
                <div
                  className={`bg-green-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow ${studentTableFilter === 'APPROVED' ? 'ring-2 ring-green-500' : ''}`}
                  onClick={() => handleStatClick('APPROVED')}
                >
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Approved</p>
                  <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{stats.approvedStudents}</p>
                </div>

                {/* Rejected - Clickable */}
                <div
                  className={`bg-red-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow ${studentTableFilter === 'REJECTED' ? 'ring-2 ring-red-500' : ''}`}
                  onClick={() => handleStatClick('REJECTED')}
                >
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Rejected</p>
                  <p className="text-2xl font-semibold text-red-600 dark:text-red-400">{stats.rejectedStudents}</p>
                </div>
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
                  onStudentDelete={user?.role === 'super_admin' ? handleStudentDelete : undefined}
                  showActions={true}
                  initialFilter={studentTableFilter}
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
        showSessionSelector={true}
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
      showSessionSelector={true}
      onItemClick={setActiveTab}
    >
      {renderDashboardContent()}
    </DashboardLayout>
  );
};

export default EnhancedAgentDashboard;
