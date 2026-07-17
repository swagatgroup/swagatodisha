import {useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';
import { showSuccess, showError, showConfirm } from '../../../utils/sweetAlert';
import QRPaymentSystem from './QRPaymentSystem';

const StudentPayments = () => {
    const [financialStatus, setFinancialStatus] = useState({
        totalFees: 0,
        paidAmount: 0,
        dueAmount: 0,
        installments: []
    });
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    
    const [uploadData, setUploadData] = useState({
        amount: '',
        paymentMethod: 'Bank Transfer',
        remarks: ''
    });
    const [receiptFile, setReceiptFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedInstallment, setSelectedInstallment] = useState(null);
    const [updateData, setUpdateData] = useState({
        amount: '',
        paymentMethod: '',
        remarks: ''
    });

    useEffect(() => {
        fetchInstallments();
    }, []);

    const fetchInstallments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/students/payments/installments');
            if (response.data.success) {
                setFinancialStatus(response.data.data.financialStatus);
            }
        } catch (error) {
            console.error('Error fetching installments:', error);
            showError('Failed to load payment history');
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
            
            // 1. Upload file
            const formDataFile = new FormData();
            formDataFile.append('file', receiptFile);
            
            const uploadRes = await api.post('/api/files/upload', formDataFile, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (!uploadRes.data?.success) {
                throw new Error('File upload failed');
            }

            const receiptUrl = uploadRes.data.data.filePath || uploadRes.data.data.downloadUrl;

            // 2. Submit installment
            await api.post('/api/students/payments/installments/upload', {
                amount: uploadData.amount,
                paymentMethod: uploadData.paymentMethod,
                remarks: uploadData.remarks,
                receiptUrl
            });

            showSuccess('Payment slip uploaded successfully! It is now pending verification.');
            setShowUploadModal(false);
            setUploadData({ amount: '', paymentMethod: 'Bank Transfer', remarks: '' });
            setReceiptFile(null);
            fetchInstallments();
        } catch (error) {
            console.error('Error uploading payment slip:', error);
            showError(error.response?.data?.message || 'Failed to upload payment slip');
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateSlip = async (e) => {
        e.preventDefault();
        if (!updateData.amount) {
            showError('Please enter the payment amount');
            return;
        }

        try {
            setUploading(true);
            let receiptUrl = selectedInstallment.receiptUrl;
            
            // 1. Upload new file if provided
            if (receiptFile) {
                const formDataFile = new FormData();
                formDataFile.append('file', receiptFile);
                
                const uploadRes = await api.post('/api/files/upload', formDataFile, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (!uploadRes.data?.success) {
                    throw new Error('File upload failed');
                }
                receiptUrl = uploadRes.data.data.filePath || uploadRes.data.data.downloadUrl;
            }

            // 2. Submit installment update
            await api.put(`/api/students/payments/installments/${selectedInstallment._id}`, {
                amount: updateData.amount,
                paymentMethod: updateData.paymentMethod,
                remarks: updateData.remarks,
                receiptUrl
            });

            showSuccess('Payment slip updated successfully!');
            setShowUpdateModal(false);
            setUpdateData({ amount: '', paymentMethod: '', remarks: '' });
            setReceiptFile(null);
            setSelectedInstallment(null);
            fetchInstallments();
        } catch (error) {
            console.error('Error updating payment slip:', error);
            showError(error.response?.data?.message || 'Failed to update payment slip');
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
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    const { totalFees, paidAmount, dueAmount, installments } = financialStatus;

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
                        <p className="text-gray-600">Track and manage your fee installments</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowPaymentModal(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            <span>QR Payment</span>
                        </button>
                        <button onClick={() => setShowUploadModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            <span>Upload Slip</span>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Payment Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-gray-100 rounded-full">
                            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Fees</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalFees)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-full">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Paid (Verified)</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(paidAmount)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-red-100 rounded-full">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Due Amount</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(dueAmount)}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Installments History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow"
            >
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Installments History</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {installments && installments.length > 0 ? (
                        installments.map((inst, index) => (
                            <motion.div
                                key={inst._id || index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 hover:bg-gray-50"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h4 className="text-lg font-semibold text-gray-900">
                                                Installment #{inst.installmentNumber}
                                            </h4>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inst.status)}`}>
                                                {inst.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span>Amount: {formatCurrency(inst.amount)}</span>
                                            <span>Method: {inst.paymentMethod || 'N/A'}</span>
                                            <span>Date: {new Date(inst.date).toLocaleDateString()}</span>
                                        </div>
                                        {inst.remarks && (
                                            <p className="text-sm text-gray-600 mt-2 italic">Remarks: {inst.remarks}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {inst.receiptUrl && (
                                            <a href={inst.receiptUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                                                View Slip
                                            </a>
                                        )}
                                        {inst.status !== 'VERIFIED' && (
                                            <button 
                                                onClick={() => {
                                                    setSelectedInstallment(inst);
                                                    setUpdateData({
                                                        amount: inst.amount || '',
                                                        paymentMethod: inst.paymentMethod || 'Bank Transfer',
                                                        remarks: inst.remarks || ''
                                                    });
                                                    setReceiptFile(null);
                                                    setShowUpdateModal(true);
                                                }}
                                                className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Update
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className="mx-auto h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No installments found</h3>
                            <p className="text-gray-500 mb-6">You haven't made any payments or uploaded any slips yet.</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Update Slip Modal */}
            {showUpdateModal && selectedInstallment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-900">Update Payment Slip</h3>
                            <button onClick={() => setShowUpdateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleUpdateSlip} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₹)*</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={updateData.amount}
                                    onChange={(e) => setUpdateData({ ...updateData, amount: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Enter amount"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method*</label>
                                <select
                                    value={updateData.paymentMethod}
                                    onChange={(e) => setUpdateData({ ...updateData, paymentMethod: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="Bank Transfer">Bank Transfer / NEFT / RTGS</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Cash">Cash Deposit</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Receipt/Slip (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave blank to keep existing receipt.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks/Notes</label>
                                <textarea
                                    value={updateData.remarks}
                                    onChange={(e) => setUpdateData({ ...updateData, remarks: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Any transaction IDs or notes..."
                                    rows="2"
                                ></textarea>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowUpdateModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                                >
                                    {uploading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </>
                                    ) : 'Update Slip'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Upload Slip Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-900">Upload Payment Slip</h3>
                            <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleUploadSlip} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₹)*</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={uploadData.amount}
                                    onChange={(e) => setUploadData({ ...uploadData, amount: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Enter amount"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method*</label>
                                <select
                                    value={uploadData.paymentMethod}
                                    onChange={(e) => setUploadData({ ...uploadData, paymentMethod: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="Bank Transfer">Bank Transfer / NEFT / RTGS</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Cash">Cash Deposit</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Receipt/Slip (Image or PDF)*</label>
                                <input
                                    type="file"
                                    required
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks/Notes</label>
                                <textarea
                                    value={uploadData.remarks}
                                    onChange={(e) => setUploadData({ ...uploadData, remarks: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Any transaction IDs or notes..."
                                    rows="2"
                                ></textarea>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                                >
                                    {uploading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Uploading...
                                        </>
                                    ) : 'Submit Slip'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* QR Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-900">Make QR Payment</h3>
                            <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <QRPaymentSystem />
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default StudentPayments;
