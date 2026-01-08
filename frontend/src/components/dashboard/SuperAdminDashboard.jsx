import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSession } from '../../contexts/SessionContext';
import DashboardLayout from './DashboardLayout';
import UserManagement from '../admin/UserManagement';
import StudentManagement from '../admin/StudentManagement';
import WebsiteManagement from '../admin/WebsiteManagement';
import ErrorBoundary from '../common/ErrorBoundary';
// RealTimeStudentTracking removed - Socket.IO component
// WebsiteManagementSystem removed - Socket.IO component
import StudentRegistrationWorkflow from './tabs/StudentRegistrationWorkflow';
import ApplicationReview from './tabs/ApplicationReview';
import {
    showSuccess,
    showError,
    showConfirm,
    showLoading,
    closeLoading,
    handleApiError,
    showSuccessToast,
    showErrorToast
} from '../../utils/sweetAlert';
import api from '../../utils/api';

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const { selectedSession } = useSession();
    const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalAgents: 0,
        totalStaff: 0,
        totalApplications: 0,
        pendingApplications: 0,
        draftApplications: 0,
        submittedApplications: 0,
        underReviewApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        completeApplications: 0
    });
    const [studentTableFilter, setStudentTableFilter] = useState('all');

    // Students table state (copied from StudentManagement)
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCourse, setFilterCourse] = useState('all');
    const [filterSubmitterRole, setFilterSubmitterRole] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({});
    const [statusData, setStatusData] = useState({
        status: '',
        notes: '',
        rejectionReason: '',
        rejectionMessage: '',
        rejectionDetails: []
    });
    const [showRejectionForm, setShowRejectionForm] = useState(false);
    const [filters, setFilters] = useState({
        statuses: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETE'],
        courses: ['Bachelor of Technology', 'Bachelor of Commerce', 'Bachelor of Arts', 'Bachelor of Science'],
        submitters: []
    });
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [loadingColleges, setLoadingColleges] = useState(false);
    const isSuperAdmin = user?.role === 'super_admin';

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
            id: 'students',
            name: 'Students',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
            )
        },
        {
            id: 'agents',
            name: 'Agents',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            id: 'staff',
            name: 'Staff',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
        },
        {
            id: 'application-review',
            name: 'Application Review',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 'website-management',
            name: 'Website Management',
            icon: (
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
            )
        }
    ];

    // Fetch colleges
    const fetchColleges = async () => {
        try {
            setLoadingColleges(true);
            const response = await api.get('/api/colleges/public');
            if (response.data.success) {
                setColleges(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching colleges:', error);
        } finally {
            setLoadingColleges(false);
        }
    };

    // Get courses for selected college
    const getCoursesForCollege = () => {
        if (!editData.courseDetails?.selectedCollege) {
            return [];
        }
        const selectedCollegeData = colleges.find(
            (college) => college._id === editData.courseDetails.selectedCollege
        );
        return selectedCollegeData?.courses || [];
    };

    // Get streams for selected course
    const getStreamsForCourse = () => {
        if (!editData.courseDetails?.selectedCourse) {
            return [];
        }
        const availableCourses = getCoursesForCollege();
        const selectedCourse = availableCourses.find(
            (course) => course.courseName === editData.courseDetails.selectedCourse
        );
        return selectedCourse?.streams || [];
    };

    // Get campuses for selected college
    const getCampusesForCollege = () => {
        if (!editData.courseDetails?.selectedCollege) {
            return [];
        }
        const selectedCollegeData = colleges.find(
            (college) => college._id === editData.courseDetails.selectedCollege
        );
        return selectedCollegeData?.campuses || [];
    };

    useEffect(() => {
        const fetchAdminData = async (session = selectedSession) => {
            try {
                setLoading(true);
                const statsRes = await api.get(`/api/admin/dashboard/stats?session=${encodeURIComponent(session)}`);

                if (statsRes.data?.success) {
                    setStats(statsRes.data.data);
                }
            } catch (error) {
                console.error('Error fetching admin data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData(selectedSession);
    }, [selectedSession]);

    useEffect(() => {
        fetchColleges();
    }, []);

    // Reset to page 1 when session changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedSession]);

    // Fetch students for the table
    useEffect(() => {
        if (activeSidebarItem === 'dashboard') {
            fetchStudents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm, filterStatus, filterCourse, filterSubmitterRole, selectedSession, activeSidebarItem]);

    const fetchStudents = async () => {
        try {
            setStudentsLoading(true);

            if (!selectedSession) {
                console.error('❌ No session selected!');
                setStudents([]);
                setTotalItems(0);
                return;
            }

            const params = new URLSearchParams({
                page: currentPage,
                limit: 20,
                session: selectedSession,
                sortBy: 'createdAt',
                sortOrder: 'desc', // Latest first (newest on top)
                ...(searchTerm && { search: searchTerm }),
                ...(filterStatus !== 'all' && { status: filterStatus }),
                ...(filterCourse !== 'all' && { course: filterCourse }),
                ...(filterSubmitterRole !== 'all' && { submitterRole: filterSubmitterRole })
            });

            const response = await api.get(`/api/admin/students?${params}`);

            if (response.data.success) {
                let studentsData = response.data.data.students || [];

                // Frontend sorting fallback: Sort by latest time (newest first)
                studentsData = [...studentsData].sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0);
                    const dateB = new Date(b.createdAt || 0);
                    return dateB - dateA; // Descending (newest first)
                });

                setStudents(studentsData);
                const pagination = response.data.data.pagination || {};
                setTotalPages(pagination.totalPages || 1);
                setTotalItems(pagination.totalItems || 0);
                setItemsPerPage(pagination.itemsPerPage || 20);
                setFilters(response.data.data.filters || {
                    statuses: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
                    courses: [],
                    categories: [],
                    submitters: []
                });
            } else {
                throw new Error(response.data.message || 'Failed to fetch students');
            }
        } catch (error) {
            console.error('❌ Error fetching students:', error);
            setStudents([]);
            setTotalPages(1);
            setTotalItems(0);
            setItemsPerPage(20);
        } finally {
            setStudentsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'SUBMITTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'DRAFT': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
            case 'CANCELLED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
            case 'COMPLETE': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedStudents(students.map(student => student._id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (studentId, checked) => {
        if (checked) {
            setSelectedStudents([...selectedStudents, studentId]);
        } else {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        }
    };

    const handleAcceptApplication = async (student) => {
        try {
            showLoading('Accepting application...');
            const response = await api.put(`/api/admin/students/${student._id}/status`, {
                status: 'APPROVED',
                notes: 'Application approved by admin'
            });
            closeLoading();
            showSuccess(`${student.fullName}'s application has been approved!`);
            fetchStudents();
            // Refresh stats
            const statsRes = await api.get(`/api/admin/dashboard/stats?session=${encodeURIComponent(selectedSession)}`);
            if (statsRes.data?.success) {
                setStats(statsRes.data.data);
            }
        } catch (error) {
            closeLoading();
            handleApiError(error);
        }
    };

    const addRejectionDetail = () => {
        setStatusData({
            ...statusData,
            rejectionDetails: [
                ...statusData.rejectionDetails,
                {
                    issue: '',
                    documentType: '',
                    actionRequired: '',
                    priority: 'High',
                    specificFeedback: ''
                }
            ]
        });
    };

    const removeRejectionDetail = (index) => {
        const newDetails = statusData.rejectionDetails.filter((_, i) => i !== index);
        setStatusData({
            ...statusData,
            rejectionDetails: newDetails
        });
    };

    const updateRejectionDetail = (index, field, value) => {
        const newDetails = [...statusData.rejectionDetails];
        newDetails[index] = { ...newDetails[index], [field]: value };
        setStatusData({
            ...statusData,
            rejectionDetails: newDetails
        });
    };

    const handleUpdateStatus = async () => {
        if (!selectedStudent) {
            showError('No student selected');
            return;
        }

        if (!statusData.status) {
            showError('Please select a status');
            return;
        }

        // If rejecting, check for required rejection fields
        if (statusData.status === 'REJECTED') {
            if (!statusData.rejectionReason) {
                showError('Please select a rejection reason');
                return;
            }
            if (!statusData.rejectionMessage) {
                showError('Please provide a rejection message');
                return;
            }
        }

        try {
            showLoading('Updating application status...');
            const response = await api.put(`/api/admin/students/${selectedStudent._id}/status`, statusData);
            
            setShowStatusModal(false);
            setStatusData({
                status: '',
                notes: '',
                rejectionReason: '',
                rejectionMessage: '',
                rejectionDetails: []
            });
            setShowRejectionForm(false);
            setSelectedStudent(null);
            closeLoading();
            showSuccess(`Application status updated to ${statusData.status}!`);

            fetchStudents(); // Refresh the list
            // Refresh stats
            const statsRes = await api.get(`/api/admin/dashboard/stats?session=${encodeURIComponent(selectedSession)}`);
            if (statsRes.data?.success) {
                setStats(statsRes.data.data);
            }
        } catch (error) {
            closeLoading();
            handleApiError(error);
        }
    };

    const handleEdit = async () => {
        try {
            showLoading('Updating student...');
            const updatePayload = {
                personalDetails: {
                    ...editData.personalDetails
                },
                contactDetails: {
                    ...editData.contactDetails,
                    permanentAddress: {
                        street: editData.contactDetails?.permanentAddress?.street || editData.contactDetails?.address || '',
                        city: editData.contactDetails?.permanentAddress?.city || editData.contactDetails?.city || '',
                        district: editData.contactDetails?.permanentAddress?.district || '',
                        state: editData.contactDetails?.permanentAddress?.state || '',
                        pincode: editData.contactDetails?.permanentAddress?.pincode || '',
                        country: editData.contactDetails?.permanentAddress?.country || 'India'
                    }
                },
                courseDetails: {
                    ...editData.courseDetails,
                    institutionName: colleges.find(c => c._id === editData.courseDetails?.selectedCollege)?.name || ''
                },
                guardianDetails: {
                    ...editData.guardianDetails
                }
            };

            // Remove empty address fields
            if (updatePayload.contactDetails.permanentAddress) {
                Object.keys(updatePayload.contactDetails.permanentAddress).forEach(key => {
                    if (!updatePayload.contactDetails.permanentAddress[key]) {
                        delete updatePayload.contactDetails.permanentAddress[key];
                    }
                });
            }

            const response = await api.put(`/api/admin/students/${selectedStudent._id}`, updatePayload);
            
            setShowEditModal(false);
            setEditData({});
            setSelectedStudent(null);
            closeLoading();
            showSuccess('Student updated successfully!');

            // Refresh the student list
            await fetchStudents();
            // Refresh stats
            const statsRes = await api.get(`/api/admin/dashboard/stats?session=${encodeURIComponent(selectedSession)}`);
            if (statsRes.data?.success) {
                setStats(statsRes.data.data);
            }
        } catch (error) {
            console.error('Error updating student:', error);
            closeLoading();
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update student';
            showError(errorMessage);
        }
    };

    const handleStudentUpdate = (updatedStudent) => {
        // Refresh dashboard stats when a new student is registered
        if (updatedStudent) {
            showSuccessToast('Student registered successfully!');

            // Refresh stats
            const fetchAdminData = async () => {
                try {
                    const statsRes = await api.get(`/api/admin/dashboard/stats?session=${encodeURIComponent(selectedSession)}`);
                    if (statsRes.data?.success) {
                        setStats(statsRes.data.data);
                    }
                } catch (error) {
                    console.error('Error refreshing admin data:', error);
                }
            };

            fetchAdminData();

            // Refresh the student list to show new student on top
            if (activeSidebarItem === 'dashboard') {
                fetchStudents();
            }
        }
    };

    const handleStatClick = (filter) => {
        // Toggle filter: if same filter is clicked, reset to 'all', otherwise set the new filter
        const newFilter = filterStatus === filter ? 'all' : filter;
        setStudentTableFilter(newFilter);
        setFilterStatus(newFilter);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const renderSidebarContent = () => {
        switch (activeSidebarItem) {
            case 'dashboard':
                return (
                    <div className="space-y-6 bg-transparent">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Super Admin Dashboard</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.fullName || 'Admin'}</p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div
                                onClick={() => setActiveSidebarItem('students')}
                                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                            >
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</p>
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalStudents}</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                onClick={() => setActiveSidebarItem('agents')}
                                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all duration-200"
                            >
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Agents</p>
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalAgents}</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                onClick={() => setActiveSidebarItem('staff')}
                                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200"
                            >
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Staff</p>
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalStaff}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center">
                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                        <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Applications</p>
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.pendingApplications}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filter Buttons */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3 mt-6">
                            <button
                                onClick={() => handleStatClick('DRAFT')}
                                className={`px-2 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${filterStatus === 'DRAFT'
                                    ? 'bg-gray-600 text-white shadow-lg'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-medium mb-0.5">Draft</span>
                                    <span className="text-base font-semibold">{stats.draftApplications || 0}</span>
                                </div>
                            </button>

                            <button
                                onClick={() => handleStatClick('SUBMITTED')}
                                className={`px-2 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${filterStatus === 'SUBMITTED'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-blue-100 dark:bg-gray-700 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-medium mb-0.5">Submitted</span>
                                    <span className="text-base font-semibold">{stats.submittedApplications || 0}</span>
                                </div>
                            </button>

                            <button
                                onClick={() => handleStatClick('UNDER_REVIEW')}
                                className={`px-2 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${filterStatus === 'UNDER_REVIEW'
                                    ? 'bg-yellow-600 text-white shadow-lg'
                                    : 'bg-yellow-100 dark:bg-gray-700 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-medium mb-0.5">Under Review</span>
                                    <span className="text-base font-semibold">{stats.underReviewApplications || 0}</span>
                                </div>
                            </button>

                            <button
                                onClick={() => handleStatClick('APPROVED')}
                                className={`px-2 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${filterStatus === 'APPROVED'
                                    ? 'bg-green-600 text-white shadow-lg'
                                    : 'bg-green-100 dark:bg-gray-700 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-medium mb-0.5">Approved</span>
                                    <span className="text-base font-semibold">{stats.approvedApplications || 0}</span>
                                </div>
                            </button>

                            <button
                                onClick={() => handleStatClick('REJECTED')}
                                className={`px-2 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${filterStatus === 'REJECTED'
                                    ? 'bg-red-600 text-white shadow-lg'
                                    : 'bg-red-100 dark:bg-gray-700 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-medium mb-0.5">Rejected</span>
                                    <span className="text-base font-semibold">{stats.rejectedApplications || 0}</span>
                                </div>
                            </button>

                            <button
                                onClick={() => handleStatClick('COMPLETE')}
                                className={`px-2 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${filterStatus === 'COMPLETE'
                                    ? 'bg-emerald-600 text-white shadow-lg'
                                    : 'bg-emerald-100 dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-medium mb-0.5">Complete</span>
                                    <span className="text-base font-semibold">{stats.completeApplications || 0}</span>
                                </div>
                            </button>
                        </div>

                        {/* Students Table - Step One */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            Recent Students
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            View and manage all student applications
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {totalItems > 0 ? (
                                            <>
                                                {totalItems} {totalItems === 1 ? 'Student' : 'Students'}
                                                {totalPages > 1 && (
                                                    <span className="ml-2 text-gray-400">
                                                        (Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems})
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            'No students found'
                                        )}
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    <input
                                        type="text"
                                        placeholder="Search by name, Aadhar, phone, email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="all">Total Students</option>
                                        {(filters.statuses || []).map(status => {
                                            const statusLabels = {
                                                'DRAFT': 'Draft',
                                                'SUBMITTED': 'Submitted',
                                                'UNDER_REVIEW': 'Under Review',
                                                'APPROVED': 'Approved',
                                                'REJECTED': 'Rejected',
                                                'COMPLETE': 'Complete'
                                            };
                                            return (
                                                <option key={status} value={status}>{statusLabels[status] || status}</option>
                                            );
                                        })}
                                    </select>
                                    <select
                                        value={filterCourse}
                                        onChange={(e) => setFilterCourse(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="all">All Courses</option>
                                        {(filters.courses || []).map(course => (
                                            <option key={course} value={course}>{course}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={filterSubmitterRole}
                                        onChange={(e) => setFilterSubmitterRole(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="all">All Submitters</option>
                                        <option value="student">Student</option>
                                        <optgroup label="Agents">
                                            {(filters.submitters || [])
                                                .filter(s => s.role === 'agent')
                                                .map(submitter => (
                                                    <option key={submitter.id} value={submitter.id}>
                                                        {submitter.name} ({submitter.count} submissions)
                                                    </option>
                                                ))}
                                        </optgroup>
                                        <optgroup label="Staff">
                                            {(filters.submitters || [])
                                                .filter(s => s.role === 'staff')
                                                .map(submitter => (
                                                    <option key={submitter.id} value={submitter.id}>
                                                        {submitter.name} ({submitter.count} submissions)
                                                    </option>
                                                ))}
                                        </optgroup>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>

                                {/* Students Table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                {isSuperAdmin && (
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStudents.length === students.length && students.length > 0}
                                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                        />
                                                    </th>
                                                )}
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    S.No
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Student
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Aadhar
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Phone
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Course
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Submitted By
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {studentsLoading ? (
                                                <tr>
                                                    <td colSpan={isSuperAdmin ? "10" : "9"} className="px-6 py-12 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : students.length === 0 ? (
                                                <tr>
                                                    <td colSpan={isSuperAdmin ? "10" : "9"} className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <svg className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                            </svg>
                                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                                No students found
                                                            </h3>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                                {searchTerm || filterStatus !== 'all' || filterCourse !== 'all' || filterSubmitterRole !== 'all'
                                                                    ? 'Try adjusting your search criteria or filters.'
                                                                    : selectedSession
                                                                        ? `No admissions found for the ${selectedSession} academic session.`
                                                                        : 'No student applications have been submitted yet.'}
                                                            </p>
                                                            {(searchTerm || filterStatus !== 'all' || filterCourse !== 'all' || filterSubmitterRole !== 'all') && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSearchTerm('');
                                                                        setFilterStatus('all');
                                                                        setFilterCourse('all');
                                                                        setFilterSubmitterRole('all');
                                                                    }}
                                                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                                                >
                                                                    Clear Filters
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                students.map((student, index) => {
                                                    const serialNumber = ((currentPage - 1) * itemsPerPage) + index + 1;
                                                    return (
                                                        <motion.tr
                                                            key={student._id}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                        >
                                                            {isSuperAdmin && (
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedStudents.includes(student._id)}
                                                                        onChange={(e) => handleSelectStudent(student._id, e.target.checked)}
                                                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                                    />
                                                                </td>
                                                            )}
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                                                                {serialNumber}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="flex-shrink-0 h-10 w-10">
                                                                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                                                            <span className="text-sm font-medium text-purple-600 dark:text-purple-300">
                                                                                {student.fullName?.split(' ').map(n => n[0]).join('') || 'S'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="ml-4">
                                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                            {(() => {
                                                                                const name = student.fullName || student.personalDetails?.fullName;
                                                                                if (!name) return 'N/A';
                                                                                if (typeof name === 'object') return name.fullName || name.name || 'N/A';
                                                                                return name;
                                                                            })()}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                            ID: {student.applicationId}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono">
                                                                {student.aadharNumber}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                {student.phone}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                {student.email}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                {(() => {
                                                                    const course = student.course || student.courseDetails?.selectedCourse || student.courseDetails?.courseName;
                                                                    if (!course) return 'N/A';
                                                                    if (typeof course === 'object') return course.courseName || course.name || course.selectedCourse || 'N/A';
                                                                    return course;
                                                                })()}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                                                                    {student.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                <div className="text-sm">
                                                                    {(() => {
                                                                        let submitterName = 'Direct';
                                                                        if (student.referredBy && student.referredBy !== 'Direct' && student.referredBy !== 'Unknown' && student.referredBy.trim() !== '') {
                                                                            submitterName = student.referredBy.trim();
                                                                        } else if (student.submittedBy) {
                                                                            const name = student.submittedBy.fullName;
                                                                            if (name) {
                                                                                if (typeof name === 'object') {
                                                                                    submitterName = (name.fullName || name.name || '').trim();
                                                                                } else {
                                                                                    submitterName = name.trim();
                                                                                }
                                                                            }
                                                                        }
                                                                        const role = student.submitterRole || 'student';
                                                                        const roleCapitalized = role.charAt(0).toUpperCase() + role.slice(1);
                                                                        return submitterName && submitterName !== 'Direct' && submitterName !== 'Unknown' && submitterName.trim() !== ''
                                                                            ? `${submitterName} (${roleCapitalized})`
                                                                            : `Direct (${roleCapitalized})`;
                                                                    })()}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedStudent(student);
                                                                            setShowDetailsModal(true);
                                                                        }}
                                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                                                                        title="View Details"
                                                                    >
                                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                        </svg>
                                                                    </button>
                                                                    {(student.status === 'SUBMITTED' || student.status === 'UNDER_REVIEW') && (
                                                                    <button
                                                                        onClick={() => handleAcceptApplication(student)}
                                                                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 cursor-pointer"
                                                                        title="Accept Application"
                                                                    >
                                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        </button>
                                                                    )}
                                                                    {(student.status === 'SUBMITTED' || student.status === 'UNDER_REVIEW') && (
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedStudent(student);
                                                                                setStatusData({
                                                                                    status: 'REJECTED',
                                                                                    notes: '',
                                                                                    rejectionReason: '',
                                                                                    rejectionMessage: '',
                                                                                    rejectionDetails: []
                                                                                });
                                                                                setShowRejectionForm(true);
                                                                                setShowStatusModal(true);
                                                                            }}
                                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
                                                                            title="Reject Application"
                                                                        >
                                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                            </svg>
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedStudent(student);
                                                                            setStatusData({ 
                                                                                status: student.status, 
                                                                                notes: '',
                                                                                rejectionReason: '',
                                                                                rejectionMessage: '',
                                                                                rejectionDetails: []
                                                                            });
                                                                            setShowRejectionForm(false);
                                                                            setShowStatusModal(true);
                                                                        }}
                                                                        className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 cursor-pointer"
                                                                        title="Update Status"
                                                                    >
                                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={async () => {
                                                                            setSelectedStudent(student);
                                                                            
                                                                            // Helper function to format date for input field
                                                                            const formatDateForInput = (dateValue) => {
                                                                                if (!dateValue) return '';
                                                                                try {
                                                                                    const date = new Date(dateValue);
                                                                                    if (isNaN(date.getTime())) return '';
                                                                                    return date.toISOString().split('T')[0];
                                                                                } catch (e) {
                                                                                    return '';
                                                                                }
                                                                            };
                                                                            
                                                                            // Helper to get campus ID
                                                                            const getCampusId = (campus) => {
                                                                                if (!campus) return '';
                                                                                if (typeof campus === 'string') {
                                                                                    return campus;
                                                                                }
                                                                                if (typeof campus === 'object' && campus._id) {
                                                                                    return campus._id.toString();
                                                                                }
                                                                                return '';
                                                                            };
                                                                            
                                                                            // Ensure colleges are loaded before setting edit data
                                                                            let loadedColleges = colleges;
                                                                            if (loadedColleges.length === 0) {
                                                                                await fetchColleges();
                                                                                await new Promise(resolve => setTimeout(resolve, 100));
                                                                                const response = await api.get('/api/colleges/public');
                                                                                if (response.data.success) {
                                                                                    loadedColleges = response.data.data || [];
                                                                                }
                                                                            }
                                                                            
                                                                            // Find college ID from existing data
                                                                            const findCollegeId = () => {
                                                                                if (student.courseDetails?.selectedCollege && typeof student.courseDetails.selectedCollege === 'string') {
                                                                                    return student.courseDetails.selectedCollege;
                                                                                }
                                                                                if (student.courseDetails?.selectedCollege && typeof student.courseDetails.selectedCollege === 'object' && student.courseDetails.selectedCollege._id) {
                                                                                    return student.courseDetails.selectedCollege._id.toString();
                                                                                }
                                                                                if (student.courseDetails?.institutionName && loadedColleges.length > 0) {
                                                                                    const foundCollege = loadedColleges.find(c => 
                                                                                        c.name === student.courseDetails.institutionName || 
                                                                                        c.name?.toLowerCase() === student.courseDetails.institutionName?.toLowerCase()
                                                                                    );
                                                                                    if (foundCollege) return foundCollege._id.toString();
                                                                                }
                                                                                return '';
                                                                            };
                                                                            
                                                                            setEditData({
                                                                                personalDetails: {
                                                                                    fullName: student.personalDetails?.fullName || student.fullName || '',
                                                                                    fathersName: student.personalDetails?.fathersName || '',
                                                                                    mothersName: student.personalDetails?.mothersName || '',
                                                                                    dateOfBirth: formatDateForInput(student.personalDetails?.dateOfBirth) || '',
                                                                                    gender: student.personalDetails?.gender || '',
                                                                                    aadharNumber: student.personalDetails?.aadharNumber || student.aadharNumber || '',
                                                                                    category: student.personalDetails?.category || ''
                                                                                },
                                                                                contactDetails: {
                                                                                    email: student.contactDetails?.email || student.email || '',
                                                                                    primaryPhone: student.contactDetails?.primaryPhone || student.phone || '',
                                                                                    whatsappNumber: student.contactDetails?.whatsappNumber || '',
                                                                                    permanentAddress: {
                                                                                        street: student.contactDetails?.permanentAddress?.street || student.contactDetails?.address || '',
                                                                                        city: student.contactDetails?.permanentAddress?.city || student.contactDetails?.city || '',
                                                                                        district: student.contactDetails?.permanentAddress?.district || '',
                                                                                        state: student.contactDetails?.permanentAddress?.state || '',
                                                                                        pincode: student.contactDetails?.permanentAddress?.pincode || '',
                                                                                        country: student.contactDetails?.permanentAddress?.country || 'India'
                                                                                    }
                                                                                },
                                                                                courseDetails: {
                                                                                    selectedCollege: findCollegeId(),
                                                                                    institutionName: student.courseDetails?.institutionName || (typeof student.courseDetails?.selectedCollege === 'object' ? student.courseDetails.selectedCollege?.name || student.courseDetails.selectedCollege?.code || '' : '') || '',
                                                                                    selectedCourse: student.courseDetails?.selectedCourse || student.courseDetails?.courseName || '',
                                                                                    customCourse: student.courseDetails?.customCourse || '',
                                                                                    stream: student.courseDetails?.stream || '',
                                                                                    campus: getCampusId(student.courseDetails?.campus) || ''
                                                                                },
                                                                                guardianDetails: {
                                                                                    guardianName: student.guardianDetails?.guardianName || '',
                                                                                    relationship: student.guardianDetails?.relationship || '',
                                                                                    guardianPhone: student.guardianDetails?.guardianPhone || '',
                                                                                    guardianEmail: student.guardianDetails?.guardianEmail || ''
                                                                                }
                                                                            });
                                                                            setShowEditModal(true);
                                                                        }}
                                                                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 cursor-pointer"
                                                                        title="Edit"
                                                                    >
                                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} students
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                                            >
                                                Previous
                                            </button>
                                            <div className="flex space-x-1">
                                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i;
                                                    } else {
                                                        pageNum = currentPage - 2 + i;
                                                    }
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => setCurrentPage(pageNum)}
                                                            className={`px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm ${currentPage === pageNum
                                                                ? 'bg-purple-600 text-white border-purple-600'
                                                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
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
            case 'students':
                return (
                    <div className="dark:text-gray-100">
                        <ErrorBoundary>
                            <StudentManagement />
                        </ErrorBoundary>
                    </div>
                );
            case 'agents':
                return (
                    <div className="dark:text-gray-100">
                        <UserManagement userType="agents" rowHoverClass="dark:hover:bg-gray-700 hover:bg-gray-50" />
                    </div>
                );
            case 'staff':
                return (
                    <div className="dark:text-gray-100">
                        <UserManagement userType="staff" rowHoverClass="dark:hover:bg-gray-700 hover:bg-gray-50" />
                    </div>
                );
            case 'new-registration':
                return (
                    <ErrorBoundary>
                        <StudentRegistrationWorkflow onStudentUpdate={handleStudentUpdate} />
                    </ErrorBoundary>
                );
            case 'application-review':
                return <ApplicationReview />;
            case 'website-management':
                return (
                    <ErrorBoundary>
                        <WebsiteManagement />
                    </ErrorBoundary>
                );
            default:
                return <div>Coming Soon...</div>;
        }
    };

    if (loading) {
        return (
            <DashboardLayout
                activeItem={activeSidebarItem}
                onItemClick={setActiveSidebarItem}
                sidebarItems={sidebarItems}
            >
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            activeItem={activeSidebarItem}
            onItemClick={setActiveSidebarItem}
            sidebarItems={sidebarItems}
        >
            {renderSidebarContent()}
            
            {/* Modals for Dashboard tab */}
            {activeSidebarItem === 'dashboard' && showDetailsModal && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Student Details</h3>
                                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-6">
                                {/* Personal Information */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4">Personal Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {(() => {
                                                    const name = selectedStudent.fullName || selectedStudent.personalDetails?.fullName;
                                                    if (!name) return 'N/A';
                                                    if (typeof name === 'object') return name.fullName || name.name || 'N/A';
                                                    return name;
                                                })()}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Father's Name</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.personalDetails?.fathersName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Mother's Name</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.personalDetails?.mothersName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Gender</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.personalDetails?.gender || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Date of Birth</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {selectedStudent.personalDetails?.dateOfBirth ? new Date(selectedStudent.personalDetails.dateOfBirth).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Aadhar Number</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.aadharNumber || selectedStudent.personalDetails?.aadharNumber || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Category</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.personalDetails?.category || selectedStudent.personalDetails?.status || selectedStudent.category || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4">Contact Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Primary Phone</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.phone || selectedStudent.contactDetails?.primaryPhone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.email || selectedStudent.contactDetails?.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">WhatsApp Number</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.contactDetails?.whatsappNumber || 'N/A'}</p>
                                        </div>
                                    </div>
                                    {selectedStudent.contactDetails?.permanentAddress && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Permanent Address</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2">
                                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Street Address</label>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.contactDetails.permanentAddress.street || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">City</label>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.contactDetails.permanentAddress.city || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">District</label>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.contactDetails.permanentAddress.district || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">State</label>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.contactDetails.permanentAddress.state || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Pincode</label>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.contactDetails.permanentAddress.pincode || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Course Information */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4">Course Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Institution Name</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {(() => {
                                                    const institution = selectedStudent.courseDetails?.institutionName || selectedStudent.institutionName;
                                                    if (institution) {
                                                        if (typeof institution === 'object') return institution.name || institution.institutionName || 'Swagat Group of Institutions';
                                                        return institution;
                                                    }
                                                    const college = selectedStudent.courseDetails?.selectedCollege;
                                                    if (college) {
                                                        if (typeof college === 'object') return college.name || college.institutionName || 'Swagat Group of Institutions';
                                                        return college;
                                                    }
                                                    return 'Swagat Group of Institutions';
                                                })()}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Course Name</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {(() => {
                                                    const course = selectedStudent.courseDetails?.selectedCourse || selectedStudent.course;
                                                    if (!course) return 'N/A';
                                                    if (typeof course === 'object') return course.courseName || course.name || 'N/A';
                                                    return course;
                                                })()}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Stream</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {(() => {
                                                    const stream = selectedStudent.courseDetails?.stream;
                                                    if (!stream) return 'N/A';
                                                    if (typeof stream === 'object') return stream.name || stream.streamName || 'N/A';
                                                    return stream;
                                                })()}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Campus</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {(() => {
                                                    const campus = selectedStudent.courseDetails?.campus;
                                                    if (!campus) return 'N/A';
                                                    if (typeof campus === 'object') return campus.name || campus.campusName || 'N/A';
                                                    return campus;
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Guardian Information */}
                                {selectedStudent.guardianDetails && (
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                        <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4">Guardian Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Guardian Name</label>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {(() => {
                                                        const name = selectedStudent.guardianDetails?.guardianName;
                                                        if (!name) return 'N/A';
                                                        if (typeof name === 'object') return name.guardianName || name.name || 'N/A';
                                                        return name;
                                                    })()}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Guardian Phone</label>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {(() => {
                                                        const phone = selectedStudent.guardianDetails?.guardianPhone;
                                                        if (!phone) return 'N/A';
                                                        if (typeof phone === 'object') return phone.phone || phone.guardianPhone || 'N/A';
                                                        return phone;
                                                    })()}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Relationship</label>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.guardianDetails?.relationship || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Status Update Modal */}
            {activeSidebarItem === 'dashboard' && showStatusModal && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => {
                    setShowStatusModal(false);
                    setShowRejectionForm(false);
                    setStatusData({
                        status: '',
                        notes: '',
                        rejectionReason: '',
                        rejectionMessage: '',
                        rejectionDetails: []
                    });
                }}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Update Status - {(() => {
                                    const name = selectedStudent.fullName || selectedStudent.personalDetails?.fullName;
                                    if (!name) return 'Student';
                                    if (typeof name === 'object') return name.fullName || name.name || 'Student';
                                    return name;
                                })()}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={statusData.status}
                                        onChange={(e) => {
                                            const newStatus = e.target.value;
                                            setStatusData({
                                                ...statusData,
                                                status: newStatus,
                                                rejectionReason: '',
                                                rejectionMessage: '',
                                                rejectionDetails: []
                                            });
                                            setShowRejectionForm(newStatus === 'REJECTED');
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="DRAFT">Draft</option>
                                        <option value="SUBMITTED">Submitted</option>
                                        <option value="UNDER_REVIEW">Under Review</option>
                                        <option value="APPROVED">Approved</option>
                                        <option value="REJECTED">Rejected</option>
                                        <option value="COMPLETE">Complete (Graduated)</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>

                                {/* Rejection Form */}
                                {showRejectionForm && (
                                    <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                                        <h4 className="text-md font-semibold text-red-800 dark:text-red-200 mb-4">
                                            Rejection Details
                                        </h4>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Rejection Reason *
                                                </label>
                                                <select
                                                    value={statusData.rejectionReason}
                                                    onChange={(e) => setStatusData({ ...statusData, rejectionReason: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                >
                                                    <option value="">Select Rejection Reason</option>
                                                    <option value="incomplete_documents">Incomplete Documents</option>
                                                    <option value="invalid_documents">Invalid Documents</option>
                                                    <option value="eligibility_criteria">Does Not Meet Eligibility Criteria</option>
                                                    <option value="document_quality">Poor Document Quality</option>
                                                    <option value="missing_information">Missing Required Information</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Rejection Message *
                                                </label>
                                                <textarea
                                                    value={statusData.rejectionMessage}
                                                    onChange={(e) => setStatusData({ ...statusData, rejectionMessage: e.target.value })}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    placeholder="Explain what the student needs to do to fix the issues..."
                                                />
                                            </div>

                                            {/* Rejection Details */}
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Specific Issues
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={addRejectionDetail}
                                                        className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                    >
                                                        + Add Issue
                                                    </button>
                                                </div>

                                                {statusData.rejectionDetails.map((detail, index) => (
                                                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 bg-white dark:bg-gray-800">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                Issue #{index + 1}
                                                            </h5>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeRejectionDetail(index)}
                                                                className="text-red-600 hover:text-red-800 text-sm"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Issue Description
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={detail.issue || ''}
                                                                    onChange={(e) => updateRejectionDetail(index, 'issue', e.target.value)}
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                    placeholder="e.g., Certificate is too old"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Document Type
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={detail.documentType || ''}
                                                                    onChange={(e) => updateRejectionDetail(index, 'documentType', e.target.value)}
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                    placeholder="e.g., 10th Grade Certificate"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Action Required
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={detail.actionRequired || ''}
                                                                    onChange={(e) => updateRejectionDetail(index, 'actionRequired', e.target.value)}
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                    placeholder="e.g., Provide recent certificate"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Priority
                                                                </label>
                                                                <select
                                                                    value={detail.priority || 'High'}
                                                                    onChange={(e) => updateRejectionDetail(index, 'priority', e.target.value)}
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                >
                                                                    <option value="High">High</option>
                                                                    <option value="Medium">Medium</option>
                                                                    <option value="Low">Low</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="mt-2">
                                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                Specific Feedback
                                                            </label>
                                                            <textarea
                                                                value={detail.specificFeedback || ''}
                                                                onChange={(e) => updateRejectionDetail(index, 'specificFeedback', e.target.value)}
                                                                rows={2}
                                                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                                                                placeholder="Additional specific feedback for this issue..."
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={statusData.notes || ''}
                                        onChange={(e) => setStatusData({ ...statusData, notes: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Add any notes about this status change..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowStatusModal(false);
                                        setShowRejectionForm(false);
                                        setStatusData({
                                            status: '',
                                            notes: '',
                                            rejectionReason: '',
                                            rejectionMessage: '',
                                            rejectionDetails: []
                                        });
                                    }}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateStatus}
                                    className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 ${statusData.status === 'REJECTED'
                                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                        : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                                        }`}
                                >
                                    {statusData.status === 'REJECTED' ? 'Reject Application' : 'Update Status'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {activeSidebarItem === 'dashboard' && showEditModal && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Student</h3>
                                <button onClick={() => {
                                    setShowEditModal(false);
                                    setEditData({});
                                    setSelectedStudent(null);
                                }} className="text-gray-400 hover:text-gray-600">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Personal Details */}
                            <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Personal Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={editData.personalDetails?.fullName || ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                personalDetails: { ...editData.personalDetails, fullName: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Father's Name</label>
                                        <input
                                            type="text"
                                            value={editData.personalDetails?.fathersName || ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                personalDetails: { ...editData.personalDetails, fathersName: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mother's Name</label>
                                        <input
                                            type="text"
                                            value={editData.personalDetails?.mothersName || ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                personalDetails: { ...editData.personalDetails, mothersName: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={editData.personalDetails?.dateOfBirth ? (typeof editData.personalDetails.dateOfBirth === 'string' && editData.personalDetails.dateOfBirth.includes('T') ? editData.personalDetails.dateOfBirth.split('T')[0] : editData.personalDetails.dateOfBirth) : ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                personalDetails: { ...editData.personalDetails, dateOfBirth: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                                        <select
                                            value={editData.personalDetails?.gender || ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                personalDetails: { ...editData.personalDetails, gender: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aadhar Number</label>
                                        <input
                                            type="text"
                                            value={editData.personalDetails?.aadharNumber || ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                personalDetails: { ...editData.personalDetails, aadharNumber: e.target.value.replace(/\D/g, '').slice(0, 12) }
                                            })}
                                            maxLength="12"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                        <select
                                            value={editData.personalDetails?.category || ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                personalDetails: { ...editData.personalDetails, category: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="General">General</option>
                                            <option value="OBC">OBC</option>
                                            <option value="SC">SC</option>
                                            <option value="ST">ST</option>
                                            <option value="PwD">PwD</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Contact Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={editData.contactDetails?.email || ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                contactDetails: { ...editData.contactDetails, email: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Phone</label>
                                        <input
                                            type="tel"
                                            value={editData.contactDetails?.primaryPhone || ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                contactDetails: { ...editData.contactDetails, primaryPhone: e.target.value.replace(/\D/g, '').slice(0, 10) }
                                            })}
                                            maxLength="10"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">WhatsApp Number</label>
                                        <input
                                            type="tel"
                                            value={editData.contactDetails?.whatsappNumber || ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                contactDetails: { ...editData.contactDetails, whatsappNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }
                                            })}
                                            maxLength="10"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Street Address</label>
                                        <input
                                            type="text"
                                            value={editData.contactDetails?.permanentAddress?.street || ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                contactDetails: {
                                                    ...editData.contactDetails,
                                                    permanentAddress: { ...editData.contactDetails?.permanentAddress, street: e.target.value }
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                                        <input
                                            type="text"
                                            value={editData.contactDetails?.permanentAddress?.city || ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                contactDetails: {
                                                    ...editData.contactDetails,
                                                    permanentAddress: { ...editData.contactDetails?.permanentAddress, city: e.target.value }
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">District</label>
                                        <input
                                            type="text"
                                            value={editData.contactDetails?.permanentAddress?.district || ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                contactDetails: {
                                                    ...editData.contactDetails,
                                                    permanentAddress: { ...editData.contactDetails?.permanentAddress, district: e.target.value }
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State</label>
                                        <input
                                            type="text"
                                            value={editData.contactDetails?.permanentAddress?.state || ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                contactDetails: {
                                                    ...editData.contactDetails,
                                                    permanentAddress: { ...editData.contactDetails?.permanentAddress, state: e.target.value }
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pincode</label>
                                        <input
                                            type="text"
                                            value={editData.contactDetails?.permanentAddress?.pincode || ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                contactDetails: {
                                                    ...editData.contactDetails,
                                                    permanentAddress: { ...editData.contactDetails?.permanentAddress, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }
                                                }
                                            })}
                                            maxLength="6"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
                                        <input
                                            type="text"
                                            value={editData.contactDetails?.permanentAddress?.country || 'India'}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                contactDetails: {
                                                    ...editData.contactDetails,
                                                    permanentAddress: { ...editData.contactDetails?.permanentAddress, country: e.target.value }
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Education Details Section */}
                            <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Education Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Institution Name *
                                        </label>
                                        <select
                                            value={editData.courseDetails?.selectedCollege || ''}
                                            onChange={(e) =>
                                                setEditData((prev) => ({
                                                    ...prev,
                                                    courseDetails: {
                                                        ...prev.courseDetails,
                                                        selectedCollege: e.target.value,
                                                        selectedCourse: "",
                                                        stream: "",
                                                        campus: "",
                                                        institutionName: colleges.find(c => c._id === e.target.value)?.name || ''
                                                    },
                                                }))
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                            disabled={loadingColleges}
                                        >
                                            <option value="">{loadingColleges ? "Loading institutions..." : "Select Institution"}</option>
                                            {colleges.map((college) => (
                                                <option key={college._id} value={college._id}>
                                                    {college.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Course Name *
                                        </label>
                                        <select
                                            value={editData.courseDetails?.selectedCourse || ''}
                                            onChange={(e) =>
                                                setEditData((prev) => ({
                                                    ...prev,
                                                    courseDetails: {
                                                        ...prev.courseDetails,
                                                        selectedCourse: e.target.value,
                                                        courseName: e.target.value,
                                                        stream: "",
                                                    },
                                                }))
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                            disabled={!editData.courseDetails?.selectedCollege || getCoursesForCollege().length === 0}
                                        >
                                            <option value="">
                                                {!editData.courseDetails?.selectedCollege
                                                    ? "Select institution first"
                                                    : getCoursesForCollege().length === 0
                                                        ? "No courses available"
                                                        : "Select Course"}
                                            </option>
                                            {getCoursesForCollege().map((course) => (
                                                <option key={course._id} value={course.courseName}>
                                                    {course.courseName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Campus *
                                        </label>
                                        <select
                                            value={editData.courseDetails?.campus || ""}
                                            onChange={(e) =>
                                                setEditData((prev) => ({
                                                    ...prev,
                                                    courseDetails: {
                                                        ...prev.courseDetails,
                                                        campus: e.target.value,
                                                    },
                                                }))
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                            disabled={!editData.courseDetails?.selectedCollege}
                                        >
                                            <option value="">
                                                {!editData.courseDetails?.selectedCollege
                                                    ? "Select institution first"
                                                    : getCampusesForCollege().length === 0
                                                        ? "No campuses available"
                                                        : "Select Campus"}
                                            </option>
                                            {getCampusesForCollege().length > 0 && getCampusesForCollege().map((campus) => (
                                                <option key={campus._id} value={campus._id}>
                                                    {campus.name} {campus.code ? `(${campus.code})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                {/* Stream Field - Below the three columns */}
                                {getStreamsForCourse().length > 0 && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Stream (Optional)
                                        </label>
                                        <select
                                            value={editData.courseDetails?.stream || ''}
                                            onChange={(e) =>
                                                setEditData((prev) => ({
                                                    ...prev,
                                                    courseDetails: {
                                                        ...prev.courseDetails,
                                                        stream: e.target.value,
                                                    },
                                                }))
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">Select Stream (Optional)</option>
                                            {getStreamsForCourse().map((stream) => (
                                                <option key={stream} value={stream}>
                                                    {stream}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                
                                {/* Custom Course Field - Show if "Other" is selected */}
                                {editData.courseDetails?.selectedCourse === 'Other' && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Custom Course (if Other selected)
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.courseDetails?.customCourse || ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                courseDetails: { ...editData.courseDetails, customCourse: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Enter custom course name if 'Other' is selected"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Guardian Details */}
                            <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Guardian Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Guardian Name</label>
                                        <input
                                            type="text"
                                            value={editData.guardianDetails?.guardianName || ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                guardianDetails: { ...editData.guardianDetails, guardianName: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Relationship</label>
                                        <select
                                            value={editData.guardianDetails?.relationship || ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                guardianDetails: { ...editData.guardianDetails, relationship: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        >
                                            <option value="">Select Relationship</option>
                                            <option value="Father">Father</option>
                                            <option value="Mother">Mother</option>
                                            <option value="Guardian">Guardian</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Guardian Phone</label>
                                        <input
                                            type="tel"
                                            value={editData.guardianDetails?.guardianPhone || ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                guardianDetails: { ...editData.guardianDetails, guardianPhone: e.target.value.replace(/\D/g, '').slice(0, 10) }
                                            })}
                                            maxLength="10"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Guardian Email</label>
                                        <input
                                            type="email"
                                            value={editData.guardianDetails?.guardianEmail || ''}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                guardianDetails: { ...editData.guardianDetails, guardianEmail: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditData({});
                                        setSelectedStudent(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEdit}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
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

export default SuperAdminDashboard;