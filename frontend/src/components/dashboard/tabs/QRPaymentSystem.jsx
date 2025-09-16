import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';

const QRPaymentSystem = () => {
    const [paymentData, setPaymentData] = useState({
        amount: 0,
        studentId: '',
        paymentId: '',
        qrCode: '',
        status: 'pending'
    });
    const [loading, setLoading] = useState(true);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [showReceipt, setShowReceipt] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        loadPaymentData();
        loadPaymentHistory();
    }, []);

    const loadPaymentData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/students/payment-info');
            if (response.data.success) {
                setPaymentData(response.data.data);
            }
        } catch (error) {
            console.error('Error loading payment data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPaymentHistory = async () => {
        try {
            const response = await api.get('/api/students/payment-history');
            if (response.data.success) {
                setPaymentHistory(response.data.data);
            }
        } catch (error) {
            console.error('Error loading payment history:', error);
        }
    };

    const generatePaymentQR = async () => {
        try {
            const response = await api.post('/api/students/generate-payment-qr', {
                amount: paymentData.amount
            });
            if (response.data.success) {
                setPaymentData(prev => ({
                    ...prev,
                    qrCode: response.data.data.qrCode,
                    paymentId: response.data.data.paymentId
                }));
            }
        } catch (error) {
            console.error('Error generating QR code:', error);
            alert('Error generating payment QR code. Please try again.');
        }
    };

    const checkPaymentStatus = async (paymentId) => {
        try {
            const response = await api.get(`/api/students/payment-status/${paymentId}`);
            if (response.data.success) {
                const status = response.data.data.status;
                if (status === 'completed') {
                    setPaymentData(prev => ({ ...prev, status: 'completed' }));
                    loadPaymentHistory();
                    alert('Payment completed successfully!');
                }
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
        }
    };

    const downloadReceipt = async (paymentId) => {
        try {
            const response = await api.get(`/api/students/payment-receipt/${paymentId}`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `payment-receipt-${paymentId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading receipt:', error);
            alert('Error downloading receipt. Please try again.');
        }
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'pending':
                return 'Pending';
            case 'failed':
                return 'Failed';
            default:
                return 'Unknown';
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
            {/* Payment QR Code */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
            >
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Make Payment</h3>
                    <p className="text-gray-600 mb-6">QR code will be available soon. Use the support options below if needed.</p>

                    <div className="bg-gray-50 rounded-lg p-8 mb-6">
                        <div className="flex flex-col items-center">
                            <div className="w-56 h-56 border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 rounded-lg">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">📱</div>
                                    <p className="text-gray-600">QR Code will appear here</p>
                                    <p className="text-sm text-gray-500 mt-2">Feature temporarily disabled</p>
                                </div>
                            </div>
                            {paymentData.amount ? (
                                <p className="text-lg font-semibold text-gray-900 mt-4">
                                    Amount: {formatAmount(paymentData.amount)}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={generatePaymentQR}
                            className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            Generate Payment QR
                        </button>

                        {paymentData.paymentId && (
                            <button
                                onClick={() => checkPaymentStatus(paymentData.paymentId)}
                                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Check Payment Status
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Payment Status */}
            {paymentData.paymentId && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-lg shadow p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(paymentData.status)}`}>
                                {getStatusText(paymentData.status)}
                            </span>
                            <span className="text-sm text-gray-500">
                                Payment ID: {paymentData.paymentId}
                            </span>
                        </div>
                        {paymentData.status === 'completed' && (
                            <button
                                onClick={() => downloadReceipt(paymentData.paymentId)}
                                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                Download Receipt
                            </button>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Support Information */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-6"
            >
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Need Help?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-blue-800 mb-2">Contact Admissions Office</h4>
                        <div className="space-y-2">
                            <a
                                href="tel:+919876543210"
                                className="flex items-center text-blue-700 hover:text-blue-900"
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                +91 98765 43210
                            </a>
                            <a
                                href="mailto:admissions@swagatodisha.com"
                                className="flex items-center text-blue-700 hover:text-blue-900"
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                admissions@swagatodisha.com
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium text-blue-800 mb-2">WhatsApp Support</h4>
                        <a
                            href="https://wa.me/919876543210"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-green-600 hover:text-green-800"
                        >
                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                            </svg>
                            Chat with us on WhatsApp
                        </a>
                    </div>
                </div>
            </motion.div>

            {/* Payment History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow"
            >
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                </div>

                <div className="p-6">
                    {paymentHistory.length === 0 ? (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No payment history</h3>
                            <p className="mt-1 text-sm text-gray-500">Your payment history will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {paymentHistory.map((payment) => (
                                <div key={payment._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">
                                                Payment #{payment.paymentId}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {new Date(payment.createdAt).toLocaleDateString()} • {formatAmount(payment.amount)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                            {getStatusText(payment.status)}
                                        </span>
                                        {payment.status === 'completed' && (
                                            <button
                                                onClick={() => downloadReceipt(payment.paymentId)}
                                                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                                            >
                                                Download Receipt
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default QRPaymentSystem;
