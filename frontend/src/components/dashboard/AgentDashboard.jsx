import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import DashboardLayout from "./DashboardLayout";
import StudentRegistrationWorkflow from "./tabs/StudentRegistrationWorkflow";
import AgentStudentsTab from "./tabs/AgentStudentsTab";
import AgentApplicationsTab from "./tabs/AgentApplicationsTab";
import ReferralManagement from "../agents/ReferralManagement";
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

  const sidebarItems = [
    {
      id: "dashboard",
      name: "Dashboard",
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
      id: "students",
      name: "My Students",
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
    },
    {
      id: "registration",
      name: "Register Student",
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
      id: "applications",
      name: "My Applications",
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "referrals",
      name: "Referrals",
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [studentsRes, statsRes, applicationsRes] = await Promise.all([
        api.get("/api/agents/my-students"),
        api.get("/api/agents/stats"),
        api.get("/api/agents/my-submitted-applications"),
      ]);

      console.log("Students response:", studentsRes.data);
      if (studentsRes.data.success) {
        const list =
          studentsRes.data.data?.students ?? studentsRes.data.data ?? [];
        console.log("Students data structure:", list);
        console.log("Is students data an array?", Array.isArray(list));
        console.log("Number of students:", Array.isArray(list) ? list.length : 0);
        setStudents(Array.isArray(list) ? list : []);
      }

      console.log("Applications response:", applicationsRes.data);
      if (applicationsRes.data.success) {
        // The API returns { success: true, data: { applications: [...], pagination: {...} } }
        const applicationsData = applicationsRes.data.data?.applications || applicationsRes.data.data || [];
        console.log("Applications data structure:", applicationsData);
        console.log("Is applications data an array?", Array.isArray(applicationsData));
        setApplications(Array.isArray(applicationsData) ? applicationsData : []);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
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
                  Students
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
          </>
        );
      case "students":
        return <AgentStudentsTab />;
      case "registration":
        return (
          <StudentRegistrationWorkflow onStudentUpdate={handleStudentUpdate} />
        );
      case "applications":
        return <AgentApplicationsTab applications={applications} />;
      case "referrals":
        return <ReferralManagement />;
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
