import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../utils/api";
import { showSuccess, showError, showLoading, closeLoading } from "../../../utils/sweetAlert";

const AgentStudentsTab = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editData, setEditData] = useState({});
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
    loadStudents();
    loadStats();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/agents/my-students", {
        params: {
          search: filters.search || undefined,
          status: filters.status || undefined,
          course: filters.course || undefined,
        },
      });
      if (response.data.success) {
        console.log('📊 Agent students data:', response.data.data.students);
        console.log('📊 First student:', response.data.data.students?.[0]);
        setStudents(response.data.data.students || []);
      }
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('📊 Loading agent stats...');
      const response = await api.get("/api/agents/stats");
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
        showSuccess('Student updated successfully!');
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
    const matchesSearch =
      !filters.search ||
      student.personalDetails?.fullName
        ?.toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      student.personalDetails?.aadharNumber?.includes(filters.search) ||
      student.contactDetails?.primaryPhone?.includes(filters.search);

    const matchesStatus = !filters.status || student.status === filters.status;
    const matchesCourse =
      !filters.course ||
      student.courseDetails?.selectedCourse === filters.course;

    return matchesSearch && matchesStatus && matchesCourse;
  });

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
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
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
              onClick={loadStudents}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Filter
            </button>
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
              {filteredStudents.map((student, index) => (
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
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          /* TODO: Implement view student functionality */
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
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
    </div>
  );
};

export default AgentStudentsTab;
