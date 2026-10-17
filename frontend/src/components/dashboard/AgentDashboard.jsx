import { useState, useEffect, useRef } from "react";
import {
  Squares2X2Icon,
  UsersIcon,
  UserPlusIcon,
  ClipboardDocumentCheckIcon,
  CreditCardIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useSession } from "../../contexts/SessionContext";
import DashboardLayout from "./DashboardLayout";
import StudentRegistrationWorkflow from "./tabs/StudentRegistrationWorkflow";
import AgentApplicationStatus from "./tabs/AgentApplicationStatus";
import AgentStudentsTab from "./tabs/AgentStudentsTab";
import AgentPaymentsTab from "./tabs/AgentPaymentsTab";
import ReferralDashboard from "./tabs/ReferralDashboard";
import ProgressPieChart from "./ProgressPieChart";
import PaymentPieChart from "./PaymentPieChart";
import StatusFilterRow from "./components/StatusFilterRow";
import { buildStatusChartData } from "../../utils/applicationStatuses";
import { showSuccessToast } from "../../utils/sweetAlert";
import api from "../../utils/api";

const EnhancedAgentDashboard = () => {
  const { user } = useAuth();
  const { selectedSession } = useSession();
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
    paymentStats: { total: 0, pending: 0, partial: 0, overdue: 0, completed: 0 },
    dashboardRegistered: { total: 0, draft: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0, complete: 0 },
    referralSignups:     { total: 0, draft: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0, complete: 0 },
  });


  const isLoadingRef = useRef(false);

  const sidebarItems = [
    { id: 'dashboard',          name: 'Dashboard',          icon: <Squares2X2Icon className="mr-3 h-5 w-5" /> },
    { id: 'students',           name: 'My Students',        icon: <UsersIcon className="mr-3 h-5 w-5" /> },
    { id: 'new-registration',   name: 'New Registration',   icon: <UserPlusIcon className="mr-3 h-5 w-5" /> },
    { id: 'application-status', name: 'Application Status', icon: <ClipboardDocumentCheckIcon className="mr-3 h-5 w-5" /> },
    { id: 'payments',           name: 'Payments',           icon: <CreditCardIcon className="mr-3 h-5 w-5" /> },
    { id: 'referrals',          name: 'Refer & Earn',       icon: <MegaphoneIcon className="mr-3 h-5 w-5" /> }
  ];

  const handleStatClick = (filterKey) => {
    const newFilter = filterKey === 'all' ? 'all' : filterKey;
    setStudentTableFilter(newFilter);
    setActiveTab("students");
  };

  useEffect(() => {
    if (selectedSession) {
      loadDashboardData(selectedSession);
    }
  }, [selectedSession]);

  useEffect(() => {
    if (activeTab === 'dashboard' && selectedSession) {
      loadDashboardData(selectedSession, false);
    }
  }, [activeTab]);

  const loadDashboardData = async (session = selectedSession, showSpinner = true) => {
    if (isLoadingRef.current) return;
    if (!session) {
      setLoading(false);
      return;
    }

    try {
      isLoadingRef.current = true;
      if (showSpinner) setLoading(true);

      const params = {
        page: 1,
        limit: 1000,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        session: session
      };

      const [studentsRes, statsRes] = await Promise.all([
        api.get("/api/agents/my-students", { params }),
        api.get("/api/agents/stats", { params: { session } })
      ]);

      if (studentsRes.data && studentsRes.data.success) {
        const list = studentsRes.data.data?.students ?? studentsRes.data.data ?? [];
        setStudents(Array.isArray(list) ? list : []);
      } else {
        setStudents([]);
      }

      if (statsRes.data && statsRes.data.success) {
        const statsData = statsRes.data.data;
        setStats({
          totalStudents:       statsData.total         || 0,
          draftStudents:       statsData.draft         || 0,
          pendingStudents:     statsData.submitted     || 0,
          underReviewStudents: statsData.underReview   || 0,
          approvedStudents:    statsData.approved      || 0,
          rejectedStudents:    statsData.rejected      || 0,
          completedStudents:   statsData.completed     || 0,
          paymentStats:        statsData.paymentStats  || { total: 0, pending: 0, partial: 0, overdue: 0, completed: 0 },
          dashboardRegistered: statsData.dashboardRegistered || { total: 0, draft: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0, complete: 0 },
          referralSignups:     statsData.referralSignups    || { total: 0, draft: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0, complete: 0 },
        });
      }
    } catch (error) {
      console.error("Error loading agent dashboard data:", error);
      setStudents([]);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  const handleStudentUpdate = () => {
    showSuccessToast('Updated successfully!');
    if (selectedSession) {
      loadDashboardData(selectedSession, false);
    }
    window.dispatchEvent(new CustomEvent('refreshStudentsList'));
  };



  // COMPLETION_REQUESTED sits between Approved and Complete; count/filter it as Approved
  const normalizeStatus = (status) => (status === 'COMPLETION_REQUESTED' ? 'APPROVED' : status);

  const matchesAgentView = (student) =>
    agentView === 'combined' ||
    (agentView === 'dashboard' && student.relationshipType !== 'referral') ||
    (agentView === 'referral' && student.relationshipType === 'referral');

  // Status counts come from the same list the table shows, so they always match the table and sum to Total
  const viewStudents = students.filter(matchesAgentView);
  const countStatus = (status) => viewStudents.filter(s => normalizeStatus(s.status) === status).length;
  const statusCounts = {
    total:       viewStudents.length,
    draft:       countStatus('DRAFT'),
    rejected:    countStatus('REJECTED'),
    submitted:   countStatus('SUBMITTED'),
    underReview: countStatus('UNDER_REVIEW'),
    approved:    countStatus('APPROVED'),
    complete:    countStatus('COMPLETE'),
  };


  const renderDashboardContent = () => {
    switch (activeTab) {
      case "dashboard": {
        const active = statusCounts;

        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#4A1D7A] rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  Welcome back, {user?.fullName || 'Agent'}! 👋
                </h2>
                <p className="text-purple-200 text-sm">
                  Track student admissions, payment status, and referral performance.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('new-registration')}
                className="px-4 py-2 bg-white text-[#4A1D7A] rounded-xl font-semibold text-sm hover:bg-purple-50 transition-colors shadow-sm flex items-center gap-2"
              >
                <UserPlusIcon className="w-5 h-5" />
                Register Student
              </button>
            </motion.div>

            {/* Assigned Manager Section */}
            {user?.assignedStaff && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#231A2E] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">Your Assigned Manager</h3>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {user.assignedStaff.firstName} {user.assignedStaff.lastName || ''}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    {user.assignedStaff.department ? user.assignedStaff.department + ' • ' : ''}{user.assignedStaff.email || ''}{user.assignedStaff.phone ? ' • ' + user.assignedStaff.phone : ''}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-[#4A1D7A] dark:text-[#9B6FCC]">
                  <UsersIcon className="w-6 h-6" />
                </div>
              </motion.div>
            )}

            {/* View Toggle + Status Buttons + 2-Column Pie Charts */}
            <div className="mt-2">
              {/* View Toggle */}
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
                        ? 'bg-white dark:bg-[#231A2E] text-[#387B95] dark:text-[#60A5FA] shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-300 mb-3">
                {agentView === 'combined'  && 'All students associated with your account in this session.'}
                {agentView === 'dashboard' && 'Students you registered directly from this dashboard.'}
                {agentView === 'referral'  && 'Students who self-registered using your referral code.'}
              </p>

              {/* Status Filter Buttons */}
              <StatusFilterRow
                counts={active}
                activeKey={studentTableFilter}
                onSelect={handleStatClick}
              />

              {/* 2-Column Charts Grid: Application Progress + Payment Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Left: Application Progress 3D Pie Chart */}
                <div className="bg-white dark:bg-[#231A2E] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 w-full text-center">Application Progress</h3>
                  <div className="w-full max-w-sm">
                    <ProgressPieChart
                      chartData={buildStatusChartData(active)}
                      onSectionClick={handleStatClick}
                    />
                  </div>
                </div>

                {/* Right: Payment Status 3D Pie Chart */}
                <div className="w-full flex justify-center items-center">
                  <div className="w-full max-w-sm">
                    <PaymentPieChart
                      paymentStats={stats.paymentStats}
                      onSectionClick={() => setActiveTab('payments')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Students - the same table as My Students (last 10, newest first), like the other dashboards */}
            <AgentStudentsTab
              mode="recent"
              listType={agentView}
              onStudentUpdate={handleStudentUpdate}
            />
          </div>
        );
      }

      case "students":
        return (
          <AgentStudentsTab
            initialFilter={studentTableFilter}
            onStudentUpdate={handleStudentUpdate}
          />
        );

      case "new-registration":
      case "registration":
        return (
          <StudentRegistrationWorkflow onStudentUpdate={handleStudentUpdate} />
        );

      case "application-status":
        return (
          <AgentApplicationStatus />
        );

      case "payments":
        return (
          <AgentPaymentsTab />
        );

      case "referrals":
      case "referral_earnings":
      case "marketing":
        return (
          <ReferralDashboard />
        );

      case "drafts":
        return (
          <AgentStudentsTab
            initialFilter="DRAFT"
            onStudentUpdate={handleStudentUpdate}
          />
        );

      default:
        return (
          <div className="p-6 text-center text-gray-500">
            <p>Section not found. Returning to dashboard...</p>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="mt-3 px-4 py-2 bg-[#4A1D7A] text-white rounded-xl text-sm"
            >
              Go to Dashboard
            </button>
          </div>
        );
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A1D7A]"></div>
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
