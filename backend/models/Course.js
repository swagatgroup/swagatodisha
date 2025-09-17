const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    // Basic course information
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        maxlength: 200
    },

    // Course details
    institutionType: {
        type: String,
        required: true,
        enum: ['School', 'Higher Secondary School', 'Degree College', 'Management School', 'Engineering College', 'Polytechnic', 'B.Ed. College', 'Computer Academy']
    },
    level: {
        type: String,
        required: true,
        enum: ['Primary', 'Secondary', 'Higher Secondary', 'Graduate', 'Post Graduate', 'Diploma', 'Certificate']
    },
    duration: {
        type: String,
        required: true // e.g., "3 Years", "2 Years", "1 Year"
    },
    eligibility: {
        type: String,
        required: true
    },

    // Pricing
    pricing: {
        totalFee: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: 'INR'
        },
        feeBreakdown: {
            admissionFee: Number,
            tuitionFee: Number,
            otherCharges: Number,
            examFee: Number,
            libraryFee: Number,
            labFee: Number
        },
        paymentOptions: [{
            type: String,
            enum: ['One Time', 'Monthly', 'Quarterly', 'Yearly', 'Semester']
        }],
        discountAvailable: {
            type: Boolean,
            default: false
        },
        discountPercentage: {
            type: Number,
            default: 0
        }
    },

    // Course features
    features: [String],
    highlights: [String],
    careerProspects: [String],

    // Media
    images: [{
        url: String,
        alt: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    brochure: String, // PDF file path

    // Status and visibility
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    displayOrder: {
        type: Number,
        default: 0
    },

    // SEO
    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],

    // Timestamps
    lastModified: {
        type: Date,
        default: Date.now
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Indexes
courseSchema.index({ institutionType: 1, isActive: 1 });
courseSchema.index({ isFeatured: 1, isActive: 1 });
courseSchema.index({ displayOrder: 1 });

module.exports = mongoose.model('Course', courseSchema);
