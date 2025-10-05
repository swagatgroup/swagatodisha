import { useState } from 'react';
import { motion } from 'framer-motion';

const StudentTable = ({ students, onStudentUpdate, showActions = true }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    
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
                return 'bg-green-100 text-green-800';
            case 'pending':
            case 'submitted':
            case 'under_review':
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
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

        const studentCategory = student.personalDetails?.status || student.personalDetails?.category || student.registrationCategory || 'General';
        const matchesCategory = categoryFilter === 'all' || studentCategory === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
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

    const maskAadhaar = (aadhaar) => {
        if (!aadhaar) return '';
        return aadhaar.replace(/(\d{4})\d{4}(\d{4})/, '$1****$2');
    };

    const maskPhone = (phone) => {
        if (!phone) return '';
        return phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
    };

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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="sm:w-48">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <div className="sm:w-48">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Categories</option>
                        <option value="A">A - Direct (No Referral)</option>
                        <option value="B1">B1 - Student Referral</option>
                        <option value="B2">B2 - Agent Referral</option>
                        <option value="B3">B3 - Staff Referral</option>
                        <option value="B4">B4 - Super Admin Referral</option>
                        <option value="C1">C1 - Agent Dashboard</option>
                        <option value="C2">C2 - Staff Dashboard</option>
                        <option value="C3">C3 - Super Admin Dashboard</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('contactDetails.primaryPhone')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Phone</span>
                                    {sortConfig.key === 'contactDetails.primaryPhone' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aadhaar
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('registrationCategory')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Category</span>
                                    {sortConfig.key === 'registrationCategory' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedStudents.map((student, index) => (
                            <motion.tr
                                key={student._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-gray-50"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {student.personalDetails?.fullName || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {student.studentId || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {student.courseDetails?.selectedCourse || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {maskPhone(student.contactDetails?.primaryPhone)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {maskAadhaar(student.personalDetails?.aadharNumber)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.workflowStatus?.currentStage || student.status)}`}>
                                        {getStatusText(student.workflowStatus?.currentStage || student.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {student.personalDetails?.status || student.personalDetails?.category || 'General'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(student.createdAt).toLocaleDateString()}
                                </td>
                                {showActions && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button className="text-blue-600 hover:text-blue-900">
                                                View
                                            </button>
                                            <button className="text-green-600 hover:text-green-900">
                                                Edit
                                            </button>
                                            <button className="text-purple-600 hover:text-purple-900">
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
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm || statusFilter !== 'all'
                            ? 'Try adjusting your search or filter criteria.'
                            : 'Get started by registering your first student.'
                        }
                    </p>
                </div>
            )}

            {/* Export Options */}
            {sortedStudents.length > 0 && (
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        Showing {sortedStudents.length} of {students.length} students
                    </div>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                            Export CSV
                        </button>
                        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                            Export Excel
                        </button>
                        <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                            Export PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentTable;
