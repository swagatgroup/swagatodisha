import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PasswordInput from './PasswordInput';

const PasswordInputDemo = () => {
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const handleChange = (name, value) => {
        setPasswords(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-8"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Password Input Component Demo
                        </h2>
                        <p className="text-gray-600">
                            Showcasing the password visibility toggle functionality
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Current Password */}
                        <PasswordInput
                            id="currentPassword"
                            name="currentPassword"
                            value={passwords.current}
                            onChange={(e) => handleChange('current', e.target.value)}
                            placeholder="Enter current password"
                            label="Current Password"
                            autoComplete="current-password"
                        />

                        {/* New Password */}
                        <PasswordInput
                            id="newPassword"
                            name="newPassword"
                            value={passwords.new}
                            onChange={(e) => handleChange('new', e.target.value)}
                            placeholder="Enter new password"
                            label="New Password"
                            autoComplete="new-password"
                        />

                        {/* Confirm Password */}
                        <PasswordInput
                            id="confirmPassword"
                            name="confirmPassword"
                            value={passwords.confirm}
                            onChange={(e) => handleChange('confirm', e.target.value)}
                            placeholder="Confirm new password"
                            label="Confirm Password"
                            autoComplete="new-password"
                        />

                        {/* Features Showcase */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-900 mb-2">✨ Features:</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Click the eye icon to toggle password visibility</li>
                                <li>• Smooth animations and transitions</li>
                                <li>• Accessible with proper ARIA labels</li>
                                <li>• Responsive design</li>
                                <li>• Customizable styling</li>
                                <li>• Support for different autocomplete values</li>
                            </ul>
                        </div>

                        {/* Usage Instructions */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h3 className="font-semibold text-green-900 mb-2">📖 Usage:</h3>
                            <div className="text-sm text-green-800">
                                <p className="mb-2">Import and use in any component:</p>
                                <code className="bg-green-100 px-2 py-1 rounded text-xs">
                                    {`import PasswordInput from './PasswordInput';`}
                                </code>
                                <p className="mt-2">Basic usage:</p>
                                <code className="bg-green-100 px-2 py-1 rounded text-xs">
                                    {`<PasswordInput
  id="password"
  name="password"
  value={password}
  onChange={handleChange}
  label="Password"
  placeholder="Enter password"
/>`}
                                </code>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PasswordInputDemo;
