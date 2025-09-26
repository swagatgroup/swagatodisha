const StudentApplication = require('../models/StudentApplication');
const User = require('../models/User');
const PDFGenerator = require('../utils/pdfGenerator');
const path = require('path');

// Create application
const createApplication = async (req, res) => {
    try {
        const {
            personalDetails,
            contactDetails,
            courseDetails,
            guardianDetails,
            financialDetails = {},
            referralCode,
        } = req.body;

        // Handle referral code if provided
        let referralInfo = {};
        if (referralCode) {
            const referrer = await User.findOne({ referralCode });
            if (referrer) {
                referralInfo = {
                    referredBy: referrer._id,
                    referralCode,
                    referralType: referrer.role,
                };
            }
        }

        // Convert date string to Date object for personalDetails.dateOfBirth
        if (personalDetails && personalDetails.dateOfBirth) {
            personalDetails.dateOfBirth = new Date(personalDetails.dateOfBirth);
        }

        // Create application
        const applicationData = {
            user: req.user._id,
            personalDetails,
            contactDetails,
            courseDetails,
            guardianDetails,
            financialDetails,
            referralInfo,
            submittedBy: req.user._id,
            submitterRole: req.user.role || 'student',
            progress: {
                registrationComplete: true,
            },
        };

        // Generate applicationId if not provided
        if (!applicationData.applicationId) {
            const year = new Date().getFullYear().toString().substr(-2);
            const random = Math.random().toString().substr(2, 6).toUpperCase();
            applicationData.applicationId = `APP${year}${random}`;
        }

        console.log(
            "Creating application with data:",
            JSON.stringify(applicationData, null, 2)
        );

        try {
            const application = new StudentApplication(applicationData);

            console.log("Application object created, saving...");
            await application.save();
            console.log("Application saved successfully");
            await application.populate("user", "fullName email phoneNumber");

            // Real-time updates removed (Socket.IO removed)

            res.status(201).json({
                success: true,
                message: "Application created successfully",
                data: application,
            });
        } catch (error) {
            console.error("Create application error:", error);
            console.error("Error details:", {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code,
            });

            res.status(500).json({
                success: false,
                message: "Failed to create application",
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            });
        }
    } catch (error) {
        console.error("Create application error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create application",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};

// Update application
const updateApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const updateData = req.body;

        const application = await StudentApplication.findOne({
            applicationId,
            user: req.user._id,
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found",
            });
        }

        // Update application data
        Object.keys(updateData).forEach((key) => {
            if (updateData[key] !== undefined) {
                application[key] = updateData[key];
            }
        });

        await application.save();

        // Real-time updates removed (Socket.IO removed)

        res.status(200).json({
            success: true,
            message: "Application updated successfully",
            data: application,
        });
    } catch (error) {
        console.error("Update application error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update application",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};

// Save draft
const saveDraft = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { data, stage } = req.body;

        const application = await StudentApplication.findOne({
            applicationId,
            user: req.user._id,
        });

        // Fallback: allow saving by applicationId only if user-scoped lookup failed (edge cases)
        let appDoc = application;
        if (!appDoc) {
            appDoc = await StudentApplication.findOne({ applicationId });
        }

        if (!appDoc) {
            return res.status(404).json({
                success: false,
                message: "Application not found",
            });
        }

        // Update application data
        if (data) {
            Object.keys(data).forEach((key) => {
                if (data[key] !== undefined) {
                    // Special handling: normalize documents from frontend SimpleDocumentUpload (Cloudinary-backed)
                    if (key === 'documents' && data.documents && typeof data.documents === 'object' && !Array.isArray(data.documents)) {
                        const normalizedDocs = Object.entries(data.documents).map(([docType, doc]) => ({
                            documentType: docType,
                            fileName: doc.name || 'uploaded',
                            filePath: doc.downloadUrl || doc.url || doc.filePath || '',
                            storageType: 'cloudinary',
                            cloudinaryPublicId: doc.cloudinaryPublicId || doc.public_id || undefined,
                            fileSize: doc.size,
                            mimeType: doc.type,
                            status: 'PENDING',
                            uploadedAt: new Date()
                        })).filter(d => d.filePath);

                        appDoc.documents = normalizedDocs;
                    } else {
                        appDoc[key] = data[key];
                    }
                }
            });
        }

        if (stage) {
            appDoc.currentStage = stage;
        }

        await appDoc.save();

        // Real-time updates removed (Socket.IO removed)

        res.status(200).json({
            success: true,
            message: "Draft saved successfully",
            data: application,
        });
    } catch (error) {
        console.error("Save draft error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save draft",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};

// Submit application
const submitApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { termsAccepted } = req.body;

        const application = await StudentApplication.findOne({
            applicationId,
            user: req.user._id,
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found",
            });
        }

        // Update application status
        application.status = "SUBMITTED";
        application.currentStage = "SUBMITTED";
        application.submittedAt = new Date();
        application.termsAccepted = termsAccepted || false;
        application.termsAcceptedAt = new Date();

        await application.save();

        // Real-time updates removed (Socket.IO removed)

        res.status(200).json({
            success: true,
            message: "Application submitted successfully",
            data: {
                applicationId: application.applicationId,
                status: application.status,
                submittedAt: application.submittedAt,
            },
        });
    } catch (error) {
        console.error("Submit application error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit application",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};

// Get application
const getApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await StudentApplication.findOne({
            applicationId,
            user: req.user._id,
        }).populate("user", "fullName email phoneNumber");

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found",
            });
        }

        res.status(200).json({
            success: true,
            data: application,
        });
    } catch (error) {
        console.error("Get application error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get application",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};

// Get user applications
const getUserApplications = async (req, res) => {
    try {
        const applications = await StudentApplication.find({
            user: req.user._id,
        })
            .populate("user", "fullName email phoneNumber")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: applications,
        });
    } catch (error) {
        console.error("Get user applications error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get applications",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};

// Get applications submitted by current user (for agents/staff)
const getSubmittedApplications = async (req, res) => {
    try {
        const applications = await StudentApplication.find({
            submittedBy: req.user._id,
        })
            .populate("user", "fullName email phoneNumber")
            .populate("submittedBy", "fullName email role")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: applications,
        });
    } catch (error) {
        console.error("Get submitted applications error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get submitted applications",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};

// Placeholder functions for missing routes
const updateApplicationStage = async (req, res) => {
    res.status(501).json({
        success: false,
        message: "Function not implemented (Socket.IO removed)"
    });
};

const generateApplicationPDF = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await StudentApplication.findOne({ applicationId })
            .populate('user', 'fullName email phoneNumber');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const result = await PDFGenerator.generateCombinedPDF(application);

        // Persist combined PDF url for quick access
        application.combinedPdfUrl = `/uploads/processed/${result.fileName}`;
        application.progress.applicationPdfGenerated = true;
        await application.save();

        return res.status(200).json({
            success: true,
            message: 'Application PDF generated successfully',
            data: {
                fileName: result.fileName,
                filePath: result.filePath,
                url: application.combinedPdfUrl
            }
        });
    } catch (error) {
        console.error('Generate application PDF error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate application PDF',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

const downloadApplicationPDF = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await StudentApplication.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (!application.combinedPdfUrl) {
            return res.status(400).json({ success: false, message: 'PDF not generated yet' });
        }

        // Serve the generated file from uploads/processed
        const filePath = path.join(__dirname, '..', application.combinedPdfUrl);
        return res.download(filePath);
    } catch (error) {
        console.error('Download application PDF error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to download application PDF',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

const getApplicationsByStatus = async (req, res) => {
    try {
        const { status = 'SUBMITTED', page = 1, limit = 20, reviewFilter } = req.query;

        console.log('getApplicationsByStatus called with:', { status, page, limit, reviewFilter });

        let query = status === 'all' ? {} : { status: status.toUpperCase() };

        // Get all applications first, then filter by document review status
        let applications = await StudentApplication.find(query)
            .populate('user', 'fullName email phoneNumber')
            .populate('referralInfo.referredBy', 'firstName lastName referralCode')
            .populate('assignedAgent', 'firstName lastName referralCode')
            .sort({ createdAt: -1 });

        // Apply document review filtering (treat PENDING and NOT_VERIFIED as not reviewed)
        if (reviewFilter) {
            console.log(`Filtering applications by reviewFilter: ${reviewFilter}`);
            console.log(`Total applications before filtering: ${applications.length}`);

            applications = applications.filter(app => {
                const documents = app.documents || [];
                const totalDocs = documents.length;
                const reviewedDocs = documents.filter(doc => doc.status && doc.status !== 'PENDING').length;
                const approvedDocs = documents.filter(doc => doc.status === 'APPROVED').length;
                const rejectedDocs = documents.filter(doc => doc.status === 'REJECTED').length;

                console.log(`Checking application ${app._id}:`, {
                    totalDocs, reviewedDocs, approvedDocs, rejectedDocs,
                    documents: documents.map(d => ({ type: d.documentType, status: d.status })),
                    allDocumentStatuses: documents.map(d => d.status),
                    uniqueStatuses: [...new Set(documents.map(d => d.status))]
                });

                let matches = false;
                switch (reviewFilter) {
                    case 'not_reviewed':
                        // Include applications that haven't been reviewed (either no documents or documents not reviewed)
                        matches = totalDocs === 0 || (totalDocs > 0 && reviewedDocs === 0);
                        break;
                    case 'partially_reviewed':
                        matches = totalDocs > 0 && reviewedDocs > 0 && reviewedDocs < totalDocs;
                        break;
                    case 'all_approved':
                        matches = totalDocs > 0 && reviewedDocs === totalDocs && rejectedDocs === 0;
                        break;
                    case 'has_rejected':
                        matches = rejectedDocs > 0;
                        break;
                    case 'no_documents':
                        matches = totalDocs === 0;
                        break;
                    default:
                        matches = true;
                }

                console.log(`Application ${app._id} ${matches ? 'MATCHES' : 'DOES NOT MATCH'} filter ${reviewFilter}`);

                return matches;
            });

            console.log(`Total applications after filtering: ${applications.length}`);
        }

        // Apply pagination
        const total = applications.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        applications = applications.slice(startIndex, endIndex);

        // Calculate document review statistics for each application
        const applicationsWithStats = applications.map(app => {
            const documents = app.documents || [];
            const totalDocs = documents.length;
            const reviewedDocs = documents.filter(doc => doc.status && doc.status !== 'PENDING' && doc.status !== 'NOT_VERIFIED').length;
            const approvedDocs = documents.filter(doc => doc.status === 'APPROVED').length;
            const rejectedDocs = documents.filter(doc => doc.status === 'REJECTED').length;
            const pendingDocs = documents.filter(doc => doc.status === 'PENDING').length;

            // Determine review status and update application status
            let reviewStatus = 'not_reviewed';
            let applicationStatus = app.status;
            let currentStage = app.currentStage;

            if (totalDocs === 0) {
                reviewStatus = 'no_documents';
            } else if (reviewedDocs === totalDocs) {
                if (rejectedDocs === 0) {
                    reviewStatus = 'all_approved';
                    // All documents approved - move to next stage
                    if (app.status === 'UNDER_REVIEW') {
                        applicationStatus = 'APPROVED';
                        currentStage = 'APPROVED';
                    }
                } else if (approvedDocs === 0) {
                    reviewStatus = 'all_rejected';
                    // All documents rejected - keep under review but mark as rejected
                    if (app.status === 'UNDER_REVIEW') {
                        applicationStatus = 'REJECTED';
                        currentStage = 'DOCUMENTS';
                    }
                } else {
                    reviewStatus = 'mixed_results';
                    // Mixed results - keep under review
                    applicationStatus = 'UNDER_REVIEW';
                    currentStage = 'DOCUMENTS';
                }
            } else if (reviewedDocs > 0) {
                reviewStatus = 'partially_reviewed';
                // Partially reviewed - keep under review
                applicationStatus = 'UNDER_REVIEW';
                currentStage = 'DOCUMENTS';
            }

            return {
                ...app.toObject(),
                status: applicationStatus,
                currentStage: currentStage,
                documentStats: {
                    total: totalDocs,
                    reviewed: reviewedDocs,
                    approved: approvedDocs,
                    rejected: rejectedDocs,
                    pending: pendingDocs,
                    reviewProgress: totalDocs > 0 ? Math.round((reviewedDocs / totalDocs) * 100) : 0,
                    reviewStatus
                }
            };
        });

        return res.status(200).json({
            success: true,
            data: {
                applications: applicationsWithStats,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get applications by status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get applications',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

const approveApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { remarks } = req.body;

        const application = await StudentApplication.findOne({ applicationId })
            .populate('user', 'fullName email phoneNumber')
            .populate('submittedBy', 'fullName email phoneNumber')
            .populate('assignedAgent', 'fullName email phoneNumber');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        await application.approveApplication(req.user._id, remarks || 'Approved by staff');
        application.reviewStatus.overallApproved = true;
        application.reviewStatus.reviewedBy = req.user._id;
        application.reviewStatus.reviewedAt = new Date();
        await application.save();

        // Send notifications to relevant parties
        await sendApplicationStatusNotification(application, 'APPROVED', remarks || 'Application approved by staff');

        return res.status(200).json({
            success: true,
            message: 'Application approved successfully',
            data: application
        });
    } catch (error) {
        console.error('Approve application error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to approve application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

const rejectApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { rejectionReason, remarks } = req.body;

        const application = await StudentApplication.findOne({ applicationId })
            .populate('user', 'fullName email phoneNumber')
            .populate('submittedBy', 'fullName email phoneNumber')
            .populate('assignedAgent', 'fullName email phoneNumber');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        await application.rejectApplication(req.user._id, rejectionReason || 'Insufficient/invalid documents', remarks);
        application.reviewStatus.overallApproved = false;
        application.reviewStatus.reviewedBy = req.user._id;
        application.reviewStatus.reviewedAt = new Date();
        await application.save();

        // Send notifications to relevant parties
        await sendApplicationStatusNotification(application, 'REJECTED', remarks || rejectionReason || 'Application rejected by staff');

        return res.status(200).json({
            success: true,
            message: 'Application rejected successfully',
            data: application
        });
    } catch (error) {
        console.error('Reject application error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to reject application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

const getWorkflowStats = async (req, res) => {
    try {
        const totals = await Promise.all([
            StudentApplication.countDocuments({}),
            StudentApplication.countDocuments({ status: 'SUBMITTED' }),
            StudentApplication.countDocuments({ status: 'UNDER_REVIEW' }),
            StudentApplication.countDocuments({ status: 'APPROVED' }),
            StudentApplication.countDocuments({ status: 'REJECTED' })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                total: totals[0],
                submitted: totals[1],
                underReview: totals[2],
                approved: totals[3],
                rejected: totals[4]
            }
        });
    } catch (error) {
        console.error('Get workflow stats error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get workflow stats',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

const getDocumentReviewStats = async (req, res) => {
    try {
        // Only count SUBMITTED applications to match the filtered endpoints
        const applications = await StudentApplication.find({ status: 'SUBMITTED' })
            .select('documents status');

        let totalApplications = applications.length;
        let notReviewed = 0;
        let partiallyReviewed = 0;
        let allApproved = 0;
        let hasRejected = 0;
        let noDocuments = 0;

        applications.forEach(app => {
            const documents = app.documents || [];
            const totalDocs = documents.length;
            const reviewedDocs = documents.filter(doc => doc.status !== 'PENDING').length;
            const approvedDocs = documents.filter(doc => doc.status === 'APPROVED').length;
            const rejectedDocs = documents.filter(doc => doc.status === 'REJECTED').length;

            if (totalDocs === 0) {
                noDocuments++;
                // Applications with no documents also count as "not reviewed"
                notReviewed++;
            } else if (reviewedDocs === 0) {
                // No documents have been reviewed yet
                notReviewed++;
            } else if (reviewedDocs === totalDocs) {
                // All documents have been reviewed
                if (rejectedDocs === 0) {
                    // All documents are approved
                    allApproved++;
                } else {
                    // Has at least one rejected document
                    hasRejected++;
                }
            } else {
                // Some documents reviewed, some not
                partiallyReviewed++;
            }
        });

        console.log('Document Review Stats (SUBMITTED only):', {
            total: totalApplications,
            notReviewed,
            partiallyReviewed,
            allApproved,
            hasRejected,
            noDocuments
        });

        return res.status(200).json({
            success: true,
            data: {
                total: totalApplications,
                notReviewed,
                partiallyReviewed,
                allApproved,
                hasRejected,
                noDocuments,
                reviewProgress: totalApplications > 0 ? Math.round(((allApproved + hasRejected) / totalApplications) * 100) : 0
            }
        });
    } catch (error) {
        console.error('Get document review stats error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get document review stats',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};


const verifyDocuments = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { decisions = [], feedbackSummary } = req.body;

        const application = await StudentApplication.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (!Array.isArray(decisions) || decisions.length === 0) {
            return res.status(400).json({ success: false, message: 'No document decisions provided' });
        }

        // Update embedded documents by documentType
        const documents = application.documents || [];
        const docMap = new Map(documents.map((d) => [d.documentType, d]));
        decisions.forEach((d) => {
            const existing = docMap.get(d.documentType);
            if (existing) {
                existing.status = d.status || 'PENDING';
                // For approvals, use default remark if none provided. For rejections, require remarks.
                if (d.status === 'APPROVED') {
                    existing.remarks = d.remarks || 'Document approved';
                } else if (d.status === 'REJECTED') {
                    existing.remarks = d.remarks || 'Document rejected - no reason provided';
                }
                existing.reviewedBy = req.user?._id;
                existing.reviewedAt = new Date();
            }
        });

        // Compute verification flags
        const allDocs = application.documents || [];
        const hasAny = allDocs.length > 0;
        const counts = allDocs.reduce((acc, d) => {
            acc.total += 1;
            if (d.status === 'APPROVED') acc.approved += 1;
            else if (d.status === 'REJECTED') acc.rejected += 1;
            else acc.pending += 1;
            return acc;
        }, { approved: 0, rejected: 0, pending: 0, total: 0 });
        const allApproved = hasAny && counts.approved === counts.total;
        const allRejected = hasAny && counts.rejected === counts.total;
        const anyReviewed = counts.approved + counts.rejected > 0;

        // Initialize reviewStatus if it doesn't exist
        if (!application.reviewStatus) {
            application.reviewStatus = {};
        }

        // Store mixed feedback summary
        if (feedbackSummary) {
            application.reviewStatus.feedbackSummary = feedbackSummary;
        }

        application.reviewStatus.documentsVerified = allApproved;
        application.reviewStatus.reviewedBy = req.user._id;
        application.reviewStatus.reviewedAt = new Date();
        application.reviewStatus.documentCounts = counts;

        // Set overall document review status
        let overallStatus;
        if (!hasAny || counts.pending === counts.total) {
            overallStatus = 'UNDER_REVIEW';
        } else if (allApproved) {
            overallStatus = 'ALL_APPROVED';
        } else if (allRejected) {
            overallStatus = 'ALL_REJECTED';
        } else if (anyReviewed) {
            overallStatus = 'PARTIALLY_APPROVED';
        } else {
            overallStatus = 'UNDER_REVIEW';
        }

        application.reviewStatus.overallDocumentReviewStatus = overallStatus;

        console.log(`Setting overall status for ${application.applicationId}:`, {
            counts,
            overallStatus,
            allApproved,
            allRejected,
            anyReviewed
        });

        // Update application status based on document review results
        if (allApproved) {
            application.status = 'UNDER_REVIEW';
            application.currentStage = 'UNDER_REVIEW';
        } else if (counts.rejected > 0) {
            // If any documents are rejected, keep status as SUBMITTED but mark as needing attention
            application.status = 'SUBMITTED';
            application.currentStage = 'DOCUMENTS';
        } else if (anyReviewed) {
            // Partially reviewed but no rejections yet
            application.status = 'UNDER_REVIEW';
            application.currentStage = 'DOCUMENTS';
        }
        // If some are approved but not all, keep current status

        await application.save();

        // Send notification about document review status
        if (anyReviewed) {
            await sendDocumentReviewNotification(application, counts, feedbackSummary);
        }

        // Generate response message based on feedback type
        let responseMessage = 'Documents reviewed successfully';
        if (feedbackSummary) {
            responseMessage = `Documents reviewed successfully. ${feedbackSummary}`;
        } else if (counts.approved > 0 && counts.rejected > 0) {
            responseMessage = `Mixed feedback: ${counts.approved} approved, ${counts.rejected} rejected`;
        } else if (counts.approved > 0) {
            responseMessage = `All documents approved (${counts.approved})`;
        } else if (counts.rejected > 0) {
            responseMessage = `All documents rejected (${counts.rejected})`;
        }

        return res.status(200).json({
            success: true,
            message: responseMessage,
            data: {
                application,
                summary: counts,
                feedbackSummary: feedbackSummary || null
            }
        });
    } catch (error) {
        console.error('Verify documents error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify documents',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Fix document review status for existing applications
const fixDocumentReviewStatus = async (req, res) => {
    try {
        console.log('Starting document review status fix...');

        // Find all applications that have documents
        const applications = await StudentApplication.find({
            'documents.0': { $exists: true }
        });

        console.log(`Found ${applications.length} applications with documents`);

        for (const application of applications) {
            const documents = application.documents || [];
            const hasAny = documents.length > 0;

            const counts = documents.reduce((acc, d) => {
                acc.total += 1;
                if (d.status === 'APPROVED') acc.approved += 1;
                else if (d.status === 'REJECTED') acc.rejected += 1;
                else acc.pending += 1;
                return acc;
            }, { approved: 0, rejected: 0, pending: 0, total: 0 });

            const allApproved = hasAny && counts.approved === counts.total;
            const allRejected = hasAny && counts.rejected === counts.total;
            const anyReviewed = counts.approved + counts.rejected > 0;

            // Determine overall status
            let overallStatus;
            if (!hasAny || counts.pending === counts.total) {
                overallStatus = 'UNDER_REVIEW';
            } else if (allApproved) {
                overallStatus = 'ALL_APPROVED';
            } else if (allRejected) {
                overallStatus = 'ALL_REJECTED';
            } else if (anyReviewed) {
                overallStatus = 'PARTIALLY_APPROVED';
            } else {
                overallStatus = 'UNDER_REVIEW';
            }

            // Update the application
            application.reviewStatus = application.reviewStatus || {};
            application.reviewStatus.documentCounts = counts;
            application.reviewStatus.overallDocumentReviewStatus = overallStatus;
            application.reviewStatus.documentsVerified = allApproved;

            await application.save();

            console.log(`Updated ${application.applicationId}: ${counts.approved} approved, ${counts.rejected} rejected, ${counts.pending} pending -> ${overallStatus}`);
        }

        res.status(200).json({
            success: true,
            message: `Fixed document review status for ${applications.length} applications`,
            data: { fixedCount: applications.length }
        });
    } catch (error) {
        console.error('Error fixing document review status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fix document review status',
            error: error.message
        });
    }
};

const generateCombinedPDF = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await StudentApplication.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const result = await PDFGenerator.generateCombinedPDF(application);
        application.combinedPdfUrl = `/uploads/processed/${result.fileName}`;
        application.progress.applicationPdfGenerated = true;
        await application.save();

        return res.status(200).json({
            success: true,
            message: 'Combined PDF generated successfully',
            data: {
                fileName: result.fileName,
                filePath: result.filePath,
                url: application.combinedPdfUrl
            }
        });
    } catch (error) {
        console.error('Generate combined PDF error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate combined PDF',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

const generateDocumentsZIP = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await StudentApplication.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const result = await PDFGenerator.generateDocumentsZIP(application);
        application.documentsZipUrl = `/uploads/processed/${result.fileName}`;
        await application.save();

        return res.status(200).json({
            success: true,
            message: 'Documents ZIP generated successfully',
            data: {
                fileName: result.fileName,
                filePath: result.filePath,
                url: application.documentsZipUrl,
                size: result.size
            }
        });
    } catch (error) {
        console.error('Generate documents ZIP error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate documents ZIP',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

const getApplicationReview = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await StudentApplication.findOne({ applicationId })
            .populate('user', 'fullName email phoneNumber')
            .populate('assignedAgent', 'fullName email phoneNumber')
            .populate('assignedStaff', 'fullName email phoneNumber');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        return res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        console.error('Get application review error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get application review data',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Helper function to send document review notifications
const sendDocumentReviewNotification = async (application, counts, feedbackSummary) => {
    try {
        const Notification = require('../models/Notification');

        let message = `Document review completed for application ${application.applicationId}. `;
        if (counts.approved > 0 && counts.rejected > 0) {
            message += `${counts.approved} documents approved, ${counts.rejected} documents rejected.`;
        } else if (counts.approved > 0) {
            message += `All ${counts.approved} documents approved.`;
        } else if (counts.rejected > 0) {
            message += `${counts.rejected} documents rejected.`;
        }

        if (feedbackSummary) {
            message += ` ${feedbackSummary}`;
        }

        // Create notification for the student
        if (application.user) {
            const studentNotification = new Notification({
                title: 'Document Review Update',
                content: message,
                shortDescription: 'Document Review Update',
                type: 'document_review',
                category: 'application',
                targetAudience: 'student',
                targetUsers: [application.user._id],
                priority: counts.rejected > 0 ? 'high' : 'medium',
                publishDate: new Date(),
                status: 'published',
                createdBy: application.reviewStatus.reviewedBy,
                lastModified: new Date(),
                modifiedBy: application.reviewStatus.reviewedBy
            });
            await studentNotification.save();
        }

        // Create notification for the agent (if different from student)
        if (application.assignedAgent && application.assignedAgent._id.toString() !== application.user._id.toString()) {
            const agentNotification = new Notification({
                title: 'Student Document Review Update',
                content: `Document review completed for student ${application.user?.fullName}'s application ${application.applicationId}. ${message}`,
                shortDescription: 'Student Document Review Update',
                type: 'document_review',
                category: 'application',
                targetAudience: 'agent',
                targetUsers: [application.assignedAgent._id],
                priority: counts.rejected > 0 ? 'high' : 'medium',
                publishDate: new Date(),
                status: 'published',
                createdBy: application.reviewStatus.reviewedBy,
                lastModified: new Date(),
                modifiedBy: application.reviewStatus.reviewedBy
            });
            await agentNotification.save();
        }

        console.log(`Document review notifications sent for application ${application.applicationId}`);
    } catch (error) {
        console.error('Error sending document review notifications:', error);
        // Don't throw error - notifications are not critical for the main flow
    }
};

// Helper function to send application status notifications
const sendApplicationStatusNotification = async (application, status, message) => {
    try {
        const Notification = require('../models/Notification');

        // Create notification for the student
        if (application.user) {
            const studentNotification = new Notification({
                title: `Application ${status}`,
                content: `Your application ${application.applicationId} has been ${status.toLowerCase()}. ${message}`,
                shortDescription: `Application ${status}`,
                type: 'application_status',
                category: 'application',
                targetAudience: 'student',
                targetUsers: [application.user._id],
                priority: status === 'APPROVED' ? 'high' : 'medium',
                publishDate: new Date(),
                status: 'published',
                createdBy: application.reviewStatus.reviewedBy,
                lastModified: new Date(),
                modifiedBy: application.reviewStatus.reviewedBy
            });
            await studentNotification.save();
        }

        // Create notification for the agent (if different from student)
        if (application.assignedAgent && application.assignedAgent._id.toString() !== application.user._id.toString()) {
            const agentNotification = new Notification({
                title: `Student Application ${status}`,
                content: `Application ${application.applicationId} for student ${application.user?.fullName} has been ${status.toLowerCase()}. ${message}`,
                shortDescription: `Student Application ${status}`,
                type: 'application_status',
                category: 'application',
                targetAudience: 'agent',
                targetUsers: [application.assignedAgent._id],
                priority: status === 'APPROVED' ? 'high' : 'medium',
                publishDate: new Date(),
                status: 'published',
                createdBy: application.reviewStatus.reviewedBy,
                lastModified: new Date(),
                modifiedBy: application.reviewStatus.reviewedBy
            });
            await agentNotification.save();
        }

        // Create notification for the submitter (if different from student and agent)
        if (application.submittedBy &&
            application.submittedBy._id.toString() !== application.user._id.toString() &&
            (!application.assignedAgent || application.submittedBy._id.toString() !== application.assignedAgent._id.toString())) {

            const submitterNotification = new Notification({
                title: `Submitted Application ${status}`,
                content: `Application ${application.applicationId} that you submitted for ${application.user?.fullName} has been ${status.toLowerCase()}. ${message}`,
                shortDescription: `Submitted Application ${status}`,
                type: 'application_status',
                category: 'application',
                targetAudience: application.submitterRole,
                targetUsers: [application.submittedBy._id],
                priority: status === 'APPROVED' ? 'high' : 'medium',
                publishDate: new Date(),
                status: 'published',
                createdBy: application.reviewStatus.reviewedBy,
                lastModified: new Date(),
                modifiedBy: application.reviewStatus.reviewedBy
            });
            await submitterNotification.save();
        }

        console.log(`Notifications sent for application ${application.applicationId} - Status: ${status}`);
    } catch (error) {
        console.error('Error sending application status notifications:', error);
        // Don't throw error - notifications are not critical for the main flow
    }
};

module.exports = {
    createApplication,
    updateApplication,
    saveDraft,
    submitApplication,
    getApplication,
    getUserApplications,
    getSubmittedApplications,
    updateApplicationStage,
    generateApplicationPDF,
    downloadApplicationPDF,
    getApplicationsByStatus,
    approveApplication,
    rejectApplication,
    getWorkflowStats,
    getDocumentReviewStats,
    verifyDocuments,
    fixDocumentReviewStatus,
    generateCombinedPDF,
    generateDocumentsZIP,
    getApplicationReview,
};
