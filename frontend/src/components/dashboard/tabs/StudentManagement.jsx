import { useState } from 'react';
import { motion } from 'framer-motion';
import UniversalStudentRegistration from '../../shared/UniversalStudentRegistration';
import DocumentsUpload from './DocumentsUpload';
import StudentApplication from './StudentApplication';
import SimpleFileTest from '../../forms/SimpleFileTest';
import BasicFileTest from '../../forms/BasicFileTest';
import LabelFileTest from '../../forms/LabelFileTest';
import AuthDebug from '../../debug/AuthDebug';
import LoginTest from '../../debug/LoginTest';

const StudentManagement = ({ onStudentUpdate }) => {
    const [activeSubTab, setActiveSubTab] = useState('registration');

    const subTabs = [
        {
            id: 'registration', name: 'Registration', icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            )
        },
        {
            id: 'documents', name: 'Documents', icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            id: 'application', name: 'Application PDF', icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 'file-test', name: 'File Test', icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 'basic-file-test', name: 'Basic File Test', icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
            )
        },
        {
            id: 'label-file-test', name: 'Label File Test', icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
            )
        },
        {
            id: 'auth-debug', name: 'Auth Debug', icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            )
        },
        {
            id: 'login-test', name: 'Login Test', icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
            )
        },
    ];

    const renderSubTabContent = () => {
        switch (activeSubTab) {
            case 'registration':
                return <UniversalStudentRegistration onStudentUpdate={onStudentUpdate} userRole="staff" showTitle={false} />;
            case 'documents':
                return <DocumentsUpload onStudentUpdate={onStudentUpdate} />;
            case 'application':
                return <StudentApplication onStudentUpdate={onStudentUpdate} />;
            case 'file-test':
                return <SimpleFileTest />;
            case 'basic-file-test':
                return <BasicFileTest />;
            case 'label-file-test':
                return <LabelFileTest />;
            case 'auth-debug':
                return <AuthDebug />;
            case 'login-test':
                return <LoginTest />;
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
