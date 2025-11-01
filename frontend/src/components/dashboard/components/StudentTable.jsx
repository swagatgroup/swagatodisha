import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';

const StudentTable = ({ students, onStudentUpdate, showActions = true, initialFilter = 'all' }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialFilter);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

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

    const safeStudents = Array.isArray(students) ? students : [];

    const filteredStudents = safeStudents.filter(student => {
        const matchesSearch =
            student.personalDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.contactDetails?.primaryPhone?.includes(searchTerm) ||
            student.personalDetails?.aadharNumber?.includes(searchTerm);

        const matchesStatus = statusFilter === 'all' ||
            student.workflowStatus?.currentStage === statusFilter ||
            student.status === statusFilter;

        return matchesSearch && matchesStatus;
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
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by name, phone, or Aadhaar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                </div>
                <div className="sm:w-48">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                        <option value="all">Total Students</option>
                        <option value="DRAFT">Draft</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
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
                                            <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                                                Edit
                                            </button>
                                            <button className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300">
                                                Contact
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
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Selected Course</label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedStudent.courseDetails?.selectedCourse || 'N/A'}</p>
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
        </div>
    );
};

export default StudentTable;
