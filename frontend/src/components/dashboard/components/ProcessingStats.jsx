import React from 'react';
import { motion } from 'framer-motion';

const ProcessingStats = ({ data, onStatClick, activeFilter = 'all' }) => {
    // Safely extract data with defaults to prevent errors
    const {
        totalStudents = 0,
        pendingVerification = 0,
        approvedInSession = 0,
        rejectedInSession = 0,
        draftInSession = 0,
        submittedInSession = 0,
        underReviewInSession = 0,
        session = 'Current'
    } = data || {};

    // Debug logging
    console.log('ProcessingStats received data:', data);

    // Ensure all values are numbers
    const total = Number(totalStudents) || 0;
    const pending = Number(pendingVerification) || 0;
    const approved = Number(approvedInSession) || 0;
    const rejected = Number(rejectedInSession) || 0;
    const draft = Number(draftInSession) || 0;
    const submitted = Number(submittedInSession) || 0;
    const underReview = Number(underReviewInSession) || 0;

    const stats = [
        {
            title: 'Total Students',
            value: total,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
            ),
            color: 'blue',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            iconBg: 'bg-blue-100',
            filterKey: 'all' // Total shows all students
        },
        {
            title: 'Draft',
            value: draft,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            ),
            color: 'gray',
            bgColor: 'bg-gray-50',
            textColor: 'text-gray-600',
            iconBg: 'bg-gray-100',
            filterKey: 'DRAFT'
        },
        {
            title: 'Submitted',
            value: submitted,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'blue',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            iconBg: 'bg-blue-100',
            filterKey: 'SUBMITTED'
        },
        {
            title: 'Under Review',
            value: underReview,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'yellow',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600',
            iconBg: 'bg-yellow-100',
            filterKey: 'UNDER_REVIEW'
        },
        {
            title: 'Approved',
            value: approved,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'green',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            iconBg: 'bg-green-100',
            filterKey: 'APPROVED'
        },
        {
            title: 'Rejected',
            value: rejected,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'red',
            bgColor: 'bg-red-50',
            textColor: 'text-red-600',
            iconBg: 'bg-red-100',
            filterKey: 'REJECTED'
        }
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Processing Statistics</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">Session: {session || 'Current'}</span>
            </div>

            {/* No Data Message for Session */}
            {total === 0 && pending === 0 && approved === 0 && rejected === 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
                    <div className="flex items-center">
                        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                                No admissions found for {session || 'this'} session
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                Select a different academic session to view statistics.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`${stat.bgColor} dark:bg-gray-700 rounded-lg p-4 ${onStatClick && stat.filterKey ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${activeFilter === stat.filterKey
                                ? stat.color === 'blue' ? 'ring-2 ring-blue-500 ring-offset-2' :
                                    stat.color === 'green' ? 'ring-2 ring-green-500 ring-offset-2' :
                                        stat.color === 'yellow' ? 'ring-2 ring-yellow-500 ring-offset-2' :
                                            stat.color === 'red' ? 'ring-2 ring-red-500 ring-offset-2' :
                                                stat.color === 'gray' ? 'ring-2 ring-gray-500 ring-offset-2' : 'ring-2 ring-blue-500 ring-offset-2'
                                : ''
                            }`}
                        onClick={() => onStatClick && stat.filterKey && onStatClick(stat.filterKey)}
                    >
                        <div className="flex items-center">
                            <div className={`p-3 ${stat.iconBg} dark:bg-gray-600 rounded-full`}>
                                <div className={stat.textColor}>
                                    {stat.icon}
                                </div>
                            </div>
                            <div className="ml-4 flex-1">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</p>
                                <p className={`text-2xl font-semibold ${stat.textColor}`}>{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ProcessingStats;
