import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../contexts/AuthContext";
import { useSession } from "../../../contexts/SessionContext";
import api from "../../../utils/api";
import { showSuccess, showError, showLoading, closeLoading } from "../../../utils/sweetAlert";
import { 
  EyeIcon, 
  PencilIcon, 
  ArrowPathIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

const AgentStudentsTab = () => {
  const { user } = useAuth();
  const { selectedSession } = useSession();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editData, setEditData] = useState({});
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionDetails, setRejectionDetails] = useState(null);
  const [resubmitting, setResubmitting] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    course: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    thisMonth: 0,
  });

  // Debug stats state changes
  useEffect(() => {
    console.log('📊 Stats state updated:', stats);
  }, [stats]);

  useEffect(() => {
    if (selectedSession) {
      loadStudents();
      loadStats();
    } else {
      console.warn('⚠️ No session selected in AgentStudentsTab');
      setStudents([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSession]);

  // Reload when filters change (but not on initial mount)
  useEffect(() => {
    if (selectedSession && students.length > 0) {
      // Only reload if we already have data (filters changed)
      const timer = setTimeout(() => {
        loadStudents();
      }, 300); // Debounce filter changes
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status, filters.course]);

  const loadStudents = async () => {
    if (!selectedSession) {
      console.warn('⚠️ Cannot load students: no session selected');
      return;
    }

    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 1000,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        session: selectedSession,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.course && { course: filters.course }),
      };

      console.log('📤 Loading students with params:', params);
      const response = await api.get("/api/agents/my-students", { params });
      console.log('📥 Students API response:', response.data);

      if (response.data.success) {
        const list = response.data.data?.students ?? response.data.data ?? [];
        console.log('✅ Students loaded:', list.length, 'items');
        console.log('📋 Sample student:', list[0]);
        console.log('📋 Student statuses:', list.map(s => ({ id: s._id, status: s.status, name: s.personalDetails?.fullName })));
        setStudents(Array.isArray(list) ? list : []);
      } else {
        console.error('❌ Students API not successful:', response.data);
        setStudents([]);
        showError(response.data.message || "Failed to load students");
      }
    } catch (error) {
      console.error("❌ Error loading students:", error);
      console.error("❌ Error response:", error.response?.data);
      setStudents([]);
      showError(error.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('📊 Loading agent stats...');
      const response = await api.get("/api/agents/stats", {
        params: {
          session: selectedSession
        }
      });
      console.log('📊 Stats response:', response.data);
      if (response.data.success) {
        setStats(response.data.data);
        console.log('📊 Stats set:', response.data.data);
      } else {
        console.error('📊 Stats response not successful:', response.data);
      }
    } catch (error) {
      console.error("📊 Error loading stats:", error);
      console.error("📊 Error response:", error.response?.data);
    }
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setEditData({
      personalDetails: {
        fullName: student.personalDetails?.fullName || '',
        fathersName: student.personalDetails?.fathersName || '',
        mothersName: student.personalDetails?.mothersName || '',
        gender: student.personalDetails?.gender || '',
        dateOfBirth: student.personalDetails?.dateOfBirth || '',
        aadharNumber: student.personalDetails?.aadharNumber || '',
        status: student.personalDetails?.status || ''
      },
      contactDetails: {
        primaryPhone: student.contactDetails?.primaryPhone || '',
        secondaryPhone: student.contactDetails?.secondaryPhone || '',
        email: student.contactDetails?.email || '',
        address: student.contactDetails?.address || '',
        city: student.contactDetails?.city || '',
        state: student.contactDetails?.state || '',
        pincode: student.contactDetails?.pincode || ''
      },
      courseDetails: {
        selectedCourse: student.courseDetails?.selectedCourse || '',
        preferredLanguage: student.courseDetails?.preferredLanguage || ''
      },
      guardianDetails: {
        guardianName: student.guardianDetails?.guardianName || '',
        guardianPhone: student.guardianDetails?.guardianPhone || '',
        guardianRelation: student.guardianDetails?.guardianRelation || ''
      }
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      showLoading('Updating student...');
      
      const response = await api.put(`/api/agents/students/${selectedStudent._id}`, editData);
      
      if (response.data.success) {
        // If the application was rejected, ask if they want to resubmit
        if (selectedStudent.status === 'REJECTED') {
          const resubmit = await window.confirm(
            'Application updated successfully! Would you like to resubmit it for admin review?'
          );
          
          if (resubmit) {
            // Resubmit the application
            try {
              showLoading('Resubmitting application...');
              const resubmitResponse = await api.post(`/api/agents/students/${selectedStudent._id}/resubmit`);
              if (resubmitResponse.data.success) {
                showSuccess('Application resubmitted successfully! It will be reviewed again.');
              }
            } catch (resubmitError) {
              console.error('Error resubmitting application:', resubmitError);
              showError('Failed to resubmit application');
            }
          } else {
            showSuccess('Application updated successfully!');
          }
        } else {
          showSuccess('Application updated successfully!');
        }
        
        setShowEditModal(false);
        setSelectedStudent(null);
        setEditData({});
        loadStudents(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating student:', error);
      showError('Failed to update student');
    } finally {
      closeLoading();
    }
  };

  const fetchRejectionDetails = async (studentId) => {
    try {
      console.log('🔍 Fetching rejection details for:', studentId);
      const response = await api.get(`/api/agents/students/${studentId}/rejection-details`);
      console.log('📥 Rejection details response:', response.data);
      if (response.data.success) {
        setRejectionDetails(response.data.data);
        setShowRejectionModal(true);
        console.log('✅ Rejection modal should now be visible');
      }
    } catch (error) {
      console.error('❌ Error fetching rejection details:', error);
      showError('Failed to load rejection details');
    }
  };

  const resubmitApplication = async (studentId) => {
    const confirmed = await window.confirm(
      'Are you sure you want to resubmit this application? Make sure you have addressed all the issues mentioned in the rejection feedback.'
    );

    if (!confirmed) return;

    try {
      setResubmitting(true);
      showLoading('Resubmitting application...');
      
      console.log('📤 Resubmitting application:', studentId);
      const response = await api.post(`/api/agents/students/${studentId}/resubmit`);
      console.log('✅ Resubmit response:', response.data);
      
      if (response.data.success) {
        showSuccess('Application resubmitted successfully! It will be reviewed again.');
        setShowRejectionModal(false);
        setRejectionDetails(null);
        // Refresh the list to show updated status
        await loadStudents();
        console.log('🔄 Student list refreshed after resubmit');
      }
    } catch (error) {
      console.error('❌ Error resubmitting application:', error);
      showError('Failed to resubmit application');
    } finally {
      setResubmitting(false);
      closeLoading();
    }
  };

  const handleViewDetails = async (student) => {
    try {
      setViewingStudent(student);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error loading student details:', error);
      showError('Failed to load student details');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
      case "SUBMITTED":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
      case "UNDER_REVIEW":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    console.log('🏷️ Converting status:', status, 'type:', typeof status);
    switch (status) {
      case "PENDING":
      case "SUBMITTED":
        return "Pending";
      case "IN_PROGRESS":
      case "UNDER_REVIEW":
        return "In Progress";
      case "COMPLETED":
      case "APPROVED":
        return "Completed";
      case "REJECTED":
        return "Rejected";
      default:
        console.log('❌ Unknown status found:', status);
        return status || "Unknown";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredStudents = students.filter((student) => {
    // Search filter
    const matchesSearch =
      !filters.search ||
      student.personalDetails?.fullName
        ?.toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      student.personalDetails?.aadharNumber?.includes(filters.search) ||
      student.contactDetails?.primaryPhone?.includes(filters.search) ||
      student.contactDetails?.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      student.applicationId?.toLowerCase().includes(filters.search.toLowerCase());

    // Status filter - handle multiple status values
    const matchesStatus = !filters.status || 
      student.status === filters.status ||
      student.status === filters.status.toUpperCase() ||
      (filters.status === 'PENDING' && (student.status === 'SUBMITTED' || student.status === 'PENDING')) ||
      (filters.status === 'IN_PROGRESS' && (student.status === 'UNDER_REVIEW' || student.status === 'IN_PROGRESS')) ||
      (filters.status === 'COMPLETED' && (student.status === 'APPROVED' || student.status === 'COMPLETED'));

    // Course filter
    const matchesCourse =
      !filters.course ||
      student.courseDetails?.selectedCourse === filters.course ||
      student.courseDetails?.courseName === filters.course;

    return matchesSearch && matchesStatus && matchesCourse;
  });

  if (!selectedSession) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No Session Selected
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please select an academic session to view students.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Students</h2>
        <div className="text-sm text-gray-600">
          Total: {stats.total} | This Month: {stats.thisMonth}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
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
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Students
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
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
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.completed}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.thisMonth}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Search by name, Aadhaar, or phone..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="APPROVED">Approved</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Course
            </label>
            <select
              value={filters.course}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, course: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Courses</option>
              <option value="B.Tech Computer Science">
                B.Tech Computer Science
              </option>
              <option value="B.Tech Mechanical Engineering">
                B.Tech Mechanical Engineering
              </option>
              <option value="B.Tech Electrical Engineering">
                B.Tech Electrical Engineering
              </option>
              <option value="MBA">MBA</option>
              <option value="BCA">BCA</option>
              <option value="B.Com">B.Com</option>
              <option value="BA">BA</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                console.log('🔄 Applying filters:', filters);
                loadStudents();
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </button>
            {(filters.search || filters.status || filters.course) && (
              <button
                onClick={() => {
                  setFilters({ search: "", status: "", course: "" });
                  setTimeout(() => loadStudents(), 100);
                }}
                className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Students ({filteredStudents.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13.5 4a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        {students.length === 0 ? 'No Students Found' : 'No Students Match Filters'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {students.length === 0 
                          ? `No students found for the ${selectedSession} academic session.`
                          : 'Try adjusting your search or filter criteria.'}
                      </p>
                      {students.length === 0 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Students will appear here once you register them.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <motion.tr
                    key={student._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {student.personalDetails?.fullName?.charAt(0) || "S"}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {student.personalDetails?.fullName || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Aadhaar:{" "}
                          {student.personalDetails?.aadharNumber || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {student.contactDetails?.primaryPhone || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {student.contactDetails?.email || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {student.courseDetails?.selectedCourse || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {student.courseDetails?.campus || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        student.status
                      )}`}
                    >
                      {getStatusText(student.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(student.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {/* View Details - Available for all statuses */}
                      <button
                        onClick={() => handleViewDetails(student)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        title="View application details"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </button>

                      {/* Edit - Only for DRAFT and REJECTED */}
                      {(student.status === 'DRAFT' || student.status === 'REJECTED') && (
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                          title={student.status === 'REJECTED' ? 'Edit and resubmit application' : 'Edit application'}
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          {student.status === 'REJECTED' ? 'Edit' : 'Edit'}
                        </button>
                      )}

                      {/* View Rejection - Only for REJECTED */}
                      {student.status === 'REJECTED' && (
                        <button
                          onClick={async () => {
                            console.log('👆 View Rejection clicked for student:', student);
                            setSelectedStudent(student);
                            await fetchRejectionDetails(student._id);
                          }}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                          title="View rejection details"
                        >
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          Rejection
                        </button>
                      )}

                      {/* Resubmit - Only for REJECTED */}
                      {student.status === 'REJECTED' && (
                        <button
                          onClick={() => resubmitApplication(student._id)}
                          disabled={resubmitting}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Resubmit application for review"
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-1" />
                          Resubmit
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Student: {selectedStudent.personalDetails?.fullName}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Personal Details */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Personal Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editData.personalDetails?.fullName || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          personalDetails: { ...editData.personalDetails, fullName: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                      <input
                        type="text"
                        value={editData.personalDetails?.fathersName || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          personalDetails: { ...editData.personalDetails, fathersName: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                      <input
                        type="text"
                        value={editData.personalDetails?.mothersName || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          personalDetails: { ...editData.personalDetails, mothersName: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        value={editData.personalDetails?.gender || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          personalDetails: { ...editData.personalDetails, gender: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={editData.personalDetails?.dateOfBirth || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          personalDetails: { ...editData.personalDetails, dateOfBirth: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
                      <input
                        type="text"
                        value={editData.personalDetails?.aadharNumber || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          personalDetails: { ...editData.personalDetails, aadharNumber: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Contact Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone</label>
                      <input
                        type="tel"
                        value={editData.contactDetails?.primaryPhone || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          contactDetails: { ...editData.contactDetails, primaryPhone: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Phone</label>
                      <input
                        type="tel"
                        value={editData.contactDetails?.secondaryPhone || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          contactDetails: { ...editData.contactDetails, secondaryPhone: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editData.contactDetails?.email || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          contactDetails: { ...editData.contactDetails, email: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea
                        value={editData.contactDetails?.address || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          contactDetails: { ...editData.contactDetails, address: e.target.value }
                        })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={editData.contactDetails?.city || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          contactDetails: { ...editData.contactDetails, city: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={editData.contactDetails?.state || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          contactDetails: { ...editData.contactDetails, state: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        value={editData.contactDetails?.pincode || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          contactDetails: { ...editData.contactDetails, pincode: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Course Details */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Course Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Selected Course</label>
                      <select
                        value={editData.courseDetails?.selectedCourse || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          courseDetails: { ...editData.courseDetails, selectedCourse: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Course</option>
                        <option value="B.Tech">B.Tech</option>
                        <option value="M.Tech">M.Tech</option>
                        <option value="MBA">MBA</option>
                        <option value="BBA">BBA</option>
                        <option value="BCA">BCA</option>
                        <option value="MCA">MCA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                      <select
                        value={editData.courseDetails?.preferredLanguage || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          courseDetails: { ...editData.courseDetails, preferredLanguage: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Language</option>
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Odia">Odia</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Guardian Details */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Guardian Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
                      <input
                        type="text"
                        value={editData.guardianDetails?.guardianName || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          guardianDetails: { ...editData.guardianDetails, guardianName: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Phone</label>
                      <input
                        type="tel"
                        value={editData.guardianDetails?.guardianPhone || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          guardianDetails: { ...editData.guardianDetails, guardianPhone: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Relation</label>
                      <select
                        value={editData.guardianDetails?.guardianRelation || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          guardianDetails: { ...editData.guardianDetails, guardianRelation: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Relation</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Document Upload Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                    📎 Document Management
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    To upload or update documents for this student:
                  </p>
                  <ol className="text-sm text-blue-700 dark:text-blue-300 list-decimal list-inside space-y-1">
                    <li>Click "Save Changes" below to update the student information</li>
                    <li>Go to the <strong>"Documents"</strong> tab in the main dashboard</li>
                    <li>Find this student and upload/update their documents</li>
                    <li>After all documents are uploaded, you can resubmit the application</li>
                  </ol>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Details Modal */}
      {showRejectionModal && rejectionDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Rejection Details{selectedStudent && ` - ${selectedStudent.personalDetails?.fullName || 'Student'}`}
                </h3>
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Rejection Summary */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-red-800 dark:text-red-200 mb-3">
                    Rejection Summary
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Reason: </span>
                      <span className="text-gray-900 dark:text-gray-100">{rejectionDetails.rejectionReason || 'Not specified'}</span>
                    </div>
                    {rejectionDetails.rejectionMessage && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Message: </span>
                        <span className="text-gray-900 dark:text-gray-100">{rejectionDetails.rejectionMessage}</span>
                      </div>
                    )}
                    {rejectionDetails.rejectedAt && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Rejected On: </span>
                        <span className="text-gray-900 dark:text-gray-100">{new Date(rejectionDetails.rejectedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specific Issues */}
                {rejectionDetails.rejectionDetails && rejectionDetails.rejectionDetails.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Specific Issues to Address
                    </h4>
                    <div className="space-y-4">
                      {rejectionDetails.rejectionDetails.map((detail, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Issue: </span>
                              <span className="text-sm text-gray-900 dark:text-gray-100">{detail.issue}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Document: </span>
                              <span className="text-sm text-gray-900 dark:text-gray-100">{detail.documentType}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Action Required: </span>
                              <span className="text-sm text-gray-900 dark:text-gray-100">{detail.actionRequired}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority: </span>
                              <span className={`text-sm px-2 py-1 rounded ${detail.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {detail.priority}
                              </span>
                            </div>
                            {detail.specificFeedback && (
                              <div className="md:col-span-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Specific Feedback: </span>
                                <span className="text-sm text-gray-900 dark:text-gray-100">{detail.specificFeedback}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {rejectionDetails.adminNotes && rejectionDetails.adminNotes.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Additional Notes</h4>
                    <div className="space-y-2">
                      {rejectionDetails.adminNotes.map((note, index) => (
                        <div key={index} className="border-l-4 border-gray-400 pl-4 py-2 bg-gray-50 dark:bg-gray-800">
                          <p className="text-sm text-gray-900 dark:text-gray-100">{note.note || note}</p>
                          {note.addedAt && (
                            <p className="text-xs text-gray-500 mt-1">{new Date(note.addedAt).toLocaleString()}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Next Steps
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-blue-900 dark:text-blue-100">
                    <li>Review all the rejection details carefully</li>
                    <li>Make necessary corrections to the student's information</li>
                    <li>Upload or update any missing or incorrect documents</li>
                    <li>Click "Resubmit" when all issues have been addressed</li>
                    <li>The application will be sent back to admin for review</li>
                  </ol>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedStudent && (
                  <>
                    <button
                      onClick={() => {
                        setShowRejectionModal(false);
                        handleEditStudent(selectedStudent);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit Application
                    </button>
                    <button
                      onClick={() => {
                        const studentId = selectedStudent._id;
                        setShowRejectionModal(false);
                        setTimeout(() => resubmitApplication(studentId), 100);
                      }}
                      disabled={resubmitting}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {resubmitting ? 'Resubmitting...' : 'Resubmit'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && viewingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Application Details - {viewingStudent.personalDetails?.fullName || 'Student'}
                </h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingStudent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Application Status */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Application ID</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {viewingStudent.applicationId || viewingStudent._id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(viewingStudent.status)}`}>
                        {getStatusText(viewingStudent.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Personal Details */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Personal Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Full Name:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{viewingStudent.personalDetails?.fullName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Aadhaar:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{viewingStudent.personalDetails?.aadharNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Date of Birth:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {viewingStudent.personalDetails?.dateOfBirth ? formatDate(viewingStudent.personalDetails.dateOfBirth) : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{viewingStudent.personalDetails?.gender || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{viewingStudent.contactDetails?.primaryPhone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{viewingStudent.contactDetails?.email || 'N/A'}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-600 dark:text-gray-400">Address:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{viewingStudent.contactDetails?.address || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Course Details */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Course Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Course:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{viewingStudent.courseDetails?.selectedCourse || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Registration Date:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{formatDate(viewingStudent.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Documents Status */}
                {viewingStudent.documents && viewingStudent.documents.length > 0 && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Documents</h4>
                    <div className="space-y-2">
                      {viewingStudent.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <span className="text-sm text-gray-900 dark:text-gray-100">{doc.documentType}</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            doc.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.status || 'PENDING'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingStudent(null);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                {(viewingStudent.status === 'DRAFT' || viewingStudent.status === 'REJECTED') && (
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditStudent(viewingStudent);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit Application
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentStudentsTab;
