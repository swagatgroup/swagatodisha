import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';
import { showSuccess, showError, showLoading, closeLoading, handleApiError } from '../../../utils/sweetAlert';

const StudentTable = ({ students, onStudentUpdate, showActions = true, initialFilter = 'all' }) => {
    const { user } = useAuth();
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialFilter);
    const [courseFilter, setCourseFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [genderFilter, setGenderFilter] = useState('all');
    const [districtFilter, setDistrictFilter] = useState('all');
    const [cityFilter, setCityFilter] = useState('all');
    const [stateFilter, setStateFilter] = useState('all');
    const [streamFilter, setStreamFilter] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [editData, setEditData] = useState({});
    const [statusData, setStatusData] = useState({
        status: '',
        notes: '',
        rejectionReason: '',
        rejectionMessage: '',
        rejectionDetails: []
    });
    const [showRejectionForm, setShowRejectionForm] = useState(false);
    
    const isSuperAdmin = user?.role === 'super_admin';

    useEffect(() => {
        // Update filter when initialFilter prop changes
        if (initialFilter !== statusFilter) {
            setStatusFilter(initialFilter);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialFilter]);

    // Debug logging for student data
    console.log('📋 StudentTable received students:', students);
    if (students && students.length > 0) {
        console.log('📋 First student full data:', students[0]);
        console.log('📋 Course field:', students[0].courseDetails?.selectedCourse);
        console.log('📋 Status field:', students[0].status);
        console.log('📋 Workflow status:', students[0].workflowStatus?.currentStage);
        console.log('📋 Personal details:', students[0].personalDetails);
    }

    // Debug edit modal state changes
    useEffect(() => {
        console.log('🔍 Edit modal state changed (StudentTable):', { showEditModal, selectedStudent: selectedStudent?._id });
    }, [showEditModal, selectedStudent]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getStatusColor = (status) => {
        // Handle both uppercase and lowercase status values
        const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : 'unknown';

        switch (normalizedStatus) {
            case 'completed':
            case 'approved':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
            case 'pending':
            case 'submitted':
            case 'under_review':
            case 'in_progress':
                return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
            case 'rejected':
            case 'failed':
                return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
            default:
                return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
        }
    };

    const getStatusText = (status) => {
        // Handle both uppercase and lowercase status values
        const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : 'unknown';

        switch (normalizedStatus) {
            case 'completed':
                return 'Complete';
            case 'approved':
                return 'Approved';
            case 'pending':
                return 'Pending';
            case 'submitted':
                return 'Pending';
            case 'under_review':
                return 'Under Review';
            case 'in_progress':
                return 'In Progress';
            case 'rejected':
                return 'Rejected';
            case 'failed':
                return 'Failed';
            default:
                console.log('❌ Unknown status in StudentTable:', status, 'normalized:', normalizedStatus);
                return status || 'Unknown';
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
            showSuccess(`${student.personalDetails?.fullName || 'Student'}'s application has been approved!`);
            if (onStudentUpdate) {
                onStudentUpdate(response.data.data);
            }
            // Refresh by calling parent component
            window.location.reload();
        } catch (error) {
            console.error('Error accepting application:', error);
            closeLoading();
            handleApiError(error);
        }
    };

    const handleStatusUpdate = async () => {
        if (!statusData.status) {
            showError('Please select a status');
            return;
        }

        if (statusData.status === 'REJECTED') {
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
            if (onStudentUpdate) {
                onStudentUpdate(response.data.data);
            }
            window.location.reload();
        } catch (error) {
            console.error('Error updating status:', error);
            closeLoading();
            handleApiError(error);
        }
    };

    const handleEdit = async () => {
        try {
            showLoading('Updating student...');
            const updatePayload = {
                personalDetails: { ...editData.personalDetails },
                contactDetails: {
                    ...editData.contactDetails,
                    permanentAddress: editData.contactDetails?.permanentAddress || {}
                },
                courseDetails: { ...editData.courseDetails },
                guardianDetails: { ...editData.guardianDetails }
            };

            const response = await api.put(`/api/admin/students/${selectedStudent._id}`, updatePayload);
            setShowEditModal(false);
            setEditData({});
            setSelectedStudent(null);
            closeLoading();
            showSuccess('Student updated successfully!');
            if (onStudentUpdate) {
                onStudentUpdate(response.data.data);
            }
            window.location.reload();
        } catch (error) {
            console.error('Error updating student:', error);
            closeLoading();
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update student';
            showError(errorMessage);
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

    const safeStudents = Array.isArray(students) ? students : [];

    // Get unique values for filters from students
    const availableCourses = [...new Set(safeStudents.map(s => 
        s.courseDetails?.selectedCourse || s.courseDetails?.courseName || ''
    ).filter(Boolean))].sort();
    
    const availableCategories = [...new Set(safeStudents.map(s => 
        s.personalDetails?.category || s.personalDetails?.status || ''
    ).filter(Boolean))].sort();

    const availableGenders = [...new Set(safeStudents.map(s => 
        s.personalDetails?.gender || ''
    ).filter(Boolean))].sort();

    const availableDistricts = [...new Set(safeStudents.map(s => 
        s.contactDetails?.permanentAddress?.district || ''
    ).filter(Boolean))].sort();

    const availableCities = [...new Set(safeStudents.map(s => 
        s.contactDetails?.permanentAddress?.city || ''
    ).filter(Boolean))].sort();

    const availableStates = [...new Set(safeStudents.map(s => 
        s.contactDetails?.permanentAddress?.state || ''
    ).filter(Boolean))].sort();

    const availableStreams = [...new Set(safeStudents.map(s => 
        s.courseDetails?.stream || ''
    ).filter(Boolean))].sort();

    const filteredStudents = safeStudents.filter(student => {
        const matchesSearch =
            student.personalDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.contactDetails?.primaryPhone?.includes(searchTerm) ||
            student.contactDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.personalDetails?.aadharNumber?.includes(searchTerm) ||
            student.applicationId?.toLowerCase().includes(searchTerm.toLowerCase());

        // Handle COMPLETED filter - it should match APPROVED status
        let statusMatch = false;
        if (statusFilter === 'all') {
            statusMatch = true;
        } else if (statusFilter === 'COMPLETED') {
            // Completed = Approved
            statusMatch = student.status === 'APPROVED' || student.workflowStatus?.currentStage === 'APPROVED';
        } else {
            statusMatch = student.workflowStatus?.currentStage === statusFilter ||
                student.status === statusFilter;
        }
        const matchesStatus = statusMatch;

        const matchesCourse = courseFilter === 'all' ||
            student.courseDetails?.selectedCourse === courseFilter ||
            student.courseDetails?.courseName === courseFilter;

        const matchesCategory = categoryFilter === 'all' ||
            student.personalDetails?.category === categoryFilter ||
            student.personalDetails?.status === categoryFilter;

        const matchesGender = genderFilter === 'all' ||
            student.personalDetails?.gender === genderFilter;

        const matchesDistrict = districtFilter === 'all' ||
            student.contactDetails?.permanentAddress?.district === districtFilter;

        const matchesCity = cityFilter === 'all' ||
            student.contactDetails?.permanentAddress?.city === cityFilter;

        const matchesState = stateFilter === 'all' ||
            student.contactDetails?.permanentAddress?.state === stateFilter;

        const matchesStream = streamFilter === 'all' ||
            student.courseDetails?.stream === streamFilter;

        return matchesSearch && matchesStatus && matchesCourse && matchesCategory && 
               matchesGender && matchesDistrict && matchesCity && matchesState && matchesStream;
    });

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aValue = a;
        let bValue = b;

        // Navigate to the nested property
        const keys = sortConfig.key.split('.');
        keys.forEach(key => {
            aValue = aValue?.[key];
            bValue = bValue?.[key];
        });

        if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });


    return (
        <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by name, phone, Aadhaar, email, or Application ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                </div>
                
                {/* Filters Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                        <option value="all">All Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                    
                    <select
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                        <option value="all">All Courses</option>
                        {availableCourses.map(course => (
                            <option key={course} value={course}>{course}</option>
                        ))}
                    </select>
                    
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                        <option value="all">All Categories</option>
                        {availableCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>

                    <select
                        value={genderFilter}
                        onChange={(e) => setGenderFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                        <option value="all">All Gender</option>
                        {availableGenders.map(gender => (
                            <option key={gender} value={gender}>{gender}</option>
                        ))}
                    </select>
                </div>

                {/* Filters Row 2 - Geographical */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <select
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                        <option value="all">All States</option>
                        {availableStates.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>

                    <select
                        value={districtFilter}
                        onChange={(e) => setDistrictFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                        <option value="all">All Districts</option>
                        {availableDistricts.map(district => (
                            <option key={district} value={district}>{district}</option>
                        ))}
                    </select>

                    <select
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                        <option value="all">All Cities</option>
                        {availableCities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>

                    <select
                        value={streamFilter}
                        onChange={(e) => setStreamFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                        <option value="all">All Streams</option>
                        {availableStreams.map(stream => (
                            <option key={stream} value={stream}>{stream}</option>
                        ))}
                    </select>
                </div>
                    
                {(searchTerm || statusFilter !== 'all' || courseFilter !== 'all' || categoryFilter !== 'all' || genderFilter !== 'all' || districtFilter !== 'all' || cityFilter !== 'all' || stateFilter !== 'all' || streamFilter !== 'all') && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                            setCourseFilter('all');
                            setCategoryFilter('all');
                            setGenderFilter('all');
                            setDistrictFilter('all');
                            setCityFilter('all');
                            setStateFilter('all');
                            setStreamFilter('all');
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                        Clear All Filters
                    </button>
                )}
                
                {/* Results Count */}
                {filteredStudents.length !== safeStudents.length && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {filteredStudents.length} of {safeStudents.length} students
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleSort('personalDetails.fullName')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>S.No</span>
                                    {sortConfig.key === 'personalDetails.fullName' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleSort('personalDetails.fullName')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Full Name</span>
                                    {sortConfig.key === 'personalDetails.fullName' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleSort('courseDetails.selectedCourse')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Course</span>
                                    {sortConfig.key === 'courseDetails.selectedCourse' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleSort('contactDetails.primaryPhone')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Phone</span>
                                    {sortConfig.key === 'contactDetails.primaryPhone' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Aadhaar
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleSort('workflowStatus.currentStage')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Status</span>
                                    {sortConfig.key === 'workflowStatus.currentStage' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleSort('createdAt')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Registration Date</span>
                                    {sortConfig.key === 'createdAt' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            {showActions && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedStudents.map((student, index) => (
                            <motion.tr
                                key={student._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {student.personalDetails?.fullName || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-gray-100">
                                        {student.courseDetails?.selectedCourse || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    {student.contactDetails?.primaryPhone || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    {student.personalDetails?.aadharNumber || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.workflowStatus?.currentStage || student.status)}`}>
                                        {getStatusText(student.workflowStatus?.currentStage || student.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(student.createdAt).toLocaleDateString()}
                                </td>
                                {showActions && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedStudent(student);
                                                    setShowDetailsModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                title="View Details"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                                {/* Accept Button - Only for SUBMITTED and UNDER_REVIEW */}
                                                {(student.workflowStatus?.currentStage === 'SUBMITTED' || student.workflowStatus?.currentStage === 'UNDER_REVIEW' || student.status === 'SUBMITTED' || student.status === 'UNDER_REVIEW') && (
                                                    <button
                                                        onClick={() => handleAcceptApplication(student)}
                                                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                        title="Accept Application"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                )}

                                                {/* Reject Button - Only for SUBMITTED and UNDER_REVIEW */}
                                                {(student.workflowStatus?.currentStage === 'SUBMITTED' || student.workflowStatus?.currentStage === 'UNDER_REVIEW' || student.status === 'SUBMITTED' || student.status === 'UNDER_REVIEW') && (
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
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
                                                        const currentStatus = student.workflowStatus?.currentStage || student.status;
                                                        setStatusData({ status: currentStatus, notes: '' });
                                                        setShowStatusModal(true);
                                                    }}
                                                    className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                                                    title="Update Status"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedStudent(student);
                                                        setEditData({
                                                            personalDetails: {
                                                                fullName: student.personalDetails?.fullName || '',
                                                                fathersName: student.personalDetails?.fathersName || '',
                                                                mothersName: student.personalDetails?.mothersName || '',
                                                                dateOfBirth: student.personalDetails?.dateOfBirth || '',
                                                                gender: student.personalDetails?.gender || '',
                                                                aadharNumber: student.personalDetails?.aadharNumber || '',
                                                                category: student.personalDetails?.category || ''
                                                            },
                                                            contactDetails: {
                                                                email: student.contactDetails?.email || '',
                                                                primaryPhone: student.contactDetails?.primaryPhone || '',
                                                                whatsappNumber: student.contactDetails?.whatsappNumber || '',
                                                                permanentAddress: {
                                                                    street: student.contactDetails?.permanentAddress?.street || '',
                                                                    city: student.contactDetails?.permanentAddress?.city || '',
                                                                    district: student.contactDetails?.permanentAddress?.district || '',
                                                                    state: student.contactDetails?.permanentAddress?.state || '',
                                                                    pincode: student.contactDetails?.permanentAddress?.pincode || '',
                                                                    country: student.contactDetails?.permanentAddress?.country || 'India'
                                                                }
                                                            },
                                                            courseDetails: {
                                                                selectedCollege: student.courseDetails?.selectedCollege || '',
                                                                selectedCourse: student.courseDetails?.selectedCourse || '',
                                                                customCourse: student.courseDetails?.customCourse || '',
                                                                stream: student.courseDetails?.stream || '',
                                                                campus: student.courseDetails?.campus || ''
                                                            },
                                                            guardianDetails: {
                                                                guardianName: student.guardianDetails?.guardianName || '',
                                                                relationship: student.guardianDetails?.relationship || '',
                                                                guardianPhone: student.guardianDetails?.guardianPhone || '',
                                                                guardianEmail: student.guardianDetails?.guardianEmail || ''
                                                            }
                                                        });
                                                        console.log('✏️ Edit button clicked for student (StudentTable):', student);
                                                        console.log('✅ Setting showEditModal to true (StudentTable)');
                                                        setShowEditModal(true);
                                                    }}
                                                    className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                    title="Edit"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                        </div>
                                    </td>
                                )}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {sortedStudents.length === 0 && (
                <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No students found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm || statusFilter !== 'all'
                            ? 'Try adjusting your search or filter criteria.'
                            : 'Get started by registering your first student.'
                        }
                    </p>
                </div>
            )}

            {/* Export Options */}
            {sortedStudents.length > 0 && (
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {sortedStudents.length} of {students.length} students
                    </div>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                            Export CSV
                        </button>
                        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                            Export Excel
                        </button>
                        <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700">
                            Export PDF
                        </button>
                    </div>
                </div>
            )}

            {/* Student Details Modal */}
            {showDetailsModal && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        Full Application Details
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {selectedStudent.applicationId && `Application ID: ${selectedStudent.applicationId} | `}
                                        Status: <span className={`font-semibold ${(() => {
                                            const status = selectedStudent.workflowStatus?.currentStage || selectedStudent.status;
                                            const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : 'unknown';
                                            switch (normalizedStatus) {
                                                case 'completed':
                                                case 'approved':
                                                    return 'text-green-600 dark:text-green-400';
                                                case 'pending':
                                                case 'submitted':
                                                case 'under_review':
                                                case 'in_progress':
                                                    return 'text-yellow-600 dark:text-yellow-400';
                                                case 'rejected':
                                                case 'failed':
                                                    return 'text-red-600 dark:text-red-400';
                                                default:
                                                    return 'text-gray-600 dark:text-gray-400';
                                            }
                                        })()}`}>
                                            {getStatusText(selectedStudent.workflowStatus?.currentStage || selectedStudent.status)}
                                        </span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Personal Information */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Personal Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.personalDetails?.fullName || 'N/A'}</p>
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
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.personalDetails?.aadharNumber || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Contact Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Primary Phone</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.contactDetails?.primaryPhone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.contactDetails?.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">WhatsApp Number</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.contactDetails?.whatsappNumber || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information */}
                                {(selectedStudent.contactDetails?.permanentAddress || selectedStudent.contactDetails?.currentAddress) && (
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                        <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Address Information
                                        </h4>
                                        <div className="space-y-4">
                                            {/* Permanent Address */}
                                            {selectedStudent.contactDetails?.permanentAddress && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Permanent Address</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="md:col-span-2">
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Street Address</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails.permanentAddress.street || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">City</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails.permanentAddress.city || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">State</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails.permanentAddress.state || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Pincode</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails.permanentAddress.pincode || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">District</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails?.district || selectedStudent.contactDetails?.permanentAddress?.district || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Country</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails.permanentAddress.country || 'India'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Current Address */}
                                            {selectedStudent.contactDetails?.currentAddress?.street && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Current Address</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="md:col-span-2">
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Street Address</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails.currentAddress.street || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">City</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails.currentAddress.city || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">State</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails.currentAddress.state || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Pincode</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails.currentAddress.pincode || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">District</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails?.currentAddress?.district || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Country</label>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {selectedStudent.contactDetails.currentAddress.country || 'India'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Course Information */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        Course Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Institution Name</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.courseDetails?.institutionName || selectedStudent.institutionName || 'Swagat Group of Institutions'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Course Name</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.courseDetails?.selectedCourse || selectedStudent.course || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Stream</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.courseDetails?.stream || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Campus</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.courseDetails?.campus || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Guardian Information */}
                                {(selectedStudent.guardianDetails?.guardianName || selectedStudent.guardianDetails?.guardianPhone) && (
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                        <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Guardian Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Guardian Name</label>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.guardianDetails?.guardianName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Guardian Phone</label>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.guardianDetails?.guardianPhone || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Relationship</label>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.guardianDetails?.guardianRelation || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Documents */}
                                {selectedStudent.documents && selectedStudent.documents.length > 0 && (
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                        <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Uploaded Documents ({selectedStudent.documents.length})
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {selectedStudent.documents.map((doc, index) => (
                                                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{doc.documentType || doc.fileName}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                Status: <span className={`font-semibold ${doc.status === 'APPROVED' ? 'text-green-600' : doc.status === 'REJECTED' ? 'text-red-600' : 'text-yellow-600'}`}>
                                                                    {doc.status || 'PENDING'}
                                                                </span>
                                                            </p>
                                                            {doc.uploadedAt && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {doc.filePath && (
                                                            <a
                                                                href={doc.filePath}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                                            >
                                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Application Tracking */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Application Tracking
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {selectedStudent.applicationId && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Application ID</label>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.applicationId}</p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Registration Date</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Category</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {selectedStudent.personalDetails?.status || selectedStudent.personalDetails?.category || 'General'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal - Simplified version */}
            {showEditModal && selectedStudent && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
                    style={{ zIndex: 9999 }}
                    onClick={() => {
                        console.log('🖱️ Modal backdrop clicked, closing modal (StudentTable)');
                        setShowEditModal(false);
                        setEditData({});
                        setSelectedStudent(null);
                    }}
                >
                    <div 
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
                        style={{ zIndex: 10000 }}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Student</h3>
                                <button
                                    onClick={() => {
                                        console.log('❌ Close button clicked (StudentTable)');
                                        setShowEditModal(false);
                                        setEditData({});
                                        setSelectedStudent(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Basic Edit Form */}
                            <div className="space-y-4">
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
                                                contactDetails: { ...editData.contactDetails, primaryPhone: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                </div>
                            </div>

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

            {/* Status Update Modal */}
            {showStatusModal && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Update Status - {selectedStudent.personalDetails?.fullName || 'Student'}
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
                                    </select>
                                </div>

                                {showRejectionForm && (
                                    <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                                        <h4 className="text-md font-semibold text-red-800 dark:text-red-200 mb-4">
                                            Rejection Details
                                        </h4>
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
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={statusData.notes}
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
                                    onClick={handleStatusUpdate}
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
        </div>
    );
};

export default StudentTable;
