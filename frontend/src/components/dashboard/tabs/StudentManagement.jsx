import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StudentRegistration from './StudentRegistration';
import DocumentsUpload from './DocumentsUpload';
import StudentApplication from './StudentApplication';

const StudentManagement = ({ onStudentUpdate }) => {
    const [activeSubTab, setActiveSubTab] = useState('registration');

    const subTabs = [
        {
            id: 'registration',
            name: 'Student Registration',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            )
        },
        {
            id: 'documents',
            name: 'Documents Upload',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            id: 'application',
            name: 'Student Application',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        }
    ];

    const renderSubTabContent = () => {
        switch (activeSubTab) {
            case 'registration':
                return <StudentRegistration onStudentUpdate={onStudentUpdate} />;
            case 'documents':
                return <DocumentsUpload onStudentUpdate={onStudentUpdate} />;
            case 'application':
                return <StudentApplication onStudentUpdate={onStudentUpdate} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Sub-tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {subTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeSubTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Sub-tab Content */}
            <motion.div
                key={activeSubTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {renderSubTabContent()}
            </motion.div>
        </div>
    );
};

export default StudentManagement;
