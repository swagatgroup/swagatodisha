import React from 'react';
import { motion } from 'framer-motion';

const CommissionPanel = ({ data }) => {
    const { totalCommission, advance, due, recentPayments } = data;

    const progressPercentage = totalCommission > 0 ? (advance / totalCommission) * 100 : 0;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Commission Status</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Total Commission */}
                <div className="text-center">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(totalCommission)}
                        </div>
                        <div className="text-sm text-blue-800 mt-1">Total Commission</div>
                    </div>
                </div>

                {/* Advance Received */}
                <div className="text-center">
                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(advance)}
                        </div>
                        <div className="text-sm text-green-800 mt-1">Advance Received</div>
                    </div>
                </div>

                {/* Due Amount */}
                <div className="text-center">
                    <div className="bg-orange-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-orange-600">
                            {formatCurrency(due)}
                        </div>
                        <div className="text-sm text-orange-800 mt-1">Due Amount</div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Advance vs Total</span>
                    <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
            </div>

            {/* Recent Payments */}
            {recentPayments && recentPayments.length > 0 && (
                <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Recent Payments</h4>
                    <div className="space-y-3">
                        {recentPayments.slice(0, 3).map((payment, index) => (
                            <motion.div
                                key={payment._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {payment.description || 'Commission Payment'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(payment.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm font-semibold text-green-600">
                                    +{formatCurrency(payment.amount)}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {recentPayments.length > 3 && (
                        <div className="mt-4 text-center">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                View All Payments →
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex space-x-4">
                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                        Request Payment
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommissionPanel;
