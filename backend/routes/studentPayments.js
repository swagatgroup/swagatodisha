const express = require('express');
const { protect } = require('../middleware/auth');
const {
    getStudentPayments,
    createPayment,
    updatePaymentStatus,
    getPaymentById
} = require('../controllers/paymentController');

const router = express.Router();

// All routes are protected
router.use(protect);

// Get student payments
router.get('/', getStudentPayments);

// Create new payment
router.post('/', createPayment);

// Get payment by ID
router.get('/:paymentId', getPaymentById);

// Update payment status
router.put('/:paymentId', updatePaymentStatus);

module.exports = router;
