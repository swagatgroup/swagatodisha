const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, refPath: 'userModel', required: true },
    userModel: { type: String, enum: ['User', 'Admin'], default: 'Admin' },
    // Calendar day in India time, YYYY-MM-DD
    date: { type: String, required: true },
    checkInTime: Date,
    checkOutTime: Date,
    checkInSelfieUrl: { type: String, default: '' },
    checkOutSelfieUrl: { type: String, default: '' },
    matchDistance: Number,
    checkOutMatchDistance: Number,
    status: { type: String, enum: ['Present', 'Half-Day', 'Absent'], default: 'Present' },
    isManual: { type: Boolean, default: false },
    note: { type: String, default: '', maxlength: 300 },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null }
}, { timestamps: true });

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
