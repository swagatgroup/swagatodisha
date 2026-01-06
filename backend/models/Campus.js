const mongoose = require('mongoose');

const campusSchema = new mongoose.Schema({
    college: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: false,
        trim: true,
        sparse: true, // Allows multiple null values
        uppercase: true
    },
    description: {
        type: String,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: {
            type: String,
            default: 'India'
        }
    },
    contact: {
        phone: [String],
        email: [String]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Indexes
campusSchema.index({ isActive: 1 });
campusSchema.index({ college: 1, isActive: 1 });

// Ensure unique campus name per college
campusSchema.index({ college: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Campus', campusSchema);

