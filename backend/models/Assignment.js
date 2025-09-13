const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    subject: {
        type: String,
        required: true,
        maxlength: [100, 'Subject cannot exceed 100 characters']
    },
    instructions: {
        type: String,
        maxlength: [2000, 'Instructions cannot exceed 2000 characters']
    },
    dueDate: {
        type: Date,
        required: true
    },
    points: {
        type: Number,
        required: true,
        min: [0, 'Points cannot be negative']
    },
    status: {
        type: String,
        enum: ['pending', 'submitted', 'graded', 'late'],
        default: 'pending'
    },
    submissionData: {
        type: String
    },
    submittedFiles: [{
        fileName: String,
        fileUrl: String,
        fileSize: Number
    }],
    submittedDate: {
        type: Date
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    gradedDate: {
        type: Date
    },
    grade: {
        type: Number,
        min: [0, 'Grade cannot be negative'],
        max: [100, 'Grade cannot exceed 100']
    },
    feedback: {
        type: String,
        maxlength: [1000, 'Feedback cannot exceed 1000 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better performance
assignmentSchema.index({ student: 1, status: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ subject: 1 });

// Virtual for status color
assignmentSchema.virtual('statusColor').get(function () {
    const colors = {
        pending: 'yellow',
        submitted: 'blue',
        graded: 'green',
        late: 'red'
    };
    return colors[this.status] || 'gray';
});

// Virtual for formatted due date
assignmentSchema.virtual('formattedDueDate').get(function () {
    return this.dueDate.toLocaleDateString('en-IN');
});

// Instance methods
assignmentSchema.methods.submit = function (submissionData, submittedBy) {
    this.status = new Date() > this.dueDate ? 'late' : 'submitted';
    this.submissionData = submissionData;
    this.submittedDate = new Date();
    this.submittedBy = submittedBy;
    return this.save();
};

assignmentSchema.methods.grade = function (grade, feedback, gradedBy) {
    this.status = 'graded';
    this.grade = grade;
    this.feedback = feedback;
    this.gradedBy = gradedBy;
    this.gradedDate = new Date();
    return this.save();
};

// Static methods
assignmentSchema.statics.getByStudent = function (studentId) {
    return this.find({ student: studentId, isActive: true }).sort({ dueDate: -1 });
};

assignmentSchema.statics.getByStatus = function (status) {
    return this.find({ status, isActive: true }).populate('student', 'fullName email');
};

assignmentSchema.statics.getOverdueAssignments = function () {
    return this.find({
        status: 'pending',
        dueDate: { $lt: new Date() },
        isActive: true
    }).populate('student', 'fullName email');
};

// Ensure virtual fields are serialized
assignmentSchema.set('toJSON', { virtuals: true });
assignmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
