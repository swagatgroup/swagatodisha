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
    isActive: {
        type: Boolean,
        default: true
    },
    displayOrder: {
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

// Indexes
collegeCourseSchema.index({ college: 1, isActive: 1 });
collegeCourseSchema.index({ college: 1, displayOrder: 1 });

// Ensure unique course name per college
collegeCourseSchema.index({ college: 1, courseName: 1 }, { unique: true });

module.exports = mongoose.model('CollegeCourse', collegeCourseSchema);

