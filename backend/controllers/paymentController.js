const Student = require('../models/Student');
const Payment = require('../models/Payment');
const QRCode = require('qrcode');
const crypto = require('crypto');

// Generate payment QR code
const generatePaymentQR = async (req, res) => {
    try {
        const { amount } = req.body;
        const studentId = req.user._id;

        // Generate unique payment ID
        const paymentId = `PAY${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Create payment record
        const payment = new Payment({
            student: studentId,
            amount,
            paymentId,
            status: 'pending',
            paymentMethod: 'UPI',
            description: 'Student Admission Fee'
        });

        await payment.save();

        // Generate UPI payment string
        const upiId = process.env.UPI_ID || 'swagatodisha@paytm';
        const upiString = `upi://pay?pa=${upiId}&pn=Swagat%20Odisha&am=${amount}&cu=INR&tn=Student%20Admission%20Fee&tr=${paymentId}`;

        // Generate QR code
        const qrCode = await QRCode.toDataURL(upiString, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        res.status(200).json({
            success: true,
            data: {
                paymentId,
                amount,
                qrCode,
                upiString,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
            }
        });

    } catch (error) {
        console.error('Generate payment QR error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate payment QR',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Check payment status
const checkPaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findOne({ paymentId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // In a real implementation, you would check with the payment gateway
        // For now, we'll simulate payment verification
        const isPaymentVerified = await verifyPaymentWithGateway(paymentId);

        if (isPaymentVerified && payment.status === 'pending') {
            payment.status = 'completed';
            payment.completedAt = new Date();
            await payment.save();

            // Update student payment status
            await Student.findOneAndUpdate(
                { user: payment.student },
                {
                    $set: {
                        'paymentStatus.isPaid': true,
                        'paymentStatus.paidAmount': payment.amount,
                        'paymentStatus.paidAt': new Date()
                    }
                }
            );
        }

        res.status(200).json({
            success: true,
            data: {
                paymentId: payment.paymentId,
                amount: payment.amount,
                status: payment.status,
                createdAt: payment.createdAt,
                completedAt: payment.completedAt
            }
        });

    } catch (error) {
        console.error('Check payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check payment status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get payment history
const getPaymentHistory = async (req, res) => {
    try {
        const studentId = req.user._id;
        const { page = 1, limit = 20 } = req.query;

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
};

// Get payment info
const getPaymentInfo = async (req, res) => {
    try {
        const studentId = req.user._id;

        const student = await Student.findOne({ user: studentId });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Calculate total amount based on course
        const courseFees = {
            'B.Tech Computer Science': 50000,
            'B.Tech Mechanical Engineering': 45000,
            'B.Tech Electrical Engineering': 45000,
            'B.Tech Civil Engineering': 40000,
            'MBA': 60000,
            'BCA': 30000,
            'MCA': 35000,
            'B.Com': 25000,
            'M.Com': 30000,
            'BA': 20000,
            'MA English': 25000,
            'BSc Mathematics': 25000,
            'MSc Physics': 30000,
            'BSc Chemistry': 25000,
            'MSc Chemistry': 30000,
            'BSc Biology': 25000,
            'MSc Biology': 30000,
            'BBA': 35000,
            'BHM': 40000,
            'BPT': 45000,
            'MPT': 50000,
            'B.Pharm': 55000,
            'M.Pharm': 60000,
            'BDS': 80000,
            'MDS': 100000,
            'MBBS': 120000,
            'MD': 150000,
            'B.Sc Nursing': 40000,
            'M.Sc Nursing': 50000,
            'Diploma in Engineering': 30000,
            'Diploma in Pharmacy': 25000,
            'Certificate Courses': 15000
        };

        const courseFee = courseFees[student.courseDetails?.selectedCourse] || 30000;
        const totalAmount = courseFee;

        res.status(200).json({
            success: true,
            data: {
                amount: totalAmount,
                studentId: student.studentId,
                course: student.courseDetails?.selectedCourse,
                paymentStatus: student.paymentStatus || { isPaid: false, paidAmount: 0 }
            }
        });

    } catch (error) {
        console.error('Get payment info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment info',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Generate payment receipt
const generatePaymentReceipt = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findOne({ paymentId }).populate('student', 'fullName email phoneNumber');
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // In a real implementation, you would generate a PDF receipt
        // For now, we'll return payment details
        const receiptData = {
            paymentId: payment.paymentId,
            amount: payment.amount,
            studentName: payment.student.fullName,
            studentEmail: payment.student.email,
            studentPhone: payment.student.phoneNumber,
            paymentDate: payment.completedAt || payment.createdAt,
            status: payment.status,
            description: payment.description
        };

        res.status(200).json({
            success: true,
            data: receiptData
        });

    } catch (error) {
        console.error('Generate payment receipt error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate payment receipt',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Verify payment with gateway (simulated)
const verifyPaymentWithGateway = async (paymentId) => {
    // In a real implementation, this would call the actual payment gateway API
    // For simulation, we'll return true after a random delay
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate 80% success rate
            resolve(Math.random() > 0.2);
        }, 2000);
    });
};

// Webhook for payment gateway notifications
const paymentWebhook = async (req, res) => {
    try {
        const { paymentId, status, transactionId, amount } = req.body;

        // Verify webhook signature (implement based on your payment gateway)
        const isValidWebhook = verifyWebhookSignature(req);
        if (!isValidWebhook) {
            return res.status(401).json({
                success: false,
                message: 'Invalid webhook signature'
            });
        }

        const payment = await Payment.findOne({ paymentId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Update payment status
        payment.status = status === 'success' ? 'completed' : 'failed';
        payment.transactionId = transactionId;
        payment.completedAt = new Date();
        await payment.save();

        // Update student payment status
        if (status === 'success') {
            await Student.findOneAndUpdate(
                { user: payment.student },
                {
                    $set: {
                        'paymentStatus.isPaid': true,
                        'paymentStatus.paidAmount': amount,
                        'paymentStatus.paidAt': new Date()
                    }
                }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Webhook processed successfully'
        });

    } catch (error) {
        console.error('Payment webhook error:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook processing failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Verify webhook signature
const verifyWebhookSignature = (req) => {
    // Implement webhook signature verification based on your payment gateway
    // This is a placeholder implementation
    return true;
};

module.exports = {
    generatePaymentQR,
    checkPaymentStatus,
    getPaymentHistory,
    getPaymentInfo,
    generatePaymentReceipt,
    paymentWebhook
};