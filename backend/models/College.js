const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
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

module.exports = mongoose.model('College', collegeSchema);

