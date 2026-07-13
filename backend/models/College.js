const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    feeType: {
        type: String,
        enum: ['Free', 'Paid'],
        default: 'Free'
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    campuses: [{
        name: {
            type: String,
            required: true,
            trim: true
        }
    }]
}, {
    timestamps: true
});

// Indexes
collegeSchema.index({ name: 1 });
collegeSchema.index({ isActive: 1 });
// Index on feeType
collegeSchema.index({ feeType: 1 });

module.exports = mongoose.model('College', collegeSchema);

