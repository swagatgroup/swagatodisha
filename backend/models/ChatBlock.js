const mongoose = require('mongoose');

// Set by the super admin only.
// scope 'admin': the person can no longer message the admin who blocked them.
// scope 'all':   the person is suspended from chat and cannot message anyone.
const chatBlockSchema = new mongoose.Schema({
    blocked: { type: mongoose.Schema.Types.ObjectId, refPath: 'blockedModel', required: true, unique: true },
    blockedModel: { type: String, enum: ['User', 'Admin'], required: true },
    blockedName: { type: String, default: '' },
    blockedRole: { type: String, default: '' },
    scope: { type: String, enum: ['admin', 'all'], required: true },
    reason: { type: String, default: '', maxlength: 300 },
    blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

module.exports = mongoose.model('ChatBlock', chatBlockSchema);
