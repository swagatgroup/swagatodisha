import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Shared shell for payment modals in every dashboard: same width, max-height, padding, header/footer and scroll
const PaymentModalShell = ({ title, subtitle, onClose, footer, children }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-[#231A2E] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
                    {subtitle && <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{subtitle}</p>}
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-[#1A1212]">
                {children}
            </div>
            {footer && (
                <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                    {footer}
                </div>
            )}
        </motion.div>
    </div>
);

export default PaymentModalShell;
