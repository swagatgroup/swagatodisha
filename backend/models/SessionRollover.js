const mongoose = require('mongoose');

// One document per session rollover run (scheduled or manual): an audit log and a lock.
const sessionRolloverSchema = new mongoose.Schema({
    session: { type: Number, required: true }, // session rolled into, e.g. 2027
    trigger: { type: String, enum: ['scheduler', 'manual'], required: true },
    runBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    status: { type: String, enum: ['RUNNING', 'DONE', 'FAILED'], default: 'RUNNING' },
    // true only while running; the unique partial index allows one run at a time
    lock: { type: Boolean },
    counts: {
        promoted: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        skippedDiscontinued: { type: Number, default: 0 },
        skippedNoDuration: { type: Number, default: 0 },
        skippedStale: { type: Number, default: 0 }
    },
    error: String,
    startedAt: Date,
    finishedAt: Date
}, {
    timestamps: true
});

sessionRolloverSchema.index({ lock: 1 }, { unique: true, partialFilterExpression: { lock: true } });
sessionRolloverSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SessionRollover', sessionRolloverSchema);
