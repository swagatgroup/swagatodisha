const mongoose = require('mongoose');

// When each person (User or Admin id) was last connected to chat
const lastSeenSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    at: { type: Date, required: true }
}, { versionKey: false });

module.exports = mongoose.model('LastSeen', lastSeenSchema);
