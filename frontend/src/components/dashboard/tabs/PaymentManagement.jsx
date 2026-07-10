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
        paymentStatus: 'PENDING'
    });
    const [receiptFile, setReceiptFile] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (selectedSession) {
            fetchApplications();
        }
    }, [selectedSession, currentPage]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                session: selectedSession,
                page: currentPage,
                limit: itemsPerPage
            });
            const response = await api.get(`/api/admin/students?${params.toString()}`);
            
            if (response.data?.success) {
                setApplications(response.data.data.students || []);
                if (response.data.data.pagination) {
                    setTotalPages(response.data.data.pagination.totalPages || 1);
                    setTotalItems(response.data.data.pagination.totalItems || 0);
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
        const finStatus = app.financialStatus || { totalFees: 0, paidAmount: 0, dueAmount: 0, paymentStatus: 'PENDING' };
        setFormData({
            totalFees: finStatus.totalFees || 0,
            paidAmount: finStatus.paidAmount || 0,
            dueAmount: finStatus.dueAmount || 0,
            paymentStatus: finStatus.paymentStatus || 'PENDING'
        });
        setReceiptFile(null);
        setIsModalOpen(true);
    };

    const handleUpdateFinancial = async () => {
        try {
            setIsUpdating(true);
            let receiptUrl = selectedApp.financialStatus?.receiptUrl;

            // Handle file upload if a new receipt is provided
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

            // Update financial status
            const response = await api.put(`/api/admin/students/${selectedApp._id}/financial`, {
                ...formData,
                receiptUrl
            });

            if (response.data?.success) {
                showSuccess('Financial status updated successfully');
                setIsModalOpen(false);
                fetchApplications();
            }
        } catch (error) {
            console.error('Error updating financial status:', error);
            showError('Failed to update financial status');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading && applications.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payment Management</h2>
                <div className="text-sm text-gray-500">
                    {selectedIds.length} selected
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
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
                            {applications.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">No applications found</td>
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
                                    onChange={(e) => setFormData({...formData, totalFees: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Paid Amount (₹)</label>
                                <input
                                    type="number"
                                    value={formData.paidAmount}
                                    onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Amount (₹)</label>
                                <input
                                    type="number"
                                    value={formData.dueAmount}
                                    onChange={(e) => setFormData({...formData, dueAmount: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Receipt (Optional)</label>
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
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateFinancial}
                                disabled={isUpdating}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                            >
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentManagement;
