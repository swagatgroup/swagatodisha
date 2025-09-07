import React from 'react';
import { motion } from 'framer-motion';

const PasswordStrengthIndicator = ({ password }) => {
    const calculateStrength = (password) => {
        let score = 0;
        const requirements = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[@$!%*?&]/.test(password)
        };

        // Count met requirements
        Object.values(requirements).forEach(met => {
            if (met) score += 1;
        });

        let strength = 'Weak';
        let color = 'bg-red-500';
        let width = '20%';

        if (score >= 5) {
            strength = 'Strong';
            color = 'bg-green-500';
            width = '100%';
        } else if (score >= 4) {
            strength = 'Good';
            color = 'bg-yellow-500';
            width = '75%';
        } else if (score >= 3) {
            strength = 'Fair';
            color = 'bg-orange-500';
            width = '50%';
        } else if (score >= 2) {
            strength = 'Weak';
            color = 'bg-red-500';
            width = '25%';
        }

        return {
            score,
            strength,
            color,
            width,
            requirements
        };
    };

    if (!password) return null;

    const { strength, color, width, requirements } = calculateStrength(password);

    return (
        <div className="mt-2">
            {/* Strength Bar */}
            <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs text-gray-600">Password Strength:</span>
                <span className={`text-xs font-medium ${strength === 'Strong' ? 'text-green-600' :
                        strength === 'Good' ? 'text-yellow-600' :
                            strength === 'Fair' ? 'text-orange-600' :
                                'text-red-600'
                    }`}>
                    {strength}
                </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <motion.div
                    className={`h-2 rounded-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Requirements Checklist */}
            <div className="text-xs space-y-1">
                <div className={`flex items-center ${requirements.length ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="mr-2">{requirements.length ? '✓' : '✗'}</span>
                    At least 8 characters
                </div>
                <div className={`flex items-center ${requirements.lowercase ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="mr-2">{requirements.lowercase ? '✓' : '✗'}</span>
                    One lowercase letter
                </div>
                <div className={`flex items-center ${requirements.uppercase ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="mr-2">{requirements.uppercase ? '✓' : '✗'}</span>
                    One uppercase letter
                </div>
                <div className={`flex items-center ${requirements.number ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="mr-2">{requirements.number ? '✓' : '✗'}</span>
                    One number
                </div>
                <div className={`flex items-center ${requirements.special ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="mr-2">{requirements.special ? '✓' : '✗'}</span>
                    One special character (@$!%*?&)
                </div>
            </div>
        </div>
    );
};

export default PasswordStrengthIndicator;
