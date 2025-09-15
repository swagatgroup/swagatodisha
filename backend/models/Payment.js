const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0, 'Amount cannot be negative']
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['online', 'bank_transfer', 'cash', 'cheque', 'upi', 'card']
    },
    description: {
        type: String,
        required: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    feeType: {
        type: String,
        enum: [
            'tuition_fee',
            'registration_fee',
            'examination_fee',
            'library_fee',
            'laboratory_fee',
            'hostel_fee',
            'transportation_fee',
            'other'
        ],
        default: 'other'
    },
    transactionId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
        default: 'pending'
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    processedDate: {
        type: Date
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    receiptUrl: {
        type: String
    },
    gatewayResponse: {
        type: mongoose.Schema.Types.Mixed
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better performance
paymentSchema.index({ student: 1, status: 1 });
paymentSchema.index({ transactionId: 1 }, { unique: true });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ dueDate: 1 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function () {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(this.amount);
});

// Virtual for payment status color
paymentSchema.virtual('statusColor').get(function () {
    const colors = {
        pending: 'yellow',
        processing: 'blue',
        completed: 'green',
        failed: 'red',
        cancelled: 'gray',
        refunded: 'purple'
    };
    return colors[this.status] || 'gray';
});

// Pre-save middleware
paymentSchema.pre('save', function (next) {
    if (this.status === 'completed' && !this.processedDate) {
        this.processedDate = new Date();
    }
    next();
});

// Instance methods
paymentSchema.methods.markAsCompleted = function (notes = '') {
    this.status = 'completed';
    this.processedDate = new Date();
    if (notes) {
        this.notes = notes;
    }
    return this.save();
};

paymentSchema.methods.markAsFailed = function (notes = '') {
    this.status = 'failed';
    if (notes) {
        this.notes = notes;
    }
    return this.save();
};

// Static methods
paymentSchema.statics.getByStudent = function (studentId) {
    return this.find({ student: studentId, isActive: true }).sort({ paymentDate: -1 });
};

paymentSchema.statics.getByStatus = function (status) {
    return this.find({ status, isActive: true }).populate('student', 'fullName email');
};

paymentSchema.statics.getOverduePayments = function () {
    return this.find({
        status: 'pending',
        dueDate: { $lt: new Date() },
        isActive: true
    }).populate('student', 'fullName email');
};

// Ensure virtual fields are serialized
paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Payment', paymentSchema);
