import {useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';

// Icon components
const UsersIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
);

const CopyIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const EditIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const CheckIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const XIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const PlusIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

const SearchIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const FilterIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);

const RefreshIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);
import {
    showSuccess,
    showError,
    showConfirm,
    showLoading,
    closeLoading,
    handleApiError
} from '../../utils/sweetAlert';

const ReferralManagement = () => {
    const [users, setUsersIcon] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCode, setEditIconingCode] = useState(null);
    const [newCode, setNewCode] = useState('');
    const [searchTerm, setSearchIconTerm] = useState('');
    const [filterRole, setFilterIconRole] = useState('all');
    const [filterStatus, setFilterIconStatus] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            showLoading('Loading referral users...');

            const response = await api.get('/api/referrals/all');

            if (response.data.success) {
                setUsersIcon(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to load users');
            }

            closeLoading();
        } catch (error) {
            console.error('Fetch users error:', error);
            closeLoading();
            handleApiError(error, 'Failed to load referral users');
        } finally {
            setLoading(false);
        }
    };

    const generateReferralCode = async (userId, customCode = '') => {
        try {
            showLoading('Generating referral code...');

            const response = await api.post('/api/referrals/generate', {
                userId,
                customCode: customCode.trim()
            });

            if (response.data.success) {
                closeLoading();
                showSuccess(`Referral code ${response.data.data.referralCode} generated successfully!`);
                fetchUsers(); // Refresh the list
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Generate referral code error:', error);
            closeLoading();
            handleApiError(error, 'Failed to generate referral code');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            showSuccess('Referral code copied to clipboard!');
        }).catch(() => {
            showError('Failed to copy to clipboard');
        });
    };

    const handleEditIconCode = (userId, currentCode) => {
        setEditIconingCode(userId);
        setNewCode(currentCode || '');
    };

    const saveEditIconedCode = async (userId) => {
        if (!newCode.trim()) {
            showError('Please enter a valid referral code.');
            return;
        }

        await generateReferralCode(userId, newCode);
        setEditIconingCode(null);
        setNewCode('');
    };

    const cancelEditIcon = () => {
        setEditIconingCode(null);
        setNewCode('');
    };

    const toggleReferralStatus = async (userId, currentStatus) => {
        try {
            showLoading('Updating referral status...');

            const response = await api.put(`/api/referrals/${userId}/toggle`);

            if (response.data.success) {
                closeLoading();
                showSuccess(`Referral status ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
                fetchUsers(); // Refresh the list
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Toggle referral status error:', error);
            closeLoading();
            handleApiError(error, 'Failed to update referral status');
        }
    };

    const filteredUsersIcon = users.filter(user => {
        const matchesSearchIcon = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.referralCode && user.referralCode.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && user.isReferralActive) ||
            (filterStatus === 'inactive' && !user.isReferralActive) ||
            (filterStatus === 'no_code' && !user.referralCode);

        return matchesSearchIcon && matchesRole && matchesStatus;
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
                        <UsersIcon className="h-6 w-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Referral Code Management</h2>
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        <RefreshIcon className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                </div>
                <p className="text-gray-600 mt-2">Manage referral codes for all users in the system.</p>
            </div>

            {/* FilterIcons */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                        {filteredUsersIcon.map((user) => (
                            <motion.tr
                                key={user._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hover:bg-gray-50"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.fullName || user.name}
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
                                                onClick={() => saveEditIconedCode(user._id)}
                                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                            >
                                                <CheckIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={cancelEditIcon}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <XIcon className="h-4 w-4" />
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
                                                        title="CopyIcon to clipboard"
                                                    >
                                                        <CopyIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditIconCode(user._id, user.referralCode)}
                                                        className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                                        title="EditIcon code"
                                                    >
                                                        <EditIcon className="h-4 w-4" />
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
                                        Successful: {user.referralStats?.successfulReferrals || 0}
                                    </div>
                                    <div>
                                        Commission: ₹{user.referralStats?.totalCommission || 0}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        {!user.referralCode ? (
                                            <button
                                                onClick={() => generateReferralCode(user._id)}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                <PlusIcon className="h-3 w-3 mr-1" />
                                                Generate
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleEditIconCode(user._id, '')}
                                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                <PlusIcon className="h-3 w-3 mr-1" />
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

            {filteredUsersIcon.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No users found matching your criteria.
                </div>
            )}
        </div>
    );
};

export default ReferralManagement;
