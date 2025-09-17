import {useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';

// Icon components
const ShieldIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const KeyIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
);

const UsersIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
);

const AlertTriangleIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
);

const CheckCircleIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const RefreshIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
import {
    showSuccess,
    showError,
    showConfirm,
    showLoading,
    closeLoading,
    handleApiError
} from '../../utils/sweetAlert';

const PasswordManagement = () => {
    const [passwordAudit, setPasswordAudit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchIconTerm] = useState('');
    const [filterStatus, setFilterIconStatus] = useState('all');
    const [fixingPasswords, setFixingPasswords] = useState(false);

    useEffect(() => {
        fetchPasswordAudit();
    }, []);

    const fetchPasswordAudit = async () => {
        try {
            setLoading(true);
            showLoading('Loading password audit...');

            const response = await api.get('/api/security/passwords');

            if (response.data.success) {
                setPasswordAudit(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to load password audit');
            }

            closeLoading();
        } catch (error) {
            console.error('Error fetching password audit:', error);
            closeLoading();
            handleApiError(error, 'Failed to load password audit');
        } finally {
            setLoading(false);
        }
    };

    const handleFixPasswords = async () => {
        const confirmed = await showConfirm(
            'Fix Weak Passwords',
            'This will reset all weak passwords to secure defaults. Users will need to change their passwords on next login. Continue?',
            'warning'
        );

        if (!confirmed) {
            return;
        }

        try {
            setFixingPasswords(true);
            showLoading('Fixing weak passwords...');

            const response = await api.post('/api/security/fix-passwords');

            if (response.data.success) {
                closeLoading();
                showSuccess(response.data.message);
                await fetchPasswordAudit(); // Refresh the audit
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error fixing passwords:', error);
            closeLoading();
            handleApiError(error, 'Failed to fix weak passwords');
        } finally {
            setFixingPasswords(false);
        }
    };

    const getPasswordStrengthColor = (strength) => {
        switch (strength) {
            case 'strong': return 'text-green-600 bg-green-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'weak': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 dark:text-gray-400 bg-gray-100';
        }
    };

    const getPasswordStrengthIcon = (strength) => {
        switch (strength) {
            case 'strong': return <CheckCircleIcon className="h-4 w-4" />;
            case 'medium': return <AlertTriangleIcon className="h-4 w-4" />;
            case 'weak': return <AlertTriangleIcon className="h-4 w-4" />;
            default: return <KeyIcon className="h-4 w-4" />;
        }
    };

    const filteredUsers = passwordAudit?.weakPasswordDetails?.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'weak' && user.strength === 'weak') ||
            (filterStatus === 'medium' && user.strength === 'medium') ||
            (filterStatus === 'strong' && user.strength === 'strong');
        return matchesSearch && matchesStatus;
    }) || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!passwordAudit) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Failed to load password audit</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Password Management</h2>
                        <p className="text-gray-600 dark:text-gray-400">Monitor and manage user password security</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={fetchPasswordAudit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <RefreshIcon className="h-4 w-4 mr-2 inline" />
                            Refresh
                        </button>
                        <button
                            onClick={handleFixPasswords}
                            disabled={fixingPasswords || passwordAudit.weakPasswords === 0}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {fixingPasswords ? 'Fixing...' : 'Fix Weak Passwords'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Security Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Password Security Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center">
                            <UsersIcon className="h-8 w-8 text-blue-600 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total UsersIcon</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{passwordAudit.totalUsersIcon}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-red-600">Weak Passwords</p>
                                <p className="text-2xl font-bold text-red-600">{passwordAudit.weakPasswords}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertTriangleIcon className="h-8 w-8 text-yellow-600 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-yellow-600">Medium Strength</p>
                                <p className="text-2xl font-bold text-yellow-600">{passwordAudit.mediumPasswords || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center">
                            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-green-600">Strong Passwords</p>
                                <p className="text-2xl font-bold text-green-600">{passwordAudit.strongPasswords || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Strength Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Password Strength Distribution</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Weak Passwords</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                <div
                                    className="bg-red-500 h-2 rounded-full"
                                    style={{ width: `${(passwordAudit.weakPasswords / passwordAudit.totalUsersIcon) * 100}%` }}
                                ></div>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{passwordAudit.weakPasswords}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Medium Strength</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                <div
                                    className="bg-yellow-500 h-2 rounded-full"
                                    style={{ width: `${((passwordAudit.mediumPasswords || 0) / passwordAudit.totalUsersIcon) * 100}%` }}
                                ></div>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{passwordAudit.mediumPasswords || 0}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Strong Passwords</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${((passwordAudit.strongPasswords || 0) / passwordAudit.totalUsersIcon) * 100}%` }}
                                ></div>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{passwordAudit.strongPasswords || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* UsersIcon with Weak Passwords */}
            {passwordAudit.weakPasswordDetails && passwordAudit.weakPasswordDetails.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">UsersIcon with Weak Passwords</h3>
                        <div className="flex space-x-3">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="SearchIcon users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchIconTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterIconStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All Strength</option>
                                <option value="weak">Weak</option>
                                <option value="medium">Medium</option>
                                <option value="strong">Strong</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Password Strength
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Issues
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Last Changed
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredUsersIcon.map((user, index) => (
                                    <motion.tr
                                        key={index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-purple-600">
                                                            {user.email.split('@')[0].substring(0, 2).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.email}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                                                user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                                                    user.role === 'agent' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPasswordStrengthColor(user.strength || 'weak')}`}>
                                                {getPasswordStrengthIcon(user.strength || 'weak')}
                                                <span className="ml-1">{user.strength || 'weak'}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <div className="space-y-1">
                                                {user.issues?.map((issue, idx) => (
                                                    <div key={idx} className="text-xs text-red-600">
                                                        • {issue}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {user.lastChanged ? new Date(user.lastChanged).toLocaleDateString() : 'Never'}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsersIcon.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No users found matching your criteria.
                        </div>
                    )}
                </div>
            )}

            {/* Password Security Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Security Recommendations</h3>
                <div className="space-y-4">
                    {[
                        {
                            priority: 'high',
                            title: 'Enforce Strong Password Policy',
                            description: 'Implement minimum password requirements: 8+ characters, mixed case, numbers, and symbols.',
                            action: 'Configure password policy in user registration and password change flows.'
                        },
                        {
                            priority: 'high',
                            title: 'Enable Password Expiration',
                            description: 'Force users to change passwords every 90 days to prevent long-term compromise.',
                            action: 'Set up automatic password expiration notifications and enforcement.'
                        },
                        {
                            priority: 'medium',
                            title: 'Implement Two-Factor Authentication',
                            description: 'Add 2FA for admin and staff accounts to provide an additional security layer.',
                            action: 'Integrate TOTP or SMS-based 2FA for sensitive accounts.'
                        },
                        {
                            priority: 'medium',
                            title: 'Monitor Password Reuse',
                            description: 'Prevent users from reusing their last 5 passwords to maintain security.',
                            action: 'Implement password history tracking and validation.'
                        }
                    ].map((rec, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${rec.priority === 'high' ? 'text-red-600 bg-red-100' :
                                            rec.priority === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                                                'text-blue-600 bg-blue-100'
                                            }`}>
                                            {rec.priority.toUpperCase()}
                                        </span>
                                        <h5 className="font-semibold text-gray-900">{rec.title}</h5>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-2">{rec.description}</p>
                                    <p className="text-sm text-blue-600 font-medium">{rec.action}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PasswordManagement;
