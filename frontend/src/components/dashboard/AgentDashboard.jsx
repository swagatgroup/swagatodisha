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
import {
  showSuccess,
  showError,
  showLoading,
  closeLoading,
  handleApiError,
  showSuccessToast
} from "../../utils/sweetAlert";
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

  // Table filter states for dashboard
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

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

  const handleEditSave = async () => {
    try {
      showLoading('Updating student...');
      const response = await api.put(`/api/agents/students/${selectedStudent._id}`, editData);
      closeLoading();
      if (response.data && response.data.success) {
        showSuccess('Student updated successfully!');
        setShowEditModal(false);
        setSelectedStudent(null);
        handleStudentUpdate();
      } else {
        showError(response.data?.message || 'Failed to update student');
      }
    } catch (error) {
      closeLoading();
      handleApiError(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':     return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400';
      case 'SUBMITTED':    return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-[#60A5FA]';
      case 'UNDER_REVIEW': return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400';
      case 'REJECTED':     return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400';
      case 'DRAFT':        return 'bg-gray-100 dark:bg-gray-800/60 text-gray-800 dark:text-gray-300';
      case 'COMPLETE':     return 'bg-[#F0E6FA] text-purple-800 dark:bg-[#231A2E]/20 dark:text-[#9B6FCC]';
      default:             return 'bg-gray-100 dark:bg-gray-800/60 text-gray-800 dark:text-gray-300';
    }
  };

  // Filter students for inline dashboard table
  const filteredStudents = students.filter(student => {
    const name = student.fullName || student.personalDetails?.fullName || '';
    const aadhar = student.aadharNumber || student.personalDetails?.aadharNumber || '';
    const phone = student.phone || student.contactDetails?.primaryPhone || '';
    const appNumber = student.applicationId || '';

    const matchesSearch = !searchTerm ||
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aadhar.includes(searchTerm) ||
      phone.includes(searchTerm) ||
      appNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = studentTableFilter === 'all' || student.status === studentTableFilter;

    const course = student.course || student.courseDetails?.selectedCourse || student.courseDetails?.courseName || '';
    const matchesCourse = filterCourse === 'all' || course === filterCourse;

    const matchesView =
      agentView === 'combined' ||
      (agentView === 'dashboard' && student.relationshipType !== 'referral') ||
      (agentView === 'referral' && student.relationshipType === 'referral');

    return matchesSearch && matchesStatus && matchesCourse && matchesView;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Available unique courses for dropdown
  const availableCourses = Array.from(new Set(
    students.map(s => s.course || s.courseDetails?.selectedCourse || s.courseDetails?.courseName).filter(Boolean)
  ));

  const renderDashboardContent = () => {
    switch (activeTab) {
      case "dashboard": {
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
        const active = viewData[agentView] || viewData.combined;

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

            {/* Quick Summary Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Students Card */}
              <div
                onClick={() => setActiveTab('students')}
                className="bg-white dark:bg-[#231A2E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer hover:shadow-md hover:border-[#4A1D7A]/30 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <UsersIcon className="h-6 w-6 text-[#4A1D7A] dark:text-[#9B6FCC]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalStudents}</p>
                    <p className="text-xs text-gray-400 mt-1">Click to view all</p>
                  </div>
                </div>
              </div>

              {/* Application Status Card */}
              <div
                onClick={() => setActiveTab('application-status')}
                className="bg-white dark:bg-[#231A2E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer hover:shadow-md hover:border-[#4A1D7A]/30 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                    <ClipboardDocumentCheckIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Approved / Active</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.approvedStudents + stats.completedStudents}</p>
                    <p className="text-xs text-gray-400 mt-1">{stats.underReviewStudents} under review · {stats.pendingStudents} submitted</p>
                  </div>
                </div>
              </div>

              {/* Student Payments Card */}
              <div
                onClick={() => setActiveTab('payments')}
                className="bg-white dark:bg-[#231A2E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer hover:shadow-md hover:border-[#4A1D7A]/30 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <CreditCardIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student Payments</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.paymentStats?.completed || 0}</p>
                    <p className="text-xs text-gray-400 mt-1">{stats.paymentStats?.partial || 0} partial · {stats.paymentStats?.pending || 0} pending</p>
                  </div>
                </div>
              </div>
            </div>

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
                    onClick={() => { setAgentView(key); setCurrentPage(1); }}
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
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 md:gap-3 mb-6">
                {[
                  { key: 'all',          label: 'Total',        count: active.total,       activeClass: 'bg-gray-800 text-white',    inactiveClass: 'bg-white dark:bg-[#231A2E] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700' },
                  { key: 'DRAFT',        label: 'Draft',        count: active.draft,       activeClass: 'bg-gray-600 text-white',    inactiveClass: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
                  { key: 'SUBMITTED',    label: 'Submitted',    count: active.submitted,   activeClass: 'bg-[#4A1D7A] text-white',   inactiveClass: 'bg-indigo-50 dark:bg-gray-700 text-[#351458] dark:text-indigo-300 border border-indigo-100 dark:border-gray-600' },
                  { key: 'UNDER_REVIEW', label: 'Under Review', count: active.underReview, activeClass: 'bg-yellow-600 text-white',  inactiveClass: 'bg-yellow-50 dark:bg-gray-700 text-yellow-700 dark:text-yellow-300 border border-yellow-100 dark:border-gray-600' },
                  { key: 'APPROVED',     label: 'Approved',     count: active.approved,    activeClass: 'bg-teal-500 text-white',    inactiveClass: 'bg-teal-50 dark:bg-gray-700 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-gray-600' },
                  { key: 'REJECTED',     label: 'Rejected',     count: active.rejected,    activeClass: 'bg-red-600 text-white',     inactiveClass: 'bg-red-50 dark:bg-gray-700 text-red-700 dark:text-red-300 border border-red-100 dark:border-gray-600' },
                  { key: 'COMPLETE',     label: 'Complete',     count: active.complete,    activeClass: 'bg-green-600 text-white',   inactiveClass: 'bg-green-50 dark:bg-gray-700 text-green-800 dark:text-green-200 border border-green-100 dark:border-gray-600' },
                ].map(({ key, label, count, activeClass, inactiveClass }) => {
                  const isActive = studentTableFilter === key || (key === 'all' && studentTableFilter === 'all');
                  return (
                    <button
                      key={key}
                      onClick={() => { setStudentTableFilter(key); setCurrentPage(1); }}
                      className={`px-2 py-3 rounded-xl font-medium transition-all duration-200 text-sm shadow-sm hover:shadow-md ${
                        isActive ? activeClass + ' shadow-lg scale-[1.02]' : inactiveClass
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-medium mb-1 opacity-80">{label}</span>
                        <span className="text-xl font-bold">{count || 0}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 2-Column Charts Grid: Application Progress + Payment Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Left: Application Progress 3D Pie Chart */}
                <div className="bg-white dark:bg-[#231A2E] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 w-full text-center">Application Progress</h3>
                  <div className="w-full max-w-sm">
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

            {/* Recent Students Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#231A2E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      My Students
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-0.5">
                      View and manage your student applications
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {filteredStudents.length > 0 ? (
                      `${filteredStudents.length} ${filteredStudents.length === 1 ? 'Student' : 'Students'}`
                    ) : 'No students found'}
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Search by name, Aadhar, phone..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A1D7A]"
                  />
                  <select
                    value={studentTableFilter}
                    onChange={(e) => { setStudentTableFilter(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A1D7A]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="COMPLETE">Complete</option>
                  </select>
                  <select
                    value={filterCourse}
                    onChange={(e) => { setFilterCourse(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A1D7A]"
                  >
                    <option value="all">All Courses</option>
                    {availableCourses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        {['S.No', 'Student', 'Aadhar', 'Phone', 'Course', 'Status', 'Relationship', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#231A2E] divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedStudents.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                            No students found matching current filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedStudents.map((student, index) => {
                          const serialNumber = ((currentPage - 1) * itemsPerPage) + index + 1;
                          const name = student.fullName || student.personalDetails?.fullName || 'N/A';
                          const aadhar = student.aadharNumber || student.personalDetails?.aadharNumber || 'N/A';
                          const phone = student.phone || student.contactDetails?.primaryPhone || 'N/A';
                          const course = student.course || student.courseDetails?.selectedCourse || student.courseDetails?.courseName || 'N/A';
                          const isReferral = student.relationshipType === 'referral';

                          return (
                            <tr key={student._id} className="hover:bg-gray-50 dark:bg-[#1A1212] dark:hover:bg-gray-700 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">{serialNumber}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-[#4A1D7A] dark:text-[#C084FC] font-semibold text-sm">
                                    {typeof name === 'string' ? name.charAt(0).toUpperCase() : 'S'}
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</div>
                                    <div className="text-xs text-gray-400">ID: {student.applicationId || student._id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700 dark:text-gray-300">{aadhar}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{phone}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{course}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                                  {student.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-xs">
                                <span className={`px-2 py-1 rounded-md font-medium ${isReferral ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'}`}>
                                  {isReferral ? 'Referral Signup' : 'Registered by me'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() => { setSelectedStudent(student); setShowDetailsModal(true); }}
                                    className="text-[#387B95] hover:text-blue-800 dark:text-[#60A5FA]"
                                    title="View Details"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedStudent(student);
                                      setEditData({
                                        personalDetails: student.personalDetails || {},
                                        contactDetails:  student.contactDetails  || {},
                                        courseDetails:   student.courseDetails   || {},
                                        guardianDetails: student.guardianDetails || {}
                                      });
                                      setShowEditModal(true);
                                    }}
                                    className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400"
                                    title="Edit Student"
                                  >
                                    Edit
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
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

      {/* Student Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowDetailsModal(false)}>
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
            <div className="relative bg-white dark:bg-[#231A2E] rounded-2xl shadow-xl max-w-2xl w-full p-6 z-10" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Student Details</h3>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Full Name:</span>
                  <p className="text-gray-900 dark:text-gray-100 mt-0.5">{selectedStudent.fullName || selectedStudent.personalDetails?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Application ID:</span>
                  <p className="text-gray-900 dark:text-gray-100 mt-0.5">{selectedStudent.applicationId || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Phone:</span>
                  <p className="text-gray-900 dark:text-gray-100 mt-0.5">{selectedStudent.phone || selectedStudent.contactDetails?.primaryPhone || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Email:</span>
                  <p className="text-gray-900 dark:text-gray-100 mt-0.5">{selectedStudent.email || selectedStudent.contactDetails?.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Aadhar Number:</span>
                  <p className="text-gray-900 dark:text-gray-100 mt-0.5 font-mono">{selectedStudent.aadharNumber || selectedStudent.personalDetails?.aadharNumber || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Course:</span>
                  <p className="text-gray-900 dark:text-gray-100 mt-0.5">{selectedStudent.course || selectedStudent.courseDetails?.selectedCourse || selectedStudent.courseDetails?.courseName || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Status:</span>
                  <p className="mt-0.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedStudent.status)}`}>
                      {selectedStudent.status}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Registration Type:</span>
                  <p className="text-gray-900 dark:text-gray-100 mt-0.5">
                    {selectedStudent.relationshipType === 'referral' ? 'Referral Signup' : 'Direct Dashboard Registration'}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 bg-[#4A1D7A] text-white rounded-xl text-sm font-medium">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowEditModal(false)}>
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
            <div className="relative bg-white dark:bg-[#231A2E] rounded-2xl shadow-xl max-w-2xl w-full p-6 z-10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Edit Student</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2">Personal Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['fullName', 'Full Name'],
                      ['fathersName', "Father's Name"],
                      ['mothersName', "Mother's Name"],
                      ['gender', 'Gender'],
                      ['aadharNumber', 'Aadhar Number']
                    ].map(([field, label]) => (
                      <div key={field}>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                        <input
                          type="text"
                          value={(editData.personalDetails && editData.personalDetails[field]) || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditData(prev => ({
                              ...prev,
                              personalDetails: { ...prev.personalDetails, [field]: val }
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A1D7A]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2">Contact Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['email', 'Email'],
                      ['primaryPhone', 'Phone']
                    ].map(([field, label]) => (
                      <div key={field}>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                        <input
                          type="text"
                          value={(editData.contactDetails && editData.contactDetails[field]) || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditData(prev => ({
                              ...prev,
                              contactDetails: { ...prev.contactDetails, [field]: val }
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A1D7A]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="px-4 py-2 bg-[#4A1D7A] text-white rounded-xl text-sm font-medium hover:bg-[#351458]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EnhancedAgentDashboard;
