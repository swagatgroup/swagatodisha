const Payment = require('../models/Payment');
const User = require('../models/User');

// Get student payments
const getStudentPayments = async (req, res) => {
    try {
        console.log('Getting payments for student:', req.user._id);

        const { status, page = 1, limit = 20 } = req.query;
        const studentId = req.user._id;

        let query = { student: studentId };

        if (status) {
            query.status = status;
        }

        console.log('Payment query:', query);

        const payments = await Payment.find(query)
            .populate('student', 'fullName email')
            .sort({ paymentDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Payment.countDocuments(query);

        console.log('Found payments:', payments.length);

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
        console.error('Get student payments error:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to get payments',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Create new payment
const createPayment = async (req, res) => {
    try {
        console.log('Creating payment for student:', req.user._id);
        console.log('Payment data:', req.body);

        const { amount, paymentMethod, description, dueDate, feeType } = req.body;
        const studentId = req.user._id;

        // Generate transaction ID
        const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        const payment = new Payment({
            student: studentId,
            amount: parseFloat(amount),
            paymentMethod,
            description: description || feeType || 'Fee Payment',
            dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            transactionId,
            status: 'pending',
            paymentDate: new Date()
        });

        await payment.save();
        await payment.populate('student', 'fullName email');

        console.log('Payment created successfully:', payment._id);

        res.status(201).json({
            success: true,
            message: 'Payment created successfully',
            data: payment
        });
    } catch (error) {
        console.error('Create payment error:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to create payment',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { status, notes } = req.body;

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check if user owns this payment
        if (payment.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        payment.status = status;
        if (notes) {
            payment.notes = notes;
        }

        await payment.save();
        await payment.populate('student', 'fullName email');

        res.status(200).json({
            success: true,
            message: 'Payment status updated successfully',
            data: payment
        });
    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update payment status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findById(paymentId)
            .populate('student', 'fullName email');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check if user owns this payment
        if (payment.student._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        console.error('Get payment by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    getStudentPayments,
    createPayment,
    updatePaymentStatus,
    getPaymentById
};
