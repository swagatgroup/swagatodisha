import {useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const ReferralManagement = () => {
    const { user } = useAuth();
    const [referrals, setReferrals] = useState([]);
    const [stats, setStats] = useState({
        totalReferrals: 0,
        activeReferrals: 0,
        totalCommission: 0,
        thisMonthReferrals: 0
    });
    const [loading, setLoading] = useState(true);
    const [showAddReferralModal, setShowAddReferralModal] = useState(false);
    const [newReferral, setNewReferral] = useState({
        studentName: '',
        studentEmail: '',
        studentPhone: '',
        course: '',
        notes: ''
    });
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchReferrals();
        fetchStats();
    }, []);

    const fetchReferrals = async () => {
        try {
            setLoading(true);
            // Mock data for now - replace with actual API call
            const mockReferrals = [
                {
                    id: 1,
                    studentName: 'Rahul Kumar',
                    studentEmail: 'rahul@example.com',
                    studentPhone: '9876543210',
                    course: 'Class 12 Science',
                    status: 'enrolled',
                    commission: 5000,
                    referredAt: '2024-01-15',
                    enrolledAt: '2024-01-20'
                },
                {
                    id: 2,
                    studentName: 'Priya Sharma',
                    studentEmail: 'priya@example.com',
                    studentPhone: '9876543211',
                    course: 'Class 11 Commerce',
                    status: 'pending',
                    commission: 0,
                    referredAt: '2024-01-20',
                    enrolledAt: null
                },
                {
                    id: 3,
                    studentName: 'Amit Singh',
                    studentEmail: 'amit@example.com',
                    studentPhone: '9876543212',
                    course: 'Class 10',
                    status: 'enrolled',
                    commission: 3000,
                    referredAt: '2024-01-10',
                    enrolledAt: '2024-01-18'
                }
            ];
            setReferrals(mockReferrals);
        } catch (error) {
            console.error('Error fetching referrals:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Mock data for now - replace with actual API call
            setStats({
                totalReferrals: 12,
                activeReferrals: 8,
                totalCommission: 15000,
                thisMonthReferrals: 3
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleAddReferral = async () => {
        if (!newReferral.studentName || !newReferral.studentEmail || !newReferral.studentPhone) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            setAdding(true);
            // Mock API call - replace with actual implementation
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Add to local state
            const referral = {
                id: Date.now(),
                ...newReferral,
                status: 'pending',
                commission: 0,
                referredAt: new Date().toISOString().split('T')[0],
                enrolledAt: null
            };

            setReferrals(prev => [referral, ...prev]);
            setNewReferral({
                studentName: '',
                studentEmail: '',
                studentPhone: '',
                course: '',
                notes: ''
            });
            setShowAddReferralModal(false);

            alert('Referral added successfully!');
        } catch (error) {
            console.error('Error adding referral:', error);
            alert('Error adding referral. Please try again.');
        } finally {
            setAdding(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'enrolled': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'enrolled': return '✓';
            case 'pending': return '⏳';
            case 'rejected': return '✗';
            default: return '?';
        }
    };

    const copyReferralCode = () => {
        const referralCode = user?.referralCode || 'AGENT001';
        navigator.clipboard.writeText(referralCode);
        alert('Referral code copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">My Referrals</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={copyReferralCode}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Referral Code
                    </button>
                    <button
                        onClick={() => setShowAddReferralModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Referral
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                        <div className="text-blue-600 text-2xl mr-3">👥</div>
                        <div>
                            <p className="text-sm text-blue-600">Total Referrals</p>
                            <p className="text-xl font-semibold text-blue-900">{stats.totalReferrals}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                        <div className="text-green-600 text-2xl mr-3">✓</div>
                        <div>
                            <p className="text-sm text-green-600">Active Referrals</p>
                            <p className="text-xl font-semibold text-green-900">{stats.activeReferrals}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center">
                        <div className="text-yellow-600 text-2xl mr-3">💰</div>
                        <div>
                            <p className="text-sm text-yellow-600">Total Commission</p>
                            <p className="text-xl font-semibold text-yellow-900">₹{stats.totalCommission.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                        <div className="text-purple-600 text-2xl mr-3">📅</div>
                        <div>
                            <p className="text-sm text-purple-600">This Month</p>
                            <p className="text-xl font-semibold text-purple-900">{stats.thisMonthReferrals}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Referral Code Display */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-medium text-gray-900">Your Referral Code</h4>
                        <p className="text-sm text-gray-600">Share this code with students to track referrals</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <code className="px-3 py-2 bg-white border border-gray-300 rounded-md font-mono text-lg">
                            {user?.referralCode || 'AGENT001'}
                        </code>
                        <button
                            onClick={copyReferralCode}
                            className="p-2 text-gray-500 hover:text-gray-700"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Referrals List */}
            {referrals.length === 0 ? (
                <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals yet</h3>
                    <p className="text-gray-500 mb-4">Start referring students to earn commissions.</p>
                    <button
                        onClick={() => setShowAddReferralModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                        Add Your First Referral
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {referrals.map((referral) => (
                        <motion.div
                            key={referral.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <h4 className="text-lg font-medium text-gray-900">
                                            {referral.studentName}
                                        </h4>
                                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                                            {getStatusIcon(referral.status)} {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                        <p><strong>Email:</strong> {referral.studentEmail}</p>
                                        <p><strong>Phone:</strong> {referral.studentPhone}</p>
                                        <p><strong>Course:</strong> {referral.course}</p>
                                        <p><strong>Commission:</strong> ₹{referral.commission.toLocaleString()}</p>
                                        <p><strong>Referred:</strong> {new Date(referral.referredAt).toLocaleDateString()}</p>
                                        {referral.enrolledAt && (
                                            <p><strong>Enrolled:</strong> {new Date(referral.enrolledAt).toLocaleDateString()}</p>
                                        )}
                                    </div>

                                    {referral.notes && (
                                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                                            <strong>Notes:</strong> {referral.notes}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    {referral.status === 'enrolled' && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Commission Earned
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add Referral Modal */}
            {showAddReferralModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Referral</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Student Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newReferral.studentName}
                                        onChange={(e) => setNewReferral(prev => ({ ...prev, studentName: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter student name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Student Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={newReferral.studentEmail}
                                        onChange={(e) => setNewReferral(prev => ({ ...prev, studentEmail: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter student email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Student Phone *
                                    </label>
                                    <input
                                        type="tel"
                                        value={newReferral.studentPhone}
                                        onChange={(e) => setNewReferral(prev => ({ ...prev, studentPhone: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter student phone"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Course
                                    </label>
                                    <input
                                        type="text"
                                        value={newReferral.course}
                                        onChange={(e) => setNewReferral(prev => ({ ...prev, course: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter course name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        value={newReferral.notes}
                                        onChange={(e) => setNewReferral(prev => ({ ...prev, notes: e.target.value }))}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter any additional notes"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowAddReferralModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddReferral}
                                    disabled={adding || !newReferral.studentName || !newReferral.studentEmail || !newReferral.studentPhone}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {adding ? 'Adding...' : 'Add Referral'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferralManagement;
