const mongoose = require('mongoose');

const websiteContentSchema = new mongoose.Schema({
    // Basic site information
    siteName: {
        type: String,
        default: 'Swagat Group of Institutions'
    },
    siteDescription: {
        type: String,
        default: 'Education • Innovation • Revolution'
    },
    siteLogo: {
        type: String,
        default: '/Swagat_Logo.png'
    },
    siteFavicon: {
        type: String,
        default: '/Swagat_Favicon.png'
    },

    // Contact information
    contactInfo: {
        phone: {
            type: String,
            default: '+91 9403891555'
        },
        email: {
            type: String,
            default: 'contact@swagatodisha.com'
        },
        address: {
            type: String,
            default: 'Sargiguda, PO - Sargul, PS - Kantabanji, Balangir, Odisha, 767039'
        },
        mapUrl: {
            type: String,
            default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3751.430049734715!2d83.151755749193!3d19.906274586551355!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a24e934ac5f21a3%3A0x163989ed75231f8d!2sswagat%20institute!5e0!3m2!1sen!2sin!4v1653113592392!5m2!1sen!2sin'
        }
    },

    // Social media links
    socialLinks: {
        facebook: {
            type: String,
            default: 'https://www.facebook.com/Swagat-Group-of-Institutions-108863395171576'
        },
        twitter: {
            type: String,
            default: 'https://twitter.com/SwagatOdisha'
        },
        instagram: {
            type: String,
            default: 'https://instagram.com/Swagat_Odisha'
        },
        youtube: {
            type: String,
            default: 'https://youtube.com/channel/UCQ5GY_dOSPmyhOeUkq61R1w'
        },
        linkedin: {
            type: String,
            default: 'https://Linkedin.com/in/SwagatOdisha'
        }
    },

    // Navigation items
    navigationItems: [{
        name: String,
        href: String,
        icon: String,
        order: Number,
        isActive: {
            type: Boolean,
            default: true
        }
    }],

    // Hero carousel images
    heroCarousel: [{
        image: String,
        title: String,
        subtitle: String,
        order: Number,
        isActive: {
            type: Boolean,
            default: true
        }
    }],

    // Quick links
    quickLinks: [{
        name: String,
        icon: String,
        href: String,
        color: String,
        order: Number,
        isActive: {
            type: Boolean,
            default: true
        }
    }],

    // Management team
    managementTeam: [{
        name: String,
        position: String,
        image: String,
        bio: String,
        order: Number,
        isActive: {
            type: Boolean,
            default: true
        }
    }],

    // Chairman message
    chairmanMessage: {
        name: String,
        position: String,
        image: String,
        message: String,
        isActive: {
            type: Boolean,
            default: true
        }
    },

    // Milestone
    milestone: {
        year: String,
        title: String,
        image: String,
        description: String,
        isActive: {
            type: Boolean,
            default: true
        }
    },

    // Footer content
    footerContent: {
        aboutText: String,
        copyrightText: String,
        disclaimerText: String
    },

    // SEO settings
    seoSettings: {
        metaTitle: String,
        metaDescription: String,
        metaKeywords: [String],
        ogTitle: String,
        ogDescription: String,
        ogImage: String
    },

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

// Ensure only one document exists
websiteContentSchema.statics.getContent = async function () {
    let content = await this.findOne();
    if (!content) {
        content = new this();
        await content.save();
    }
    return content;
};

module.exports = mongoose.model('WebsiteContent', websiteContentSchema);
