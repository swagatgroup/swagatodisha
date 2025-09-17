const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
    // Basic information
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
    type: {
        type: String,
        required: true,
        enum: ['School', 'Higher Secondary School', 'Degree College', 'Management School', 'Engineering College', 'Polytechnic', 'B.Ed. College', 'Computer Academy']
    },
    subtitle: String,
    description: {
        type: String,
        required: true
    },

    // Location details
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: {
            type: String,
            default: 'India'
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },

    // Contact information
    contact: {
        phone: [String],
        email: [String],
        website: String,
        principal: {
            name: String,
            phone: String,
            email: String
        }
    },

    // Academic details
    academicInfo: {
        board: String, // CBSE, State Board, etc.
        affiliation: String,
        recognition: [String],
        establishedYear: Number,
        totalStudents: Number,
        totalTeachers: Number
    },

    // Fee structure (simplified - just final price)
    feeStructure: {
        totalFee: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: 'INR'
        },
        paymentOptions: [{
            type: String,
            enum: ['One Time', 'Monthly', 'Quarterly', 'Yearly', 'Semester']
        }]
    },

    // Courses offered
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],

    // Media
    images: [{
        url: String,
        alt: String,
        type: {
            type: String,
            enum: ['main', 'gallery', 'infrastructure', 'classroom', 'lab', 'library', 'sports']
        },
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],

    // Features and facilities
    facilities: [String],
    achievements: [String],
    awards: [String],

    // Status and visibility
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    displayOrder: {
        type: Number,
        default: 0
    },

    // Website integration
    hasWebsite: {
        type: Boolean,
        default: false
    },
    websiteUrl: String,

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
institutionSchema.index({ type: 1, isActive: 1 });
institutionSchema.index({ isFeatured: 1, isActive: 1 });
institutionSchema.index({ displayOrder: 1 });

module.exports = mongoose.model('Institution', institutionSchema);
