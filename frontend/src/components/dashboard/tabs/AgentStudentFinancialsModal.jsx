import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../utils/api';
import { showSuccess, showError } from '../../../utils/sweetAlert';
import { XMarkIcon, CurrencyRupeeIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';

const AgentStudentFinancialsModal = ({ student, onClose, onUpdate }) => {
    const [financialStatus, setFinancialStatus] = useState({
        totalFees: 0,
        paidAmount: 0,
        dueAmount: 0,
        installments: []
    });
    const [loading, setLoading] = useState(true);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadData, setUploadData] = useState({
        amount: '',
        paymentMethod: 'Bank Transfer',
        remarks: ''
    });
    const [receiptFile, setReceiptFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (student) {
            fetchInstallments();
        }
    }, [student]);

    const fetchInstallments = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/agents/students/${student._id || student.user}/installments`);
            if (response.data.success) {
                setFinancialStatus(response.data.data.financialStatus);
            }
        } catch (error) {
            console.error('Error fetching installments:', error);
            showError('Failed to load financial details');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showError('File size should be less than 5MB');
                return;
            }
            setReceiptFile(file);
        }
    };

    const handleUploadSlip = async (e) => {
        e.preventDefault();
        if (!uploadData.amount) {
            showError('Please enter the payment amount');
            return;
        }
        if (!receiptFile) {
            showError('Please select a receipt file to upload');
            return;
        }

        try {
            setUploading(true);
            
            const formDataFile = new FormData();
            formDataFile.append('file', receiptFile);
            
            const uploadRes = await api.post('/api/files/upload', formDataFile, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (!uploadRes.data?.success) {
                throw new Error('File upload failed');
            }

            const receiptUrl = uploadRes.data.data.url;

            await api.post(`/api/agents/students/${student._id || student.user}/installments/upload`, {
                amount: uploadData.amount,
                paymentMethod: uploadData.paymentMethod,
                remarks: uploadData.remarks,
                receiptUrl
            });

            showSuccess('Payment slip uploaded successfully!');
            setShowUploadForm(false);
            setUploadData({ amount: '', paymentMethod: 'Bank Transfer', remarks: '' });
            setReceiptFile(null);
            fetchInstallments();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error uploading payment slip:', error);
            showError(error.response?.data?.message || 'Failed to upload payment slip');
        } finally {
            setUploading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'VERIFIED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (!student) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    <div className="flex items-center justify-between p-6 border-b">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Financials: {student.personalDetails?.fullName || 'Student'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Manage installments and upload slips
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                        <p className="text-sm text-gray-500 font-medium">Total Fees</p>
                                        <p className="text-xl font-bold text-gray-900 mt-1">
                                            {formatCurrency(financialStatus.totalFees)}
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                        <p className="text-sm text-gray-500 font-medium">Paid (Verified)</p>
                                        <p className="text-xl font-bold text-green-600 mt-1">
                                            {formatCurrency(financialStatus.paidAmount)}
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                        <p className="text-sm text-gray-500 font-medium">Due Amount</p>
                                        <p className="text-xl font-bold text-red-600 mt-1">
                                            {formatCurrency(financialStatus.dueAmount)}
                                        </p>
                                    </div>
                                </div>

                                {/* Installments List */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-gray-900">Installments History</h3>
                                        <button
                                            onClick={() => setShowUploadForm(!showUploadForm)}
                                            className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium flex items-center gap-1"
                                        >
                                            <DocumentArrowUpIcon className="w-4 h-4" />
                                            {showUploadForm ? 'Cancel Upload' : 'Upload New Slip'}
                                        </button>
                                    </div>

                                    {/* Upload Form */}
                                    {showUploadForm && (
                                        <div className="p-4 bg-purple-50 border-b border-purple-100">
                                            <form onSubmit={handleUploadSlip} className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₹)*</label>
                                                        <input
                                                            type="number"
                                                            required
                                                            min="1"
                                                            value={uploadData.amount}
                                                            onChange={(e) => setUploadData({ ...uploadData, amount: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method*</label>
                                                        <select
                                                            value={uploadData.paymentMethod}
                                                            onChange={(e) => setUploadData({ ...uploadData, paymentMethod: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                                        >
                                                            <option value="Bank Transfer">Bank Transfer / NEFT</option>
                                                            <option value="UPI">UPI</option>
                                                            <option value="Cheque">Cheque</option>
                                                            <option value="Cash">Cash Deposit</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Receipt/Slip*</label>
                                                    <input
                                                        type="file"
                                                        required
                                                        accept="image/*,.pdf"
                                                        onChange={handleFileChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                                                    <textarea
                                                        value={uploadData.remarks}
                                                        onChange={(e) => setUploadData({ ...uploadData, remarks: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                                        rows="2"
                                                        placeholder="Transaction ID or notes..."
                                                    ></textarea>
                                                </div>

                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="submit"
                                                        disabled={uploading}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        {uploading ? 'Uploading...' : 'Submit Payment Slip'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    <div className="divide-y divide-gray-200">
                                        {financialStatus.installments && financialStatus.installments.length > 0 ? (
                                            financialStatus.installments.map((inst, index) => (
                                                <div key={index} className="p-4 hover:bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-gray-900">
                                                                Installment #{inst.installmentNumber}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inst.status)}`}>
                                                                {inst.status}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-500 space-y-1">
                                                            <p>Amount: {formatCurrency(inst.amount)}</p>
                                                            <p>Date: {new Date(inst.date).toLocaleDateString()}</p>
                                                            <p>Method: {inst.paymentMethod}</p>
                                                            {inst.remarks && <p className="italic text-gray-600 mt-1">{inst.remarks}</p>}
                                                        </div>
                                                    </div>
                                                    {inst.receiptUrl && (
                                                        <a 
                                                            href={inst.receiptUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                        >
                                                            View Slip
                                                        </a>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-6 text-center text-gray-500">
                                                No installments recorded yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AgentStudentFinancialsModal;
