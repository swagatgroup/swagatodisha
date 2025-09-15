const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Payment = require('../models/Payment');
const Student = require('../models/Student');

// Generate QR code for payment
router.post('/generate-qr/:studentId', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { amount, description, metadata } = req.body;

        // Verify student exists and user has access
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check if user has permission to generate payment for this student
        if (req.user.role === 'student' && student.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Create payment record
        const payment = new Payment({
            student: studentId,
            amount: amount || 50000, // Default amount
            description: description || 'Course Fee Payment',
            metadata: metadata || {
                course: student.courseDetails?.selectedCourse,
                academicYear: new Date().getFullYear()
            }
        });

        await payment.save();

        // Generate QR code
        const qrData = payment.generateQRCode();
        await payment.save();

        res.status(201).json({
            success: true,
            data: {
                paymentId: payment._id,
                transactionId: payment.transactionId,
                amount: payment.amount,
                qrCodeData: qrData,
                qrCodeUrl: payment.qrCodeUrl,
                expiryTime: payment.expiryTime,
                description: payment.description
            }
        });

    } catch (error) {
        console.error('Generate QR code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate QR code',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Payment gateway callback
router.post('/callback', async (req, res) => {
    try {
        const { transactionId, status, gatewayResponse } = req.body;

        const payment = await Payment.findOne({ transactionId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        if (status === 'success') {
            await payment.markAsCompleted(gatewayResponse);

            // Update student payment status
            await Student.findByIdAndUpdate(payment.student, {
                $set: {
                    'paymentStatus.isPaid': true,
                    'paymentStatus.paymentDate': new Date(),
                    'paymentStatus.transactionId': transactionId
                }
            });

            // Send notification
            const { sendNotification } = require('../utils/notificationService');
            await sendNotification({
                type: 'payment_success',
                recipient: payment.student,
                title: 'Payment Successful',
                message: `Your payment of ₹${payment.amount} has been processed successfully.`,
                data: { transactionId, amount: payment.amount }
            });

        } else if (status === 'failed') {
            await payment.markAsFailed(gatewayResponse);
        }

        res.status(200).json({
            success: true,
            message: 'Payment status updated successfully'
        });

    } catch (error) {
        console.error('Payment callback error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process payment callback',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get payment status
router.get('/status/:paymentId', protect, async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findById(paymentId).populate('student', 'studentId personalDetails.fullName');
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check access permissions
        if (req.user.role === 'student' && payment.student.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                paymentId: payment._id,
                transactionId: payment.transactionId,
                amount: payment.amount,
                status: payment.status,
                paymentDate: payment.paymentDate,
                description: payment.description,
                qrCodeUrl: payment.qrCodeUrl,
                expiryTime: payment.expiryTime,
                student: {
                    studentId: payment.student.studentId,
                    name: payment.student.personalDetails?.fullName
                }
            }
        });

    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Download payment receipt
router.get('/receipt/:paymentId', protect, async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findById(paymentId).populate('student', 'studentId personalDetails.fullName');
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check access permissions
        if (req.user.role === 'student' && payment.student.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (payment.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Receipt is only available for completed payments'
            });
        }

        // Generate receipt data
        const receiptData = {
            paymentId: payment._id,
            transactionId: payment.transactionId,
            amount: payment.amount,
            paymentDate: payment.paymentDate,
            studentName: payment.student.personalDetails?.fullName,
            studentId: payment.student.studentId,
            course: payment.metadata?.course,
            academicYear: payment.metadata?.academicYear,
            description: payment.description
        };

        // In a real implementation, you would generate a PDF here
        res.status(200).json({
            success: true,
            data: {
                receiptUrl: `${process.env.BASE_URL}/api/payments/receipt-pdf/${paymentId}`,
                receiptData
            }
        });

    } catch (error) {
        console.error('Get payment receipt error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment receipt',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get payment history for a student
router.get('/history/:studentId', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Verify student exists and user has access
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check access permissions
        if (req.user.role === 'student' && student.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const payments = await Payment.find({ student: studentId })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Payment.countDocuments({ student: studentId });

        res.status(200).json({
            success: true,
            data: {
                payments,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment history',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Process refund
router.post('/refund/:paymentId', protect, async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { refundAmount, reason } = req.body;

        // Only staff and admin can process refunds
        if (!['staff', 'admin', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        if (payment.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Only completed payments can be refunded'
            });
        }

        await payment.processRefund(refundAmount, reason);

        res.status(200).json({
            success: true,
            message: 'Refund processed successfully',
            data: {
                refundId: payment.refundDetails.refundId,
                refundAmount: payment.refundDetails.refundAmount,
                refundDate: payment.refundDetails.refundDate
            }
        });

    } catch (error) {
        console.error('Process refund error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process refund',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get payment statistics
router.get('/stats', protect, async (req, res) => {
    try {
        // Only staff and admin can view payment stats
        if (!['staff', 'admin', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const stats = await Payment.getPaymentStats();

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Get payment stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;