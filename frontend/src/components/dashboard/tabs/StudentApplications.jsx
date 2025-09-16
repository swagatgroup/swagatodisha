import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';
import { showSuccess, showError, showConfirm } from '../../../utils/sweetAlert';
import EnhancedStudentApplicationForm from '../../forms/EnhancedStudentApplicationForm';

const StudentApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);
    const [newApplication, setNewApplication] = useState({
        course: '',
        institution: '',
        preferredStartDate: '',
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfBlobUrl, setPdfBlobUrl] = useState('');

    const courses = [
        'DMLT (Diploma in Medical Laboratory Technology)',
        'BMLT (Bachelor in Medical Laboratory Technology)',
        'D.Pharm (Diploma in Pharmacy)',
        'B.Pharm (Bachelor in Pharmacy)',
        'GNM (General Nursing and Midwifery)',
        'ANM (Auxiliary Nursing and Midwifery)',
        'B.Sc Nursing',
        'BPT (Bachelor of Physiotherapy)',
        'D.Pharm (Diploma in Pharmacy)',
        'BDS (Bachelor of Dental Surgery)'
    ];

    const institutions = [
        'Swagat Group of Institutions - Main Campus',
        'Swagat Medical College',
        'Swagat Pharmacy College',
        'Swagat Nursing College',
        'Swagat Physiotherapy College'
    ];

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/students/applications');
            const list = response.data.data?.applications ?? response.data.data ?? [];
            setApplications(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error('Error fetching applications:', error);
            showError('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const openApplicationPdf = async (applicationId) => {
        try {
            const response = await api.get(`/api/students/applications/${applicationId}/pdf`, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfBlobUrl(url);
            setShowPdfModal(true);
        } catch (error) {
            console.error('Error generating PDF:', error);
            showError('Failed to load application PDF');
        }
    };

    const downloadApplicationPdf = () => {
        if (!pdfBlobUrl) return;
        const link = document.createElement('a');
        link.href = pdfBlobUrl;
        link.download = 'application.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleNewApplication = async () => {
        try {
            setSubmitting(true);
            await api.post('/api/students/applications', newApplication);
            showSuccess('Application submitted successfully!');
            setShowNewApplicationModal(false);
            setNewApplication({
                course: '',
                institution: '',
                preferredStartDate: '',
                notes: ''
            });
            fetchApplications();
        } catch (error) {
            console.error('Error submitting application:', error);
            showError('Failed to submit application');
        } finally {
            setSubmitting(false);
        }
    };

    const handleWithdrawApplication = async (applicationId) => {
        const confirmed = await showConfirm(
            'Withdraw Application',
            'Are you sure you want to withdraw this application? This action cannot be undone.'
        );

        if (confirmed) {
            try {
                await api.delete(`/api/students/applications/${applicationId}`);
                showSuccess('Application withdrawn successfully');
                fetchApplications();
            } catch (error) {
                console.error('Error withdrawing application:', error);
                showError('Failed to withdraw application');
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'under_review': return 'bg-blue-100 text-blue-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'withdrawn': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'under_review': return '👀';
            case 'approved': return '✅';
            case 'rejected': return '❌';
            case 'withdrawn': return '🚫';
            default: return '❓';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
                        <p className="text-gray-600">Track and manage your course applications</p>
                    </div>
                    <button
                        onClick={() => setShowNewApplicationModal(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>New Application</span>
                    </button>
                </div>
            </motion.div>

            {/* Applications List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow"
            >
                {applications.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {applications.map((application, index) => (
                            <motion.div
                                key={application._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 hover:bg-gray-50"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {application.course}
                                            </h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                                <span className="mr-1">{getStatusIcon(application.status)}</span>
                                                {application.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-2">{application.institution}</p>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span>Applied: {new Date(application.applicationDate).toLocaleDateString()}</span>
                                            {application.preferredStartDate && (
                                                <span>Preferred Start: {new Date(application.preferredStartDate).toLocaleDateString()}</span>
                                            )}
                                            <span>Application ID: {application.applicationId}</span>
                                        </div>
                                        {application.notes && (
                                            <p className="text-sm text-gray-600 mt-2 italic">"{application.notes}"</p>
                                        )}
                                        {application.reviewNotes && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                <p className="text-sm font-medium text-blue-900">Review Notes:</p>
                                                <p className="text-sm text-blue-800">{application.reviewNotes}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {application.status === 'pending' && (
                                            <button
                                                onClick={() => handleWithdrawApplication(application._id)}
                                                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                                            >
                                                Withdraw
                                            </button>
                                        )}
                                        <button onClick={() => openApplicationPdf(application._id)} className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                                            View PDF
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                        <p className="text-gray-500 mb-6">Get started by creating your first application.</p>
                        <button
                            onClick={() => setShowNewApplicationModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                        >
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            New Application
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Enhanced Application Form Modal */}
            {showNewApplicationModal && (
                <EnhancedStudentApplicationForm
                    onClose={() => setShowNewApplicationModal(false)}
                    onSuccess={(data) => {
                        setShowNewApplicationModal(false);
                        fetchApplications();
                        showSuccess('Application submitted successfully!');
                    }}
                />
            )}

            {showPdfModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Application PDF</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={downloadApplicationPdf} className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700">Download</button>
                                <button onClick={() => { URL.revokeObjectURL(pdfBlobUrl); setShowPdfModal(false); setPdfBlobUrl(''); }} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50">Close</button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            {pdfBlobUrl ? (
                                <iframe title="Application PDF" src={pdfBlobUrl} className="w-full h-full" />
                            ) : (
                                <div className="p-6 text-center text-gray-500">No PDF to display</div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default StudentApplications;
