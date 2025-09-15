const express = require('express');
const { protect } = require('../middleware/auth');
const {
    getPaymentHistory,
    generatePaymentQR,
    checkPaymentStatus,
    getPaymentInfo,
    generatePaymentReceipt
} = require('../controllers/paymentController');

const router = express.Router();

// All routes are protected
router.use(protect);

// Get payment history
router.get('/', getPaymentHistory);

// Get payment info (amount, course fees, etc.)
router.get('/info', getPaymentInfo);

// Generate payment QR code
router.post('/generate-qr', generatePaymentQR);

// Check payment status
router.get('/status/:paymentId', checkPaymentStatus);

// Generate payment receipt
router.get('/receipt/:paymentId', generatePaymentReceipt);

module.exports = router;
