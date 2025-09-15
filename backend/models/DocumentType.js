const mongoose = require('mongoose');

const documentTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    code: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        unique: true
    },
    category: {
        type: String,
        enum: ['MANDATORY', 'CONDITIONAL', 'OPTIONAL', 'CUSTOM'],
        required: true
    },
    required: {
        type: Boolean,
        default: false
    },
    maxSizeMb: {
        type: Number,
        default: 5
    },
    allowedFormats: {
        type: [String],
        default: ['pdf', 'jpg', 'jpeg', 'png']
    },
    validityPeriod: {
        type: String, // e.g., '1_YEAR', '5_YEARS'
        default: null
    },
    validationRules: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    options: {
        type: mongoose.Schema.Types.Mixed, // supports FLEXIBLE types/options
        default: {}
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

documentTypeSchema.index({ category: 1, isActive: 1 });
documentTypeSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model('DocumentType', documentTypeSchema);


