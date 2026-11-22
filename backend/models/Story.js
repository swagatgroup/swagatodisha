const mongoose = require('mongoose');

// 24-hour status updates. MongoDB removes them once expiresAt passes.
const storySchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, refPath: 'authorModel', required: true },
    authorModel: { type: String, enum: ['User', 'Admin'], required: true },
    authorRole: { type: String, required: true },
    authorName: { type: String, default: '' },
    text: { type: String, default: '', maxlength: 700 },
    bg: { type: String, default: '#0E1A3D' },
    mediaUrl: { type: String, default: '' },
    mediaType: { type: String, enum: ['none', 'image'], default: 'none' },
    viewers: [{
        _id: false,
        user: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, default: '' },
        at: { type: Date, default: Date.now }
    }],
    expiresAt: { type: Date, required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
storySchema.index({ author: 1, createdAt: 1 });

module.exports = mongoose.model('Story', storySchema);
