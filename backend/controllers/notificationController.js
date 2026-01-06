const Notification = require('../models/Notification');

// Get all notifications
const getNotifications = async (req, res) => {
    try {
        const { type, category, status, targetAudience, search, page = 1, limit = 20 } = req.query;

        let query = {};

        if (type) {
            query.type = type;
        }

        if (category) {
            query.category = category;
        }

        if (status) {
            query.status = status;
        }

        if (targetAudience) {
            query.targetAudience = targetAudience;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } }
            ];
        }

        const notifications = await Notification.find(query)
            .populate('targetInstitutions', 'name type')
            .populate('targetCourses', 'name code')
            .populate('createdBy', 'name email')
            .sort({ publishDate: -1, priority: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Notification.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                notifications,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notifications',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get notification by ID
const getNotificationById = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findById(notificationId)
            .populate('targetInstitutions', 'name type')
            .populate('targetCourses', 'name code')
            .populate('createdBy', 'name email');

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Increment view count
        notification.views += 1;
        await notification.save();

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Get notification by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notification',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Create new notification
const createNotification = async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.title || !req.body.content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        // Ensure targetAudience is set (required field)
        if (!req.body.targetAudience) {
            req.body.targetAudience = 'All';
        }

        // Remove any attachments from req.body if it exists (it might be a string from FormData)
        // We'll set it properly below based on file upload
        const cleanBody = { ...req.body };
        delete cleanBody.attachments; // Explicitly delete to prevent string attachments
        
        console.log('🔍 req.body.attachments:', req.body.attachments);
        console.log('🔍 cleanBody.attachments:', cleanBody.attachments);

        const notificationData = {
            title: cleanBody.title,
            content: cleanBody.content,
            type: cleanBody.type || 'General',
            priority: cleanBody.priority || 'Medium',
            targetAudience: cleanBody.targetAudience || 'All',
            isActive: cleanBody.isActive !== 'false' && cleanBody.isActive !== false,
            publishDate: cleanBody.publishDate ? new Date(cleanBody.publishDate) : new Date(),
            createdBy: req.user._id,
            lastModified: new Date(),
            modifiedBy: req.user._id
            // Don't set attachments here - we'll set it only if there's a file
        };

        // Handle file upload if present
        if (req.file && req.file.cloudinaryUrl) {
            const fileUrl = req.file.cloudinaryUrl;
            const isPDF = req.file.isPDF;

            if (isPDF) {
                notificationData.pdfDocument = fileUrl;
            } else {
                notificationData.image = fileUrl;
            }

            // Add to attachments array (ensure it's always an array of objects)
            notificationData.attachments = [{
                name: req.file.originalname || 'uploaded-file',
                url: fileUrl,
                type: req.file.mimetype || 'application/octet-stream',
                size: req.file.size || 0
            }];
        }
        // If no file, attachments will be undefined, which Mongoose will handle as empty array

        // Final check: ensure attachments is never a string and is properly formatted
        if (notificationData.attachments) {
            if (typeof notificationData.attachments === 'string') {
                console.error('❌ ERROR: attachments is a string! Value:', notificationData.attachments);
                delete notificationData.attachments;
            } else if (!Array.isArray(notificationData.attachments)) {
                console.error('❌ ERROR: attachments is not an array! Type:', typeof notificationData.attachments);
                delete notificationData.attachments;
            }
        }

        // Ensure we never pass attachments as undefined or string to Mongoose
        // Only include it if it's a valid array
        const finalData = { ...notificationData };
        if (!finalData.attachments || typeof finalData.attachments === 'string' || !Array.isArray(finalData.attachments)) {
            // Don't include attachments at all - let Mongoose use the default
            delete finalData.attachments;
        }

        // Create notification without attachments first, then set it
        const { attachments: attachmentsData, ...dataWithoutAttachments } = finalData;
        const notification = new Notification(dataWithoutAttachments);
        
        // Set attachments separately if it exists and is a valid array
        if (attachmentsData && Array.isArray(attachmentsData) && attachmentsData.length > 0) {
            notification.attachments = attachmentsData;
        }
        await notification.save();

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: notification
        });
    } catch (error) {
        console.error('Create notification error:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to create notification',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? {
                name: error.name,
                validationErrors: error.errors
            } : undefined
        });
    }
};

// Update notification
const updateNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const updateData = {
            ...req.body,
            lastModified: new Date(),
            modifiedBy: req.user._id
        };

        // Handle file upload if present
        if (req.file && req.file.cloudinaryUrl) {
            const fileUrl = req.file.cloudinaryUrl;
            const isPDF = req.file.isPDF;

            // Delete old file from Cloudinary if exists
            const CloudinaryService = require('../utils/cloudinary');
            const existingNotification = await Notification.findById(notificationId);
            
            if (existingNotification) {
                if (isPDF && existingNotification.pdfDocument) {
                    // Try to extract public ID from URL
                    let oldPublicId = null;
                    if (existingNotification.pdfDocument?.includes('cloudinary.com')) {
                        const match = existingNotification.pdfDocument.match(/\/v\d+\/(.+?)(?:\.pdf)?$/);
                        if (match) {
                            oldPublicId = match[1];
                        }
                    }
                    if (oldPublicId) {
                        try {
                            await CloudinaryService.deleteFile(oldPublicId);
                            console.log('🗑️ Deleted old PDF from Cloudinary');
                        } catch (err) {
                            console.log('⚠️ Could not delete old PDF:', err.message);
                        }
                    }
                } else if (!isPDF && existingNotification.image) {
                    // Try to extract public ID from URL
                    let oldPublicId = null;
                    if (existingNotification.image?.includes('cloudinary.com')) {
                        const match = existingNotification.image.match(/\/v\d+\/(.+?)(?:\.(jpg|png|webp|jpeg))?$/);
                        if (match) {
                            oldPublicId = match[1];
                        }
                    }
                    if (oldPublicId) {
                        try {
                            await CloudinaryService.deleteImage(oldPublicId);
                            console.log('🗑️ Deleted old image from Cloudinary');
                        } catch (err) {
                            console.log('⚠️ Could not delete old image:', err.message);
                        }
                    }
                }
            }

            if (isPDF) {
                updateData.pdfDocument = fileUrl;
            } else {
                updateData.image = fileUrl;
            }

            // Update attachments array (ensure it's always an array of objects, not a string)
            updateData.attachments = [{
                name: req.file.originalname || 'uploaded-file',
                url: fileUrl,
                type: req.file.mimetype || 'application/octet-stream',
                size: req.file.size || 0
            }];
        } else {
            // If no file uploaded, explicitly exclude any string attachments from req.body
            if (req.body.attachments && typeof req.body.attachments === 'string') {
                // Don't include string attachments - they cause validation errors
                // The existing attachments will remain unchanged
            }
        }

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification updated successfully',
            data: notification
        });
    } catch (error) {
        console.error('Update notification error:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to update notification',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? {
                name: error.name,
                validationErrors: error.errors
            } : undefined
        });
    }
};

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndDelete(notificationId);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update notification status
const updateNotificationStatus = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { status } = req.body;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            {
                status,
                lastModified: new Date(),
                modifiedBy: req.user._id
            },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification status updated successfully',
            data: notification
        });
    } catch (error) {
        console.error('Update notification status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update notification status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get public notifications (for website display)
const getPublicNotifications = async (req, res) => {
    try {
        const { limit = 10, category } = req.query;

        let query = {
            status: 'Published',
            isActive: true,
            $or: [
                { publishDate: { $lte: new Date() } },
                { publishDate: { $exists: false } }
            ]
        };

        if (category) {
            query.category = category;
        }

        const notifications = await Notification.find(query)
            .select('title shortDescription content type category priority isUrgent isImportant publishDate eventDate attachments image')
            .sort({ priority: -1, publishDate: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Get public notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get public notifications',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
    try {
        const totalNotifications = await Notification.countDocuments();
        const publishedNotifications = await Notification.countDocuments({ status: 'Published' });
        const draftNotifications = await Notification.countDocuments({ status: 'Draft' });
        const urgentNotifications = await Notification.countDocuments({ isUrgent: true });

        const byType = await Notification.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        const byCategory = await Notification.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        const byPriority = await Notification.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalNotifications,
                publishedNotifications,
                draftNotifications,
                urgentNotifications,
                byType,
                byCategory,
                byPriority
            }
        });
    } catch (error) {
        console.error('Get notification stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notification statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Increment click count
const incrementClickCount = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { $inc: { clicks: 1 } },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Click count incremented',
            data: { clicks: notification.clicks }
        });
    } catch (error) {
        console.error('Increment click count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to increment click count',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    getNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    deleteNotification,
    updateNotificationStatus,
    getPublicNotifications,
    getNotificationStats,
    incrementClickCount
};