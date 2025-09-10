import React, { useState, useEffect } from 'react';
import { Users, Copy, Edit, Check, X, Plus, Search, Filter, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const ReferralManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCode, setEditingCode] = useState(null);
    const [newCode, setNewCode] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/referrals/all', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const result = await response.json();
            if (result.success) {
                setUsers(result.data);
            }
        } catch (error) {
            console.error('Fetch users error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to Load',
                text: 'Failed to load users data.'
            });
        } finally {
            setLoading(false);
        }
    };

    const generateReferralCode = async (userId, customCode = '') => {
        try {
            const response = await fetch('/api/referrals/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    userId,
                    customCode: customCode.trim()
                })
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: `Referral code ${result.data.referralCode} generated successfully.`
                });
                fetchUsers(); // Refresh the list
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Generate referral code error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to Generate',
                text: error.message || 'Failed to generate referral code.'
            });
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Copied!',
                text: 'Referral code copied to clipboard.',
                timer: 1500,
                showConfirmButton: false
            });
        });
    };

    const handleEditCode = (userId, currentCode) => {
        setEditingCode(userId);
        setNewCode(currentCode || '');
    };

    const saveEditedCode = async (userId) => {
        if (!newCode.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Code',
                text: 'Please enter a valid referral code.'
            });
            return;
        }

        await generateReferralCode(userId, newCode);
        setEditingCode(null);
        setNewCode('');
    };

    const cancelEdit = () => {
        setEditingCode(null);
        setNewCode('');
    };

    const toggleReferralStatus = async (userId, currentStatus) => {
        try {
            const response = await fetch(`/api/referrals/${userId}/toggle`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const result = await response.json();

            if (result.success) {
                fetchUsers(); // Refresh the list
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: `Referral status ${currentStatus ? 'deactivated' : 'activated'}.`,
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Toggle referral status error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'Failed to update referral status.'
            });
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.referralCode && user.referralCode.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && user.isReferralActive) ||
            (filterStatus === 'inactive' && !user.isReferralActive) ||
            (filterStatus === 'no_code' && !user.referralCode);

        return matchesSearch && matchesRole && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Users className="h-6 w-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Referral Code Management</h2>
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                </div>
                <p className="text-gray-600 mt-2">Manage referral codes for all users in the system.</p>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search users or codes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Roles</option>
                        <option value="student">Students</option>
                        <option value="agent">Agents</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admins</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="no_code">No Code</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Referral Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stats
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                            <motion.tr
                                key={user._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hover:bg-gray-50"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.fullName}
                                        </div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                    ${user.role === 'admin' || user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                                                user.role === 'agent' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'}
                  `}>
                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingCode === user._id ? (
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={newCode}
                                                onChange={(e) => setNewCode(e.target.value)}
                                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter referral code"
                                            />
                                            <button
                                                onClick={() => saveEditedCode(user._id)}
                                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            {user.referralCode ? (
                                                <>
                                                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                        {user.referralCode}
                                                    </span>
                                                    <button
                                                        onClick={() => copyToClipboard(user.referralCode)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="Copy to clipboard"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditCode(user._id, user.referralCode)}
                                                        className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                                        title="Edit code"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-gray-400 text-sm">No code</span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={user.isReferralActive || false}
                                            onChange={() => toggleReferralStatus(user._id, user.isReferralActive)}
                                            className="text-blue-600 focus:ring-blue-500"
                                            disabled={!user.referralCode}
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            {user.isReferralActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </label>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div>
                                        Total: {user.referralStats?.totalReferrals || 0}
                                    </div>
                                    <div>
                                        Approved: {user.referralStats?.approvedReferrals || 0}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        {!user.referralCode ? (
                                            <button
                                                onClick={() => generateReferralCode(user._id)}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Generate
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleEditCode(user._id, '')}
                                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                New Code
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No users found matching your criteria.
                </div>
            )}
        </div>
    );
};

export default ReferralManagement;
