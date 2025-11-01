const StudentApplication = require('../models/StudentApplication');
const User = require('../models/User');
const PDFGenerator = require('../utils/pdfGenerator');
const path = require('path');
const documentRequirements = require('../config/documentRequirements');

// Document validation helper functions
const validateDocumentRequirements = (documents) => {
    const errors = [];
    const warnings = [];

    // Check required documents
    const requiredDocs = documentRequirements.required;
    const uploadedDocs = documents || [];

    requiredDocs.forEach(reqDoc => {
        const uploadedDoc = uploadedDocs.find(doc => doc.documentType === reqDoc.key);

        if (!uploadedDoc) {
            errors.push(`Missing required document: ${reqDoc.label}`);
        } else {
            // Validate file format
            const fileExtension = uploadedDoc.fileName?.split('.').pop()?.toLowerCase();
            if (!reqDoc.allowedFormats.includes(fileExtension)) {
                errors.push(`${reqDoc.label}: Invalid file format. Allowed: ${reqDoc.allowedFormats.join(', ')}`);
            }

            // Validate file size
            if (uploadedDoc.fileSize > reqDoc.maxSize) {
                errors.push(`${reqDoc.label}: File size too large. Maximum: ${Math.round(reqDoc.maxSize / (1024 * 1024))}MB`);
            }

            // Check document age if required
            if (reqDoc.validation.checkDate && reqDoc.validation.maxAge) {
                const docDate = uploadedDoc.uploadedAt || new Date();
                const ageInYears = (new Date() - new Date(docDate)) / (1000 * 60 * 60 * 24 * 365);
                if (ageInYears > reqDoc.validation.maxAge) {
                    warnings.push(`${reqDoc.label}: Document is older than ${reqDoc.validation.maxAge} year(s). Please ensure it's recent.`);
                }
            }
        }
    });

    return { errors, warnings };
};

const calculateDocumentUploadStatus = (documents) => {
    const uploadedDocs = documents || [];
    const requiredDocs = documentRequirements.required;
    const optionalDocs = documentRequirements.optional;

    const status = {
        required: {
            total: requiredDocs.length,
            uploaded: 0,
            missing: []
        },
        optional: {
            total: optionalDocs.length,
            uploaded: 0,
            available: []
        },
        custom: {
            uploaded: uploadedDocs.filter(doc => doc.isCustom).length,
            maxAllowed: documentRequirements.custom.maxCustomDocuments
        },
        overall: {
            isComplete: false,
            progress: 0
        }
    };

    // Check required documents
    requiredDocs.forEach(reqDoc => {
        const uploaded = uploadedDocs.find(doc => doc.documentType === reqDoc.key);
        if (uploaded) {
            status.required.uploaded++;
        } else {
            status.required.missing.push(reqDoc.label);
        }
    });

    // Check optional documents
    optionalDocs.forEach(optDoc => {
        const uploaded = uploadedDocs.find(doc => doc.documentType === optDoc.key);
        if (uploaded) {
            status.optional.uploaded++;
            status.optional.available.push(optDoc.label);
        }
    });

    // Calculate overall status
    status.overall.isComplete = status.required.uploaded === status.required.total;
    status.overall.progress = Math.round((status.required.uploaded / status.required.total) * 100);

    return status;
};

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
                        const normalizedDocs = Object.entries(data.documents).map(([docType, doc]) => {
                            // Validate document data before processing
                            if (!doc || (!doc.downloadUrl && !doc.url && !doc.filePath)) {
                                console.warn(`Invalid document data for type ${docType}:`, doc);
                                return null;
                            }

                            return {
                                documentType: docType,
                                fileName: doc.name || doc.fileName || 'uploaded',
                                filePath: doc.downloadUrl || doc.url || doc.filePath || '',
                                storageType: 'cloudinary',
                                cloudinaryPublicId: doc.cloudinaryPublicId || doc.public_id || doc.cloudinaryPublicId || undefined,
                                fileSize: doc.size || doc.fileSize || 0,
                                mimeType: doc.type || doc.mimeType || 'application/octet-stream',
                                status: 'PENDING',
                                uploadedAt: new Date()
                            };
                        }).filter(d => d && d.filePath && d.filePath.trim() !== '');

                        // Only update documents if we have valid ones
                        if (normalizedDocs.length > 0) {
                            appDoc.documents = normalizedDocs;
                            console.log(`Updated ${normalizedDocs.length} documents for application ${applicationId}`);
                        } else {
                            console.warn(`No valid documents found for application ${applicationId}`);
                        }
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

        // Validate that application is not already submitted
        if (application.status === 'SUBMITTED' || application.status === 'UNDER_REVIEW' || application.status === 'APPROVED') {
            return res.status(400).json({
                success: false,
                message: `Application is already ${application.status.toLowerCase()}`,
            });
        }

        // Validate required fields before submission
        const requiredFields = ['personalDetails', 'contactDetails', 'courseDetails', 'guardianDetails'];
        const missingFields = requiredFields.filter(field => !application[field] || Object.keys(application[field]).length === 0);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`,
            });
        }

        // Validate document requirements
        const documentValidation = validateDocumentRequirements(application.documents);
        if (documentValidation.errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Document validation failed',
                errors: documentValidation.errors,
                warnings: documentValidation.warnings
            });
        }

        // Validate terms acceptance
        if (!termsAccepted) {
            return res.status(400).json({
                success: false,
                message: "You must accept the terms and conditions to submit the application",
            });
        }

        // Update application status
        application.status = "SUBMITTED";
        application.currentStage = "SUBMITTED";
        application.submittedAt = new Date();
        application.termsAccepted = termsAccepted;
        application.termsAcceptedAt = new Date();

        // Add workflow history entry
        application.workflowHistory.push({
            stage: 'SUBMITTED',
            status: 'SUBMITTED',
            updatedBy: req.user._id,
            action: 'SUBMIT',
            remarks: 'Application submitted by student',
            timestamp: new Date()
        });

        application.lastModified = new Date();
        await application.save();

        // Real-time updates removed (Socket.IO removed)

        res.status(200).json({
            success: true,
            message: "Application submitted successfully",
            data: {
                applicationId: application.applicationId,
                status: application.status,
                submittedAt: application.submittedAt,
                documentsCount: application.documents?.length || 0
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
            .populate("submittedBy", "fullName email role")
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
                // Applications without documents should not be approved
                if (app.status === 'APPROVED') {
                    applicationStatus = 'SUBMITTED';
                    currentStage = 'DOCUMENTS';
                }
            } else if (reviewedDocs === totalDocs) {
                if (rejectedDocs === 0) {
                    reviewStatus = 'all_approved';
                    // All documents approved - can move to UNDER_REVIEW for final approval
                    if (app.status === 'SUBMITTED') {
                        applicationStatus = 'UNDER_REVIEW';
                        currentStage = 'UNDER_REVIEW';
                    }
                } else if (approvedDocs === 0) {
                    reviewStatus = 'all_rejected';
                    // All documents rejected - keep as SUBMITTED, needs re-upload
                    applicationStatus = 'SUBMITTED';
                    currentStage = 'DOCUMENTS';
                } else {
                    reviewStatus = 'mixed_results';
                    // Mixed results - keep under review
                    applicationStatus = 'UNDER_REVIEW';
                    currentStage = 'DOCUMENTS';
                }
            } else if (reviewedDocs > 0) {
                reviewStatus = 'partially_reviewed';
                // Partially reviewed - move to UNDER_REVIEW if no rejections
                if (rejectedDocs === 0) {
                    applicationStatus = 'UNDER_REVIEW';
                    currentStage = 'DOCUMENTS';
                } else {
                    applicationStatus = 'SUBMITTED';
                    currentStage = 'DOCUMENTS';
                }
            }

            // Additional validation: Ensure APPROVED status only if all documents are approved
            if (applicationStatus === 'APPROVED' && totalDocs > 0 && approvedDocs !== totalDocs) {
                applicationStatus = 'UNDER_REVIEW';
                currentStage = 'UNDER_REVIEW';
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

        // Validate application status before approval
        if (application.status === 'APPROVED') {
            return res.status(400).json({
                success: false,
                message: 'Application is already approved'
            });
        }

        if (application.status === 'REJECTED') {
            return res.status(400).json({
                success: false,
                message: 'Cannot approve a rejected application'
            });
        }

        // Validate that application has required documents
        const documents = application.documents || [];
        if (documents.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot approve application: No documents uploaded'
            });
        }

        // Check if all documents are approved
        const documentCounts = application.reviewStatus?.documentCounts || { total: 0, approved: 0, rejected: 0, pending: 0 };
        if (documentCounts.total > 0 && documentCounts.approved !== documentCounts.total) {
            return res.status(400).json({
                success: false,
                message: `Cannot approve application: Only ${documentCounts.approved}/${documentCounts.total} documents are approved. All documents must be approved before final approval.`
            });
        }

        // Validate that all required verification steps are completed
        const reviewStatus = application.reviewStatus || {};
        if (!reviewStatus.documentsVerified) {
            return res.status(400).json({
                success: false,
                message: 'Cannot approve application: Document verification not completed'
            });
        }

        // Proceed with approval
        await application.approveApplication(req.user._id, remarks || 'Approved by staff');

        // Update review status
        if (!application.reviewStatus) {
            application.reviewStatus = {};
        }
        application.reviewStatus.overallApproved = true;
        application.reviewStatus.reviewedBy = req.user._id;
        application.reviewStatus.reviewedAt = new Date();
        application.reviewStatus.finalApprovalRemarks = remarks || 'Application approved by staff';

        // Add detailed review info
        application.reviewInfo = {
            reviewedBy: req.user._id,
            reviewedAt: new Date(),
            remarks: remarks || 'Application approved by staff',
            documentCounts: documentCounts,
            verificationStatus: {
                documentsVerified: reviewStatus.documentsVerified,
                personalDetailsVerified: reviewStatus.personalDetailsVerified || false,
                academicDetailsVerified: reviewStatus.academicDetailsVerified || false,
                guardianDetailsVerified: reviewStatus.guardianDetailsVerified || false,
                financialDetailsVerified: reviewStatus.financialDetailsVerified || false
            }
        };

        application.lastModified = new Date();
        await application.save();

        // Send notifications to relevant parties
        await sendApplicationStatusNotification(application, 'APPROVED', remarks || 'Application approved by staff');

        return res.status(200).json({
            success: true,
            message: 'Application approved successfully',
            data: {
                application,
                reviewInfo: application.reviewInfo,
                documentCounts: documentCounts
            }
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

        // Validate rejection reason
        if (!rejectionReason || rejectionReason.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        await application.rejectApplication(req.user._id, rejectionReason || 'Insufficient/invalid documents', remarks);

        // Update review status with detailed rejection info
        if (!application.reviewStatus) {
            application.reviewStatus = {};
        }
        application.reviewStatus.overallApproved = false;
        application.reviewStatus.reviewedBy = req.user._id;
        application.reviewStatus.reviewedAt = new Date();
        application.reviewStatus.rejectionReason = rejectionReason;
        application.reviewStatus.rejectionRemarks = remarks || 'Application rejected by staff';

        // Add detailed review info
        application.reviewInfo = {
            reviewedBy: req.user._id,
            reviewedAt: new Date(),
            remarks: remarks || 'Application rejected by staff',
            rejectionReason: rejectionReason,
            documentCounts: application.reviewStatus?.documentCounts || { total: 0, approved: 0, rejected: 0, pending: 0 },
            verificationStatus: {
                documentsVerified: false,
                personalDetailsVerified: application.reviewStatus?.personalDetailsVerified || false,
                academicDetailsVerified: application.reviewStatus?.academicDetailsVerified || false,
                guardianDetailsVerified: application.reviewStatus?.guardianDetailsVerified || false,
                financialDetailsVerified: application.reviewStatus?.financialDetailsVerified || false
            }
        };

        application.lastModified = new Date();
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

        // Validate that application has documents before allowing review
        const documents = application.documents || [];
        if (documents.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot review documents: No documents uploaded for this application'
            });
        }

        // Update embedded documents by documentType
        const docMap = new Map(documents.map((d) => [d.documentType, d]));
        let updatedDocuments = 0;

        console.log('📝 Processing', decisions.length, 'document decisions');

        decisions.forEach((d) => {
            const existing = docMap.get(d.documentType);
            if (existing) {
                console.log(`  - Updating ${d.documentType}: ${existing.status} → ${d.status}`);
                existing.status = d.status || 'PENDING';
                // For approvals, use default remark if none provided. For rejections, require remarks.
                if (d.status === 'APPROVED') {
                    existing.remarks = d.remarks || 'Document approved';
                } else if (d.status === 'REJECTED') {
                    existing.remarks = d.remarks || 'Document rejected - no reason provided';
                }
                existing.reviewedBy = req.user?._id;
                existing.reviewedAt = new Date();
                updatedDocuments++;
            } else {
                console.warn(`  - Document type ${d.documentType} not found in application`);
            }
        });

        if (updatedDocuments === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid documents found to update'
            });
        }

        console.log(`✅ Updated ${updatedDocuments} documents`);

        // CRITICAL: Mark documents array as modified so Mongoose saves it
        application.markModified('documents');

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
            overallStatus = 'NOT_VERIFIED';
        } else if (allApproved) {
            overallStatus = 'ALL_APPROVED';
        } else if (allRejected) {
            overallStatus = 'ALL_REJECTED';
        } else if (anyReviewed) {
            overallStatus = 'PARTIALLY_APPROVED';
        } else {
            overallStatus = 'NOT_VERIFIED';
        }

        application.reviewStatus.overallDocumentReviewStatus = overallStatus;

        console.log(`Setting overall status for ${application.applicationId}:`, {
            counts,
            overallStatus,
            allApproved,
            allRejected,
            anyReviewed
        });

        // Update application status based on document review results with proper validation
        const previousStatus = application.status;
        const previousStage = application.currentStage;

        if (allApproved) {
            // All documents approved - move to UNDER_REVIEW for final approval
            application.status = 'UNDER_REVIEW';
            application.currentStage = 'UNDER_REVIEW';
        } else if (allRejected) {
            // All documents rejected - keep as SUBMITTED but mark for re-upload
            application.status = 'SUBMITTED';
            application.currentStage = 'DOCUMENTS';
        } else if (counts.rejected > 0) {
            // Some documents rejected - keep as SUBMITTED, needs attention
            application.status = 'SUBMITTED';
            application.currentStage = 'DOCUMENTS';
        } else if (anyReviewed && counts.rejected === 0) {
            // Partially reviewed but no rejections yet - move to UNDER_REVIEW
            application.status = 'UNDER_REVIEW';
            application.currentStage = 'DOCUMENTS';
        }
        // If no documents reviewed, keep current status

        // Add workflow history entry for document review
        // Use REQUEST_MODIFICATION if any docs rejected, otherwise APPROVE if all approved
        const workflowAction = counts.rejected > 0 ? 'REQUEST_MODIFICATION' : 'APPROVE';

        application.workflowHistory.push({
            stage: application.currentStage,
            status: application.status,
            updatedBy: req.user._id,
            action: workflowAction,
            remarks: `Document review completed: ${counts.approved} approved, ${counts.rejected} rejected, ${counts.pending} pending`,
            timestamp: new Date()
        });

        application.lastModified = new Date();

        console.log('💾 Saving application with updated document statuses...');
        await application.save();
        console.log('✅ Application saved successfully to database');

        // Verify the save by logging final document statuses
        console.log('📋 Final document statuses after save:');
        application.documents.forEach(doc => {
            console.log(`  - ${doc.documentType}: ${doc.status} ${doc.remarks ? `(${doc.remarks.substring(0, 50)})` : ''}`);
        });

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

        console.log(`✅ ${responseMessage}`);

        return res.status(200).json({
            success: true,
            message: responseMessage,
            data: {
                application,
                summary: counts,
                feedbackSummary: feedbackSummary || null,
                statusChanged: previousStatus !== application.status
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
        const { selectedDocuments } = req.body || {};

        const application = await StudentApplication.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Get selected documents - if not provided, use all approved documents
        let documentsToMerge = [];
        const allDocuments = Array.isArray(application.documents)
            ? application.documents
            : Object.values(application.documents || {});

        if (selectedDocuments && selectedDocuments.length > 0) {
            // Filter documents based on selected IDs
            documentsToMerge = allDocuments.filter(doc =>
                selectedDocuments.includes(doc._id?.toString()) ||
                selectedDocuments.includes(doc.documentType)
            ).filter(doc => doc.status === 'APPROVED'); // Only approved documents
        } else {
            // Use all approved documents if none specified
            documentsToMerge = allDocuments.filter(doc => doc.status === 'APPROVED');
        }

        if (documentsToMerge.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No approved documents selected for PDF generation'
            });
        }

        const result = await PDFGenerator.generateCombinedPDF(application, documentsToMerge);
        application.combinedPdfUrl = `/api/files/download/${result.fileName}`;
        application.progress.applicationPdfGenerated = true;
        await application.save();

        return res.status(200).json({
            success: true,
            message: 'Combined PDF generated successfully',
            data: {
                fileName: result.fileName,
                filePath: result.filePath,
                url: application.combinedPdfUrl,
                pdfUrl: application.combinedPdfUrl
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
        const { selectedDocuments } = req.body || {};

        const application = await StudentApplication.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Get selected documents - if not provided, use all approved documents
        let documentsToZip = [];
        const allDocuments = Array.isArray(application.documents)
            ? application.documents
            : Object.values(application.documents || {});

        if (selectedDocuments && selectedDocuments.length > 0) {
            // Filter documents based on selected IDs
            documentsToZip = allDocuments.filter(doc =>
                selectedDocuments.includes(doc._id?.toString()) ||
                selectedDocuments.includes(doc.documentType)
            ).filter(doc => doc.status === 'APPROVED'); // Only approved documents
        } else {
            // Use all approved documents if none specified
            documentsToZip = allDocuments.filter(doc => doc.status === 'APPROVED');
        }

        if (documentsToZip.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No approved documents selected for ZIP generation'
            });
        }

        const result = await PDFGenerator.generateDocumentsZIP(application, documentsToZip);
        application.documentsZipUrl = `/api/files/download/${result.fileName}`;
        await application.save();

        return res.status(200).json({
            success: true,
            message: 'Documents ZIP generated successfully',
            data: {
                fileName: result.fileName,
                filePath: result.filePath,
                url: application.documentsZipUrl,
                zipUrl: application.documentsZipUrl,
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

// Get document requirements
const getDocumentRequirements = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                requirements: documentRequirements,
                uploadOrder: documentRequirements.uploadOrder,
                helpText: documentRequirements.helpText
            }
        });
    } catch (error) {
        console.error('Get document requirements error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get document requirements',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get document upload status for an application
const getDocumentUploadStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await StudentApplication.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const status = calculateDocumentUploadStatus(application.documents);

        res.status(200).json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Get document upload status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get document upload status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
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
    getDocumentRequirements,
    getDocumentUploadStatus,
};
