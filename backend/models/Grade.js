const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    subject: {
        type: String,
        required: true,
        maxlength: [100, 'Subject cannot exceed 100 characters']
    },
    grade: {
        type: Number,
        required: true,
        min: [0, 'Grade cannot be negative'],
        max: [100, 'Grade cannot exceed 100']
    },
    maxGrade: {
        type: Number,
        default: 100
    },
    letterGrade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
        required: true
    },
    feedback: {
        type: String,
        maxlength: [1000, 'Feedback cannot exceed 1000 characters']
    },
    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gradedDate: {
        type: Date,
        default: Date.now
    },
    submittedDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better performance
gradeSchema.index({ student: 1, subject: 1 });
gradeSchema.index({ assignment: 1 });
gradeSchema.index({ gradedDate: -1 });

// Virtual for grade percentage
gradeSchema.virtual('percentage').get(function () {
    return ((this.grade / this.maxGrade) * 100).toFixed(1);
});

// Virtual for grade color
gradeSchema.virtual('gradeColor').get(function () {
    if (this.grade >= 90) return 'green';
    if (this.grade >= 80) return 'blue';
    if (this.grade >= 70) return 'yellow';
    if (this.grade >= 60) return 'orange';
    return 'red';
});

// Pre-save middleware to calculate letter grade
gradeSchema.pre('save', function (next) {
    if (this.grade >= 90) this.letterGrade = 'A+';
    else if (this.grade >= 80) this.letterGrade = 'A';
    else if (this.grade >= 70) this.letterGrade = 'B+';
    else if (this.grade >= 60) this.letterGrade = 'B';
    else if (this.grade >= 50) this.letterGrade = 'C+';
    else if (this.grade >= 40) this.letterGrade = 'C';
    else if (this.grade >= 30) this.letterGrade = 'D';
    else this.letterGrade = 'F';
    next();
});

// Static methods
gradeSchema.statics.getByStudent = function (studentId) {
    return this.find({ student: studentId, isActive: true })
        .populate('assignment', 'title subject')
        .populate('gradedBy', 'fullName')
        .sort({ gradedDate: -1 });
};

gradeSchema.statics.getBySubject = function (subject) {
    return this.find({ subject, isActive: true })
        .populate('student', 'fullName email')
        .populate('assignment', 'title')
        .sort({ gradedDate: -1 });
};

gradeSchema.statics.getAverageGrade = function (studentId, subject = null) {
    const query = { student: studentId, isActive: true };
    if (subject) query.subject = subject;

    return this.aggregate([
        { $match: query },
        { $group: { _id: null, average: { $avg: '$grade' } } }
    ]);
};

// Ensure virtual fields are serialized
gradeSchema.set('toJSON', { virtuals: true });
gradeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Grade', gradeSchema);
