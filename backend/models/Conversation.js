const mongoose = require('mongoose');

// Students/agents live in User, staff/super admins live in Admin, so every
// participant records which collection it belongs to.
const participantSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, refPath: 'participants.model', required: true },
    model: { type: String, enum: ['User', 'Admin'], required: true },
    role: { type: String, required: true }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
    participants: { type: [participantSchema], required: true },
    // Sorted "id:id" string so a pair of people only ever has one conversation
    pairKey: { type: String, required: true, unique: true },
    hasStudent: { type: Boolean, default: false },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
    lastMessageAt: { type: Date, default: Date.now },
    unreadCounts: { type: Map, of: Number, default: {} }
}, { timestamps: true });

conversationSchema.index({ 'participants.user': 1, lastMessageAt: -1 });
conversationSchema.index({ hasStudent: 1, lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
