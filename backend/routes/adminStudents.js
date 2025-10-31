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
router.get('/', protect, authorize('staff', 'super_admin'), async (req, res) => {
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
            submitterRole,
            session: sessionParam,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter query
        const filter = {};

        // SESSION IS REQUIRED - Always filter by session
        if (!sessionParam) {
            return res.status(400).json({
                success: false,
                message: 'Session parameter is required',
                error: 'Missing session parameter'
            });
        }

        // Add session filter - REQUIRED
        const { getSessionDateRange } = require('../utils/sessionHelper');
        try {
            const { startDate, endDate } = getSessionDateRange(sessionParam);
            console.log(`📅 Filtering by session ${sessionParam}: ${startDate.toISOString()} to ${endDate.toISOString()}`);
            filter.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        } catch (error) {
            console.error('❌ Session date range error:', error);
            return res.status(400).json({
                success: false,
                message: `Invalid session format: ${error.message}`,
                error: process.env.NODE_ENV === "development" ? error.message : "Invalid session"
            });
        }

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

        // Filter by submitter role or specific submitter
        if (submitterRole && submitterRole !== 'all') {
            // Check if it's a submitter ID (ObjectId format) or role
            if (submitterRole.match(/^[0-9a-fA-F]{24}$/)) {
                // It's an ObjectId - filter by specific submitter
                filter.submittedBy = submitterRole;
            } else {
                // It's a role - filter by role
                filter.submitterRole = submitterRole;
            }
        }

        // Build sort query
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Debug filter
        console.log('🔍 Query filter:', JSON.stringify(filter, null, 2));

        // Execute query with pagination - don't populate submittedBy yet as it might be Admin
        const applications = await StudentApplication.find(filter)
            .populate('user', 'fullName email phoneNumber')
            .populate('referralInfo.referredBy', 'fullName email phoneNumber referralCode')
            .select('+submittedBy') // Ensure submittedBy is included even if populate fails
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean(false) // Keep as Mongoose documents to access raw _doc
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
            categories: [],
            submitters: []
        };

        try {
            filterOptions.courses = await StudentApplication.distinct('courseDetails.selectedCourse');
            filterOptions.categories = await StudentApplication.distinct('personalDetails.status');

            // Get unique submitters (agents and staff) with their names and submission counts
            // Apply session filter if provided
            const submitterMatch = {
                submitterRole: { $in: ['agent', 'staff'] },
                submittedBy: { $exists: true, $ne: null }
            };

            // Add session filter to submitter aggregation
            if (sessionParam && filter.createdAt) {
                submitterMatch.createdAt = filter.createdAt;
            }

            const submitterPipeline = [
                {
                    $match: submitterMatch
                },
                {
                    $group: {
                        _id: '$submittedBy',
                        role: { $first: '$submitterRole' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'userInfo'
                    }
                },
                {
                    $lookup: {
                        from: 'admins',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'adminInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$userInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: '$adminInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        role: 1,
                        count: 1,
                        name: {
                            $cond: {
                                if: { $ne: [{ $ifNull: ['$userInfo.fullName', ''] }, ''] },
                                then: '$userInfo.fullName',
                                else: {
                                    $cond: {
                                        if: {
                                            $or: [
                                                { $ne: [{ $ifNull: ['$adminInfo.firstName', ''] }, ''] },
                                                { $ne: [{ $ifNull: ['$adminInfo.lastName', ''] }, ''] }
                                            ]
                                        },
                                        then: {
                                            $concat: [
                                                { $ifNull: ['$adminInfo.firstName', ''] },
                                                ' ',
                                                { $ifNull: ['$adminInfo.lastName', ''] }
                                            ]
                                        },
                                        else: 'Unknown'
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $sort: { count: -1, name: 1 }
                }
            ];

            const submitters = await StudentApplication.aggregate(submitterPipeline);

            // Post-process to handle any remaining missing names by checking Admin model
            const submittersWithNames = await Promise.all(submitters.map(async (s) => {
                let name = s.name?.trim() || 'Unknown';

                // If name is still Unknown, try fetching from Admin model
                if (name === 'Unknown' && s._id) {
                    try {
                        const Admin = require('../models/Admin');
                        const admin = await Admin.findById(s._id).select('firstName lastName').lean();
                        if (admin && (admin.firstName || admin.lastName)) {
                            name = `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
                        }
                    } catch (err) {
                        // Ignore errors
                    }
                }

                return {
                    id: s._id.toString(),
                    name: name || 'Unknown',
                    role: s.role,
                    count: s.count
                };
            }));

            filterOptions.submitters = submittersWithNames;
        } catch (filterError) {
            console.error('Error getting filter options:', filterError);
            // Use default values if distinct queries fail
        }

        // Transform data for frontend (include ALL details for modal view)
        const transformedStudents = await Promise.all(applications.map(async (app) => {
            // Extract submitter name properly - User model uses fullName, not firstName/lastName
            let submitterName = 'Direct';

            // Get the raw submittedBy ID from the Mongoose document BEFORE converting to object
            // This is critical because populate might fail for Admin users, but the raw ObjectId is still there
            let submitterId = null;
            let submittedByObj = null;

            // Try multiple ways to get the raw ObjectId
            if (app._doc && app._doc.submittedBy) {
                // Raw document before any transformations
                submitterId = app._doc.submittedBy.toString ? app._doc.submittedBy.toString() : String(app._doc.submittedBy);
            } else if (app.submittedBy) {
                // Might be populated (object) or raw ObjectId
                if (typeof app.submittedBy === 'object') {
                    if (app.submittedBy._id) {
                        // Populated object
                        submittedByObj = app.submittedBy.toObject ? app.submittedBy.toObject() : app.submittedBy;
                        submitterId = app.submittedBy._id.toString ? app.submittedBy._id.toString() : String(app.submittedBy._id);
                    } else if (app.submittedBy.toString) {
                        // Raw ObjectId
                        submitterId = app.submittedBy.toString();
                    }
                } else if (typeof app.submittedBy === 'string') {
                    submitterId = app.submittedBy;
                }
            }

            // Convert Mongoose document to plain object for other fields
            const appObj = app.toObject ? app.toObject() : app;

            // Store submitter details for response object
            let submitterDetails = null;

            // Debug logging
            console.log('🔍 Processing app:', appObj._id);
            console.log('   submittedBy type:', typeof appObj.submittedBy);
            console.log('   submittedBy value:', appObj.submittedBy ? (appObj.submittedBy.toString ? appObj.submittedBy.toString() : JSON.stringify(appObj.submittedBy)) : 'null');
            console.log('   submitterRole:', appObj.submitterRole);
            console.log('   Raw _doc.submittedBy:', app._doc ? (app._doc.submittedBy ? app._doc.submittedBy.toString() : 'null') : 'no _doc');
            console.log('   submitterId extracted:', submitterId);
            console.log('   submittedByObj:', submittedByObj);

            // If we have a populated object with fullName, use it
            if (submittedByObj && submittedByObj.fullName) {
                // Already populated and has fullName (from User model)
                submitterName = submittedByObj.fullName.trim();
                submitterDetails = {
                    _id: submittedByObj._id ? submittedByObj._id.toString() : null,
                    fullName: submitterName,
                    email: submittedByObj.email || '',
                    phoneNumber: submittedByObj.phoneNumber || ''
                };
                console.log('   ✅ Found fullName from populated User:', submitterName);
            } else if (submitterId) {
                // Not populated but we have an ID - fetch from User model first
                try {
                    const User = require('../models/User');
                    const mongoose = require('mongoose');
                    const ObjectId = mongoose.Types.ObjectId;

                    // Ensure submitterId is a valid ObjectId
                    let validId = submitterId;
                    if (!ObjectId.isValid(submitterId)) {
                        console.log('   ⚠️ Invalid ObjectId:', submitterId);
                    } else {
                        validId = new ObjectId(submitterId);
                    }

                    let submitter = await User.findById(validId).select('fullName email phoneNumber').lean();

                    if (submitter && submitter.fullName) {
                        submitterName = submitter.fullName.trim();
                        submitterDetails = {
                            _id: submitter._id ? submitter._id.toString() : null,
                            fullName: submitterName,
                            email: submitter.email || '',
                            phoneNumber: submitter.phoneNumber || ''
                        };
                        console.log('   ✅ Fetched fullName from User model:', submitterName);
                    } else {
                        // If not found in User model, try Admin model (staff might be in Admin model)
                        const Admin = require('../models/Admin');
                        const adminSubmitter = await Admin.findById(validId).select('firstName lastName email phone').lean();

                        if (adminSubmitter && (adminSubmitter.firstName || adminSubmitter.lastName)) {
                            submitterName = `${adminSubmitter.firstName || ''} ${adminSubmitter.lastName || ''}`.trim();
                            submitterDetails = {
                                _id: adminSubmitter._id ? adminSubmitter._id.toString() : null,
                                fullName: submitterName,
                                email: adminSubmitter.email || '',
                                phoneNumber: adminSubmitter.phone || ''
                            };
                            console.log('   ✅ Fetched name from Admin model:', submitterName);
                        } else {
                            console.log('   ⚠️ Submitter not found in User or Admin models with ID:', submitterId);
                        }
                    }
                } catch (fetchError) {
                    console.error('   ❌ Error fetching submitter:', fetchError.message);
                    console.error('   Stack:', fetchError.stack);
                }
            } else {
                console.log('   ⚠️ submittedBy is null/undefined - no ID to fetch');
            }

            // Don't override if we have a valid name and it's not a student
            if (!submitterName || submitterName === 'Unknown' || submitterName.trim() === '') {
                if (appObj.submitterRole === 'student') {
                    submitterName = 'Direct';
                } else {
                    // For non-student roles, keep trying to get the name
                    submitterName = submitterName || 'Direct';
                }
            }

            console.log('   📝 Final submitterName:', submitterName, 'Role:', appObj.submitterRole);

            return {
                _id: appObj._id,
                applicationId: appObj.applicationId,
                fullName: appObj.personalDetails?.fullName || 'N/A',
                email: appObj.contactDetails?.email || appObj.user?.email || 'N/A',
                phone: appObj.contactDetails?.primaryPhone || appObj.user?.phoneNumber || 'N/A',
                aadharNumber: appObj.personalDetails?.aadharNumber || 'N/A',
                course: appObj.courseDetails?.selectedCourse || 'N/A',
                category: appObj.personalDetails?.status || 'N/A',
                status: appObj.status,
                currentStage: appObj.currentStage,
                guardianName: appObj.guardianDetails?.guardianName || 'N/A',
                guardianPhone: appObj.guardianDetails?.guardianPhone || 'N/A',
                referralCode: appObj.referralInfo?.referralCode || 'N/A',
                referredBy: submitterName,
                submitterRole: appObj.submitterRole || 'student',
                documentsCount: appObj.documents?.length || 0,
                createdAt: appObj.createdAt,
                submittedAt: appObj.submittedAt,
                user: appObj.user,
                submittedBy: submitterDetails,
                // Include full details for modal view
                personalDetails: appObj.personalDetails,
                contactDetails: appObj.contactDetails,
                courseDetails: appObj.courseDetails,
                guardianDetails: appObj.guardianDetails,
                financialDetails: appObj.financialDetails,
                documents: appObj.documents,
                reviewInfo: appObj.referralInfo,
                workflowHistory: appObj.workflowHistory,
                referralInfo: appObj.referralInfo
            };
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

// @desc    Get available rejection reasons
// @route   GET /api/admin/students/rejection-reasons
// @access  Private - Staff/Super Admin only
router.get('/rejection-reasons', protect, authorize('staff', 'super_admin'), async (req, res) => {
    try {
        const rejectionReasons = {
            documentIssues: {
                category: "Document Issues",
                reasons: [
                    {
                        id: "MISSING_DOCUMENT",
                        title: "Missing Document",
                        description: "Required document is not uploaded",
                        examples: ["10th Grade Certificate not uploaded", "Aadhar Card missing"]
                    },
                    {
                        id: "DOCUMENT_EXPIRED",
                        title: "Document Expired",
                        description: "Document has expired and needs renewal",
                        examples: ["Medical certificate expired", "Income certificate expired"]
                    },
                    {
                        id: "DOCUMENT_OLD",
                        title: "Document Too Old",
                        description: "Document is too old, need recent/current version",
                        examples: ["Birth certificate too old", "Address proof outdated"]
                    },
                    {
                        id: "DOCUMENT_BLURRY",
                        title: "Document Not Clear",
                        description: "Document image is blurry or unclear",
                        examples: ["Certificate image is blurry", "Document not readable"]
                    },
                    {
                        id: "DOCUMENT_CUT_OFF",
                        title: "Document Cut Off",
                        description: "Document image is incomplete or cut off",
                        examples: ["Certificate edges cut off", "Document partially visible"]
                    },
                    {
                        id: "WRONG_DOCUMENT",
                        title: "Wrong Document Type",
                        description: "Uploaded document is not the required type",
                        examples: ["Uploaded mark sheet instead of certificate", "Wrong document uploaded"]
                    },
                    {
                        id: "DOCUMENT_DAMAGED",
                        title: "Document Damaged",
                        description: "Document is damaged or torn",
                        examples: ["Certificate is torn", "Document has stains"]
                    }
                ]
            },
            personalInfoIssues: {
                category: "Personal Information Issues",
                reasons: [
                    {
                        id: "NAME_MISMATCH",
                        title: "Name Mismatch",
                        description: "Name in documents doesn't match application",
                        examples: ["Name spelling different", "Name format mismatch"]
                    },
                    {
                        id: "DATE_MISMATCH",
                        title: "Date Mismatch",
                        description: "Date of birth or other dates don't match",
                        examples: ["DOB mismatch", "Certificate date mismatch"]
                    },
                    {
                        id: "INCOMPLETE_INFO",
                        title: "Incomplete Information",
                        description: "Required personal information is missing",
                        examples: ["Father's name missing", "Address incomplete"]
                    }
                ]
            },
            academicIssues: {
                category: "Academic Issues",
                reasons: [
                    {
                        id: "GRADE_INSUFFICIENT",
                        title: "Insufficient Grades",
                        description: "Academic performance doesn't meet requirements",
                        examples: ["Marks below minimum requirement", "Grade not eligible"]
                    },
                    {
                        id: "COURSE_MISMATCH",
                        title: "Course Mismatch",
                        description: "Selected course doesn't match qualifications",
                        examples: ["Course not suitable for qualification", "Wrong course selected"]
                    }
                ]
            },
            otherIssues: {
                category: "Other Issues",
                reasons: [
                    {
                        id: "FRAUD_DETECTED",
                        title: "Fraud Detected",
                        description: "Suspected fraudulent documents",
                        examples: ["Fake certificate detected", "Forged document"]
                    },
                    {
                        id: "INCOMPLETE_APPLICATION",
                        title: "Incomplete Application",
                        description: "Application form is incomplete",
                        examples: ["Required fields missing", "Form not fully filled"]
                    },
                    {
                        id: "DUPLICATE_APPLICATION",
                        title: "Duplicate Application",
                        description: "Multiple applications found",
                        examples: ["Already applied", "Duplicate submission"]
                    }
                ]
            }
        };

        res.json({
            success: true,
            data: rejectionReasons
        });

    } catch (error) {
        console.error('Get rejection reasons error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get rejection reasons',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Get single student application details
// @route   GET /api/admin/students/:id
// @access  Private - Staff/Super Admin only
router.get('/:id', protect, authorize('staff', 'super_admin'), async (req, res) => {
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
router.put('/:id/status', protect, authorize('staff', 'super_admin'), async (req, res) => {
    try {
        const {
            status,
            notes,
            rejectionReason,
            rejectionMessage,
            rejectionDetails = []
        } = req.body;

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

        // Handle rejection with specific reasons
        if (status === 'REJECTED') {
            if (!rejectionReason) {
                return res.status(400).json({
                    success: false,
                    message: 'Rejection reason is required'
                });
            }

            // Enhanced rejection details with document-specific feedback
            const enhancedRejectionDetails = rejectionDetails.map(detail => {
                if (typeof detail === 'string') {
                    return {
                        issue: detail,
                        documentType: 'General',
                        actionRequired: 'Please address the mentioned issue',
                        priority: 'High'
                    };
                }
                return {
                    issue: detail.issue || detail,
                    documentType: detail.documentType || 'General',
                    actionRequired: detail.actionRequired || 'Please provide correct document',
                    priority: detail.priority || 'High',
                    specificFeedback: detail.specificFeedback || ''
                };
            });

            // Use the model's rejectApplication method
            await application.rejectApplication(
                req.user._id,
                rejectionReason,
                notes || '',
                rejectionMessage || '',
                enhancedRejectionDetails
            );

            res.json({
                success: true,
                message: 'Application rejected successfully',
                data: {
                    status: application.status,
                    currentStage: application.currentStage,
                    rejectionReason,
                    rejectionMessage,
                    rejectionDetails: enhancedRejectionDetails,
                    rejectedAt: application.reviewInfo?.reviewedAt,
                    rejectedBy: req.user._id,
                    canResubmit: true
                }
            });
            return;
        }

        // Handle other status updates
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
router.put('/:id', protect, authorize('staff', 'super_admin'), async (req, res) => {
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
router.delete('/:id', protect, authorize('staff', 'super_admin'), async (req, res) => {
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
router.get('/stats/overview', protect, authorize('staff', 'super_admin'), async (req, res) => {
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

// @desc    Get rejection details for student
// @route   GET /api/admin/students/:id/rejection-details
// @access  Private - Student only
router.get('/:id/rejection-details', protect, async (req, res) => {
    try {
        const application = await StudentApplication.findById(req.params.id);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Student application not found'
            });
        }

        // Check if user owns this application
        if (application.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only view your own application details'
            });
        }

        // Check if application is rejected
        if (application.status !== 'REJECTED') {
            return res.status(400).json({
                success: false,
                message: 'Application is not rejected'
            });
        }

        res.json({
            success: true,
            data: {
                rejectionReason: application.reviewInfo?.rejectionReason,
                rejectionMessage: application.reviewInfo?.rejectionMessage,
                rejectionDetails: application.reviewInfo?.rejectionDetails || [],
                rejectedAt: application.reviewInfo?.reviewedAt,
                rejectedBy: application.reviewInfo?.reviewedBy,
                adminNotes: application.adminNotes?.filter(note => note.type !== 'RESUBMISSION') || []
            }
        });

    } catch (error) {
        console.error('Get rejection details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get rejection details',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @desc    Resubmit rejected application
// @route   POST /api/admin/students/:id/resubmit
// @access  Private - Student only
router.post('/:id/resubmit', protect, async (req, res) => {
    try {
        const application = await StudentApplication.findById(req.params.id);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Student application not found'
            });
        }

        // Check if user owns this application
        if (application.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only resubmit your own applications'
            });
        }

        // Check if application is rejected
        if (application.status !== 'REJECTED') {
            return res.status(400).json({
                success: false,
                message: 'Only rejected applications can be resubmitted'
            });
        }

        // Reset status to SUBMITTED for review
        application.status = 'SUBMITTED';
        application.currentStage = 'SUBMITTED';
        application.submittedAt = new Date();

        // Add resubmission note
        if (!application.adminNotes) {
            application.adminNotes = [];
        }
        application.adminNotes.push({
            note: 'Application resubmitted by student after addressing rejection feedback',
            addedBy: req.user._id,
            addedAt: new Date(),
            type: 'RESUBMISSION'
        });

        // Add to workflow history
        application.workflowHistory.push({
            stage: 'SUBMITTED',
            status: 'SUBMITTED',
            updatedBy: req.user._id,
            action: 'RESUBMIT',
            remarks: 'Application resubmitted after addressing rejection feedback',
            timestamp: new Date()
        });

        await application.save();

        res.json({
            success: true,
            message: 'Application resubmitted successfully',
            data: {
                status: application.status,
                currentStage: application.currentStage,
                submittedAt: application.submittedAt,
                resubmittedAt: new Date()
            }
        });

    } catch (error) {
        console.error('Resubmit application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resubmit application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;

