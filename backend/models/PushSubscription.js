const mongoose = require('mongoose');

// One row per browser/device that turned on chat notifications
const pushSubscriptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    role: { type: String, default: '' },
    endpoint: { type: String, required: true, unique: true, maxlength: 1000 },
    keys: {
        p256dh: { type: String, required: true, maxlength: 200 },
        auth: { type: String, required: true, maxlength: 100 }
    },
    userAgent: { type: String, default: '', maxlength: 300 }
}, { timestamps: true });

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);
