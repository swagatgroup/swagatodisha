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
    const startTime = Date.now();
    let notificationId = null;
    
    try {
        console.log('📝 [NOTIFICATION CREATE] Starting notification creation');
        console.log('📝 [NOTIFICATION CREATE] User:', {
            id: req.user._id,
            role: req.user.role,
            email: req.user.email || req.user.fullName || 'N/A'
        });
        console.log('📝 [NOTIFICATION CREATE] Request body:', {
            title: req.body.title,
            type: req.body.type,
            hasFile: !!req.file,
            fileType: req.file?.mimetype
        });

        // Validate required fields
        if (!req.body.title || !req.body.content) {
            console.error('❌ [NOTIFICATION CREATE] Validation failed: Missing required fields', {
                hasTitle: !!req.body.title,
                hasContent: !!req.body.content
            });
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        // Ensure targetAudience is set (required field)
        if (!req.body.targetAudience) {
            console.log('📝 [NOTIFICATION CREATE] Setting default targetAudience: All');
            req.body.targetAudience = 'All';
        }

        // Remove any attachments from req.body if it exists (it might be a string from FormData)
        // We'll set it properly below based on file upload
        const cleanBody = { ...req.body };
        if (cleanBody.attachments) {
            console.log('📝 [NOTIFICATION CREATE] Removing attachments from req.body (will be set from file upload)');
            delete cleanBody.attachments;
        }

        // Check if user is Admin or User - only Admin/Staff can create notifications
        if (!['super_admin', 'staff'].includes(req.user.role)) {
            console.error('❌ [NOTIFICATION CREATE] Authorization failed:', {
                userRole: req.user.role,
                requiredRoles: ['super_admin', 'staff']
            });
            return res.status(403).json({
                success: false,
                message: 'Only staff and super admin can create notifications'
            });
        }

        // Determine user model type from req.userType or check if it's Admin model
        const userModelType = req.userType === 'admin' ? 'Admin' : 'User';
        // If user has staff/super_admin role but is from User model, still allow but use User model
        const isAdminModel = req.user.constructor.modelName === 'Admin' || req.userType === 'admin';
        const finalUserModelType = isAdminModel ? 'Admin' : 'User';
        
        console.log('📝 [NOTIFICATION CREATE] User model type:', {
            userType: req.userType,
            modelName: req.user.constructor.modelName,
            finalModelType: finalUserModelType
        });

        const notificationData = {
            title: cleanBody.title,
            content: cleanBody.content,
            type: cleanBody.type || 'General',
            priority: cleanBody.priority || 'Medium',
            targetAudience: cleanBody.targetAudience || 'All',
            isActive: cleanBody.isActive !== 'false' && cleanBody.isActive !== false,
            publishDate: cleanBody.publishDate ? new Date(cleanBody.publishDate) : new Date(),
            createdBy: req.user._id,
            createdByModel: finalUserModelType,
            lastModified: new Date(),
            modifiedBy: req.user._id,
            modifiedByModel: finalUserModelType
            // Don't set attachments here - we'll set it only if there's a file
        };

        // Handle file upload if present
        if (req.file && req.file.cloudinaryUrl) {
            try {
                console.log('📎 [NOTIFICATION CREATE] Processing uploaded file:', {
                    originalName: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size,
                    cloudinaryUrl: req.file.cloudinaryUrl,
                    isPDF: req.file.isPDF
                });

                const fileUrl = req.file.cloudinaryUrl;
                const isPDF = req.file.isPDF;

                if (isPDF) {
                    notificationData.pdfDocument = fileUrl;
                    console.log('📎 [NOTIFICATION CREATE] Set PDF document URL');
                } else {
                    notificationData.image = fileUrl;
                    console.log('📎 [NOTIFICATION CREATE] Set image URL');
                }

                // Add to attachments array (ensure it's always an array of plain objects)
                // Create a completely fresh plain object to avoid any reference issues
                const attachmentObj = Object.assign({}, {
                    name: String(req.file.originalname || 'uploaded-file'),
                    url: String(fileUrl),
                    type: String(req.file.mimetype || 'application/octet-stream'),
                    size: Number(req.file.size || 0)
                });
                
                notificationData.attachments = [attachmentObj];
                
                console.log('✅ [NOTIFICATION CREATE] Created attachment object:', {
                    name: attachmentObj.name,
                    url: attachmentObj.url,
                    type: attachmentObj.type,
                    size: attachmentObj.size,
                    isPlainObject: attachmentObj.constructor === Object,
                    attachmentType: typeof attachmentObj
                });
            } catch (fileError) {
                console.error('❌ [NOTIFICATION CREATE] Error processing file:', {
                    error: fileError.message,
                    stack: fileError.stack,
                    file: req.file
                });
                // Continue without file attachment if file processing fails
                console.warn('⚠️ [NOTIFICATION CREATE] Continuing without file attachment');
            }
        } else {
            console.log('📝 [NOTIFICATION CREATE] No file uploaded');
        }
        // If no file, attachments will be undefined, which Mongoose will handle as empty array

        // Final check: ensure attachments is never a string and is properly formatted
        if (notificationData.attachments) {
            try {
                if (typeof notificationData.attachments === 'string') {
                    console.error('❌ [NOTIFICATION CREATE] ERROR: attachments is a string!', {
                        value: notificationData.attachments,
                        type: typeof notificationData.attachments
                    });
                    delete notificationData.attachments;
                } else if (!Array.isArray(notificationData.attachments)) {
                    console.error('❌ [NOTIFICATION CREATE] ERROR: attachments is not an array!', {
                        type: typeof notificationData.attachments,
                        value: notificationData.attachments
                    });
                    delete notificationData.attachments;
                } else {
                    console.log('📝 [NOTIFICATION CREATE] Validating attachments array:', {
                        length: notificationData.attachments.length,
                        items: notificationData.attachments.map((att, idx) => ({
                            index: idx,
                            type: typeof att,
                            isObject: typeof att === 'object',
                            isArray: Array.isArray(att),
                            constructor: att?.constructor?.name
                        }))
                    });

                    // Ensure each attachment is a proper plain object (not a string or array)
                    const validAttachments = notificationData.attachments
                        .filter((att, idx) => {
                            const isValid = att && typeof att === 'object' && !Array.isArray(att) && att.constructor === Object;
                            if (!isValid) {
                                console.warn(`⚠️ [NOTIFICATION CREATE] Invalid attachment at index ${idx} filtered out:`, {
                                    attachment: att,
                                    type: typeof att,
                                    isArray: Array.isArray(att),
                                    constructor: att?.constructor?.name
                                });
                            }
                            return isValid;
                        })
                        .map((att, idx) => {
                            try {
                                // Create a completely fresh plain object with explicit type conversions
                                // Use Object.assign to ensure it's a plain object, not a Mongoose document
                                const cleanAtt = Object.assign({}, {
                                    name: String(att.name || 'file'),
                                    url: String(att.url || ''),
                                    type: String(att.type || 'application/octet-stream'),
                                    size: Number(att.size || 0)
                                });
                                console.log(`✅ [NOTIFICATION CREATE] Cleaned attachment ${idx}:`, cleanAtt);
                                return cleanAtt;
                            } catch (cleanError) {
                                console.error(`❌ [NOTIFICATION CREATE] Error cleaning attachment ${idx}:`, {
                                    error: cleanError.message,
                                    attachment: att
                                });
                                return null;
                            }
                        })
                        .filter(att => att !== null);
                    
                    if (validAttachments.length > 0) {
                        notificationData.attachments = validAttachments;
                        console.log('✅ [NOTIFICATION CREATE] Valid attachments prepared:', {
                            count: validAttachments.length,
                            attachments: validAttachments
                        });
                    } else {
                        console.warn('⚠️ [NOTIFICATION CREATE] No valid attachments after filtering, removing attachments field');
                        delete notificationData.attachments;
                    }
                }
            } catch (attachmentError) {
                console.error('❌ [NOTIFICATION CREATE] Error processing attachments:', {
                    error: attachmentError.message,
                    stack: attachmentError.stack,
                    attachments: notificationData.attachments
                });
                // Remove attachments if processing fails
                delete notificationData.attachments;
            }
        }

        // Ensure attachments are properly formatted before creating notification
        if (notificationData.attachments && Array.isArray(notificationData.attachments) && notificationData.attachments.length > 0) {
            // Clean and format attachments array - ensure all are plain objects
            notificationData.attachments = notificationData.attachments.map((att) => {
                // Return a completely fresh plain object
                return {
                    name: String(att.name || 'file'),
                    url: String(att.url || ''),
                    type: String(att.type || 'application/octet-stream'),
                    size: Number(att.size || 0)
                };
            });
            
            console.log('📝 [NOTIFICATION CREATE] Cleaned attachments array:', {
                count: notificationData.attachments.length,
                attachments: notificationData.attachments,
                isArray: Array.isArray(notificationData.attachments),
                firstItemType: notificationData.attachments[0] ? typeof notificationData.attachments[0] : 'none',
                firstItemConstructor: notificationData.attachments[0]?.constructor?.name
            });
        } else {
            // If no attachments, set to empty array explicitly
            notificationData.attachments = [];
        }

        // Log final notification data before creating
        console.log('📋 [NOTIFICATION CREATE] Final notification data:', {
            title: notificationData.title,
            type: notificationData.type,
            hasAttachments: notificationData.attachments.length > 0,
            attachmentsCount: notificationData.attachments.length,
            attachmentsType: typeof notificationData.attachments,
            attachmentsIsArray: Array.isArray(notificationData.attachments),
            hasPdfDocument: !!notificationData.pdfDocument,
            hasImage: !!notificationData.image
        });

        // Create notification with all data including attachments
        console.log('📝 [NOTIFICATION CREATE] Creating Notification model instance...');
        const notification = new Notification(notificationData);
        notificationId = notification._id;
        
        console.log('📝 [NOTIFICATION CREATE] Saving notification to database...');
        await notification.save();
        
        const duration = Date.now() - startTime;
        console.log('✅ [NOTIFICATION CREATE] Notification created successfully:', {
            id: notification._id,
            title: notification.title,
            duration: `${duration}ms`,
            hasAttachments: notification.attachments?.length > 0,
            attachmentsCount: notification.attachments?.length || 0
        });

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: notification
        });
    } catch (error) {
        const duration = Date.now() - startTime;
        
        console.error('❌ [NOTIFICATION CREATE] Error creating notification:', {
            error: error.message,
            name: error.name,
            stack: error.stack,
            duration: `${duration}ms`,
            notificationId: notificationId,
            user: {
                id: req.user?._id,
                role: req.user?.role
            },
            requestData: {
                title: req.body?.title,
                type: req.body?.type,
                hasFile: !!req.file
            }
        });

        // Log validation errors if present
        if (error.errors) {
            console.error('❌ [NOTIFICATION CREATE] Validation errors:', {
                errors: Object.keys(error.errors).map(key => ({
                    field: key,
                    message: error.errors[key].message,
                    value: error.errors[key].value,
                    kind: error.errors[key].kind
                }))
            });
        }

        // Determine error type and provide appropriate response
        let statusCode = 500;
        let errorMessage = 'Failed to create notification';
        let errorDetails = undefined;

        if (error.name === 'ValidationError') {
            statusCode = 400;
            errorMessage = 'Notification validation failed';
            errorDetails = process.env.NODE_ENV === 'development' ? {
                errors: Object.keys(error.errors).map(key => ({
                    field: key,
                    message: error.errors[key].message
                }))
            } : undefined;
        } else if (error.name === 'CastError') {
            statusCode = 400;
            errorMessage = 'Invalid data format';
            errorDetails = process.env.NODE_ENV === 'development' ? {
                field: error.path,
                value: error.value,
                kind: error.kind
            } : undefined;
        }

        res.status(statusCode).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            details: errorDetails
        });
    }
};

// Update notification
const updateNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        // Determine user model type
        const isAdminModel = req.user.constructor.modelName === 'Admin' || req.userType === 'admin';
        const finalUserModelType = isAdminModel ? 'Admin' : 'User';
        
        const updateData = {
            ...req.body,
            lastModified: new Date(),
            modifiedBy: req.user._id,
            modifiedByModel: finalUserModelType
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