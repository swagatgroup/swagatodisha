import {useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';

const AgentManagement = ({ agents, onAgentUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredAgents = agents.filter(agent => {
        const matchesSearch =
            agent.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.phoneNumber?.includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleStatusChange = async (agentId, newStatus) => {
        try {
            setLoading(true);
            const response = await api.put(`/api/staff/agents/${agentId}/status`, {
                status: newStatus
            });

            if (response.data.success) {
                onAgentUpdate();
                alert('Agent status updated successfully!');
            }
        } catch (error) {
            console.error('Error updating agent status:', error);
            alert('Error updating agent status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignStudents = async (agentId, studentIds) => {
        try {
            setLoading(true);
            const response = await api.post(`/api/staff/agents/${agentId}/assign-students`, {
                studentIds
            });

            if (response.data.success) {
                onAgentUpdate();
                alert('Students assigned successfully!');
            }
        } catch (error) {
            console.error('Error assigning students:', error);
            alert('Error assigning students. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            case 'suspended':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPerformanceColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-6">
            {/* Header with Search and Filters */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <h3 className="text-lg font-semibold text-gray-900">Agent Management</h3>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Search agents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Agent List */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-md font-medium text-gray-900">
                        Agents ({filteredAgents.length})
                    </h4>
                </div>

                <div className="p-6">
                    {filteredAgents.length === 0 ? (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No agents found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'No agents have been registered yet.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredAgents.map((agent, index) => (
                                <motion.div
                                    key={agent._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                                <span className="text-lg font-semibold text-gray-600">
                                                    {agent.fullName?.charAt(0) || 'A'}
                                                </span>
                                            </div>

                                            <div>
                                                <h5 className="font-medium text-gray-900">{agent.fullName}</h5>
                                                <p className="text-sm text-gray-500">{agent.email}</p>
                                                <p className="text-xs text-gray-400">
                                                    {agent.phoneNumber} • Joined {new Date(agent.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-6">
                                            {/* Performance Score */}
                                            <div className="text-center">
                                                <div className={`text-lg font-bold ${getPerformanceColor(agent.performanceScore || 0)}`}>
                                                    {agent.performanceScore || 0}%
                                                </div>
                                                <div className="text-xs text-gray-500">Performance</div>
                                            </div>

                                            {/* Student Count */}
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">
                                                    {agent.assignedStudents?.length || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">Students</div>
                                            </div>

                                            {/* Commission */}
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-green-600">
                                                    ₹{agent.totalCommission || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">Commission</div>
                                            </div>

                                            {/* Status */}
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(agent.status)}`}>
                                                    {agent.status?.charAt(0).toUpperCase() + agent.status?.slice(1)}
                                                </span>

                                                <div className="flex space-x-1">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedAgent(agent);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="p-1 text-blue-600 hover:text-blue-800"
                                                        title="View Details"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>

                                                    <select
                                                        value={agent.status}
                                                        onChange={(e) => handleStatusChange(agent._id, e.target.value)}
                                                        className="text-xs border border-gray-300 rounded px-2 py-1"
                                                        disabled={loading}
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                        <option value="suspended">Suspended</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Agent Details Modal */}
            {showDetailsModal && selectedAgent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Agent Details - {selectedAgent.fullName}
                            </h3>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Information */}
                                <div>
                                    <h4 className="text-md font-semibold text-gray-900 mb-4">Basic Information</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Full Name</label>
                                            <p className="text-sm text-gray-900">{selectedAgent.fullName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Email</label>
                                            <p className="text-sm text-gray-900">{selectedAgent.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Phone</label>
                                            <p className="text-sm text-gray-900">{selectedAgent.phoneNumber}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Status</label>
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedAgent.status)}`}>
                                                {selectedAgent.status?.charAt(0).toUpperCase() + selectedAgent.status?.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Metrics */}
                                <div>
                                    <h4 className="text-md font-semibold text-gray-900 mb-4">Performance Metrics</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">Performance Score</span>
                                            <span className={`text-sm font-medium ${getPerformanceColor(selectedAgent.performanceScore || 0)}`}>
                                                {selectedAgent.performanceScore || 0}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">Total Students</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {selectedAgent.assignedStudents?.length || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">Total Commission</span>
                                            <span className="text-sm font-medium text-green-600">
                                                ₹{selectedAgent.totalCommission || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">Pending Commission</span>
                                            <span className="text-sm font-medium text-orange-600">
                                                ₹{selectedAgent.pendingCommission || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Assigned Students */}
                            <div className="mt-6">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Assigned Students</h4>
                                {selectedAgent.assignedStudents?.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedAgent.assignedStudents.slice(0, 5).map((student) => (
                                            <div key={student._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {student.personalDetails?.fullName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {student.courseDetails?.selectedCourse}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.workflowStatus?.currentStage || student.status)}`}>
                                                    {student.workflowStatus?.currentStage || student.status}
                                                </span>
                                            </div>
                                        ))}
                                        {selectedAgent.assignedStudents.length > 5 && (
                                            <p className="text-xs text-gray-500 text-center">
                                                And {selectedAgent.assignedStudents.length - 5} more...
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No students assigned</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        // Open assign students modal
                                        alert('Assign students functionality would be implemented here');
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Assign Students
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentManagement;
