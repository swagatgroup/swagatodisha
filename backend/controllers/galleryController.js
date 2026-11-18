const Gallery = require('../models/Gallery');
const Institution = require('../models/Institution');
const CloudinaryService = require('../utils/cloudinary');

// Match "events" / "Events" from the query string to the model's category spelling
const CATEGORIES = Gallery.schema.path('category').enumValues;
const normaliseCategory = (value) => CATEGORIES.find((c) => c.toLowerCase() === String(value).toLowerCase());

// Get all gallery items
const getGalleryItems = async (req, res) => {
    try {
        const { category, institution, campus, search, page = 1, limit = 20 } = req.query;

        let query = {};

        if (category) {
            query.category = normaliseCategory(category) || category;
        }

        if (campus) {
            query.campus = campus;
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

// Fields an admin may set from the form (FormData sends everything as strings)
const pickGalleryFields = (body = {}) => {
    const data = {};
    ['title', 'description', 'alt', 'category', 'campus', 'subcategory'].forEach((key) => {
        if (typeof body[key] === 'string') data[key] = body[key].trim();
    });
    if (data.category) data.category = normaliseCategory(data.category) || data.category;
    ['isActive', 'isFeatured', 'showOnHomepage'].forEach((key) => {
        if (body[key] !== undefined) data[key] = body[key] === true || body[key] === 'true';
    });
    if (body.displayOrder !== undefined && body.displayOrder !== '') {
        const order = parseInt(body.displayOrder, 10);
        if (!Number.isNaN(order)) data.displayOrder = order;
    }
    if (body.tags !== undefined) {
        const tags = Array.isArray(body.tags) ? body.tags : String(body.tags).split(',');
        data.tags = tags.map((t) => String(t).trim()).filter(Boolean);
    }
    return data;
};

// "annual-day_2025.jpg" -> "Annual day 2025"
const titleFromFileName = (name = '') => {
    const base = name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
    return base ? base.charAt(0).toUpperCase() + base.slice(1) : 'Gallery photo';
};

const removeFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
        await CloudinaryService.deleteImage(publicId);
    } catch (error) {
        console.error('Gallery Cloudinary delete error:', error.message);
    }
};

// Create gallery item(s): one record per uploaded photo, all sharing the form's category, campus and caption
const createGalleryItem = async (req, res) => {
    try {
        const fields = pickGalleryFields(req.body);
        const uploads = req.galleryUploads || [];

        if (uploads.length === 0 && !req.body.imageUrl) {
            return res.status(400).json({ success: false, message: 'Please choose at least one photo to upload' });
        }

        const sources = uploads.length > 0 ? uploads : [{ imageUrl: String(req.body.imageUrl) }];
        const items = sources.map((source) => ({
            category: 'General',
            ...fields,
            ...source,
            title: fields.title || titleFromFileName(source.originalFileName),
            approvalStatus: 'Approved',
            approvedBy: req.user._id,
            approvedAt: new Date(),
            uploadedBy: req.user._id,
            lastModified: new Date(),
            modifiedBy: req.user._id
        }));

        const created = await Gallery.insertMany(items, { ordered: true });

        res.status(201).json({
            success: true,
            message: created.length === 1 ? 'Photo added to the gallery' : `${created.length} photos added to the gallery`,
            data: created.length === 1 ? created[0] : created
        });
    } catch (error) {
        console.error('Create gallery item error:', error);
        (req.galleryUploads || []).forEach((u) => removeFromCloudinary(u.cloudinaryPublicId));
        res.status(error.name === 'ValidationError' ? 400 : 500).json({
            success: false,
            message: error.name === 'ValidationError' ? error.message : 'Failed to create gallery item',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update gallery item (details, and optionally a replacement photo)
const updateGalleryItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const existing = await Gallery.findById(itemId);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }

        const replacement = (req.galleryUploads || [])[0];
        const updateData = {
            ...pickGalleryFields(req.body),
            ...(replacement || {}),
            lastModified: new Date(),
            modifiedBy: req.user._id
        };

        const galleryItem = await Gallery.findByIdAndUpdate(
            itemId,
            updateData,
            { new: true, runValidators: true }
        );

        if (replacement && existing.cloudinaryPublicId) {
            await removeFromCloudinary(existing.cloudinaryPublicId);
        }

        res.status(200).json({
            success: true,
            message: 'Gallery item updated successfully',
            data: galleryItem
        });
    } catch (error) {
        console.error('Update gallery item error:', error);
        res.status(error.name === 'ValidationError' ? 400 : 500).json({
            success: false,
            message: error.name === 'ValidationError' ? error.message : 'Failed to update gallery item',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Delete gallery item (and its Cloudinary file)
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

        await removeFromCloudinary(galleryItem.cloudinaryPublicId);

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
        const { category, institution, campus, limit = 60, featured } = req.query;

        let query = {
            isActive: true,
            approvalStatus: { $ne: 'Rejected' }
        };

        if (category) {
            query.category = normaliseCategory(category) || category;
        }

        if (institution) {
            query.institution = institution;
        }

        if (campus) {
            query.campus = campus;
        }

        if (featured === 'true') {
            query.isFeatured = true;
        }

        const galleryItems = await Gallery.find(query)
            .select('title description alt imageUrl thumbnailUrl category campus dimensions isFeatured tags createdAt')
            .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 })
            .limit(Math.min(parseInt(limit, 10) || 60, 200));

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
            isActive: true,
            approvalStatus: 'Approved'
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


const approveGalleryItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { status } = req.body; // 'Approved' or 'Rejected'
        
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const galleryItem = await Gallery.findByIdAndUpdate(
            itemId,
            { 
                approvalStatus: status,
                approvedBy: req.user._id,
                approvedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        if (!galleryItem) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }

        res.json({
            success: true,
            message: `Gallery item ${status.toLowerCase()} successfully`,
            data: galleryItem
        });
    } catch (error) {
        console.error('Approve gallery item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve gallery item'
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
    approveGalleryItem,
    incrementDownloadCount
};
