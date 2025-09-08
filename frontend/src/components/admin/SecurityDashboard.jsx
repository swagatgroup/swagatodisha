import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import {
    showSuccess,
    showError,
    showLoading,
    closeLoading,
    handleApiError
} from '../../utils/sweetAlert';

const SecurityDashboard = () => {
    const [securityReport, setSecurityReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [fixingPasswords, setFixingPasswords] = useState(false);

    useEffect(() => {
        fetchSecurityReport();
    }, []);

    const fetchSecurityReport = async () => {
        try {
            setLoading(true);
            showLoading('Loading security report...');
            const response = await api.get('/api/security/audit');
            setSecurityReport(response.data.data);
            closeLoading();
        } catch (error) {
            console.error('Error fetching security report:', error);
            closeLoading();
            handleApiError(error, 'Failed to fetch security report');
        } finally {
            setLoading(false);
        }
    };

    const handleFixPasswords = async () => {
        try {
            setFixingPasswords(true);
            showLoading('Fixing password issues...');
            const response = await api.post('/api/security/fix-passwords');

            closeLoading();
            showSuccess(response.data.message);

            // Refresh the security report
            await fetchSecurityReport();
        } catch (error) {
            console.error('Error fixing passwords:', error);
            closeLoading();
            handleApiError(error, 'Failed to fix weak passwords');
        } finally {
            setFixingPasswords(false);
        }
    };

    const getSecurityScoreColor = (score) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getSecurityScoreBg = (score) => {
        if (score >= 90) return 'bg-green-100';
        if (score >= 70) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'CRITICAL': return 'text-red-600 bg-red-100';
            case 'HIGH': return 'text-orange-600 bg-orange-100';
            case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
            case 'LOW': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!securityReport) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">Failed to load security report</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Security Dashboard</h2>
                        <p className="text-gray-600">Monitor and manage system security</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={fetchSecurityReport}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Refresh Report
                        </button>
                        <button
                            onClick={handleFixPasswords}
                            disabled={fixingPasswords}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {fixingPasswords ? 'Fixing...' : 'Fix Weak Passwords'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Security Score */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Overall Security Score</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSecurityScoreBg(securityReport.securityScore)} ${getSecurityScoreColor(securityReport.securityScore)}`}>
                        {securityReport.securityScore}/100
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all duration-500 ${securityReport.securityScore >= 90 ? 'bg-green-500' :
                            securityReport.securityScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                        style={{ width: `${securityReport.securityScore}%` }}
                    ></div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'passwords', label: 'Passwords' },
                            { id: 'jwt', label: 'JWT Security' },
                            { id: 'database', label: 'Database' },
                            { id: 'files', label: 'File Uploads' },
                            { id: 'recommendations', label: 'Recommendations' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Password Security</h4>
                                <p className="text-2xl font-bold text-red-600">
                                    {securityReport.audits.passwords.weakPasswords}
                                </p>
                                <p className="text-sm text-gray-600">Weak passwords detected</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">JWT Security</h4>
                                <p className="text-2xl font-bold text-green-600">
                                    {securityReport.audits.jwt.isStrongSecret ? '✓' : '✗'}
                                </p>
                                <p className="text-sm text-gray-600">Strong secret configured</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Database Security</h4>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {securityReport.audits.database.hasIndexes ? '✓' : '✗'}
                                </p>
                                <p className="text-sm text-gray-600">Indexes configured</p>
                            </div>
                        </div>
                    )}

                    {/* Passwords Tab */}
                    {activeTab === 'passwords' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-gray-900">Password Security Audit</h4>
                                <span className="text-sm text-gray-600">
                                    {securityReport.audits.passwords.totalUsers} total users
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h5 className="font-semibold text-red-800">Weak Passwords</h5>
                                    <p className="text-2xl font-bold text-red-600">
                                        {securityReport.audits.passwords.weakPasswords}
                                    </p>
                                </div>
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <h5 className="font-semibold text-orange-800">Duplicate Passwords</h5>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {securityReport.audits.passwords.duplicatePasswords}
                                    </p>
                                </div>
                            </div>

                            {securityReport.audits.passwords.weakPasswordDetails.length > 0 && (
                                <div>
                                    <h5 className="font-semibold text-gray-900 mb-3">Users with Weak Passwords</h5>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Email
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Role
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Issue
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {securityReport.audits.passwords.weakPasswordDetails.map((user, index) => (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {user.email}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {user.role}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                                            {user.reason}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* JWT Tab */}
                    {activeTab === 'jwt' && (
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900">JWT Security Configuration</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="font-semibold text-gray-900">Secret Configured</h5>
                                    <p className={`text-lg font-bold ${securityReport.audits.jwt.secretConfigured ? 'text-green-600' : 'text-red-600'}`}>
                                        {securityReport.audits.jwt.secretConfigured ? 'Yes' : 'No'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="font-semibold text-gray-900">Secret Length</h5>
                                    <p className="text-lg font-bold text-gray-600">
                                        {securityReport.audits.jwt.secretLength} characters
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="font-semibold text-gray-900">Strong Secret</h5>
                                    <p className={`text-lg font-bold ${securityReport.audits.jwt.isStrongSecret ? 'text-green-600' : 'text-red-600'}`}>
                                        {securityReport.audits.jwt.isStrongSecret ? 'Yes' : 'No'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Database Tab */}
                    {activeTab === 'database' && (
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900">Database Security</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="font-semibold text-gray-900">Total Users</h5>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {securityReport.audits.database.userCount}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="font-semibold text-gray-900">Total Admins</h5>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {securityReport.audits.database.adminCount}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="font-semibold text-gray-900">Indexes Configured</h5>
                                    <p className={`text-lg font-bold ${securityReport.audits.database.hasIndexes ? 'text-green-600' : 'text-red-600'}`}>
                                        {securityReport.audits.database.hasIndexes ? 'Yes' : 'No'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="font-semibold text-gray-900">Encrypted Connection</h5>
                                    <p className={`text-lg font-bold ${securityReport.audits.database.connectionEncrypted ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {securityReport.audits.database.connectionEncrypted ? 'Yes' : 'Development'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Files Tab */}
                    {activeTab === 'files' && (
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900">File Upload Security</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="font-semibold text-gray-900">Allowed MIME Types</h5>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {securityReport.audits.fileUploads.allowedMimeTypes.length}
                                    </p>
                                    <div className="mt-2">
                                        {securityReport.audits.fileUploads.allowedMimeTypes.map((type, index) => (
                                            <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="font-semibold text-gray-900">Max File Size</h5>
                                    <p className="text-2xl font-bold text-green-600">
                                        {securityReport.audits.fileUploads.maxFileSize}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="font-semibold text-gray-900">File Validation</h5>
                                    <p className={`text-lg font-bold ${securityReport.audits.fileUploads.fileValidationEnabled ? 'text-green-600' : 'text-red-600'}`}>
                                        {securityReport.audits.fileUploads.fileValidationEnabled ? 'Enabled' : 'Disabled'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="font-semibold text-gray-900">Virus Scanning</h5>
                                    <p className={`text-lg font-bold ${securityReport.audits.fileUploads.virusScanningEnabled ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {securityReport.audits.fileUploads.virusScanningEnabled ? 'Enabled' : 'Not Implemented'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recommendations Tab */}
                    {activeTab === 'recommendations' && (
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900">Security Recommendations</h4>
                            {securityReport.recommendations.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-green-600 text-6xl mb-4">✓</div>
                                    <p className="text-lg font-semibold text-gray-900">All security checks passed!</p>
                                    <p className="text-gray-600">No recommendations at this time.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {securityReport.recommendations.map((rec, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-white border border-gray-200 rounded-lg p-4"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                                                            {rec.priority}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-900">{rec.category}</span>
                                                    </div>
                                                    <h5 className="font-semibold text-gray-900 mb-1">{rec.issue}</h5>
                                                    <p className="text-gray-600">{rec.recommendation}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SecurityDashboard;
