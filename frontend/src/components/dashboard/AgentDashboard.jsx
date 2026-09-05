import { useState, useEffect, useRef } from "react";
import { Squares2X2Icon, UsersIcon, UserGroupIcon, UserIcon, UserPlusIcon, ClipboardDocumentCheckIcon, GlobeAltIcon, CreditCardIcon, MegaphoneIcon, KeyIcon, DocumentTextIcon, HeartIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSession } from "../../contexts/SessionContext";
import DashboardLayout from "./DashboardLayout";
import StudentRegistrationWorkflow from "./tabs/StudentRegistrationWorkflow";
import AgentApplicationStatus from "./tabs/AgentApplicationStatus";
import AgentStudentsTab from "./tabs/AgentStudentsTab";
import StudentTable from "./components/StudentTable";
import ProgressPieChart from "./ProgressPieChart";
import ReferralDashboard from "./tabs/ReferralDashboard";
import AgentPaymentsTab from "./tabs/AgentPaymentsTab";
import api from "../../utils/api";

const EnhancedAgentDashboard = () => {
  const { user } = useAuth();
  const { selectedSession } = useSession();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [studentTableFilter, setStudentTableFilter] = useState("all");
  const [students, setStudents] = useState([]);
  const [agentView, setAgentView] = useState('combined'); // 'combined' | 'dashboard' | 'referral'
  const [stats, setStats] = useState({
    totalStudents: 0,
    draftStudents: 0,
    pendingStudents: 0,
    underReviewStudents: 0,
    approvedStudents: 0,
    rejectedStudents: 0,
    completedStudents: 0,
    dashboardRegistered: { total: 0, draft: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0, complete: 0 },
    referralSignups:     { total: 0, draft: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0, complete: 0 },
  });
  const isLoadingRef = useRef(false);

  const handleStatClick = (filterKey) => {
    const newFilter = filterKey === 'all' ? 'all' : filterKey;
    setStudentTableFilter(newFilter);
    setActiveTab("students");
  };

  // Reset filter when returning to dashboard
  useEffect(() => {
    if (activeTab === "dashboard") {
      setStudentTableFilter("all");
    }
  }, [activeTab]);
  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <Squares2X2Icon className="mr-3 h-5 w-5" /> },
    { id: 'referrals', name: 'My Referrals', icon: <UsersIcon className="mr-3 h-5 w-5" /> },
    { id: 'referral_earnings', name: 'Referral Earnings', icon: <CurrencyRupeeIcon className="mr-3 h-5 w-5" /> },
    { id: 'drafts', name: 'Draft Manager', icon: <DocumentTextIcon className="mr-3 h-5 w-5" /> },
    { id: 'new-registration', name: 'New Registration', icon: <UserPlusIcon className="mr-3 h-5 w-5" /> },
    { id: 'marketing', name: 'Marketing Materials', icon: <GlobeAltIcon className="mr-3 h-5 w-5" /> },
    { id: 'student-password-reset', name: 'Student Password Reset', icon: <KeyIcon className="mr-3 h-5 w-5" /> }
  ];
  useEffect(() => {
    loadDashboardData(selectedSession);
  }, [selectedSession]);

  // Reload data when switching back to dashboard tab
  useEffect(() => {
    if (activeTab === 'dashboard' && selectedSession) {
      loadDashboardData(selectedSession, false); // Don't show loading spinner on tab switch
    }
  }, [activeTab]);

  const loadDashboardData = async (session = selectedSession, showLoading = true) => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) {
      return;
    }

    // Don't load if no session selected
    if (!session) {
      console.warn('⚠️ No session selected, skipping data load');
      setLoading(false);
      return;
    }

    try {
      isLoadingRef.current = true;
      if (showLoading) {
        setLoading(true);
      }

      console.log('🔄 Loading agent dashboard data for session:', session);

      const params = {
        page: 1,
        limit: 1000,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        session: session
      };

      console.log('📤 API params:', params);

      const [studentsRes, statsRes] = await Promise.all([
        api.get("/api/agents/my-students", { params }),
        api.get("/api/agents/stats", { params: { session } })
      ]);

      console.log('📥 Students response:', studentsRes.data);
      console.log('📥 Stats response:', statsRes.data);

      if (studentsRes.data.success) {
        const list = studentsRes.data.data?.students ?? studentsRes.data.data ?? [];
        console.log('✅ Students loaded:', list.length);
        console.log('📋 Sample student data:', list[0]);
        console.log('📋 All student statuses:', list.map(s => ({ id: s._id, status: s.status, name: s.personalDetails?.fullName })));
        
        // Count statuses in frontend for comparison
        const statusCounts = list.reduce((acc, s) => {
          const status = s.status || 'UNKNOWN';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        console.log('📊 Frontend status counts:', statusCounts);
        
        setStudents(Array.isArray(list) ? list : []);
      } else {
        console.error('❌ Students API not successful:', studentsRes.data);
        setStudents([]);
      }

      if (statsRes.data.success) {
        console.log('📊 AgentDashboard - Stats response:', statsRes.data.data);
        const statsData = statsRes.data.data;

        const mappedStats = {
          totalStudents:      statsData.total         || 0,
          draftStudents:      statsData.draft         || 0,
          pendingStudents:    statsData.submitted     || 0, // Maps submitted count directly to pendingStudents to fit UI logic smoothly
          underReviewStudents:statsData.underReview   || 0,
          approvedStudents:   statsData.approved       || 0,
          rejectedStudents:   statsData.rejected       || 0,
          completedStudents:  statsData.completed      || 0,
          dashboardRegistered: statsData.dashboardRegistered || { total: 0, draft: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0, complete: 0 },
          referralSignups:     statsData.referralSignups    || { total: 0, draft: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0, complete: 0 },
        };
        
        setStats(mappedStats);
        console.log('📊 AgentDashboard - Stats mapped:', mappedStats);
        console.log('📊 AgentDashboard - Raw backend stats:', statsData);
      } else {
        console.error('❌ AgentDashboard - Stats not successful:', statsRes.data);
        // Set default stats if API fails
        setStats({
          totalStudents: students.length,
          pendingStudents: 0,
          underReviewStudents: 0,
          approvedStudents: 0,
          rejectedStudents: 0,
          completedStudents: 0,
        });
      }
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error);
      console.error("❌ Error details:", error.response?.data || error.message);
      // Set empty arrays on error
      setStudents([]);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  const handleStudentUpdate = (updatedStudent) => {
    // If updatedStudent has an _id that exists in current list, update it
    // Otherwise, refresh the entire list to include new submissions
    const studentExists = students.some(s => s._id === updatedStudent._id);
    
    if (studentExists) {
      setStudents((prev) => {
        if (!Array.isArray(prev)) return [];
        return prev.map((student) =>
          student._id === updatedStudent._id ? updatedStudent : student
        );
      });
    }
    
    // Always refresh dashboard data after student update to ensure new submissions appear
    // This ensures the session is preserved and data is refreshed
    if (selectedSession) {
      loadDashboardData(selectedSession, false);
    }
    
    // Trigger a custom event to refresh Students tab if it's active
    window.dispatchEvent(new CustomEvent('refreshStudentsList'));
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
              className="bg-[#7B3FA0] rounded-lg p-6 text-white mb-6"
            >
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {user?.fullName}! 👋
              </h2>
              <p className="text-blue-100">
                Manage your students and registrations.
              </p>
            </motion.div>




            {/* Assigned Manager Section */}
            {user?.assignedStaff && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-[#2A1E2E] rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex items-center justify-between"
                >
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Your Assigned Manager</h3>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {user.assignedStaff.firstName} {user.assignedStaff.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.assignedStaff.department} • {user.assignedStaff.email}
                        </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                </motion.div>
            )}

            {/* 3D Progress Chart — with view tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              {(() => {
                const viewData = {
                  combined: {
                    total:       stats.totalStudents,
                    draft:       stats.draftStudents,
                    submitted:   stats.pendingStudents,
                    underReview: stats.underReviewStudents,
                    approved:    stats.approvedStudents,
                    rejected:    stats.rejectedStudents,
                    complete:    stats.completedStudents,
                  },
                  dashboard: stats.dashboardRegistered || {},
                  referral:  stats.referralSignups     || {},
                };
                const active = viewData[agentView] || {};
                return (
                  <div>
                    {/* Toggle Tabs */}
                    <div className="flex gap-2 mb-4 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl w-fit">
                      {[
                        ['combined',  'Dashboard'],
                        ['dashboard', 'Registered by me'],
                        ['referral',  'Used my referral code'],
                      ].map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setAgentView(key)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            agentView === key
                              ? 'bg-white dark:bg-[#2A1E2E] text-[#387B95] dark:text-[#60A5FA] shadow-md'
                              : 'text-gray-600 dark:bg-transparent dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      {agentView === 'combined'  && 'All students associated with your account.'}
                      {agentView === 'dashboard' && 'Students you registered directly from this dashboard.'}
                      {agentView === 'referral'  && 'Students who self-registered using your referral code.'}
                    </p>

                    {/* Pie Chart */}
                    <div className="w-full lg:w-1/2 mx-auto">
                        <ProgressPieChart
                          chartData={[
                            { label: 'Draft',        value: active.draft       || 0, color: '#6B7280', filterKey: 'DRAFT' },
                            { label: 'Submitted',    value: active.submitted   || 0, color: '#6366F1', filterKey: 'SUBMITTED' },
                            { label: 'Rejected',     value: active.rejected    || 0, color: '#EF4444', filterKey: 'REJECTED' },
                            { label: 'Under Review', value: active.underReview || 0, color: '#EAB308', filterKey: 'UNDER_REVIEW' },
                            { label: 'Approved',     value: active.approved    || 0, color: '#14B8A6', filterKey: 'APPROVED' },
                            { label: 'Completed',    value: active.complete    || 0, color: '#22C55E', filterKey: 'COMPLETE' },
                          ]}
                          onSectionClick={handleStatClick}
                        />
                    </div>

                    {/* Status Filter Buttons */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3 mt-4">
                        {[
                          { key: 'DRAFT',        label: 'Draft',        count: active.draft,        activeClass: 'bg-gray-600 text-white',   inactiveClass: 'bg-gray-100 dark:bg-gray-700 text-gray-700 hover:bg-gray-200' },
                          { key: 'SUBMITTED',    label: 'Submitted',    count: active.submitted,    activeClass: 'bg-[#7B3FA0] text-white',   inactiveClass: 'bg-indigo-100 dark:bg-gray-700 text-[#5C2D80] hover:bg-indigo-200' },
                          { key: 'REJECTED',     label: 'Rejected',     count: active.rejected,     activeClass: 'bg-red-600 text-white',    inactiveClass: 'bg-red-100 dark:bg-gray-700 text-red-700 hover:bg-red-200' },
                          { key: 'UNDER_REVIEW', label: 'Under Review', count: active.underReview,  activeClass: 'bg-yellow-600 text-white', inactiveClass: 'bg-yellow-100 dark:bg-gray-700 text-yellow-700 hover:bg-yellow-200' },
                          { key: 'APPROVED',     label: 'Approved',     count: active.approved,     activeClass: 'bg-teal-500 text-white',  inactiveClass: 'bg-teal-100 dark:bg-gray-700 text-teal-700 hover:bg-teal-200' },
                          { key: 'COMPLETE',     label: 'Complete',     count: active.complete,     activeClass: 'bg-green-600 text-white', inactiveClass: 'bg-green-100 dark:bg-gray-700 text-green-900 hover:bg-green-300' },
                        ].map(({ key, label, count, activeClass, inactiveClass }) => (
                        <button
                          key={key}
                          onClick={() => handleStatClick(key)}
                          className={`px-2 py-2 rounded-lg font-medium transition-all duration-200 text-sm shadow-sm ${
                            studentTableFilter === key ? activeClass + ' shadow-lg' : inactiveClass
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-medium mb-0.5">{label}</span>
                            <span className="text-base font-semibold">{count || 0}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </motion.div>

            {/* Commission panel removed as requested */}

            {/* Student List Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-[#2A1E2E] rounded-lg shadow"
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
                  initialFilter={studentTableFilter}
                />
              </div>
            </motion.div>
          </>
        );
      case "students":
        return (
          <AgentStudentsTab 
            initialFilter={studentTableFilter}
            onStudentUpdate={handleStudentUpdate}
          />
        );
      case "registration":
        return (
          <StudentRegistrationWorkflow onStudentUpdate={handleStudentUpdate} />
        );
      case "application-status":
        return (
          <AgentApplicationStatus />
        );
      case "referrals":
        return (
          <ReferralDashboard />
        );
      case "payments":
        return (
          <AgentPaymentsTab />
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B3FA0]"></div>
        </div>
      </DashboardLayout>
    );
  }

  const handleItemClick = (itemId) => {
    // Check if the clicked item has an href (for external navigation)
    const item = sidebarItems.find(i => i.id === itemId);
    if (item && item.href) {
      navigate(item.href, { replace: true });
    } else {
      // Otherwise, handle as a tab switch
      setActiveTab(itemId);
    }
  };

  return (
    <DashboardLayout
      title="Agent Dashboard"
      sidebarItems={sidebarItems}
      activeItem={activeTab}
      showSessionSelector={true}
      onItemClick={handleItemClick}
    >
      {renderDashboardContent()}
    </DashboardLayout>
  );
};

export default EnhancedAgentDashboard;
