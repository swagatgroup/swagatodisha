import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import { showError, showSuccess } from '../../../utils/sweetAlert';
import PaymentModalShell from '../../shared/PaymentModalShell';

const EMPTY_FORM = { totalFees: 0, paidAmount: 0, dueAmount: 0, paymentStatus: 'PENDING', installments: [] };

// Manage one student's payments. Used by the Payments tab and the student tables.
// Always works from the student's full saved record: saving sends the whole installment list,
// so starting from a partial row would overwrite payments that row does not include.
const PaymentManageModal = ({ app, onClose, onSaved }) => {
    const { user } = useAuth();
    const [selectedApp, setSelectedApp] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [receiptFile, setReceiptFile] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        let cancelled = false;
        api.get(`/api/admin/students/${app._id}`)
            .then((response) => {
                if (cancelled) return;
                const fresh = response.data.data;
                const finStatus = fresh.financialStatus || EMPTY_FORM;
                setSelectedApp(fresh);
                setFormData({
                    totalFees: finStatus.totalFees || 0,
                    paidAmount: finStatus.paidAmount || 0,
                    dueAmount: finStatus.dueAmount || 0,
                    paymentStatus: finStatus.paymentStatus || 'PENDING',
                    installments: finStatus.installments || []
                });
            })
            .catch((error) => {
                if (cancelled) return;
                console.error('Error loading payment details:', error);
                showError('Failed to load payment details');
                onClose();
            });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [app._id]);

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
                    receiptUrl = uploadRes.data.data.filePath || uploadRes.data.data.downloadUrl || uploadRes.data.data.url;
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
                onSaved?.(response.data.data);
                onClose();
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
        
        let newStatus = formData.paymentStatus;
        if (paid === 0) {
            newStatus = 'PENDING';
        } else if (total > 0 && paid >= total) {
            newStatus = 'COMPLETED';
        } else {
            newStatus = 'PARTIAL';
        }

        setFormData({
            ...formData,
            paidAmount: val,
            dueAmount: Math.max(0, total - paid),
            paymentStatus: newStatus
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

            let newPaymentStatus = prev.paymentStatus;
            let newDueAmount = prev.dueAmount;
            
            if (field === 'status' || field === 'amount') {
                newDueAmount = Math.max(0, prev.totalFees - newPaidAmount);
                if (newPaidAmount === 0 && updated.length === 0) {
                    newPaymentStatus = 'PENDING';
                } else if (prev.totalFees > 0 && newPaidAmount >= prev.totalFees) {
                    newPaymentStatus = 'COMPLETED';
                } else {
                    newPaymentStatus = 'PARTIAL';
                }
            }

            return { 
                ...prev, 
                installments: updated,
                paidAmount: field === 'status' || field === 'amount' ? newPaidAmount : prev.paidAmount,
                dueAmount: newDueAmount,
                paymentStatus: newPaymentStatus
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

            const newDueAmount = Math.max(0, prev.totalFees - newPaidAmount);
            let newPaymentStatus = prev.paymentStatus;
            if (newPaidAmount === 0 && updated.length === 0) {
                newPaymentStatus = 'PENDING';
            } else if (prev.totalFees > 0 && newPaidAmount >= prev.totalFees) {
                newPaymentStatus = 'COMPLETED';
            } else {
                newPaymentStatus = 'PARTIAL';
            }

            return {
                ...prev,
                installments: updated,
                paidAmount: newPaidAmount,
                dueAmount: newDueAmount,
                paymentStatus: newPaymentStatus
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
                <div style="margin-top: 15px; margin-bottom: 8px; font-size: 12px; font-weight: 600; color: #4b5563;">Installment Details</div>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <thead>
                        <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                            <th style="padding: 8px; text-align: left; font-size: 10px; font-weight: 600; color: #475569;">Inst #</th>
                            <th style="padding: 8px; text-align: left; font-size: 10px; font-weight: 600; color: #475569;">Date</th>
                            <th style="padding: 8px; text-align: left; font-size: 10px; font-weight: 600; color: #475569;">Method</th>
                            <th style="padding: 8px; text-align: left; font-size: 10px; font-weight: 600; color: #475569;">Status</th>
                            <th style="padding: 8px; text-align: right; font-size: 10px; font-weight: 600; color: #475569;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${finStatus.installments.map(inst => `
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 8px; font-size: 11px; color: #334155;">${inst.installmentNumber}</td>
                                <td style="padding: 8px; font-size: 11px; color: #334155;">${new Date(inst.date).toLocaleDateString('en-IN')}</td>
                                <td style="padding: 8px; font-size: 11px; color: #334155;">${inst.paymentMethod || 'N/A'}</td>
                                <td style="padding: 8px; font-size: 11px; color: #334155;">
                                    <span style="font-weight: 600; color: ${inst.status === 'VERIFIED' ? '#059669' : inst.status === 'REJECTED' ? '#dc2626' : '#d97706'}">${inst.status}</span>
                                </td>
                                <td style="padding: 8px; text-align: right; font-size: 11px; font-weight: 600; color: #334155;">₹${inst.amount}</td>
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
                        body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #333; background-color: #fff; }
                        .receipt-container { padding: 20px; max-width: 800px; margin: 0 auto; }
                        .header-container { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; }
                        .logo-col { display: flex; flex-direction: column; }
                        .logo { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 2px; letter-spacing: -0.5px; }
                        .sub-logo { font-size: 11px; color: #64748b; }
                        .invoice-badge { font-size: 24px; font-weight: 300; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase; }
                        .grid-info { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                        .info-box { background-color: #f8fafc; padding: 12px; border-radius: 6px; }
                        .label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 2px; letter-spacing: 0.5px; }
                        .value { font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 8px; }
                        .amount-summary { margin-top: 15px; margin-left: auto; width: 250px; }
                        .amount-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; }
                        .amount-label { color: #64748b; font-weight: 500; }
                        .amount-value { font-weight: 600; color: #0f172a; }
                        .amount-total { font-size: 15px; color: #0f172a; border-top: 2px solid #e2e8f0; padding-top: 8px; margin-top: 8px; font-weight: 700; }
                        .status-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
                        .status-completed { background-color: #dcfce7; color: #166534; }
                        .status-partial { background-color: #fef9c3; color: #854d0e; }
                        .status-overdue { background-color: #fee2e2; color: #991b1b; }
                        .status-pending { background-color: #f1f5f9; color: #475569; }
                        .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
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
                                <div class="value" style="font-size: 15px;">${selectedApp.personalDetails?.fullName || 'N/A'}</div>
                                <div class="label" style="margin-top: 10px;">Application ID</div>
                                <div class="value" style="margin-bottom: 0;">${selectedApp.applicationId || 'N/A'}</div>
                            </div>
                            <div class="info-box">
                                <div class="label">Course Details</div>
                                <div class="value">${selectedApp.courseDetails?.selectedCourse || 'N/A'}</div>
                                <div class="label" style="margin-top: 10px;">Date of Issue</div>
                                <div class="value" style="margin-bottom: 0;">${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                            </div>
                        </div>
                        
                        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                            <thead>
                                <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                                    <th style="padding: 8px; text-align: left; font-size: 11px; font-weight: 600; color: #475569;">Description</th>
                                    <th style="padding: 8px; text-align: right; font-size: 11px; font-weight: 600; color: #475569;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 8px; font-size: 12px; color: #334155; font-weight: 500;">Course Tuition & Registration Fees</td>
                                    <td style="padding: 10px 8px; text-align: right; font-size: 12px; color: #0f172a; font-weight: 600;">₹${finStatus.totalFees}</td>
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

    if (!selectedApp) {
        return (
            <PaymentModalShell title={`Manage Payments for ${app.personalDetails?.fullName || app.fullName || 'Student'}`} onClose={onClose}>
                <div className="flex justify-center py-12" role="status" aria-label="Loading payment details">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#387B95]"></div>
                </div>
            </PaymentModalShell>
        );
    }

    return (
        <PaymentModalShell
            title={`Manage Payments for ${selectedApp.personalDetails?.fullName || 'Student'}`}
            onClose={onClose}
        >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Fees (₹)</label>
                                <input
                                    type="number"
                                    value={formData.totalFees}
                                    onChange={handleTotalFeesChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-[#387B95] dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
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
                                    <p className="text-sm text-gray-500 dark:text-gray-300 italic text-center py-2 bg-gray-50 dark:bg-gray-700/50 rounded">No installments added yet.</p>
                                ) : (
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                        {formData.installments.map((inst, index) => (
                                            <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 relative">
                                                {!(inst.status === 'VERIFIED' && user?.role !== 'super_admin') && (
                                                    <button 
                                                        onClick={() => handleRemoveInstallment(index)}
                                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                                        title="Remove Installment"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                )}
                                                <div className="flex items-center mb-2 pr-8">
                                                    <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mr-3">Installment {inst.installmentNumber}</h5>
                                                    {inst.receiptUrl && (
                                                        <a href={inst.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#387B95] hover:text-blue-800 flex items-center bg-[#D0E8F0] px-2 py-0.5 rounded">
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                            View Slip
                                                        </a>
                                                    )}
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    <div>
                                                        <label className="block text-xs text-gray-500 dark:text-gray-300 mb-1">Amount (₹)</label>
                                                        <input 
                                                            type="number" 
                                                            value={inst.amount}
                                                            onChange={(e) => handleInstallmentChange(index, 'amount', e.target.value)}
                                                            className="w-full rounded border-gray-300 dark:border-gray-600 dark:bg-[#231A2E] text-sm p-1 border"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 dark:text-gray-300 mb-1">Date</label>
                                                        <input 
                                                            type="date" 
                                                            value={inst.date ? inst.date.substring(0,10) : ''}
                                                            onChange={(e) => handleInstallmentChange(index, 'date', e.target.value)}
                                                            className="w-full rounded border-gray-300 dark:border-gray-600 dark:bg-[#231A2E] text-sm p-1 border"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-xs text-gray-500 dark:text-gray-300 mb-1">Method</label>
                                                        <select 
                                                            value={inst.paymentMethod || 'Bank Transfer'}
                                                            onChange={(e) => handleInstallmentChange(index, 'paymentMethod', e.target.value)}
                                                            className="w-full rounded border-gray-300 dark:border-gray-600 dark:bg-[#231A2E] text-sm p-1 border"
                                                        >
                                                            <option value="Bank Transfer">Bank Transfer</option>
                                                            <option value="UPI">UPI</option>
                                                            <option value="Cash">Cash</option>
                                                            <option value="Cheque">Cheque</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 dark:text-gray-300 mb-1">Status</label>
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
                                                <div className="mt-2">
                                                    <label className="block text-xs text-gray-500 dark:text-gray-300 mb-1">Remarks</label>
                                                    <textarea 
                                                        value={inst.remarks || ''}
                                                        onChange={(e) => handleInstallmentChange(index, 'remarks', e.target.value)}
                                                        className="w-full rounded border-gray-300 dark:border-gray-600 dark:bg-[#231A2E] text-sm p-1 border"
                                                        rows="1"
                                                        placeholder="Notes or transaction ID..."
                                                    />
                                                </div>
                                                {inst.receiptUrl && (
                                                    <div className="mt-2 text-right">
                                                        <a href={inst.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#387B95] hover:text-blue-800 hover:underline inline-flex items-center">
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                            View Payment Slip
                                                        </a>
                                                    </div>
                                                )}
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
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-[#387B95] dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border font-semibold text-green-700"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">*Auto-calc from verified installments</p>
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-[#387B95] dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
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
                                    className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#D0E8F0] file:text-[#1D4B5E] hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200"
                                    accept="image/*,.pdf"
                                />
                                {selectedApp.financialStatus?.receiptUrl && !receiptFile && (
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">A receipt is already uploaded.</p>
                                )}
                            </div>
                        </div>
                        <div className="mt-6 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
                            <button
                                onClick={handlePrintReceipt}
                                className="px-4 py-2 text-sm font-medium text-[#1D4B5E] bg-[#D0E8F0] border border-blue-200 rounded-md hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 flex items-center shadow-sm"
                            >
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2zm5-17V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Print
                            </button>
                            <div className="flex space-x-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateFinancial}
                                    disabled={isUpdating}
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#387B95] border border-transparent rounded-md hover:bg-[#1D4B5E] disabled:opacity-50 flex items-center shadow-sm"
                                >
                                    {isUpdating ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
        </PaymentModalShell>
    );
};

export default PaymentManageModal;
