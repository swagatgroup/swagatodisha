const mongoose = require('mongoose');

const collegeCourseSchema = new mongoose.Schema({
    college: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: true
    },
    courseName: {
        type: String,
        required: true,
        trim: true
    },
    courseCode: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        default: 0,
        min: 0
    },
    isPaidOnly: {
        type: Boolean,
        default: false
    },
    // BOARD courses run in sessions, UNIVERSITY courses in semesters.
    // Not schema-required: courses created before this field have no category until an admin sets it.
    category: {
        type: String,
        enum: ['BOARD', 'UNIVERSITY']
    },
    sessions: [{
        type: String,
        trim: true
    }],
    semesters: {
        type: Number,
        min: 1
    },
    // Course length; the session rollover marks students COMPLETED after their final year
    durationYears: {
        type: Number,
        min: 1
    },
    // Missing on older courses = UNLIMITED. seatLimit applies per batch (registration year).
    seatType: {
        type: String,
        enum: ['LIMITED', 'UNLIMITED']
    },
    seatLimit: {
        type: Number,
        min: 1
    },
    streams: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        price: {
            type: Number,
            default: 0,
            min: 0
        },
        isPaidOnly: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    isActive: {
        type: Boolean,
        default: true
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

// Indexes
collegeCourseSchema.index({ college: 1, isActive: 1 });

// Ensure unique course name per college
collegeCourseSchema.index({ college: 1, courseName: 1 }, { unique: true });

collegeCourseSchema.plugin(require('../utils/uppercaseText'));

module.exports = mongoose.model('CollegeCourse', collegeCourseSchema);

