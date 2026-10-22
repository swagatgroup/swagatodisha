import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine, RiMapPin2Line, RiBankCardLine, RiLoader4Line, RiArrowRightLine, RiErrorWarningLine, RiShieldKeyholeLine, RiPencilLine, RiSendPlaneLine, RiSearchLine, RiCheckLine, RiGraduationCapLine } from '@remixicon/react';
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
            default: return 0;
        }
    };

    const renderStepper = (status) => {
        const activeStep = getActiveStep(status);
        
        if (status === 'REJECTED') {
            return (
                <div className="mt-8 rounded-sw-md bg-sw-error-bg p-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-sw-pill bg-sw-white text-sw-error">
                        <RiCloseLine size={28} aria-hidden="true" />
                    </div>
                    <h3 className="text-sw-h3 font-bold text-sw-error">Application Rejected</h3>
                    <p className="mt-2 text-sw-body text-sw-error">Please contact our administration office for further details.</p>
                </div>
            );
        }

        const steps = [
            { label: 'Draft', icon: RiPencilLine },
            { label: 'Submitted', icon: RiSendPlaneLine },
            { label: 'Under Review', icon: RiSearchLine },
            { label: 'Approved', icon: RiCheckLine },
            { label: 'Complete', icon: RiGraduationCapLine }
        ];

        return (
            <div className="mt-10 relative">
                <div className="py-2 overflow-visible">
                    <div className="flex justify-between relative z-10">
                        {steps.map((step, index) => {
                            const isCompleted = index <= activeStep;
                            const isCurrent = index === activeStep;
                            
                            return (
                                <div key={index} className="flex flex-col items-center w-1/5 relative">
                                    {/* Connecting Line */}
                                    {index < steps.length - 1 && (
                                        <div className={`absolute left-1/2 top-6 -z-10 h-1 w-full ${index < activeStep ? 'bg-sw-black' : 'bg-sw-gray-200'}`}></div>
                                    )}
                                    
                                    {/* Step Circle */}
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-sw-pill transition-all duration-sw
                                        ${isCompleted ? 'bg-sw-black text-sw-white' : 'bg-sw-white text-sw-text-muted ring-2 ring-inset ring-sw-gray-200'}
                                        ${isCurrent ? 'ring-4 ring-sw-badge-blue' : ''}
                                    `}>
                                        <step.icon size={20} />
                                    </div>
                                    
                                    {/* Step Label */}
                                    <p className={`mt-3 text-center text-sw-caption font-semibold ${isCompleted ? 'text-sw-text' : 'text-sw-text-muted'}`}>
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
        <section aria-labelledby="track-title" className="w-full">
            <div className="rounded-sw-md bg-sw-white p-6 shadow-sw-soft ring-1 ring-sw-border-light md:p-10">
                <div className="mb-8 text-center">
                    <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-sw-pill bg-sw-black text-sw-white">
                        <RiMapPin2Line size={24} aria-hidden="true" />
                    </span>
                    <h2 id="track-title" className="mb-2 text-sw-h2 font-bold">Track Your Application</h2>
                    <p className="mx-auto max-w-xl text-sw-body text-sw-text-secondary">
                        Enter your Application ID, Mobile Number, or Aadhar Number to securely check the real-time status of your admission process.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="relative mx-auto max-w-2xl">
                    <label htmlFor="application-status-query" className="sr-only">Application ID, Mobile, or Aadhar</label>
                    <div className="relative flex items-center rounded-sw-sm bg-sw-white shadow-sw-input ring-1 ring-inset ring-sw-border-light focus-within:ring-2 focus-within:ring-sw-focus">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <RiBankCardLine className="text-sw-text-muted" aria-hidden="true" />
                        </div>
                        <input
                            id="application-status-query"
                            type="text"
                            className="block min-h-14 w-full rounded-sw-sm bg-transparent pl-11 pr-28 text-sw-body text-sw-text outline-none"
                            placeholder="Application ID, Mobile, or Aadhar..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="absolute bottom-1.5 right-1.5 top-1.5 flex items-center gap-2 rounded-sw-sm bg-sw-black px-4 font-semibold text-sw-white transition-colors duration-sw-fast hover:bg-sw-gray-800 disabled:opacity-60"
                        >
                            {loading ? (
                                <RiLoader4Line className="animate-spin" aria-hidden="true" />
                            ) : (
                                <RiArrowRightLine aria-hidden="true" />
                            )}
                            <span className="hidden sm:inline">Track</span>
                            <span className="sr-only sm:hidden">Track</span>
                        </button>
                    </div>
                </form>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            role="alert"
                            className="mx-auto mt-6 flex max-w-2xl items-center gap-3 rounded-sw-sm bg-sw-error-bg p-4"
                        >
                            <RiErrorWarningLine className="shrink-0 text-sw-error" aria-hidden="true" />
                            <p className="text-sw-small font-semibold text-sw-error">{error}</p>
                        </motion.div>
                    )}

                    {result && !error && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-10 border-t border-sw-border-light pt-8"
                        >
                            <div className="mb-2 flex flex-col items-start justify-between rounded-sw-sm bg-sw-surface-muted p-6 md:flex-row md:items-center">
                                <div>
                                    <p className="mb-1 text-sw-caption font-semibold uppercase tracking-wider text-sw-text-muted">Application ID</p>
                                    <p className="text-sw-h2 font-bold">{result.applicationId}</p>
                                </div>
                                <div className="mt-4 md:mt-0 md:text-right">
                                    <p className="mb-1 text-sw-caption font-semibold uppercase tracking-wider text-sw-text-muted">Course Applied</p>
                                    <p className="text-sw-label font-semibold">{result.course}</p>
                                </div>
                            </div>

                            {renderStepper(result.status)}

                            <div className="mt-12 flex items-center justify-center text-center text-sw-caption text-sw-text-muted">
                                <RiShieldKeyholeLine className="mr-2" aria-hidden="true" />
                                Status metadata securely updated on {new Date(result.updatedAt).toLocaleDateString()}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default ApplicationStatusSearch;
