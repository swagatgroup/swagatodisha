import React, { useState } from 'react';
import {
    showSuccess,
    showError,
    showConfirm,
    showLoading,
    closeLoading,
    handleApiError
} from '../../../utils/sweetAlert';
import api from '../../../utils/api';

const PasswordsTab = () => {
    const [activeSubTab, setActiveSubTab] = useState('students');
    const [searchTerm, setSearchTerm] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    // Sample data for different user types
    const students = [
        { id: 1, name: "Rahul Kumar", email: "rahul@example.com", phone: "+91 9876543210", lastPasswordChange: "2024-01-15", status: "Active" },
        { id: 2, name: "Priya Sharma", email: "priya@example.com", phone: "+91 9876543211", lastPasswordChange: "2024-02-20", status: "Active" },
        { id: 3, name: "Amit Singh", email: "amit@example.com", phone: "+91 9876543212", lastPasswordChange: "2024-01-05", status: "Active" }
    ];

    const agents = [
        { id: 1, name: "Rajesh Kumar", email: "rajesh.agent@example.com", phone: "+91 9876543210", lastPasswordChange: "2024-01-15", status: "Active" },
        { id: 2, name: "Priya Sharma", email: "priya.agent@example.com", phone: "+91 9876543211", lastPasswordChange: "2024-02-20", status: "Active" }
    ];

    const staff = [
        { id: 1, name: "Dr. Rajesh Kumar", email: "rajesh.staff@swagat.edu", phone: "+91 9876543210", lastPasswordChange: "2024-01-15", status: "Active" },
        { id: 2, name: "Priya Sharma", email: "priya.staff@swagat.edu", phone: "+91 9876543211", lastPasswordChange: "2024-02-20", status: "Active" }
    ];

    const getCurrentData = () => {
        switch (activeSubTab) {
            case 'students': return students;
            case 'agents': return agents;
            case 'staff': return staff;
            default: return students;
        }
    };

    const filteredData = getCurrentData().filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePasswordReset = (user) => {
        setSelectedUser(user);
        setNewPassword('');
    };

    const confirmPasswordReset = async () => {
        if (!newPassword || !selectedUser) {
            showError('Please enter a new password.');
            return;
        }

        try {
            showLoading('Resetting password...');

            // Determine the correct API endpoint based on user type
            let endpoint = `/api/auth/reset-password/${selectedUser._id || selectedUser.id}`;
            if (activeSubTab === 'students') {
                endpoint = `/api/students/reset-password/${selectedUser._id || selectedUser.id}`;
            } else if (activeSubTab === 'staff') {
                endpoint = `/api/admin/reset-password/${selectedUser._id || selectedUser.id}`;
            }

            await api.post(endpoint, { newPassword });

            setSelectedUser(null);
            setNewPassword('');
            closeLoading();
            showSuccess(`Password reset successfully for ${selectedUser.name}!`);
        } catch (error) {
            console.error('Error resetting password:', error);
            closeLoading();
            handleApiError(error, 'Failed to reset password');
        }
    };

    const renderUserTable = (users) => (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                    {activeSubTab.charAt(0).toUpperCase() + activeSubTab.slice(1)} Password Management
                </h3>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="relative">
                    <input
                        type="text"
                        placeholder={`Search ${activeSubTab} by name or email`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
                    />
                    <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Password Change</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
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
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastPasswordChange}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'Active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handlePasswordReset(user)}
                                        className="text-purple-600 hover:text-purple-900 font-medium"
                                    >
                                        Reset Password
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Password Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Home / Passwords</p>
                </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveSubTab('students')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeSubTab === 'students'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Students
                </button>
                <button
                    onClick={() => setActiveSubTab('agents')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeSubTab === 'agents'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Agents
                </button>
                <button
                    onClick={() => setActiveSubTab('staff')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeSubTab === 'staff'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Staff
                </button>
            </div>

            {/* User Table */}
            {renderUserTable(filteredData)}

            {/* Password Reset Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-purple-100 rounded-full">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div className="mt-2 px-7 py-3">
                                <h3 className="text-lg font-medium text-gray-900 text-center">Reset Password</h3>
                                <div className="mt-2 px-7 py-3">
                                    <p className="text-sm text-gray-500 text-center">
                                        Reset password for <strong>{selectedUser.name}</strong>
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-end px-4 py-3 bg-gray-50 sm:px-6">
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 mr-3"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmPasswordReset}
                                    disabled={!newPassword}
                                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Reset Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PasswordsTab;
