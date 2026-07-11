import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { useSession } from '../../../contexts/SessionContext';
import { showError, showSuccess } from '../../../utils/sweetAlert';

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
    const [formData, setFormData] = useState({
        totalFees: 0,
        paidAmount: 0,
        dueAmount: 0,
        paymentStatus: 'PENDING',
        installments: []
    });
    const [receiptFile, setReceiptFile] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Refactored states for payments management
    const [activeStatus, setActiveStatus] = useState(null);
    const [paymentStats, setPaymentStats] = useState({ ALL: 0, PENDING: 0, PARTIAL: 0, OVERDUE: 0, COMPLETED: 0 });
    const [searchVal, setSearchVal] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debouncing effect (500ms inactivity pause)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchVal);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchVal]);

    useEffect(() => {
        if (selectedSession) {
            if (activeStatus === null && debouncedSearch.trim()) {
                // If they search while activeStatus is null, auto-select 'all'
                setActiveStatus('all');
            } else if (activeStatus === null) {
                fetchApplications(true); // stats only on initial load
            } else {
                fetchApplications(false); // full load when tab selected
            }
        }
    }, [selectedSession, currentPage, activeStatus, debouncedSearch]);

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
                sortOrder: 'asc'
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
        const finStatus = app.financialStatus || { totalFees: 0, paidAmount: 0, dueAmount: 0, paymentStatus: 'PENDING', installments: [] };
        setFormData({
            totalFees: finStatus.totalFees || 0,
            paidAmount: finStatus.paidAmount || 0,
            dueAmount: finStatus.dueAmount || 0,
            paymentStatus: finStatus.paymentStatus || 'PENDING',
            installments: finStatus.installments || []
        });
        setReceiptFile(null);
        setIsModalOpen(true);
    };

    const handleUpdateFinancial = async () => {
        try {
            setIsUpdating(true);
            let receiptUrl = selectedApp.financialStatus?.receiptUrl;

            if (receiptFile) {
                const formDataFile = new FormData();
                formDataFile.append('file', receiptFile);
                
                const uploadRes = await api.post('/api/files/upload', formDataFile, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (uploadRes.data?.success) {
                    receiptUrl = uploadRes.data.data.url;
                } else {
                    throw new Error('File upload failed');
                }
            }

            const response = await api.put(`/api/admin/students/${selectedApp._id}/financial`, {
                ...formData,
                receiptUrl
            });

            if (response.data?.success) {
                showSuccess('Financial status updated successfully');
                setIsModalOpen(false);
                fetchApplications(activeStatus === null);
            }
        } catch (error) {
            console.error('Error updating financial status:', error);
            showError('Failed to update financial status');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleTotalFeesChange = (e) => {
        const val = e.target.value;
        const total = parseFloat(val) || 0;
        const paid = parseFloat(formData.paidAmount) || 0;
        setFormData({
            ...formData,
            totalFees: val,
            dueAmount: Math.max(0, total - paid)
        });
    };

    const handlePaidAmountChange = (e) => {
        const val = e.target.value;
        const total = parseFloat(formData.totalFees) || 0;
        const paid = parseFloat(val) || 0;
        setFormData({
            ...formData,
            paidAmount: val,
            dueAmount: Math.max(0, total - paid)
        });
    };

    const handleAddInstallment = () => {
        setFormData(prev => ({
            ...prev,
            installments: [
                ...prev.installments,
                {
                    installmentNumber: prev.installments.length + 1,
                    amount: 0,
                    date: new Date().toISOString().split('T')[0],
                    status: 'PENDING',
                    paymentMethod: 'Bank Transfer',
                    remarks: ''
                }
            ]
        }));
    };

    const handleInstallmentChange = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.installments];
            updated[index] = { ...updated[index], [field]: value };
            
            // Auto-calculate paid amount if status changes to VERIFIED or amount changes
            let newPaidAmount = prev.paidAmount;
            if (field === 'status' || field === 'amount') {
                newPaidAmount = updated.reduce((sum, inst) => {
                    return inst.status === 'VERIFIED' ? sum + (parseFloat(inst.amount) || 0) : sum;
                }, 0);
            }

            return { 
                ...prev, 
                installments: updated,
                paidAmount: field === 'status' || field === 'amount' ? newPaidAmount : prev.paidAmount,
                dueAmount: field === 'status' || field === 'amount' ? Math.max(0, prev.totalFees - newPaidAmount) : prev.dueAmount
            };
        });
    };

    const handleRemoveInstallment = (index) => {
        setFormData(prev => {
            const updated = prev.installments.filter((_, i) => i !== index);
            // Re-number remaining
            updated.forEach((inst, i) => inst.installmentNumber = i + 1);
            
            // Recalculate
            const newPaidAmount = updated.reduce((sum, inst) => {
                return inst.status === 'VERIFIED' ? sum + (parseFloat(inst.amount) || 0) : sum;
            }, 0);

            return {
                ...prev,
                installments: updated,
                paidAmount: newPaidAmount,
                dueAmount: Math.max(0, prev.totalFees - newPaidAmount)
            };
        });
    };

    const handlePrintReceipt = () => {
        if (!selectedApp) return;
        const printWindow = window.open('', '_blank');
        const finStatus = formData;
        
        let installmentsHtml = '';
        if (finStatus.installments && finStatus.installments.length > 0) {
            installmentsHtml = `
                <div style="margin-top: 30px; margin-bottom: 10px; font-size: 14px; font-weight: 600; color: #4b5563;">Installment Details</div>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                            <th style="padding: 10px; text-align: left; font-size: 12px; font-weight: 600; color: #475569;">Inst #</th>
                            <th style="padding: 10px; text-align: left; font-size: 12px; font-weight: 600; color: #475569;">Date</th>
                            <th style="padding: 10px; text-align: left; font-size: 12px; font-weight: 600; color: #475569;">Method</th>
                            <th style="padding: 10px; text-align: left; font-size: 12px; font-weight: 600; color: #475569;">Status</th>
                            <th style="padding: 10px; text-align: right; font-size: 12px; font-weight: 600; color: #475569;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${finStatus.installments.map(inst => `
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 10px; font-size: 13px; color: #334155;">${inst.installmentNumber}</td>
                                <td style="padding: 10px; font-size: 13px; color: #334155;">${new Date(inst.date).toLocaleDateString('en-IN')}</td>
                                <td style="padding: 10px; font-size: 13px; color: #334155;">${inst.paymentMethod || 'N/A'}</td>
                                <td style="padding: 10px; font-size: 13px; color: #334155;">
                                    <span style="font-weight: 600; color: ${inst.status === 'VERIFIED' ? '#059669' : inst.status === 'REJECTED' ? '#dc2626' : '#d97706'}">${inst.status}</span>
                                </td>
                                <td style="padding: 10px; text-align: right; font-size: 13px; font-weight: 600; color: #334155;">₹${inst.amount}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Payment Invoice - ${selectedApp.personalDetails?.fullName || 'N/A'}</title>
                    <style>
                        body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #333; background-color: #fff; }
                        .receipt-container { padding: 40px; max-width: 800px; margin: 0 auto; }
                        .header-container { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
                        .logo-col { display: flex; flex-direction: column; }
                        .logo { font-size: 26px; font-weight: 800; color: #0f172a; margin-bottom: 4px; letter-spacing: -0.5px; }
                        .sub-logo { font-size: 13px; color: #64748b; }
                        .invoice-badge { font-size: 32px; font-weight: 300; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase; }
                        .grid-info { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                        .info-box { background-color: #f8fafc; padding: 20px; border-radius: 6px; }
                        .label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; letter-spacing: 0.5px; }
                        .value { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
                        .amount-summary { margin-top: 30px; margin-left: auto; width: 300px; }
                        .amount-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
                        .amount-label { color: #64748b; font-weight: 500; }
                        .amount-value { font-weight: 600; color: #0f172a; }
                        .amount-total { font-size: 18px; color: #0f172a; border-top: 2px solid #e2e8f0; padding-top: 12px; margin-top: 12px; font-weight: 700; }
                        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
                        .status-completed { background-color: #dcfce7; color: #166534; }
                        .status-partial { background-color: #fef9c3; color: #854d0e; }
                        .status-overdue { background-color: #fee2e2; color: #991b1b; }
                        .status-pending { background-color: #f1f5f9; color: #475569; }
                        .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                        @media print {
                            body { margin: 0; }
                            .receipt-container { max-width: 100%; padding: 20px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt-container">
                        <div class="header-container">
                            <div class="logo-col">
                                <div class="logo">Swagat Group of Institutions</div>
                                <div class="sub-logo">Official Payment Invoice</div>
                            </div>
                            <div class="invoice-badge">INVOICE</div>
                        </div>
                        
                        <div class="grid-info">
                            <div class="info-box">
                                <div class="label">Billed To</div>
                                <div class="value" style="font-size: 18px;">${selectedApp.personalDetails?.fullName || 'N/A'}</div>
                                <div class="label" style="margin-top: 15px;">Application ID</div>
                                <div class="value" style="margin-bottom: 0;">${selectedApp.applicationId || 'N/A'}</div>
                            </div>
                            <div class="info-box">
                                <div class="label">Course Details</div>
                                <div class="value">${selectedApp.courseDetails?.selectedCourse || 'N/A'}</div>
                                <div class="label" style="margin-top: 15px;">Date of Issue</div>
                                <div class="value" style="margin-bottom: 0;">${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                            </div>
                        </div>
                        
                        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                            <thead>
                                <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                                    <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #475569;">Description</th>
                                    <th style="padding: 12px; text-align: right; font-size: 13px; font-weight: 600; color: #475569;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 15px 12px; font-size: 14px; color: #334155; font-weight: 500;">Course Tuition & Registration Fees</td>
                                    <td style="padding: 15px 12px; text-align: right; font-size: 14px; color: #0f172a; font-weight: 600;">₹${finStatus.totalFees}</td>
                                </tr>
                            </tbody>
                        </table>

                        ${installmentsHtml}

                        <div class="amount-summary">
                            <div class="amount-row">
                                <div class="amount-label">Subtotal</div>
                                <div class="amount-value">₹${finStatus.totalFees}</div>
                            </div>
                            <div class="amount-row">
                                <div class="amount-label" style="color: #059669;">Total Paid</div>
                                <div class="amount-value" style="color: #059669;">- ₹${finStatus.paidAmount}</div>
                            </div>
                            <div class="amount-row amount-total">
                                <div class="amount-label">Balance Due</div>
                                <div class="amount-value">₹${finStatus.dueAmount}</div>
                            </div>
                            <div class="amount-row" style="margin-top: 20px; align-items: center;">
                                <div class="amount-label">Status</div>
                                <div>
                                    <span class="status-badge status-${finStatus.paymentStatus.toLowerCase()}">${finStatus.paymentStatus}</span>
                                </div>
                            </div>
                        </div>

                        <div class="footer">
                            <p>This is a computer-generated document. No physical signature is required.</p>
                            <p>Swagat Group of Institutions &copy; ${new Date().getFullYear()} &bull; All Rights Reserved</p>
                        </div>
                    </div>
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                            }, 500);
                            window.onafterprint = function() {
                                window.close();
                            };
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };



    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payment Management</h2>
            </div>

            {/* Filter Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <button
                    onClick={() => { setActiveStatus('all'); setCurrentPage(1); }}
                    className={`p-3 rounded-lg border font-semibold text-center transition-all ${
                        activeStatus === 'all' 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
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
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
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
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
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
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
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
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                    <div className="text-xs uppercase tracking-wider text-opacity-80">Completed</div>
                    <div className="text-xl font-bold mt-1">{paymentStats.COMPLETED}</div>
                </button>
            </div>

            {/* Search Box */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSearchSubmit} className="flex w-full sm:max-w-md items-center">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Search by student name, application ID, phone..."
                            value={searchVal}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-r-lg text-sm transition-colors border border-blue-600"
                    >
                        Search
                    </button>
                </form>
                <div className="text-sm text-gray-500">
                    {selectedIds.length} selected
                </div>
            </div>

            <div className="relative bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 z-10 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {activeStatus === null ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <svg className="h-12 w-12 text-gray-400 dark:text-gray-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                            </svg>
                                            <p className="font-semibold text-base text-gray-700 dark:text-gray-300">No Status Selected</p>
                                            <p className="text-sm text-gray-400">Click one of the status buttons above to view and manage students.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No students found matching this criteria
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app) => {
                                    const finStatus = app.financialStatus || { totalFees: 0, paidAmount: 0, dueAmount: 0, paymentStatus: 'PENDING' };
                                    return (
                                        <tr key={app._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    checked={selectedIds.includes(app._id)}
                                                    onChange={(e) => handleSelectOne(e, app._id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {app.personalDetails?.fullName || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {app.applicationId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                ₹{finStatus.totalFees}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                                                ₹{finStatus.paidAmount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                                                ₹{finStatus.dueAmount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${finStatus.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                                    finStatus.paymentStatus === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' : 
                                                    finStatus.paymentStatus === 'OVERDUE' ? 'bg-red-100 text-red-800' : 
                                                    'bg-gray-100 text-gray-800'}`}>
                                                    {finStatus.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button 
                                                    onClick={() => openManageModal(app)}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
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
                        <div className="text-sm text-gray-500">
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
                                    className={`px-3 py-1 border rounded text-sm ${currentPage === pageNum ? 'bg-blue-600 text-white' : ''}`}
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

            {/* Manage Financial Modal */}
            {isModalOpen && selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50">
                    <div className="relative w-full max-w-md p-6 mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                        <div className="flex items-start justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Manage Payments for {selectedApp.personalDetails?.fullName}
                            </h3>
                            <button
                                className="text-gray-400 hover:text-gray-500"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <span className="text-2xl">×</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Fees (₹)</label>
                                <input
                                    type="number"
                                    value={formData.totalFees}
                                    onChange={handleTotalFeesChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                                />
                            </div>
                            
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">Installments</h4>
                                    <button 
                                        type="button"
                                        onClick={handleAddInstallment}
                                        className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded hover:bg-green-200 flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        Add Installment
                                    </button>
                                </div>
                                
                                {formData.installments.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic text-center py-2 bg-gray-50 dark:bg-gray-700/50 rounded">No installments added yet.</p>
                                ) : (
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                        {formData.installments.map((inst, index) => (
                                            <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 relative">
                                                <button 
                                                    onClick={() => handleRemoveInstallment(index)}
                                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                                    title="Remove Installment"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                                <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Installment {inst.installmentNumber}</h5>
                                                
                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Amount (₹)</label>
                                                        <input 
                                                            type="number" 
                                                            value={inst.amount}
                                                            onChange={(e) => handleInstallmentChange(index, 'amount', e.target.value)}
                                                            className="w-full rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-sm p-1 border"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Date</label>
                                                        <input 
                                                            type="date" 
                                                            value={inst.date ? inst.date.substring(0,10) : ''}
                                                            onChange={(e) => handleInstallmentChange(index, 'date', e.target.value)}
                                                            className="w-full rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-sm p-1 border"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Method</label>
                                                        <select 
                                                            value={inst.paymentMethod || 'Bank Transfer'}
                                                            onChange={(e) => handleInstallmentChange(index, 'paymentMethod', e.target.value)}
                                                            className="w-full rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-sm p-1 border"
                                                        >
                                                            <option value="Bank Transfer">Bank Transfer</option>
                                                            <option value="UPI">UPI</option>
                                                            <option value="Cash">Cash</option>
                                                            <option value="Cheque">Cheque</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Status</label>
                                                        <select 
                                                            value={inst.status}
                                                            onChange={(e) => handleInstallmentChange(index, 'status', e.target.value)}
                                                            className={`w-full rounded border-gray-300 dark:border-gray-600 text-sm p-1 border font-semibold
                                                                ${inst.status === 'VERIFIED' ? 'text-green-700 bg-green-50' : 
                                                                  inst.status === 'REJECTED' ? 'text-red-700 bg-red-50' : 'text-yellow-700 bg-yellow-50'}`}
                                                        >
                                                            <option value="PENDING">PENDING</option>
                                                            <option value="VERIFIED">VERIFIED</option>
                                                            <option value="REJECTED">REJECTED</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Paid (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.paidAmount}
                                        onChange={handlePaidAmountChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border font-semibold text-green-700"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">*Auto-calc from verified installments</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.dueAmount}
                                        disabled
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:border-gray-600 dark:text-white bg-gray-100 dark:bg-gray-600 cursor-not-allowed sm:text-sm p-2 border font-semibold text-red-700"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Overall Status</label>
                                <select
                                    value={formData.paymentStatus}
                                    onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                                >
                                    <option value="PENDING">PENDING</option>
                                    <option value="PARTIAL">PARTIAL</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="OVERDUE">OVERDUE</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload General Receipt (Optional)</label>
                                <input
                                    type="file"
                                    onChange={(e) => setReceiptFile(e.target.files[0])}
                                    className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200"
                                    accept="image/*,.pdf"
                                />
                                {selectedApp.financialStatus?.receiptUrl && !receiptFile && (
                                    <p className="mt-1 text-sm text-gray-500">A receipt is already uploaded.</p>
                                )}
                            </div>
                        </div>
                        <div className="mt-6 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
                            <button
                                onClick={handlePrintReceipt}
                                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 flex items-center shadow-sm"
                            >
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2zm5-17V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Print
                            </button>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateFinancial}
                                    disabled={isUpdating}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center shadow-sm"
                                >
                                    {isUpdating ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentManagement;
