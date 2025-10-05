const express = require('express');
const mongoose = require('mongoose');
const StudentApplication = require('../models/StudentApplication');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Debug endpoint to test database connection
router.get('/test', async (req, res) => {
    try {
        console.log('🧪 Testing database connection...');
        
        // Test direct collection access
        const totalCount = await StudentApplication.countDocuments({});
        console.log('📊 Total count:', totalCount);
        
        // Get sample documents
        const samples = await StudentApplication.find({}).limit(3).lean();
        console.log('📊 Sample docs:', samples.length);
        
        res.json({
            success: true,
            message: 'Database test',
            totalCount,
            sampleCount: samples.length,
            samples: samples.map(doc => ({
                id: doc._id,
                applicationId: doc.applicationId,
                status: doc.status,
                fullName: doc.personalDetails?.fullName
            }))
        });
    } catch (error) {
        console.error('❌ Test error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @desc    Get all student applications for admin management
// @route   GET /api/admin/students
// @access  Private - Staff/Super Admin only
router.get('/', async (req, res) => {
    try {
        console.log('👤 Request user:', req.user?.email, 'Role:', req.user?.role);
        
        // Test database connection
        console.log('🔍 Testing MongoDB connection...');
        const dbStatus = await StudentApplication.db.readyState;
        console.log('📊 Database state:', dbStatus === 1 ? 'Connected' : 'Disconnected/Connecting');
        
        const {
            page = 1,
            limit = 20,
            search,
            status,
            course,
            category,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter query
        const filter = {};

        // Search functionality
        if (search) {
            filter.$or = [
                { 'personalDetails.fullName': { $regex: search, $options: 'i' } },
                { 'personalDetails.aadharNumber': { $regex: search, $options: 'i' } },
                { 'contactDetails.primaryPhone': { $regex: search, $options: 'i' } },
                { 'contactDetails.email': { $regex: search, $options: 'i' } },
                { applicationId: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by status
        if (status && status !== 'all') {
            filter.status = status;
        }

        // Filter by course
        if (course && course !== 'all') {
            filter['courseDetails.selectedCourse'] = course;
        }

        // Filter by category
        if (category && category !== 'all') {
            filter['personalDetails.status'] = category;
        }

        // Build sort query
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Debug filter
        console.log('🔍 Query filter:', JSON.stringify(filter, null, 2));
        
        // Execute query with pagination
        const applications = await StudentApplication.find(filter)
            .populate('user', 'firstName lastName email phoneNumber')
            .populate('referralInfo.referredBy', 'firstName lastName referralCode')
            .populate('submittedBy', 'firstName lastName email phoneNumber')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            
        console.log(`📊 Found ${applications.length} applications`);;

        // Get total count for pagination
        const total = await StudentApplication.countDocuments(filter);
        const totalInCollection = await StudentApplication.countDocuments({});
        
        console.log(`📊 Total with filter: ${total}, Total in collection: ${totalInCollection}`);
        
        // Debug: Check first few documents to verify structure
        if (totalInCollection > 0) {
            const sampleDocs = await StudentApplication.find({}).limit(2).lean();
            console.log('📊 Sample documents:', JSON.stringify(sampleDocs, null, 2));
        }
        
        // Get filter options with error handling
        let filterOptions = {
            statuses: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
            courses: [],
            categories: []
        };
        
        try {
            filterOptions.courses = await StudentApplication.distinct('courseDetails.selectedCourse');
            filterOptions.categories = await StudentApplication.distinct('personalDetails.status');
        } catch (filterError) {
            console.error('Error getting filter options:', filterError);
            // Use default values if distinct queries fail
        }

        // Transform data for frontend
        const transformedStudents = applications.map(app => ({
            _id: app._id,
            applicationId: app.applicationId,
            fullName: app.personalDetails?.fullName || 'N/A',
            email: app.contactDetails?.email || app.user?.email || 'N/A',
            phone: app.contactDetails?.primaryPhone || app.user?.phoneNumber || 'N/A',
            aadharNumber: app.personalDetails?.aadharNumber || 'N/A',
            course: app.courseDetails?.selectedCourse || 'N/A',
            category: app.personalDetails?.status || 'N/A',
            status: app.status,
            currentStage: app.currentStage,
            guardianName: app.guardianDetails?.guardianName || 'N/A',
            guardianPhone: app.guardianDetails?.guardianPhone || 'N/A',
            referralCode: app.referralInfo?.referralCode || 'N/A',
            referredBy: app.submittedBy ? 
                `${app.submittedBy.firstName || ''} ${app.submittedBy.lastName || ''}`.trim() || 'Unknown' : 'Direct',
            submitterRole: app.submitterRole || 'student',
            documentsCount: app.documents?.length || 0,
            createdAt: app.createdAt,
            submittedAt: app.submittedAt,
            user: app.user,
            submittedBy: app.submittedBy
        }));

        res.json({
            success: true,
            data: {
                students: transformedStudents,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                },
                filters: filterOptions
            }
        });

    } catch (error) {
        console.error('Get admin students error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch students',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Get single student application details
// @route   GET /api/admin/students/:id
// @access  Private - Staff/Super Admin only
router.get('/:id', protect, authorize(['staff', 'super_admin']), async (req, res) => {
    try {
        const application = await StudentApplication.findById(req.params.id)
            .populate('user', 'firstName lastName email phoneNumber')
            .populate('referralInfo.referredBy', 'firstName lastName referralCode email phoneNumber')
            .exec();

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Student application not found'
            });
        }

        res.json({
            success: true,
            data: application
        });

    } catch (error) {
        console.error('Get student application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Update student application status
// @route   PUT /api/admin/students/:id/status
// @access  Private - Staff/Super Admin only
router.put('/:id/status', protect, authorize(['staff', 'super_admin']), async (req, res) => {
    try {
        const { status, notes } = req.body;

        if (!status || !['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status is required'
            });
        }

        const application = await StudentApplication.findById(req.params.id);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Student application not found'
            });
        }

        // Update status and add notes
        application.status = status;
        application.currentStage = status;
        
        if (notes) {
            if (!application.adminNotes) {
                application.adminNotes = [];
            }
            application.adminNotes.push({
                note: notes,
                addedBy: req.user._id,
                addedAt: new Date()
            });
        }

        // Update timestamps based on status
        if (status === 'APPROVED') {
            application.approvedAt = new Date();
            application.approvedBy = req.user._id;
        } else if (status === 'REJECTED') {
            application.rejectedAt = new Date();
            application.rejectedBy = req.user._id;
        }

        await application.save();

        res.json({
            success: true,
            message: 'Student application status updated successfully',
            data: {
                status: application.status,
                currentStage: application.currentStage,
                updatedAt: application.updatedAt
            }
        });

    } catch (error) {
        console.error('Update student status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update student status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Update student application details
// @route   PUT /api/admin/students/:id
// @access  Private - Staff/Super Admin only
router.put('/:id', protect, authorize(['staff', 'super_admin']), async (req, res) => {
    try {
        const application = await StudentApplication.findById(req.params.id);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Student application not found'
            });
        }

        const updateData = req.body;

        // Update personal details
        if (updateData.personalDetails) {
            Object.assign(application.personalDetails, updateData.personalDetails);
        }

        // Update contact details
        if (updateData.contactDetails) {
            Object.assign(application.contactDetails, updateData.contactDetails);
        }

        // Update course details
        if (updateData.courseDetails) {
            Object.assign(application.courseDetails, updateData.courseDetails);
        }

        // Update guardian details
        if (updateData.guardianDetails) {
            Object.assign(application.guardianDetails, updateData.guardianDetails);
        }

        // Update financial details
        if (updateData.financialDetails) {
            Object.assign(application.financialDetails, updateData.financialDetails);
        }

        await application.save();

        res.json({
            success: true,
            message: 'Student application updated successfully',
            data: application
        });

    } catch (error) {
        console.error('Update student application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update student application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Delete student application
// @route   DELETE /api/admin/students/:id
// @access  Private - Staff/Super Admin only  
router.delete('/:id', protect, authorize(['staff', 'super_admin']), async (req, res) => {
    try {
        const application = await StudentApplication.findById(req.params.id);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Student application not found'
            });
        }

        await StudentApplication.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Student application deleted successfully'
        });

    } catch (error) {
        console.error('Delete student application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete student application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Get student statistics for admin dashboard
// @route   GET /api/admin/students/stats
// @access  Private - Staff/Super Admin only
router.get('/stats/overview', protect, authorize(['staff', 'super_admin']), async (req, res) => {
    try {
        const stats = await StudentApplication.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const categoryStats = await StudentApplication.aggregate([
            {
                $group: {
                    _id: '$personalDetails.status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const courseStats = await StudentApplication.aggregate([
            {
                $group: {
                    _id: '$courseDetails.selectedCourse',
                    count: { $sum: 1 }
                }
            }
        ]);

        const monthlyStats = await StudentApplication.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        res.json({
            success: true,
            data: {
                statusStats: stats,
                categoryStats: categoryStats,
                courseStats: courseStats,
                monthlyStats: monthlyStats,
                totalApplications: await StudentApplication.countDocuments(),
                totalApproved: await StudentApplication.countDocuments({ status: 'APPROVED' }),
                totalPending: await StudentApplication.countDocuments({ status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] } }),
                totalRejected: await StudentApplication.countDocuments({ status: 'REJECTED' })
            }
        });

    } catch (error) {
        console.error('Get student stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;

