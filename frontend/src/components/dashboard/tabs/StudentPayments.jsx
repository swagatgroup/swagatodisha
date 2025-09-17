import {useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';
import { showSuccess, showError, showConfirm } from '../../../utils/sweetAlert';
import QRPaymentSystem from './QRPaymentSystem';

const StudentPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        paymentMethod: 'online',
        description: '',
        dueDate: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const paymentMethods = [
        { value: 'online', label: 'Online Payment', icon: '💳' },
        { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
        { value: 'cash', label: 'Cash Payment', icon: '💵' },
        { value: 'cheque', label: 'Cheque', icon: '📝' }
    ];

    const feeTypes = [
        'Tuition Fee',
        'Registration Fee',
        'Examination Fee',
        'Library Fee',
        'Laboratory Fee',
        'Hostel Fee',
        'Transportation Fee',
        'Other'
    ];

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/students/payments');
            setPayments(response.data.data.payments || []);
        } catch (error) {
            console.error('Error fetching payments:', error);
            showError('Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };

    const handleMakePayment = async () => {
        try {
            setSubmitting(true);
            await api.post('/api/students/payments', paymentData);
            showSuccess('Payment initiated successfully!');
            setShowPaymentModal(false);
            setPaymentData({
                amount: '',
                paymentMethod: 'online',
                description: '',
                dueDate: ''
            });
            fetchPayments();
        } catch (error) {
            console.error('Error making payment:', error);
            showError('Failed to initiate payment');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePaymentStatus = async (paymentId, status) => {
        const confirmed = await showConfirm(
            'Update Payment Status',
            `Are you sure you want to mark this payment as ${status}?`
        );

        if (confirmed) {
            try {
                await api.put(`/api/students/payments/${paymentId}`, { status });
                showSuccess(`Payment marked as ${status}`);
                fetchPayments();
            } catch (error) {
                console.error('Error updating payment status:', error);
                showError('Failed to update payment status');
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            case 'refunded': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'processing': return '🔄';
            case 'completed': return '✅';
            case 'failed': return '❌';
            case 'cancelled': return '🚫';
            case 'refunded': return '↩️';
            default: return '❓';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
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
                        <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
                        <p className="text-gray-600">Track and manage your fee payments</p>
                    </div>
                    <button onClick={() => setShowPaymentModal(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        <span>Make Payment</span>
                    </button>
                </div>
            </motion.div>

            {/* Payment Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Paid</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {formatCurrency(payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {payments.filter(p => p.status === 'pending').length}
                            </p>
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
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {payments.filter(p => p.status === 'completed').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-red-100 rounded-full">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Overdue</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {payments.filter(p => p.status === 'pending' && new Date(p.dueDate) < new Date()).length}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Payment History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow"
            >
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {payments.length > 0 ? (
                        payments.map((payment, index) => (
                            <motion.div
                                key={payment._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 hover:bg-gray-50"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h4 className="text-lg font-semibold text-gray-900">
                                                {payment.description || payment.feeType}
                                            </h4>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                <span className="mr-1">{getStatusIcon(payment.status)}</span>
                                                {payment.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span>Amount: {formatCurrency(payment.amount)}</span>
                                            <span>Method: {payment.paymentMethod}</span>
                                            <span>Date: {new Date(payment.paymentDate).toLocaleDateString()}</span>
                                            {payment.dueDate && (
                                                <span>Due: {new Date(payment.dueDate).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                        {payment.transactionId && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                Transaction ID: {payment.transactionId}
                                            </p>
                                        )}
                                        {payment.notes && (
                                            <p className="text-sm text-gray-600 mt-2 italic">"{payment.notes}"</p>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {payment.status === 'pending' && (
                                            <button
                                                onClick={() => handlePaymentStatus(payment._id, 'completed')}
                                                className="px-3 py-1 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
                                            >
                                                Mark Paid
                                            </button>
                                        )}
                                        <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                                            View Receipt
                                        </button>
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
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
                            <p className="text-gray-500 mb-6">Your payment history will appear here.</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Payment Modal with QR and support */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-900">Make Payment</h3>
                            <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <QRPaymentSystem />
                            <div className="mt-4 flex items-center justify-center gap-4">
                                <a href="tel:+919876543210" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    Call Support
                                </a>
                                <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" /></svg>
                                    WhatsApp Support
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default StudentPayments;
