const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
    // Basic information
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: String,

    // QR Code details
    qrCodeImage: {
        type: String,
        required: true
    },
    qrCodeData: {
        type: String,
        required: true
    },
    qrCodeType: {
        type: String,
        enum: ['URL', 'Text', 'Email', 'Phone', 'SMS', 'WiFi', 'Location', 'Event', 'Contact'],
        default: 'URL'
    },

    // Target information
    targetUrl: String,
    targetText: String,
    targetEmail: String,
    targetPhone: String,
    targetSms: String,
    wifiDetails: {
        ssid: String,
        password: String,
        security: String
    },
    locationDetails: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    contactDetails: {
        name: String,
        phone: String,
        email: String,
        organization: String
    },

    // Display settings
    isActive: {
        type: Boolean,
        default: true
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    showOnHomepage: {
        type: Boolean,
        default: false
    },

    // Usage tracking
    scanCount: {
        type: Number,
        default: 0
    },
    lastScanned: Date,

    // Institution association
    institution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution'
    },

    // Timestamps
    lastModified: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Indexes
qrCodeSchema.index({ isActive: 1, displayOrder: 1 });
qrCodeSchema.index({ institution: 1, isActive: 1 });
qrCodeSchema.index({ qrCodeType: 1 });

// Method to increment scan count
qrCodeSchema.methods.incrementScanCount = function () {
    this.scanCount += 1;
    this.lastScanned = new Date();
    return this.save();
};

module.exports = mongoose.model('QRCode', qrCodeSchema);
