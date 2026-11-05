import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { useSession } from '../../../contexts/SessionContext';
import { showError } from '../../../utils/sweetAlert';
import PaymentManageModal from '../components/PaymentManageModal';

const PaymentManagement = () => {
    const { selectedSession } = useSession();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 20;
    
    // Selection state
    const [selectedIds, setSelectedIds] = useState([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);

    // Refactored states for payments management
    const [activeStatus, setActiveStatus] = useState(null);
    const [paymentStats, setPaymentStats] = useState({ ALL: 0, PENDING: 0, PARTIAL: 0, OVERDUE: 0, COMPLETED: 0 });
    const [searchVal, setSearchVal] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Recent payments state
    const [recentPayments, setRecentPayments] = useState([]);
    const [recentPage, setRecentPage] = useState(1);
    const [recentTotalPages, setRecentTotalPages] = useState(1);
    const [recentLoading, setRecentLoading] = useState(false);
    const recentLimit = 10;

    // Debouncing effect (500ms inactivity pause)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchVal);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchVal]);

    useEffect(() => {
        if (selectedSession) {
            if (activeStatus === 'recent') {
                fetchRecentPayments(recentPage);
            } else if (activeStatus === null && debouncedSearch.trim()) {
                // If they search while activeStatus is null, auto-select 'all'
                setActiveStatus('all');
            } else if (activeStatus === null) {
                fetchApplications(true); // stats only on initial load
            } else {
                fetchApplications(false); // full load when tab selected
            }
        }
    }, [selectedSession, currentPage, activeStatus, debouncedSearch, recentPage]);

    const fetchRecentPayments = async (pageNum = 1) => {
        setRecentLoading(true);
        try {
            const res = await api.get(`/api/admin/students/recent-payments?page=${pageNum}&limit=${recentLimit}`);
            if (res.data?.success) {
                // recent-payments returns { studentName, applicationId, installment, studentId }
                // We need to enrich with full student data so Manage modal works.
                // Build a minimal app-like object from each recent payment entry.
                const enriched = (res.data.data || []).map(item => ({
                    _id: item.studentId || item._id,
                    applicationId: item.applicationId,
                    personalDetails: { fullName: item.studentName },
                    financialStatus: item.financialStatus || {
                        totalFees: item.installment?.amount || 0,
                        paidAmount: item.installment?.status === 'VERIFIED' ? (item.installment?.amount || 0) : 0,
                        dueAmount: 0,
                        paymentStatus: item.installment?.status === 'VERIFIED' ? 'PARTIAL' : 'PENDING',
                        installments: item.installment ? [item.installment] : [],
                        receiptUrl: item.installment?.receiptUrl || null,
                    },
                    _recentInstallment: item.installment,
                    _recentDate: item.installment?.date,
                }));
                setRecentPayments(enriched);
                if (res.data.pagination) {
                    setRecentTotalPages(res.data.pagination.pages || 1);
                }
            }
        } catch (err) {
            console.error('Error fetching recent payments:', err);
        } finally {
            setRecentLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchVal(e.target.value);
        setCurrentPage(1);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setDebouncedSearch(searchVal);
        setCurrentPage(1);
    };

    const fetchApplications = async (loadStatsOnly = false) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                session: selectedSession,
                page: loadStatsOnly ? 1 : currentPage,
                limit: loadStatsOnly ? 1 : itemsPerPage,
                sortBy: 'personalDetails.fullName',
                sortOrder: 'asc',
                listType: 'all' // backend defaults to 'main' (Our Students), which hides Direct students
            });

            if (debouncedSearch.trim()) {
                params.append('search', debouncedSearch.trim());
            }

            if (activeStatus && !loadStatsOnly) {
                params.append('paymentStatus', activeStatus);
            }

            const response = await api.get(`/api/admin/students?${params.toString()}`);
            
            if (response.data?.success) {
                const data = response.data.data;
                if (!loadStatsOnly) {
                    setApplications(data.students || []);
                    if (data.pagination) {
                        setTotalPages(data.pagination.totalPages || 1);
                        setTotalItems(data.pagination.totalItems || 0);
                    }
                } else {
                    setApplications([]);
                    setTotalPages(1);
                    setTotalItems(0);
                }
                if (data.paymentStats) {
                    setPaymentStats(data.paymentStats);
                }
            }
        } catch (error) {
            console.error('Error fetching applications for payments:', error);
            showError('Failed to load applications for payment management');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(applications.map(app => app._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (e, id) => {
        if (e.target.checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(item => item !== id));
        }
    };

    const openManageModal = (app) => {
        setSelectedApp(app);
        setIsModalOpen(true);
    };




    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payment Management</h2>
            </div>

            {/* Filter Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                <button
                    onClick={() => { setActiveStatus('all'); setCurrentPage(1); }}
                    className={`p-3 rounded-lg border font-semibold text-center transition-all ${
                        activeStatus === 'all' 
                            ? 'bg-[#387B95] border-[#387B95] text-white shadow-md' 
                            : 'bg-white dark:bg-[#231A2E] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                    <div className="text-xs uppercase tracking-wider text-opacity-80">All Students</div>
                    <div className="text-xl font-bold mt-1">{paymentStats.ALL}</div>
                    <div className="text-[10px] opacity-75 font-normal">(A-Z Filtered)</div>
                </button>
                <button
                    onClick={() => { setActiveStatus('PENDING'); setCurrentPage(1); }}
                    className={`p-3 rounded-lg border font-semibold text-center transition-all ${
                        activeStatus === 'PENDING' 
                            ? 'bg-yellow-600 border-yellow-600 text-white shadow-md' 
                            : 'bg-white dark:bg-[#231A2E] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                    <div className="text-xs uppercase tracking-wider text-opacity-80">Pending</div>
                    <div className="text-xl font-bold mt-1">{paymentStats.PENDING}</div>
                </button>
                <button
                    onClick={() => { setActiveStatus('PARTIAL'); setCurrentPage(1); }}
                    className={`p-3 rounded-lg border font-semibold text-center transition-all ${
                        activeStatus === 'PARTIAL' 
                            ? 'bg-orange-600 border-orange-600 text-white shadow-md' 
                            : 'bg-white dark:bg-[#231A2E] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                    <div className="text-xs uppercase tracking-wider text-opacity-80">Partial</div>
                    <div className="text-xl font-bold mt-1">{paymentStats.PARTIAL}</div>
                </button>
                <button
                    onClick={() => { setActiveStatus('OVERDUE'); setCurrentPage(1); }}
                    className={`p-3 rounded-lg border font-semibold text-center transition-all ${
                        activeStatus === 'OVERDUE' 
                            ? 'bg-red-600 border-red-600 text-white shadow-md' 
                            : 'bg-white dark:bg-[#231A2E] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                    <div className="text-xs uppercase tracking-wider text-opacity-80">Overdue</div>
                    <div className="text-xl font-bold mt-1">{paymentStats.OVERDUE}</div>
                </button>
                <button
                    onClick={() => { setActiveStatus('COMPLETED'); setCurrentPage(1); }}
                    className={`p-3 rounded-lg border font-semibold text-center transition-all ${
                        activeStatus === 'COMPLETED' 
                            ? 'bg-green-600 border-green-600 text-white shadow-md' 
                            : 'bg-white dark:bg-[#231A2E] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                    <div className="text-xs uppercase tracking-wider text-opacity-80">Completed</div>
                    <div className="text-xl font-bold mt-1">{paymentStats.COMPLETED}</div>
                </button>
                {/* Recent Payments Button */}
                <button
                    onClick={() => { setActiveStatus('recent'); setRecentPage(1); }}
                    className={`p-3 rounded-lg border font-semibold text-center transition-all ${
                        activeStatus === 'recent' 
                            ? 'bg-[#4A1D7A] border-[#4A1D7A] text-white shadow-md' 
                            : 'bg-white dark:bg-[#231A2E] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                    <div className="text-xs uppercase tracking-wider text-opacity-80 flex items-center justify-center gap-1">
                        <i className="fa-solid fa-clock-rotate-left text-[10px]"></i> Recent
                    </div>
                    <div className="text-xl font-bold mt-1">⟳</div>
                    <div className="text-[10px] opacity-75 font-normal">By Date</div>
                </button>
            </div>

            {/* Search Box */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-[#231A2E] p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSearchSubmit} className="flex w-full sm:max-w-md items-center">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Search by student name, application ID, phone..."
                            value={searchVal}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[#387B95] focus:border-blue-500 text-sm"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#387B95] hover:bg-[#1D4B5E] text-white font-medium rounded-r-lg text-sm transition-colors border border-[#387B95]"
                    >
                        Search
                    </button>
                </form>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                    {selectedIds.length} selected
                </div>
            </div>

            {/* ── RECENT PAYMENTS TABLE (shown when activeStatus === 'recent') ── */}
            {activeStatus === 'recent' && (
                <div className="relative bg-white dark:bg-[#231A2E] shadow rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                    {/* Header bar */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-[#F0E6FA] dark:bg-[#231A2E]/10">
                        <div className="p-2 bg-[#F0E6FA] dark:bg-[#231A2E]/30 rounded-lg">
                            <i className="fa-solid fa-clock-rotate-left text-[#4A1D7A] dark:text-[#9B6FCC]"></i>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Payments</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-300">Sorted by most recent installment date — all management actions available</p>
                        </div>
                    </div>

                    {recentLoading && (
                        <div className="absolute inset-0 bg-white dark:bg-[#231A2E]/60 dark:bg-[#231A2E]/60 z-10 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4A1D7A]"></div>
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">App ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Latest Installment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Fees</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Paid</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-[#231A2E] divide-y divide-gray-200 dark:divide-gray-700">
                                {recentPayments.length === 0 && !recentLoading ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-300">
                                            <div className="flex flex-col items-center gap-2">
                                                <i className="fa-solid fa-receipt text-3xl text-gray-300"></i>
                                                <p className="font-medium">No recent payments found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : recentPayments.map((app, idx) => {
                                    const finStatus = app.financialStatus || {};
                                    const inst = app._recentInstallment || {};
                                    const instDate = app._recentDate ? new Date(app._recentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                                    const instStatusColor = inst.status === 'VERIFIED' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 dark:bg-green-900/30 dark:text-green-400' :
                                                            inst.status === 'REJECTED' ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400';
                                    return (
                                        <tr key={`recent-${idx}`} className="hover:bg-[#F0E6FA]/40 dark:hover:bg-purple-900/10 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="hidden sm:flex h-8 w-8 rounded-full bg-[#F0E6FA] dark:bg-[#231A2E]/30 items-center justify-center flex-shrink-0 text-[#4A1D7A] dark:text-[#9B6FCC] font-bold text-sm">
                                                        {(app.personalDetails?.fullName || 'U').charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{app.personalDetails?.fullName || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono">{app.applicationId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-gray-100">{instDate}</div>
                                                {inst.installmentNumber && <div className="text-xs text-gray-400 dark:text-gray-300">Installment #{inst.installmentNumber}</div>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">₹{(inst.amount || 0).toLocaleString('en-IN')}</div>
                                                <span className={`mt-0.5 inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded-full uppercase ${instStatusColor}`}>
                                                    {inst.status || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">₹{finStatus.totalFees || 0}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">₹{finStatus.paidAmount || 0}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    finStatus.paymentStatus === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 dark:bg-green-900/30 dark:text-green-400' :
                                                    finStatus.paymentStatus === 'PARTIAL' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    finStatus.paymentStatus === 'OVERDUE' ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-gray-100 dark:bg-gray-800/60 text-gray-800 dark:text-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                    {finStatus.paymentStatus || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                <button
                                                    onClick={() => openManageModal(app)}
                                                    className="text-[#387B95] hover:text-blue-900 dark:text-[#60A5FA] dark:hover:text-blue-300 font-medium"
                                                >
                                                    Manage
                                                </button>
                                                {finStatus.receiptUrl && (
                                                    <a
                                                        href={finStatus.receiptUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 font-medium"
                                                    >
                                                        Receipt
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => openManageModal(app)}
                                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200"
                                                    title="Print Receipt"
                                                >
                                                    <i className="fa-solid fa-print text-xs"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Recent Payments Pagination */}
                    {recentPayments.length > 0 && (
                        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-500 dark:text-gray-300">
                                Showing page <span className="font-medium text-gray-900 dark:text-gray-100">{recentPage}</span> of <span className="font-medium text-gray-900 dark:text-gray-100">{recentTotalPages}</span>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => setRecentPage(p => Math.max(p - 1, 1))} disabled={recentPage === 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50 dark:bg-gray-800 transition-colors">Prev</button>
                                {Array.from({ length: recentTotalPages }, (_, i) => i + 1).slice(Math.max(0, recentPage - 3), recentPage + 2).map(pn => (
                                    <button key={pn} onClick={() => setRecentPage(pn)} className={`px-3 py-1 border rounded text-sm transition-colors ${recentPage === pn ? 'bg-[#4A1D7A] text-white border-[#4A1D7A] shadow-sm' : 'hover:bg-gray-50 dark:bg-gray-800'}`}>{pn}</button>
                                ))}
                                <button onClick={() => setRecentPage(p => Math.min(p + 1, recentTotalPages))} disabled={recentPage === recentTotalPages} className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50 dark:bg-gray-800 transition-colors">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── STANDARD PAYMENTS TABLE (hidden when activeStatus === 'recent') ── */}
            {activeStatus !== 'recent' && (
            <div className="relative bg-white dark:bg-[#231A2E] shadow rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                {loading && (
                    <div className="absolute inset-0 bg-white dark:bg-[#231A2E]/60 dark:bg-[#231A2E]/60 z-10 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#387B95]"></div>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 text-[#387B95] focus:ring-[#387B95]"
                                        onChange={handleSelectAll}
                                        checked={selectedIds.length === applications.length && applications.length > 0}
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">App ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Fees</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Paid Amount</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Amount</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-[#231A2E] divide-y divide-gray-200 dark:divide-gray-700">
                            {activeStatus === null ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-300">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <svg className="h-12 w-12 text-gray-400 dark:text-gray-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                            </svg>
                                            <p className="font-semibold text-base text-gray-700 dark:text-gray-300">No Status Selected</p>
                                            <p className="text-sm text-gray-400 dark:text-gray-300">Click one of the status buttons above to view and manage students.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-300">
                                        No students found matching this criteria
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app) => {
                                    const finStatus = app.financialStatus || { totalFees: 0, paidAmount: 0, dueAmount: 0, paymentStatus: 'PENDING' };
                                    return (
                                        <tr key={app._id} className="hover:bg-gray-50 dark:bg-[#1A1212] dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-gray-300 text-[#387B95] focus:ring-[#387B95]"
                                                    checked={selectedIds.includes(app._id)}
                                                    onChange={(e) => handleSelectOne(e, app._id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {app.personalDetails?.fullName || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {app.applicationId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                ₹{finStatus.totalFees}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                                                ₹{finStatus.paidAmount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-semibold">
                                                ₹{finStatus.dueAmount !== undefined && finStatus.dueAmount !== null ? finStatus.dueAmount : (finStatus.totalFees || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${finStatus.paymentStatus === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200' : 
                                                    finStatus.paymentStatus === 'PARTIAL' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200' : 
                                                    finStatus.paymentStatus === 'OVERDUE' ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200' : 
                                                    'bg-gray-100 dark:bg-gray-800/60 text-gray-800 dark:text-gray-200'}`}>
                                                    {app.courseDetails?.admissionType === 'free' ? 'NO PAYMENT' : (finStatus.paymentStatus || 'PENDING')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button 
                                                    onClick={() => openManageModal(app)}
                                                    className="text-[#387B95] hover:text-blue-900 dark:text-[#60A5FA] dark:hover:text-blue-300 mr-3"
                                                >
                                                    Manage
                                                </button>
                                                {finStatus.receiptUrl && (
                                                    <a 
                                                        href={finStatus.receiptUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                    >
                                                        Receipt
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination UI */}
                {totalPages > 1 && (
                    <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                        </div>
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                            >
                                Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-1 border rounded text-sm ${currentPage === pageNum ? 'bg-[#387B95] text-white' : ''}`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
            )}

            {/* Manage Financial Modal */}
            {isModalOpen && selectedApp && (
                <PaymentManageModal
                    app={selectedApp}
                    onClose={() => setIsModalOpen(false)}
                    onSaved={() => (activeStatus === 'recent' ? fetchRecentPayments(recentPage) : fetchApplications(activeStatus === null))}
                />
            )}
        </div>
    );
};

export default PaymentManagement;
