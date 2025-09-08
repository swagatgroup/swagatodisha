import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import {
    showSuccess,
    showError,
    showConfirm,
    showLoading,
    closeLoading,
    handleApiError
} from '../../utils/sweetAlert';

const UserManagement = ({ userType = 'students' }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [editData, setEditData] = useState({});
    const [passwordData, setPasswordData] = useState({ newPassword: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [userType, currentPage, searchTerm, filterStatus]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            showLoading('Loading users...');

            // Determine the correct API endpoint based on user type
            let endpoint = '/api/auth/users';
            if (userType === 'students') {
                endpoint = '/api/students';
            } else if (userType === 'agents') {
                endpoint = '/api/auth/users?role=agent';
            } else if (userType === 'staff') {
                endpoint = '/api/admin/staff';
            }

            const response = await api.get(endpoint);
            const usersData = response.data.users || response.data || [];

            setUsers(usersData);
            setTotalPages(Math.ceil(usersData.length / 10));
            closeLoading();
        } catch (error) {
            console.error('Error fetching users:', error);
            closeLoading();
            handleApiError(error, 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const generateMockUsers = (type) => {
        const baseUsers = [
            {
                id: 1,
                name: 'Rahul Kumar',
                email: 'rahul@example.com',
                phone: '9876543210',
                status: 'active',
                role: type === 'students' ? 'student' : type === 'agents' ? 'agent' : 'staff',
                createdAt: '2024-01-15',
                lastLogin: '2024-01-20',
                ...(type === 'students' && {
                    course: 'Class 12 Science',
                    aadharNumber: '123456789012',
                    guardianName: 'Suresh Kumar'
                }),
                ...(type === 'agents' && {
                    referralCode: 'AGENT001',
                    totalReferrals: 5,
                    totalCommission: 15000
                }),
                ...(type === 'staff' && {
                    department: 'Admissions',
                    managedAgents: 3
                })
            },
            {
                id: 2,
                name: 'Priya Sharma',
                email: 'priya@example.com',
                phone: '9876543211',
                status: 'active',
                role: type === 'students' ? 'student' : type === 'agents' ? 'agent' : 'staff',
                createdAt: '2024-01-10',
                lastLogin: '2024-01-19',
                ...(type === 'students' && {
                    course: 'Class 11 Commerce',
                    aadharNumber: '123456789013',
                    guardianName: 'Rajesh Sharma'
                }),
                ...(type === 'agents' && {
                    referralCode: 'AGENT002',
                    totalReferrals: 3,
                    totalCommission: 9000
                }),
                ...(type === 'staff' && {
                    department: 'Academic',
                    managedAgents: 2
                })
            }
        ];

        return baseUsers.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setEditData({
            name: user.name,
            email: user.email,
            phone: user.phone,
            status: user.status,
            ...(userType === 'students' && {
                course: user.course,
                aadharNumber: user.aadharNumber,
                guardianName: user.guardianName
            }),
            ...(userType === 'agents' && {
                referralCode: user.referralCode
            }),
            ...(userType === 'staff' && {
                department: user.department
            })
        });
        setShowEditModal(true);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            showLoading('Updating user...');

            // Determine the correct API endpoint based on user type
            let endpoint = `/api/auth/users/${selectedUser._id || selectedUser.id}`;
            if (userType === 'students') {
                endpoint = `/api/students/${selectedUser._id || selectedUser.id}`;
            } else if (userType === 'staff') {
                endpoint = `/api/admin/staff/${selectedUser._id || selectedUser.id}`;
            }

            await api.put(endpoint, editData);

            // Update local state
            setUsers(prev => prev.map(user =>
                (user._id || user.id) === (selectedUser._id || selectedUser.id)
                    ? { ...user, ...editData }
                    : user
            ));

            setShowEditModal(false);
            setSelectedUser(null);
            closeLoading();
            showSuccess('User updated successfully!');
        } catch (error) {
            console.error('Error updating user:', error);
            closeLoading();
            handleApiError(error, 'Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!passwordData.newPassword) {
            showError('Please enter a new password.');
            return;
        }

        try {
            setSaving(true);
            showLoading('Resetting password...');

            // Determine the correct API endpoint based on user type
            let endpoint = `/api/auth/reset-password/${selectedUser._id || selectedUser.id}`;
            if (userType === 'students') {
                endpoint = `/api/students/reset-password/${selectedUser._id || selectedUser.id}`;
            } else if (userType === 'staff') {
                endpoint = `/api/admin/reset-password/${selectedUser._id || selectedUser.id}`;
            }

            await api.post(endpoint, { newPassword: passwordData.newPassword });

            setShowPasswordModal(false);
            setPasswordData({ newPassword: '' });
            closeLoading();
            showSuccess('Password reset successfully!');
        } catch (error) {
            console.error('Error resetting password:', error);
            closeLoading();
            handleApiError(error, 'Failed to reset password');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (userId) => {
        const confirmed = await showConfirm(
            'Delete User',
            'Are you sure you want to delete this user? This action cannot be undone.',
            'warning'
        );

        if (!confirmed) {
            return;
        }

        try {
            showLoading('Deleting user...');

            // Determine the correct API endpoint based on user type
            let endpoint = `/api/auth/users/${userId}`;
            if (userType === 'students') {
                endpoint = `/api/students/${userId}`;
            } else if (userType === 'staff') {
                endpoint = `/api/admin/staff/${userId}`;
            }

            await api.delete(endpoint);

            setUsers(prev => prev.filter(user => (user._id || user.id) !== userId));
            closeLoading();
            showSuccess('User deleted successfully!');
        } catch (error) {
            console.error('Error deleting user:', error);
            closeLoading();
            handleApiError(error, 'Failed to delete user');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'student': return 'bg-blue-100 text-blue-800';
            case 'agent': return 'bg-green-100 text-green-800';
            case 'staff': return 'bg-purple-100 text-purple-800';
            case 'super_admin': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    {userType === 'students' ? 'Student Management' :
                        userType === 'agents' ? 'Agent Management' : 'Staff Management'}
                </h3>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            {userType === 'students' && (
                                <>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Course
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aadhar
                                    </th>
                                </>
                            )}
                            {userType === 'agents' && (
                                <>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Referral Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Referrals
                                    </th>
                                </>
                            )}
                            {userType === 'staff' && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Department
                                </th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <motion.tr
                                key={user.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hover:bg-gray-50"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                <span className="text-sm font-medium text-purple-600">
                                                    {user.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{user.email}</div>
                                    <div className="text-sm text-gray-500">{user.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                    </span>
                                </td>
                                {userType === 'students' && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.course}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.aadharNumber}
                                        </td>
                                    </>
                                )}
                                {userType === 'agents' && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                                            {user.referralCode}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.totalReferrals} (₹{user.totalCommission.toLocaleString()})
                                        </td>
                                    </>
                                )}
                                {userType === 'staff' && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.department}
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="text-purple-600 hover:text-purple-900"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowPasswordModal(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Reset Password
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <nav className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 border rounded-md text-sm font-medium ${page === currentPage
                                    ? 'border-purple-500 bg-purple-50 text-purple-600'
                                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={editData.email}
                                        onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone *
                                    </label>
                                    <input
                                        type="tel"
                                        value={editData.phone}
                                        onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status *
                                    </label>
                                    <select
                                        value={editData.status}
                                        onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>

                                {userType === 'students' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Course
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.course || ''}
                                                onChange={(e) => setEditData(prev => ({ ...prev, course: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Aadhar Number
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.aadharNumber || ''}
                                                onChange={(e) => setEditData(prev => ({ ...prev, aadharNumber: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </>
                                )}

                                {userType === 'agents' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Referral Code
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.referralCode || ''}
                                            onChange={(e) => setEditData(prev => ({ ...prev, referralCode: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                )}

                                {userType === 'staff' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Department
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.department || ''}
                                            onChange={(e) => setEditData(prev => ({ ...prev, department: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {showPasswordModal && selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Reset Password for {selectedUser.name}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Enter new password"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePasswordReset}
                                    disabled={saving || !passwordData.newPassword}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                                >
                                    {saving ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
