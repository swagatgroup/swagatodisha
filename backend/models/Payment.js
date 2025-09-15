const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    paymentMethod: {
        type: String,
        enum: ['UPI_QR', 'UPI', 'CARD', 'NET_BANKING', 'WALLET', 'CASH'],
        default: 'UPI_QR'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
        default: 'pending'
    },
    receiptUrl: {
        type: String,
        default: null
    },
    paymentDate: {
        type: Date,
        default: null
    },
    gatewayResponse: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    refundDetails: {
        refundId: String,
        refundAmount: Number,
        refundDate: Date,
        refundReason: String
    },
    qrCodeData: {
        type: String,
        default: null
    },
    qrCodeUrl: {
        type: String,
        default: null
    },
    expiryTime: {
        type: Date,
        default: function () {
            return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
        }
    },
    description: {
        type: String,
        default: 'Course Fee Payment'
    },
    metadata: {
        course: String,
        semester: String,
        academicYear: String,
        additionalFees: [{
            name: String,
            amount: Number
        }]
    }
}, {
    timestamps: true
});

// Indexes for better performance
paymentSchema.index({ student: 1, status: 1 });
// transactionId index is already defined in schema with unique: true
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// Instance methods
paymentSchema.methods.generateQRCode = function () {
    // This would integrate with a QR code generation service
    const qrData = {
        merchantId: process.env.MERCHANT_ID,
        amount: this.amount,
        transactionId: this.transactionId,
        description: this.description,
        studentId: this.student
    };

    this.qrCodeData = JSON.stringify(qrData);
    this.qrCodeUrl = `${process.env.BASE_URL}/api/payments/qr/${this._id}`;

    return this.qrCodeData;
};

paymentSchema.methods.markAsCompleted = function (gatewayResponse) {
    this.status = 'completed';
    this.paymentDate = new Date();
    this.gatewayResponse = gatewayResponse;
    return this.save();
};

paymentSchema.methods.markAsFailed = function (gatewayResponse) {
    this.status = 'failed';
    this.gatewayResponse = gatewayResponse;
    return this.save();
};

paymentSchema.methods.processRefund = function (refundAmount, reason) {
    this.status = 'refunded';
    this.refundDetails = {
        refundId: `REF${Date.now()}`,
        refundAmount: refundAmount || this.amount,
        refundDate: new Date(),
        refundReason: reason
    };
    return this.save();
};

// Static methods
paymentSchema.statics.generateTransactionId = function () {
    return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

paymentSchema.statics.getByStudent = function (studentId) {
    return this.find({ student: studentId }).sort({ createdAt: -1 });
};

paymentSchema.statics.getByStatus = function (status) {
    return this.find({ status }).sort({ createdAt: -1 });
};

paymentSchema.statics.getPendingPayments = function () {
    return this.find({
        status: 'pending',
        expiryTime: { $gt: new Date() }
    }).sort({ createdAt: -1 });
};

paymentSchema.statics.getExpiredPayments = function () {
    return this.find({
        status: 'pending',
        expiryTime: { $lte: new Date() }
    });
};

paymentSchema.statics.getPaymentStats = async function () {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
            }
        }
    ]);

    const totalPayments = await this.countDocuments();
    const totalAmount = await this.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    return {
        byStatus: stats.reduce((acc, item) => {
            acc[item._id] = {
                count: item.count,
                totalAmount: item.totalAmount
            };
            return acc;
        }, {}),
        totalPayments,
        totalAmount: totalAmount[0]?.total || 0
    };
};

// Pre-save middleware
paymentSchema.pre('save', function (next) {
    if (this.isNew && !this.transactionId) {
        this.transactionId = this.constructor.generateTransactionId();
    }
    next();
});

module.exports = mongoose.model('Payment', paymentSchema);