const Gallery = require('../models/Gallery');
const Institution = require('../models/Institution');

// Get all gallery items
const getGalleryItems = async (req, res) => {
    try {
        const { category, institution, search, page = 1, limit = 20 } = req.query;

        let query = {};

        if (category) {
            query.category = category;
        }

        if (institution) {
            query.institution = institution;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const galleryItems = await Gallery.find(query)
            .populate('institution', 'name type')
            .populate('course', 'name code')
            .populate('uploadedBy', 'name email')
            .sort({ displayOrder: 1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Gallery.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                galleryItems,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get gallery items error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get gallery items',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get gallery item by ID
const getGalleryItemById = async (req, res) => {
    try {
        const { itemId } = req.params;

        const galleryItem = await Gallery.findById(itemId)
            .populate('institution', 'name type')
            .populate('course', 'name code')
            .populate('uploadedBy', 'name email');

        if (!galleryItem) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }

        // Increment view count
        galleryItem.views += 1;
        await galleryItem.save();

        res.status(200).json({
            success: true,
            data: galleryItem
        });
    } catch (error) {
        console.error('Get gallery item by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get gallery item',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Create new gallery item
const createGalleryItem = async (req, res) => {
    try {
        const galleryData = {
            ...req.body,
            uploadedBy: req.user._id,
            lastModified: new Date(),
            modifiedBy: req.user._id
        };

        const galleryItem = new Gallery(galleryData);
        await galleryItem.save();

        res.status(201).json({
            success: true,
            message: 'Gallery item created successfully',
            data: galleryItem
        });
    } catch (error) {
        console.error('Create gallery item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create gallery item',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update gallery item
const updateGalleryItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const updateData = {
            ...req.body,
            lastModified: new Date(),
            modifiedBy: req.user._id
        };

        const galleryItem = await Gallery.findByIdAndUpdate(
            itemId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!galleryItem) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Gallery item updated successfully',
            data: galleryItem
        });
    } catch (error) {
        console.error('Update gallery item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update gallery item',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Delete gallery item
const deleteGalleryItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        const galleryItem = await Gallery.findByIdAndDelete(itemId);

        if (!galleryItem) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Gallery item deleted successfully'
        });
    } catch (error) {
        console.error('Delete gallery item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete gallery item',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get public gallery items (for website display)
const getPublicGalleryItems = async (req, res) => {
    try {
        const { category, institution, limit = 20, featured } = req.query;

        let query = {
            isActive: true
        };

        if (category) {
            query.category = category;
        }

        if (institution) {
            query.institution = institution;
        }

        if (featured === 'true') {
            query.isFeatured = true;
        }

        const galleryItems = await Gallery.find(query)
            .select('title description imageUrl thumbnailUrl category tags views')
            .sort({ displayOrder: 1, createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: galleryItems
        });
    } catch (error) {
        console.error('Get public gallery items error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get public gallery items',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get gallery items by category
const getGalleryItemsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { limit = 20 } = req.query;

        const galleryItems = await Gallery.find({
            category,
            isActive: true
        })
            .select('title description imageUrl thumbnailUrl tags views')
            .sort({ displayOrder: 1, createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: galleryItems
        });
    } catch (error) {
        console.error('Get gallery items by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get gallery items by category',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get featured gallery items
const getFeaturedGalleryItems = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const galleryItems = await Gallery.find({
            isFeatured: true,
            isActive: true
        })
            .select('title description imageUrl thumbnailUrl category tags views')
            .sort({ displayOrder: 1, createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: galleryItems
        });
    } catch (error) {
        console.error('Get featured gallery items error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get featured gallery items',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get gallery statistics
const getGalleryStats = async (req, res) => {
    try {
        const totalItems = await Gallery.countDocuments();
        const activeItems = await Gallery.countDocuments({ isActive: true });
        const featuredItems = await Gallery.countDocuments({ isFeatured: true });
        const totalViews = await Gallery.aggregate([
            { $group: { _id: null, totalViews: { $sum: '$views' } } }
        ]);

        const byCategory = await Gallery.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        const byInstitution = await Gallery.aggregate([
            { $group: { _id: '$institution', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalItems,
                activeItems,
                featuredItems,
                totalViews: totalViews[0]?.totalViews || 0,
                byCategory,
                byInstitution
            }
        });
    } catch (error) {
        console.error('Get gallery stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get gallery statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Increment download count
const incrementDownloadCount = async (req, res) => {
    try {
        const { itemId } = req.params;

        const galleryItem = await Gallery.findByIdAndUpdate(
            itemId,
            { $inc: { downloads: 1 } },
            { new: true }
        );

        if (!galleryItem) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Download count incremented',
            data: { downloads: galleryItem.downloads }
        });
    } catch (error) {
        console.error('Increment download count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to increment download count',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    getGalleryItems,
    getGalleryItemById,
    createGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    getPublicGalleryItems,
    getGalleryItemsByCategory,
    getFeaturedGalleryItems,
    getGalleryStats,
    incrementDownloadCount
};
