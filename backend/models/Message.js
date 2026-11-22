const mongoose = require('mongoose');

// Messages are never deleted. Students only see the last 24 hours of their
// chats (filtered on read); staff, agents and the super admin keep history.
const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel', required: true },
    senderModel: { type: String, enum: ['User', 'Admin'], required: true },
    senderRole: { type: String, required: true },
    senderName: { type: String, default: '' },
    text: { type: String, default: '', maxlength: 4000 },
    mediaUrl: { type: String, default: '' },
    mediaType: { type: String, enum: ['none', 'image', 'file'], default: 'none' },
    fileName: { type: String, default: '' },
    readBy: [{ type: mongoose.Schema.Types.ObjectId }],
    // Group events ("X added Y") shown centred in the thread
    system: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
    // Unsent messages keep their content in the database but are shown to
    // everyone as "This message was deleted"
    deletedAt: { type: Date, default: null }
}, { timestamps: { createdAt: true, updatedAt: false } });

messageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
