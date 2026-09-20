const fs = require('fs');

// 1. Update Gallery Schema
let model = fs.readFileSync('backend/models/Gallery.js', 'utf8');
const approvalFields = `    approvalStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    approvedAt: Date,
    // Display settings`;
    
if (!model.includes('approvalStatus')) {
    model = model.replace(/\/\/ Display settings/, approvalFields);
    fs.writeFileSync('backend/models/Gallery.js', model);
}

// 2. Update Gallery Controller (Public Queries)
let controller = fs.readFileSync('backend/controllers/galleryController.js', 'utf8');
if (!controller.includes("approvalStatus: 'Approved'")) {
    // In getPublicGalleryItems
    controller = controller.replace(/const query = \{ isActive: true \};/, "const query = { isActive: true, approvalStatus: 'Approved' };");
    
    // In getFeaturedGalleryItems
    controller = controller.replace(/const galleryItems = await Gallery\.find\(\{[\s\n]*isFeatured: true,[\s\n]*isActive: true/, "const galleryItems = await Gallery.find({\n            isFeatured: true,\n            isActive: true,\n            approvalStatus: 'Approved'");
    
    // In getGalleryItemsByCategory
    controller = controller.replace(/category: req\.params\.category,[\s\n]*isActive: true/, "category: req.params.category,\n            isActive: true,\n            approvalStatus: 'Approved'");

    // Export a new function to approve
    const approveFn = `
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
                approvedBy: req.admin._id,
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
            message: \`Gallery item \${status.toLowerCase()} successfully\`,
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
`;
    
    if (!controller.includes('approveGalleryItem')) {
        controller = controller.replace(/module\.exports = \{/, approveFn + "\nmodule.exports = {");
        controller = controller.replace(/getGalleryStats,/, "getGalleryStats,\n    approveGalleryItem,");
    }
    
    fs.writeFileSync('backend/controllers/galleryController.js', controller);
}

// 3. Update Gallery Routes
let routes = fs.readFileSync('backend/routes/gallery.js', 'utf8');
if (!routes.includes('approveGalleryItem')) {
    routes = routes.replace(/getGalleryStats,/, "getGalleryStats,\n    approveGalleryItem,");
    
    const authorizeImport = "const { protect, authorize } = require('../middleware/auth');";
    routes = routes.replace(/const \{ protect \} = require\('\.\.\/middleware\/auth'\);/, authorizeImport);
    
    const approveRoute = `
// Super Admin approval route
router.patch('/:itemId/approve', protect, authorize('super_admin'), approveGalleryItem);
`;
    routes = routes.replace(/module\.exports = router;/, approveRoute + "\nmodule.exports = router;");
    fs.writeFileSync('backend/routes/gallery.js', routes);
}
