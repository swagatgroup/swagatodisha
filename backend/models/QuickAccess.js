const mongoose = require('mongoose');

const quickAccessSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['timetable', 'notification', 'result'],
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    file: {
        type: String,
        required: true // PDF file path
    },
    fileName: {
        type: String,
        trim: true // Original filename
    },
    isActive: {
        type: Boolean,
        default: true
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    order: {
        type: Number,
        default: 0
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

// Add compound index
quickAccessSchema.index({ type: 1, isActive: 1, order: 1 });

module.exports = mongoose.model('QuickAccess', quickAccessSchema);

