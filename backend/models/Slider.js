const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        required: true // Will store Cloudinary URL or local path
    },
    cloudinaryPublicId: {
        type: String,
        default: null // Cloudinary public ID for deletion
    },
    order: {
        type: Number,
        default: 0 // For sorting sliders
    },
    isActive: {
        type: Boolean,
        default: true
    },
    link: {
        type: String,
        trim: true // Optional link when slider is clicked
    },
    sliderType: {
        type: String,
        enum: ['horizontal', 'vertical'],
        required: true,
        default: 'horizontal' // Horizontal for screens >1000px, vertical for <1000px
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

// Add index for faster queries
sliderSchema.index({ order: 1, isActive: 1 });
sliderSchema.index({ sliderType: 1, isActive: 1 });

module.exports = mongoose.model('Slider', sliderSchema);

