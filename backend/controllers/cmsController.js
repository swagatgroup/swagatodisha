const Content = require('../models/Content');
const Admin = require('../models/Admin');
// Socket.IO removed

// Get all content with pagination and filters
exports.getAllContent = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            type,
            category,
            status,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        let query = {};

        if (type) query.type = type;
        if (category) query.category = category;
        if (status) {
            if (status === 'published') {
                query.isPublished = true;
                query.visibility = 'public';
            } else if (status === 'draft') {
                query.visibility = 'draft';
            } else if (status === 'scheduled') {
                query.scheduledAt = { $gt: new Date() };
            }
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } }
            ];
        }

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const contents = await Content.find(query)
            .populate('author', 'firstName lastName email')
            .populate('lastModifiedBy', 'firstName lastName email')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Content.countDocuments(query);

        res.json({
            success: true,
            data: {
                contents,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get content',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get single content by ID or slug
exports.getContent = async (req, res) => {
    try {
        const { id } = req.params;

        let content;
        if (mongoose.Types.ObjectId.isValid(id)) {
            content = await Content.findById(id)
                .populate('author', 'firstName lastName email')
                .populate('lastModifiedBy', 'firstName lastName email');
        } else {
            content = await Content.findOne({ slug: id })
                .populate('author', 'firstName lastName email')
                .populate('lastModifiedBy', 'firstName lastName email');
        }

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        res.json({
            success: true,
            data: content
        });
    } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get content',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Create new content
exports.createContent = async (req, res) => {
    try {
        const contentData = {
            ...req.body,
            author: req.user._id,
            lastModifiedBy: req.user._id
        };

        const content = new Content(contentData);
        await content.save();

        // Populate author info
        await content.populate('author', 'firstName lastName email');

        // Emit real-time update
        io.emit('contentCreated', {
            type: 'content_created',
            data: content,
            timestamp: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Content created successfully',
            data: content
        });
    } catch (error) {
        console.error('Create content error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Content with this slug already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create content',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update content
exports.updateContent = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            lastModifiedBy: req.user._id,
            updatedAt: new Date()
        };

        const content = await Content.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('author', 'firstName lastName email')
            .populate('lastModifiedBy', 'firstName lastName email');

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        // Add change log
        await content.addChangeLog(
            `Content updated by ${req.user.firstName} ${req.user.lastName}`,
            req.user._id
        );

        // Emit real-time update
        io.emit('contentUpdated', {
            type: 'content_updated',
            data: content,
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: 'Content updated successfully',
            data: content
        });
    } catch (error) {
        console.error('Update content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update content',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Delete content
exports.deleteContent = async (req, res) => {
    try {
        const { id } = req.params;

        const content = await Content.findByIdAndDelete(id);

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        // Emit real-time update
        io.emit('contentDeleted', {
            type: 'content_deleted',
            data: { id: content._id, title: content.title },
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: 'Content deleted successfully'
        });
    } catch (error) {
        console.error('Delete content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete content',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Publish content
exports.publishContent = async (req, res) => {
    try {
        const { id } = req.params;

        const content = await Content.findById(id);
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        await content.publish();
        await content.addChangeLog(
            `Content published by ${req.user.firstName} ${req.user.lastName}`,
            req.user._id
        );

        // Emit real-time update
        io.emit('contentPublished', {
            type: 'content_published',
            data: content,
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: 'Content published successfully',
            data: content
        });
    } catch (error) {
        console.error('Publish content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to publish content',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Unpublish content
exports.unpublishContent = async (req, res) => {
    try {
        const { id } = req.params;

        const content = await Content.findById(id);
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        await content.unpublish();
        await content.addChangeLog(
            `Content unpublished by ${req.user.firstName} ${req.user.lastName}`,
            req.user._id
        );

        // Emit real-time update
        io.emit('contentUnpublished', {
            type: 'content_unpublished',
            data: content,
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: 'Content unpublished successfully',
            data: content
        });
    } catch (error) {
        console.error('Unpublish content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unpublish content',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get content statistics
exports.getContentStats = async (req, res) => {
    try {
        const stats = await Content.aggregate([
            {
                $group: {
                    _id: null,
                    totalContent: { $sum: 1 },
                    publishedContent: {
                        $sum: { $cond: [{ $eq: ['$isPublished', true] }, 1, 0] }
                    },
                    draftContent: {
                        $sum: { $cond: [{ $eq: ['$visibility', 'draft'] }, 1, 0] }
                    },
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: '$likes' }
                }
            }
        ]);

        const categoryStats = await Content.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    published: {
                        $sum: { $cond: [{ $eq: ['$isPublished', true] }, 1, 0] }
                    }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const typeStats = await Content.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    published: {
                        $sum: { $cond: [{ $eq: ['$isPublished', true] }, 1, 0] }
                    }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                overview: stats[0] || {
                    totalContent: 0,
                    publishedContent: 0,
                    draftContent: 0,
                    totalViews: 0,
                    totalLikes: 0
                },
                categoryStats,
                typeStats
            }
        });
    } catch (error) {
        console.error('Get content stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get content statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Bulk operations
exports.bulkAction = async (req, res) => {
    try {
        const { action, contentIds } = req.body;

        if (!Array.isArray(contentIds) || contentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Content IDs are required'
            });
        }

        let result;
        let message;

        switch (action) {
            case 'publish':
                result = await Content.updateMany(
                    { _id: { $in: contentIds } },
                    {
                        isPublished: true,
                        visibility: 'public',
                        publishedAt: new Date(),
                        lastModifiedBy: req.user._id
                    }
                );
                message = `${result.modifiedCount} content items published`;
                break;

            case 'unpublish':
                result = await Content.updateMany(
                    { _id: { $in: contentIds } },
                    {
                        isPublished: false,
                        visibility: 'draft',
                        lastModifiedBy: req.user._id
                    }
                );
                message = `${result.modifiedCount} content items unpublished`;
                break;

            case 'delete':
                result = await Content.deleteMany({ _id: { $in: contentIds } });
                message = `${result.deletedCount} content items deleted`;
                break;

            case 'feature':
                result = await Content.updateMany(
                    { _id: { $in: contentIds } },
                    { isFeatured: true, lastModifiedBy: req.user._id }
                );
                message = `${result.modifiedCount} content items featured`;
                break;

            case 'unfeature':
                result = await Content.updateMany(
                    { _id: { $in: contentIds } },
                    { isFeatured: false, lastModifiedBy: req.user._id }
                );
                message = `${result.modifiedCount} content items unfeatured`;
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid action'
                });
        }

        // Emit real-time update
        io.emit('contentBulkAction', {
            type: 'content_bulk_action',
            action,
            count: result.modifiedCount || result.deletedCount,
            timestamp: new Date()
        });

        res.json({
            success: true,
            message,
            data: result
        });
    } catch (error) {
        console.error('Bulk action error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to perform bulk action',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get content for public website
exports.getPublicContent = async (req, res) => {
    try {
        const { slug, category, type, limit = 10 } = req.query;

        let query = {
            isPublished: true,
            visibility: 'public'
        };

        if (slug) {
            query.slug = slug;
        }
        if (category) {
            query.category = category;
        }
        if (type) {
            query.type = type;
        }

        const contents = await Content.find(query)
            .select('title slug content excerpt featuredImage images metaTitle metaDescription publishedAt views')
            .sort({ publishedAt: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: contents
        });
    } catch (error) {
        console.error('Get public content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get public content',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
