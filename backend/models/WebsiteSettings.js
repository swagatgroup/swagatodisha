const mongoose = require('mongoose');

const websiteSettingsSchema = new mongoose.Schema({
    // Contact Information
    contactInfo: {
        phone: { type: String, default: '+91 98765 43210' },
        whatsapp: { type: String, default: '+91 98765 43210' },
        email: { type: String, default: 'info@swagatodisha.com' },
        address: { type: String, default: 'Swagat Group of Institutions, Odisha' }
    },

    // Hero Section
    heroSection: {
        title: { type: String, default: 'Welcome to Swagat Group of Institutions' },
        subtitle: { type: String, default: 'Your Gateway to Quality Education' },
        backgroundImage: { type: String, default: '/images/hero-bg.jpg' },
        ctaText: { type: String, default: 'Apply Now' },
        ctaLink: { type: String, default: '/admission' }
    },

    // About Section
    aboutSection: {
        title: { type: String, default: 'About Swagat Group' },
        description: { type: String, default: 'We are committed to providing quality education and shaping the future of our students.' },
        image: { type: String, default: '/images/about.jpg' },
        features: [{
            title: String,
            description: String,
            icon: String
        }]
    },

    // Academic Programs
    academicPrograms: {
        title: { type: String, default: 'Our Programs' },
        programs: [{
            name: String,
            description: String,
            duration: String,
            eligibility: String,
            image: String
        }]
    },

    // Statistics
    statistics: {
        students: { type: String, default: '1000+' },
        courses: { type: String, default: '50+' },
        faculty: { type: String, default: '100+' },
        years: { type: String, default: '10+' }
    },

    // Admission Information
    admissionInfo: {
        title: { type: String, default: 'Admission Process' },
        steps: [{
            step: Number,
            title: String,
            description: String
        }],
        requirements: [String],
        documents: [String]
    },

    // Footer Information
    footer: {
        description: { type: String, default: 'Swagat Group of Institutions - Excellence in Education' },
        quickLinks: [{
            title: String,
            url: String
        }],
        socialMedia: {
            facebook: String,
            instagram: String,
            twitter: String,
            linkedin: String
        }
    },

    // SEO Settings
    seoSettings: {
        metaTitle: { type: String, default: 'Swagat Group of Institutions - Quality Education in Odisha' },
        metaDescription: { type: String, default: 'Join Swagat Group of Institutions for quality education and bright future.' },
        keywords: { type: String, default: 'education, college, university, odisha, swagat, admission' }
    },

    // Agent Information
    agentInfo: {
        title: { type: String, default: 'Become Our Agent' },
        description: { type: String, default: 'Join our network of educational agents and help students achieve their dreams.' },
        benefits: [String],
        commissionRate: { type: Number, default: 5 },
        requirements: [String]
    },

    // System Settings
    systemSettings: {
        maintenanceMode: { type: Boolean, default: false },
        allowRegistration: { type: Boolean, default: true },
        allowAgentRegistration: { type: Boolean, default: true },
        requireEmailVerification: { type: Boolean, default: false },
        maxFileSize: { type: Number, default: 5242880 }, // 5MB
        allowedFileTypes: { type: [String], default: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'] }
    }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteSettings', websiteSettingsSchema);
