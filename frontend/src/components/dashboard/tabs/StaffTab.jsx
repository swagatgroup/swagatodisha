import { useState, useEffect, useRef } from 'react';
import api from '../../../utils/api';
import { showSuccess, showError } from '../../../utils/sweetAlert';
import CreateStaffModal from '../../admin/CreateStaffModal';

const StaffTab = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        total: 1,
        totalItems: 0,
        hasNext: false,
        hasPrev: false
    });
    const isInitialLoad = useRef(true);

    // Fetch staff data
    const fetchStaff = async (page = pagination.current) => {
        try {
            setLoading(true);
            // Fetching staff with params
            page: page,
                limit: 10,
                    search: searchTerm || undefined,
                        role: filterRole === 'All' ? undefined : filterRole,
                            isActive: true
        });

        const response = await api.get('/api/admin/staff', {
            params: {
                page: page,
                limit: 10,
                search: searchTerm || undefined,
                role: filterRole === 'All' ? undefined : filterRole,
                isActive: true
            }
        });

        // Staff API response received

        if (response.data.success) {
            setStaff(response.data.data.staff);
            setPagination(response.data.data.pagination);
        }
    } catch (error) {
        console.error('Error fetching staff:', error);
        console.error('Error details:', error.response?.data);
        showError('Failed to fetch staff');
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    if (isInitialLoad.current) {
        fetchStaff();
        isInitialLoad.current = false;
    } else {
        fetchStaff();
    }
}, [searchTerm, filterRole]);

// Handle pagination changes
const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
    fetchStaff(page);
};

const handleCreateSuccess = () => {
    fetchStaff();
};

const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, current: 1 }));
};

const handleRoleFilter = (e) => {
    setFilterRole(e.target.value);
    setPagination(prev => ({ ...prev, current: 1 }));
};

const uniqueRoles = [...new Set(staff.map(member => member.role))];

return (
    <div className="space-y-6 dark:text-gray-100">
        {/* Header Section */}
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Staff List</h1>
                <p className="text-sm text-gray-500 mt-1">Home / Staff</p>
            </div>
            <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Staff
            </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 p-6 rounded-lg shadow">
                <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Staff</p>
                        <p className="text-2xl font-semibold text-gray-900">{pagination.totalItems}</p>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 p-6 rounded-lg shadow">
                <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Active Staff</p>
                        <p className="text-2xl font-semibold text-gray-900">{staff.filter(s => s.isActive).length}</p>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 p-6 rounded-lg shadow">
                <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Departments</p>
                        <p className="text-2xl font-semibold text-gray-900">{[...new Set(staff.map(s => s.department))].length}</p>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 p-6 rounded-lg shadow">
                <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                        <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Online Now</p>
                        <p className="text-2xl font-semibold text-gray-900">{staff.filter(s => s.isActive && s.lastLogin && new Date(s.lastLogin).toDateString() === new Date().toDateString()).length}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Staff Information Table */}
        <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Staff Information</h3>
            </div>

            {/* Search and Filter Bar */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, email, role, or department"
                            value={searchTerm}
                            onChange={handleSearch}
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <select
                        value={filterRole}
                        onChange={handleRoleFilter}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option>All</option>
                        {uniqueRoles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Staff Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Agents</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="px-6 py-8 text-center">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                        <span className="ml-2 text-gray-600">Loading staff...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : staff.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                                    No staff found
                                </td>
                            </tr>
                        ) : (
                            staff.map((member) => (
                                <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-purple-600">
                                                        {member.firstName?.substring(0, 1)}{member.lastName?.substring(0, 1)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {member.firstName} {member.lastName}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-gray-100">{member.email}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{member.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{member.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {member.assignedAgents && member.assignedAgents.length > 0 ? (
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">
                                                    {member.assignedAgents.length} agent(s)
                                                </div>
                                                <div className="text-gray-500">
                                                    {member.assignedAgents.slice(0, 2).map(agent => agent.fullName).join(', ')}
                                                    {member.assignedAgents.length > 2 && '...'}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">No agents assigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {new Date(member.joiningDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {member.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button className="text-indigo-600 hover:text-indigo-400" title="Edit">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button className="text-red-600 hover:text-red-400" title="Delete">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(pagination.current - 1)}
                        disabled={!pagination.hasPrev}
                        className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {Array.from({ length: Math.min(5, pagination.total) }, (_, i) => {
                        const page = i + 1;
                        return (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 text-sm rounded ${pagination.current === page
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    })}

                    {pagination.total > 5 && (
                        <>
                            <span className="px-2 text-gray-500">...</span>
                            <button
                                onClick={() => handlePageChange(pagination.total)}
                                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                            >
                                {pagination.total}
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => handlePageChange(pagination.current + 1)}
                        disabled={!pagination.hasNext}
                        className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">10 / page</span>
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>

        {/* Create Staff Modal */}
        <CreateStaffModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateSuccess}
        />
    </div>
);
};

export default StaffTab;
