import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const AllRecentPaymentsModal = ({ isOpen, onClose }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;

    const fetchPayments = async (pageNum) => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/students/recent-payments?page=${pageNum}&limit=${limit}`);
            if (res.data?.success) {
                setPayments(res.data.data || []);
                if (res.data.pagination) {
                    setTotalPages(res.data.pagination.pages || 1);
                }
            }
        } catch (error) {
            console.error('Error fetching recent payments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setPage(1);
            fetchPayments(1);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <i className="fa-solid fa-money-check-dollar text-purple-600 dark:text-purple-400"></i>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">All Recent Payments</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <i className="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>

                    {/* Content (Fully Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-800">
                        {loading && payments.length === 0 ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                            </div>
                        ) : payments.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                                    <i className="fa-solid fa-receipt text-2xl text-gray-400"></i>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Payments Found</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">There are no recent payment records to display.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {payments.map((item, idx) => {
                                    const inst = item.installment || {};
                                    const statusColor = inst.status === 'VERIFIED' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 
                                                      inst.status === 'REJECTED' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 
                                                      'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
                                    
                                    const amountFormatted = (inst.amount || 0).toLocaleString('en-IN', {
                                        style: 'currency',
                                        currency: 'INR',
                                        maximumFractionDigits: 0
                                    });

                                    return (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-md transition-all bg-white dark:bg-gray-800/50 group">
                                            <div className="flex items-start sm:items-center space-x-4">
                                                <div className="hidden sm:flex h-12 w-12 rounded-full bg-purple-50 dark:bg-purple-900/20 items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                    <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">
                                                        {(item.studentName || 'U').charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{item.studentName || 'Unknown Student'}</h3>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <i className="fa-solid fa-hashtag text-xs"></i> {item.applicationId}
                                                        </span>
                                                        <span className="hidden sm:inline">•</span>
                                                        <span className="flex items-center gap-1">
                                                            <i className="fa-solid fa-layer-group text-xs"></i> Installment #{inst.installmentNumber}
                                                        </span>
                                                        <span className="hidden sm:inline">•</span>
                                                        <span className="flex items-center gap-1">
                                                            <i className="fa-regular fa-calendar text-xs"></i> 
                                                            {inst.date ? new Date(inst.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 sm:mt-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                                                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{amountFormatted}</div>
                                                <div className={`mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wider ${statusColor}`}>
                                                    {inst.status}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        
                        {loading && payments.length > 0 && (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                            </div>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing page <span className="font-medium text-gray-900 dark:text-gray-100">{page}</span> of <span className="font-medium text-gray-900 dark:text-gray-100">{totalPages}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => {
                                        const newPage = Math.max(1, page - 1);
                                        setPage(newPage);
                                        fetchPayments(newPage);
                                    }}
                                    disabled={page === 1 || loading}
                                    className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => {
                                        const newPage = Math.min(totalPages, page + 1);
                                        setPage(newPage);
                                        fetchPayments(newPage);
                                    }}
                                    disabled={page === totalPages || loading}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AllRecentPaymentsModal;
