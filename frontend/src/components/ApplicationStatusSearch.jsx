import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const ApplicationStatusSearch = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await api.get(`/api/students/public/status?query=${encodeURIComponent(query.trim())}`);
            if (response.data.success) {
                setResult(response.data.data);
            } else {
                setError(response.data.message || 'No application found.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching application status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to determine the active step based on status
    const getActiveStep = (status) => {
        switch (status) {
            case 'DRAFT': return 0;
            case 'SUBMITTED': return 1;
            case 'UNDER_REVIEW': return 2;
            case 'APPROVED': return 3;
            case 'COMPLETE': return 4;
            case 'REJECTED': return -1;
            case 'CANCELLED': return -1;
            default: return 0;
        }
    };

    const renderStepper = (status) => {
        const activeStep = getActiveStep(status);
        
        if (status === 'REJECTED' || status === 'CANCELLED') {
            return (
                <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fa-solid fa-xmark text-3xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-red-700">Application {status === 'REJECTED' ? 'Rejected' : 'Cancelled'}</h3>
                    <p className="text-red-600 mt-2">Please contact our administration office for further details.</p>
                </div>
            );
        }

        const steps = [
            { label: 'Draft', icon: 'fa-pen-to-square' },
            { label: 'Submitted', icon: 'fa-paper-plane' },
            { label: 'Under Review', icon: 'fa-magnifying-glass' },
            { label: 'Approved', icon: 'fa-check-circle' },
            { label: 'Complete', icon: 'fa-graduation-cap' }
        ];

        return (
            <div className="mt-10 relative">
                <div className="overflow-hidden">
                    <div className="flex justify-between relative z-10">
                        {steps.map((step, index) => {
                            const isCompleted = index <= activeStep;
                            const isCurrent = index === activeStep;
                            
                            return (
                                <div key={index} className="flex flex-col items-center w-1/5 relative">
                                    {/* Connecting Line */}
                                    {index < steps.length - 1 && (
                                        <div className={`absolute top-6 left-1/2 w-full h-1 -z-10 ${index < activeStep ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                    )}
                                    
                                    {/* Step Circle */}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-md transition-all duration-300
                                        ${isCompleted ? 'bg-gradient-to-r from-green-400 to-green-600 text-white transform scale-110' : 'bg-white text-gray-400 border-2 border-gray-200'}
                                        ${isCurrent ? 'ring-4 ring-green-100' : ''}
                                    `}>
                                        <i className={`fa-solid ${step.icon}`}></i>
                                    </div>
                                    
                                    {/* Step Label */}
                                    <p className={`mt-3 text-xs md:text-sm font-semibold text-center ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                        {step.label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-12 px-4 sm:px-6 relative z-10">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 overflow-hidden">
                <div className="px-8 py-10 md:p-12">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl mb-4 shadow-inner">
                            <i className="fa-solid fa-search-location text-2xl text-indigo-600"></i>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Track Your Application</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">
                            Enter your Application ID, Mobile Number, or Aadhar Number to securely check the real-time status of your admission process.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
                        <div className="relative flex items-center shadow-sm rounded-2xl bg-white focus-within:shadow-md transition-all">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <i className="fa-solid fa-id-card text-gray-400"></i>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-32 py-4 bg-transparent border-2 border-gray-100 rounded-2xl text-gray-900 focus:ring-0 focus:border-indigo-400 transition-all duration-300 outline-none text-lg"
                                placeholder="Application ID, Mobile, or Aadhar..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading || !query.trim()}
                                className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-6 rounded-xl hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-70 flex items-center"
                            >
                                {loading ? (
                                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                ) : (
                                    <i className="fa-solid fa-arrow-right mr-2"></i>
                                )}
                                <span className="hidden sm:inline">Track</span>
                            </button>
                        </div>
                    </form>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="max-w-2xl mx-auto mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg"
                            >
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <i className="fa-solid fa-circle-exclamation text-red-500"></i>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700 font-medium">{error}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {result && !error && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-10 border-t border-gray-100 pt-8"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 rounded-2xl p-6 mb-2 border border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Application ID</p>
                                        <p className="text-2xl font-bold text-gray-900">{result.applicationId}</p>
                                    </div>
                                    <div className="mt-4 md:mt-0 md:text-right">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Course Applied</p>
                                        <p className="text-lg font-semibold text-indigo-700">{result.course}</p>
                                    </div>
                                </div>
                                
                                {renderStepper(result.status)}
                                
                                <div className="mt-12 text-center text-xs text-gray-400 flex items-center justify-center">
                                    <i className="fa-solid fa-shield-halved mr-2"></i>
                                    Status metadata securely updated on {new Date(result.updatedAt).toLocaleDateString()}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ApplicationStatusSearch;
