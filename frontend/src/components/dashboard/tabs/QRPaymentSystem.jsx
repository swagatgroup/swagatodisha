import React from 'react';
import { motion } from 'framer-motion';
import defaultQrCode from '../../../assets/documents/swagatodisha-payment-qr-code.webp';

const QRPaymentSystem = ({ qrCodeImage, amount }) => {
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
            >
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Scan & Pay</h3>
                    <p className="text-gray-600 mb-6">Scan the QR code below using any UPI app to make your payment.</p>

                    <div className="bg-gray-50 rounded-lg p-8 mb-6 flex flex-col items-center">
                        {qrCodeImage ? (
                            <img 
                                src={qrCodeImage} 
                                alt="Payment QR Code" 
                                className="w-64 h-64 object-contain border border-gray-300 rounded-lg bg-white shadow-sm"
                            />
                        ) : (
                            <img 
                                src={defaultQrCode} 
                                alt="Default Payment QR Code" 
                                className="w-64 h-64 object-contain border border-gray-300 rounded-lg bg-white shadow-sm opacity-80"
                            />
                        )}
                        
                        {amount > 0 ? (
                            <div className="mt-6 p-4 bg-purple-50 text-purple-900 rounded-lg w-full max-w-sm border border-purple-100">
                                <p className="text-sm text-purple-700 font-medium">Due Amount</p>
                                <p className="text-2xl font-bold">{formatAmount(amount)}</p>
                            </div>
                        ) : (
                            <div className="mt-6 p-4 bg-green-50 text-green-900 rounded-lg w-full max-w-sm border border-green-100">
                                <p className="text-green-700 font-medium">No Due Amount</p>
                            </div>
                        )}
                    </div>

                    <div className="text-left bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-100">
                        <p className="font-semibold mb-2 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Instructions
                        </p>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>Scan the QR code using Google Pay, PhonePe, Paytm, or any UPI app.</li>
                            <li>Pay the due amount shown above or any installment amount.</li>
                            <li>Take a screenshot of the successful payment receipt (showing UTR/Transaction ID).</li>
                            <li>Click "Upload Payment Slip" above to submit your payment details.</li>
                        </ol>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default QRPaymentSystem;
