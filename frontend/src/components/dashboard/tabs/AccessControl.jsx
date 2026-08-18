import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';
import { showSuccess, showError } from '../../../utils/sweetAlert';

const AccessControl = () => {
    const [settings, setSettings] = useState({
        allowRegistration: true,
        showReferralRewardTier: true,
        referralRewardWhitelist: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [whitelistInput, setWhitelistInput] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/admin/website-settings');
            if (response.data.success && response.data.data) {
                const sysSettings = response.data.data.systemSettings || {};
                setSettings({
                    allowRegistration: sysSettings.allowRegistration !== false,
                    showReferralRewardTier: sysSettings.showReferralRewardTier !== false,
                    referralRewardWhitelist: sysSettings.referralRewardWhitelist || []
                });
                setWhitelistInput((sysSettings.referralRewardWhitelist || []).join(', '));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            showError('Failed to load access control settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            // Process the whitelist input into an array of strings
            const parsedWhitelist = whitelistInput
                .split(',')
                .map(item => item.trim())
                .filter(item => item !== '');

            // The update endpoint expects the entire settings object or a partial object
            // based on how the backend merges it. We'll send the systemSettings object.
            const payload = {
                systemSettings: {
                    allowRegistration: settings.allowRegistration,
                    showReferralRewardTier: settings.showReferralRewardTier,
                    referralRewardWhitelist: parsedWhitelist
                }
            };

            const response = await api.put('/api/admin/website-settings', payload);
            if (response.data.success) {
                showSuccess('Access Control settings updated successfully!');
                setSettings({
                    ...settings,
                    referralRewardWhitelist: parsedWhitelist
                });
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            showError('Failed to update access control settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Access Control</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage global platform availability and feature visibility
                    </p>
                </div>

                <div className="p-6 space-y-8">
                    {/* Registration Control */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                            New Registration
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Accept New Registrations</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mt-1">
                                    When disabled, users will not be able to register. A message will be displayed stating that admissions are currently closed. This applies globally.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.allowRegistration}
                                    onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Referral Rewards Control */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mt-8">
                            Referral Rewards
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Show Referral Benefits Tier</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mt-1">
                                    When enabled, the "Referral Benefits Tier" (prize money) section will be visible on everyone's dashboard. When disabled, it will be hidden globally (except for whitelisted users below).
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.showReferralRewardTier}
                                    onChange={(e) => setSettings({ ...settings, showReferralRewardTier: e.target.checked })}
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        {!settings.showReferralRewardTier && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }} 
                                className="pt-4"
                            >
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Whitelist (Emails or Phone Numbers)
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    Even if hidden above, the following users will STILL see the Referral Benefits Tier. Separate multiple entries with commas.
                                </p>
                                <textarea
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    rows="3"
                                    placeholder="agent@example.com, +919876543210"
                                    value={whitelistInput}
                                    onChange={(e) => setWhitelistInput(e.target.value)}
                                ></textarea>
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-colors ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        {saving ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </span>
                        ) : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessControl;
