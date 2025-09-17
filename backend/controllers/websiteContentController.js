const WebsiteContent = require('../models/WebsiteContent');

// Get website content
const getWebsiteContent = async (req, res) => {
    try {
        const content = await WebsiteContent.getContent();

        res.status(200).json({
            success: true,
            data: content
        });
    } catch (error) {
        console.error('Get website content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get website content',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update website content
const updateWebsiteContent = async (req, res) => {
    try {
        const updateData = req.body;
        updateData.lastModified = new Date();
        updateData.modifiedBy = req.user._id;

        let content = await WebsiteContent.findOne();

        if (!content) {
            content = new WebsiteContent(updateData);
        } else {
            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined) {
                    content[key] = updateData[key];
                }
            });
        }

        await content.save();

        res.status(200).json({
            success: true,
            message: 'Website content updated successfully',
            data: content
        });
    } catch (error) {
        console.error('Update website content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update website content',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update specific section
const updateSection = async (req, res) => {
    try {
        const { section } = req.params;
        const sectionData = req.body;

        const content = await WebsiteContent.getContent();

        if (content[section] !== undefined) {
            content[section] = sectionData;
            content.lastModified = new Date();
            content.modifiedBy = req.user._id;

            await content.save();

            res.status(200).json({
                success: true,
                message: `${section} updated successfully`,
                data: content
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid section name'
            });
        }
    } catch (error) {
        console.error('Update section error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update section',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Reset to defaults
const resetToDefaults = async (req, res) => {
    try {
        const content = await WebsiteContent.getContent();

        // Reset to default values
        content.siteName = 'Swagat Group of Institutions';
        content.siteDescription = 'Education • Innovation • Revolution';
        content.siteLogo = '/Swagat_Logo.png';
        content.siteFavicon = '/Swagat_Favicon.png';

        content.contactInfo = {
            phone: '+91 9403891555',
            email: 'contact@swagatodisha.com',
            address: 'Sargiguda, PO - Sargul, PS - Kantabanji, Balangir, Odisha, 767039',
            mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3751.430049734715!2d83.151755749193!3d19.906274586551355!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a24e934ac5f21a3%3A0x163989ed75231f8d!2sswagat%20institute!5e0!3m2!1sen!2sin!4v1653113592392!5m2!1sen!2sin'
        };

        content.socialLinks = {
            facebook: 'https://www.facebook.com/Swagat-Group-of-Institutions-108863395171576',
            twitter: 'https://twitter.com/SwagatOdisha',
            instagram: 'https://instagram.com/Swagat_Odisha',
            youtube: 'https://youtube.com/channel/UCQ5GY_dOSPmyhOeUkq61R1w',
            linkedin: 'https://Linkedin.com/in/SwagatOdisha'
        };

        content.lastModified = new Date();
        content.modifiedBy = req.user._id;

        await content.save();

        res.status(200).json({
            success: true,
            message: 'Website content reset to defaults successfully',
            data: content
        });
    } catch (error) {
        console.error('Reset to defaults error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset to defaults',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    getWebsiteContent,
    updateWebsiteContent,
    updateSection,
    resetToDefaults
};
