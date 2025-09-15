import React from 'react';
import { motion } from 'framer-motion';

const ProcessingStats = ({ data }) => {
    const { totalStudents, pendingVerification, approvedToday, rejectedToday, averageProcessingTime } = data;

    const stats = [
        {
            title: 'Total Students',
            value: totalStudents,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
            ),
            color: 'blue',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            iconBg: 'bg-blue-100'
        },
        {
            title: 'Pending Verification',
            value: pendingVerification,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'yellow',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600',
            iconBg: 'bg-yellow-100'
        },
        {
            title: 'Approved Today',
            value: approvedToday,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'green',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            iconBg: 'bg-green-100'
        },
        {
            title: 'Rejected Today',
            value: rejectedToday,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'red',
            bgColor: 'bg-red-50',
            textColor: 'text-red-600',
            iconBg: 'bg-red-100'
        }
    ];

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Processing Statistics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`${stat.bgColor} rounded-lg p-4`}
                    >
                        <div className="flex items-center">
                            <div className={`p-3 ${stat.iconBg} rounded-full`}>
                                <div className={stat.textColor}>
                                    {stat.icon}
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <p className={`text-2xl font-semibold ${stat.textColor}`}>{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Average Processing Time */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 rounded-lg p-4"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-md font-medium text-gray-900">Average Processing Time</h4>
                        <p className="text-sm text-gray-600">Time taken to process student applications</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                            {averageProcessingTime}h
                        </div>
                        <div className="text-sm text-gray-500">
                            {averageProcessingTime < 24 ? 'Excellent' : averageProcessingTime < 48 ? 'Good' : 'Needs Improvement'}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                            className={`h-2 rounded-full ${averageProcessingTime < 24 ? 'bg-green-500' :
                                    averageProcessingTime < 48 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((averageProcessingTime / 72) * 100, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0h</span>
                        <span>24h (Target)</span>
                        <span>48h</span>
                        <span>72h+</span>
                    </div>
                </div>
            </motion.div>

            {/* Performance Indicators */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                        {totalStudents > 0 ? Math.round((approvedToday / totalStudents) * 100) : 0}%
                    </div>
                    <div className="text-sm text-blue-800">Approval Rate</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                        {pendingVerification > 0 ? Math.round((approvedToday / (approvedToday + rejectedToday)) * 100) : 0}%
                    </div>
                    <div className="text-sm text-green-800">Success Rate</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                        {totalStudents > 0 ? Math.round((pendingVerification / totalStudents) * 100) : 0}%
                    </div>
                    <div className="text-sm text-purple-800">Pending Rate</div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProcessingStats;
