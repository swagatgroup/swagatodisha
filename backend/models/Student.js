const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    // Reference to User
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    // Basic Academic Information
    studentId: {
        type: String,
        unique: true,
        sparse: true, // Allow multiple null values during creation
        required: false // Will be auto-generated
    },
    course: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                const validCourses = [
                    "B.Tech Computer Science",
                    "B.Tech Mechanical Engineering",
                    "B.Tech Electrical Engineering",
                    "B.Tech Civil Engineering",
                    "MBA",
                    "BCA",
                    "MCA",
                    "B.Com",
                    "M.Com",
                    "BA",
                    "MA English",
                    "BSc Mathematics",
                    "MSc Physics"
                ];
                return validCourses.includes(v);
            },
            message: 'Please select a valid course from the dropdown'
        }
    },

    // Profile Status
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },

    // Agent Information (if applicable)
    agentReferral: {
        agent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        referralCode: String,
        commissionPercentage: {
            type: Number,
            default: 0
        }
    },

    // Aadhar Number (optional, for profile completion)
    aadharNumber: {
        type: String,
        unique: true,
        sparse: true, // Allow multiple null values
        required: false
    },

    // Audit Fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Pre-save middleware to generate student ID
studentSchema.pre('save', async function (next) {
    if (this.isNew && !this.studentId) {
        let studentId;
        let isUnique = false;

        // Keep generating until we get a unique ID
        while (!isUnique) {
            const year = new Date().getFullYear().toString().substr(-2);
            const random = Math.random().toString().substr(2, 4);
            studentId = `ST${year}${random}`;

            // Check if this ID already exists
            const existingStudent = await this.constructor.findOne({ studentId });
            if (!existingStudent) {
                isUnique = true;
            }
        }

        this.studentId = studentId;
    }
    next();
});

// Basic indexes
studentSchema.index({ studentId: 1 });
studentSchema.index({ status: 1 });

module.exports = mongoose.model('Student', studentSchema);