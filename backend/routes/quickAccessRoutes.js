const express = require('express');
const router = express.Router();
const {
    getQuickAccessDocs,
    getQuickAccessDoc,
    createQuickAccessDoc,
    updateQuickAccessDoc,
    deleteQuickAccessDoc
} = require('../controllers/quickAccessController');
const { protect, authorize } = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../middleware/quickAccessUpload');
const { asyncHandler } = require('../middleware/errorHandler');

// Public route - Get active documents for homepage
router.get('/public', asyncHandler(async (req, res) => {
    const QuickAccess = require('../models/QuickAccess');
    const Notification = require('../models/Notification');

    // Get active QuickAccess documents (exclude 'notification' type since we get those from Notification collection)
    const quickAccessDocs = await QuickAccess.find({ 
        isActive: true,
        type: { $ne: 'notification' } // Exclude notification type - we get those from Notification collection
    })
        .sort({ type: 1, order: 1, createdAt: -1 })
        .select('-createdBy -updatedBy'); // Exclude populated fields for public access

    // Get active notifications that have files and should be shown in quick links
    const notifications = await Notification.find({
        isActive: true,
        $or: [
            { showInQuickLinks: true },
            { pdfDocument: { $exists: true, $ne: null, $ne: '' } },
            { image: { $exists: true, $ne: null, $ne: '' } },
            { 'attachments.0': { $exists: true } } // Has at least one attachment
        ]
    })
        .sort({ publishDate: -1, displayOrder: 1 })
        .select('title content pdfDocument image attachments publishDate displayOrder')
        .limit(50); // Limit to prevent too many results

    console.log(`📊 [QUICK ACCESS] Found ${notifications.length} notifications with files`);
    
    // Transform notifications to match QuickAccess document format
    const notificationDocs = notifications.map(notification => {
        // Get file URL from pdfDocument, image, or first attachment
        let fileUrl = null;
        let fileName = notification.title;
        
        if (notification.pdfDocument) {
            fileUrl = notification.pdfDocument;
            fileName = notification.attachments?.[0]?.name || `${notification.title}.pdf`;
        } else if (notification.image) {
            fileUrl = notification.image;
            fileName = notification.attachments?.[0]?.name || notification.title;
        } else if (notification.attachments && notification.attachments.length > 0) {
            fileUrl = notification.attachments[0].url;
            fileName = notification.attachments[0].name || notification.title;
        }

        // Only include if we have a valid file URL
        if (!fileUrl) {
            return null;
        }

        return {
            _id: notification._id,
            type: 'notification',
            title: notification.title,
            description: notification.content || notification.title,
            file: fileUrl,
            fileName: fileName,
            publishDate: notification.publishDate,
            order: notification.displayOrder || 0,
            isActive: true,
            createdAt: notification.publishDate,
            updatedAt: notification.publishDate
        };
    }).filter(doc => doc !== null); // Remove null entries

    console.log(`📊 [QUICK ACCESS] Transformed ${notificationDocs.length} notification documents`);
    console.log(`📊 [QUICK ACCESS] Found ${quickAccessDocs.length} QuickAccess documents`);
    
    // Combine both document types
    const allDocuments = [...quickAccessDocs, ...notificationDocs];
    
    console.log(`📊 [QUICK ACCESS] Total documents before deduplication: ${allDocuments.length}`);

    // Remove duplicates based on file URL, notification ID, or title+file combination
    // If a QuickAccess doc and Notification doc have the same file, keep only one
    const seenFiles = new Set();
    const seenNotificationIds = new Set();
    const seenTitleFileCombos = new Set(); // For catching duplicates with same title and file
    const deduplicatedDocs = [];

    for (const doc of allDocuments) {
        // For notification type, check notification ID, file URL, and title+file combination
        if (doc.type === 'notification') {
            const notificationId = doc._id?.toString();
            const fileKey = doc.file;
            const titleFileCombo = `${doc.title}|${fileKey}`; // Combine title and file for duplicate detection
            
            // Skip if we've already seen this notification ID, file URL, or title+file combination
            if (seenNotificationIds.has(notificationId) || 
                seenFiles.has(fileKey) || 
                seenTitleFileCombos.has(titleFileCombo)) {
                console.log('🔍 [QUICK ACCESS] Skipping duplicate notification:', {
                    id: notificationId,
                    title: doc.title,
                    file: fileKey
                });
                continue;
            }
            
            seenNotificationIds.add(notificationId);
            seenFiles.add(fileKey);
            seenTitleFileCombos.add(titleFileCombo);
        } else {
            // For other types, just check file URL
            const fileKey = doc.file;
            if (seenFiles.has(fileKey)) {
                console.log('🔍 [QUICK ACCESS] Skipping duplicate document:', {
                    type: doc.type,
                    title: doc.title,
                    file: fileKey
                });
                continue;
            }
            seenFiles.add(fileKey);
        }
        
        deduplicatedDocs.push(doc);
    }

    console.log(`📊 [QUICK ACCESS] Total documents after deduplication: ${deduplicatedDocs.length}`);
    
    // Sort all documents by type, then order, then date
    deduplicatedDocs.sort((a, b) => {
        if (a.type !== b.type) {
            return a.type.localeCompare(b.type);
        }
        if (a.order !== b.order) {
            return (a.order || 0) - (b.order || 0);
        }
        return new Date(b.publishDate || b.createdAt) - new Date(a.publishDate || a.createdAt);
    });

    res.status(200).json({
        success: true,
        count: deduplicatedDocs.length,
        data: deduplicatedDocs
    });
}));

// All other routes require authentication
router.use(protect);

// Apply role-based access control for write operations
const isSuperAdminOrStaff = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'User not authenticated'
        });
    }
    if (!['super_admin', 'staff'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Super Admin or Staff only.'
        });
    }
    next();
};

// Routes
router.get('/', getQuickAccessDocs);
router.get('/:id', getQuickAccessDoc);
router.post(
    '/',
    isSuperAdminOrStaff,
    upload.single('file'),
    uploadToCloudinary,
    createQuickAccessDoc
);
router.put(
    '/:id',
    isSuperAdminOrStaff,
    upload.single('file'),
    uploadToCloudinary,
    updateQuickAccessDoc
);
router.delete('/:id', isSuperAdminOrStaff, deleteQuickAccessDoc);

module.exports = router;

