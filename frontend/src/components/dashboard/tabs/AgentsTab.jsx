import React, { useState, useEffect, useRef } from 'react';
import api from '../../../utils/api';
import { showSuccess, showError } from '../../../utils/sweetAlert';
import CreateAgentModal from '../../admin/CreateAgentModal';

const AgentsTab = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [agents, setAgents] = useState([]);
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

    // Fetch agents data
    const fetchAgents = async (page = pagination.current) => {
        try {
            setLoading(true);
            // Fetching agents with params
            page: page,
                limit: 10,
                    search: searchTerm || undefined,
                        isActive: filterStatus === 'All' ? undefined : filterStatus === 'Active'
        });

        const response = await api.get('/api/admin/agents', {
            params: {
                page: page,
                limit: 10,
                search: searchTerm || undefined,
                isActive: filterStatus === 'All' ? undefined : filterStatus === 'Active'
            }
        });

        // Agents API response received

        if (response.data.success) {
            setAgents(response.data.data.agents);
            setPagination(response.data.data.pagination);
        }
    } catch (error) {
        console.error('Error fetching agents:', error);
        console.error('Error details:', error.response?.data);
        showError('Failed to fetch agents');
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    if (isInitialLoad.current) {
        fetchAgents();
        isInitialLoad.current = false;
    } else {
        fetchAgents();
    }
}, [searchTerm, filterStatus]);

// Handle pagination changes
const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
    fetchAgents(page);
};

const handleCreateSuccess = () => {
    fetchAgents();
};

const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, current: 1 }));
};

const handleStatusFilter = (e) => {
    setFilterStatus(e.target.value);
    setPagination(prev => ({ ...prev, current: 1 }));
};

return (
    <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Agents List</h1>
                <p className="text-sm text-gray-500 mt-1">Home / Agents</p>
            </div>
            <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Agent
            </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Agents</p>
                        <p className="text-2xl font-semibold text-gray-900">{pagination.totalItems}</p>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Active Agents</p>
                        <p className="text-2xl font-semibold text-gray-900">{agents.filter(a => a.isActive).length}</p>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Referrals</p>
                        <p className="text-2xl font-semibold text-gray-900">{agents.reduce((sum, agent) => sum + (agent.referralStats?.totalReferrals || 0), 0)}</p>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                        <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Commission</p>
                        <p className="text-2xl font-semibold text-gray-900">₹{agents.reduce((sum, agent) => sum + (agent.referralStats?.totalCommission || 0), 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Agents Information Table */}
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Agents Information</h3>
            </div>

            {/* Search and Filter Bar */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, email, or referral code"
                            value={searchTerm}
                            onChange={handleSearch}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <select
                        value={filterStatus}
                        onChange={handleStatusFilter}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option>All</option>
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Staff</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Referrals</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Successful</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="10" className="px-6 py-8 text-center">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                        <span className="ml-2 text-gray-600">Loading agents...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : agents.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                                    No agents found
                                </td>
                            </tr>
                        ) : (
                            agents.map((agent) => (
                                <tr key={agent._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-purple-600">
                                                        {agent.fullName?.substring(0, 2).toUpperCase() || 'AG'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{agent.fullName}</div>
                                                <div className="text-sm text-gray-500">Joined: {new Date(agent.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{agent.email}</div>
                                        <div className="text-sm text-gray-500">{agent.phoneNumber}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {agent.referralCode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {agent.assignedStaff ? (
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">
                                                    {agent.assignedStaff.firstName} {agent.assignedStaff.lastName}
                                                </div>
                                                <div className="text-gray-500">{agent.assignedStaff.department}</div>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">Not assigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {agent.referralStats?.totalReferrals || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                        {agent.referralStats?.approvedReferrals || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                                        {agent.referralStats?.pendingReferrals || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ₹{(agent.referralStats?.totalCommission || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${agent.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {agent.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button className="text-indigo-600 hover:text-indigo-900" title="Edit">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button className="text-red-600 hover:text-red-900" title="Delete">
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

        {/* Create Agent Modal */}
        <CreateAgentModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateSuccess}
        />
    </div>
);
};

export default AgentsTab;
