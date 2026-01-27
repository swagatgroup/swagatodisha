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
    
    // Handle both array and object formats
    let uploadedDocs = [];
    if (Array.isArray(documents)) {
        uploadedDocs = documents || [];
    } else if (documents && typeof documents === 'object') {
        // Convert object format to array format
        uploadedDocs = Object.entries(documents)
            .map(([docType, doc]) => {
                if (!doc || (!doc.downloadUrl && !doc.url && !doc.filePath)) {
                    return null;
                }
                return {
                    documentType: docType,
                    fileName: doc.name || doc.fileName || 'uploaded',
                    filePath: doc.downloadUrl || doc.url || doc.filePath || '',
                    fileSize: doc.size || doc.fileSize || 0,
                    uploadedAt: doc.uploadedAt || new Date()
                };
            })
            .filter(doc => doc && doc.filePath);
    }

    requiredDocs.forEach(reqDoc => {
        const uploadedDoc = uploadedDocs.find(doc => doc.documentType === reqDoc.key);

        if (!uploadedDoc || !uploadedDoc.filePath) {
            errors.push(`Missing required document: ${reqDoc.label}`);
        } else {
            // Validate file format
            const fileExtension = uploadedDoc.fileName?.split('.').pop()?.toLowerCase();
            if (fileExtension && reqDoc.allowedFormats && !reqDoc.allowedFormats.includes(fileExtension)) {
                errors.push(`${reqDoc.label}: Invalid file format. Allowed: ${reqDoc.allowedFormats.join(', ')}`);
            }

            // Validate file size
            if (uploadedDoc.fileSize && reqDoc.maxSize && uploadedDoc.fileSize > reqDoc.maxSize) {
                errors.push(`${reqDoc.label}: File size too large. Maximum: ${Math.round(reqDoc.maxSize / (1024 * 1024))}MB`);
            }

            // Check document age if required
            if (reqDoc.validation && reqDoc.validation.checkDate && reqDoc.validation.maxAge) {
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
        // Convert date string to Date object for personalDetails.registrationDate
        if (personalDetails && personalDetails.registrationDate) {
            personalDetails.registrationDate = new Date(personalDetails.registrationDate);
        }

        // Normalize guardian relationship to valid enum value
        const validRelationships = ['Father', 'Mother', 'Brother', 'Sister', 'Uncle', 'Aunt', 'Grandfather', 'Grandmother', 'Other'];
        let normalizedGuardianDetails = guardianDetails || {};
        if (normalizedGuardianDetails.relationship && !validRelationships.includes(normalizedGuardianDetails.relationship)) {
            console.warn(`Invalid guardian relationship "${normalizedGuardianDetails.relationship}", defaulting to "Other"`);
            normalizedGuardianDetails = {
                ...normalizedGuardianDetails,
                relationship: 'Other'
            };
        }

        // Create application
        const applicationData = {
            user: req.user._id,
            personalDetails,
            contactDetails,
            courseDetails,
            guardianDetails: normalizedGuardianDetails,
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
            // Convert date strings to Date objects for personalDetails
            if (data.personalDetails) {
                if (data.personalDetails.dateOfBirth) {
                    data.personalDetails.dateOfBirth = new Date(data.personalDetails.dateOfBirth);
                }
                if (data.personalDetails.registrationDate) {
                    data.personalDetails.registrationDate = new Date(data.personalDetails.registrationDate);
                }
            }

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

        // Validate that application is not already submitted/reviewed
        if (application.status === 'UNDER_REVIEW' || application.status === 'APPROVED') {
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

        // Normalize documents to array format if needed
        let documentsArray = application.documents || [];
        if (!Array.isArray(documentsArray) && typeof documentsArray === 'object') {
            documentsArray = Object.entries(documentsArray)
                .map(([docType, doc]) => {
                    if (!doc || (!doc.downloadUrl && !doc.url && !doc.filePath)) {
                        return null;
                    }
                    return {
                        documentType: docType,
                        fileName: doc.name || doc.fileName || 'uploaded',
                        filePath: doc.downloadUrl || doc.url || doc.filePath || '',
                        fileSize: doc.size || doc.fileSize || 0,
                        uploadedAt: doc.uploadedAt || new Date()
                    };
                })
                .filter(doc => doc && doc.filePath);
        }

        // Validate document requirements
        const documentValidation = validateDocumentRequirements(documentsArray);
        if (documentValidation.errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot submit application without all mandatory documents',
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

        // Update application status - goes directly to UNDER_REVIEW for staff to check
        application.status = "UNDER_REVIEW";
        application.currentStage = "UNDER_REVIEW";
        application.submittedAt = new Date();
        application.termsAccepted = termsAccepted;
        application.termsAcceptedAt = new Date();

        // Add workflow history entry
        application.workflowHistory.push({
            stage: 'UNDER_REVIEW',
            status: 'UNDER_REVIEW',
            updatedBy: req.user._id,
            action: 'SUBMIT',
            remarks: 'Application submitted and moved to review',
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

        // Validate mandatory documents before PDF generation
        const documentValidation = validateDocumentRequirements(application.documents);
        if (documentValidation.errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot generate PDF without all mandatory documents',
                errors: documentValidation.errors,
                warnings: documentValidation.warnings
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
        const { status = 'UNDER_REVIEW', page = 1, limit = 20, reviewFilter, session: sessionParam } = req.query;

        console.log('getApplicationsByStatus called with:', { status, page, limit, reviewFilter, session: sessionParam });

        // SESSION IS REQUIRED - Always filter by session
        if (!sessionParam) {
            return res.status(400).json({
                success: false,
                message: 'Session parameter is required',
                error: 'Missing session parameter'
            });
        }

        // Parse session to extract start year (e.g., "2025-26" → 2025, "26-27" → 2026)
        let startYear;
        try {
            const parts = sessionParam.split('-');
            if (parts.length !== 2) {
                throw new Error(`Invalid session format: ${sessionParam}`);
            }
            
            startYear = parseInt(parts[0], 10);
            // Handle 2-digit year format (e.g., "26-27" → 2026)
            if (startYear < 100) {
                startYear = 2000 + startYear;
            }
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: `Invalid session format: ${error.message}`,
                error: process.env.NODE_ENV === "development" ? error.message : "Invalid session"
            });
        }

        // Create date range for the entire calendar year (Jan 1 to Dec 31) in UTC
        const yearStart = new Date(Date.UTC(startYear, 0, 1, 0, 0, 0, 0)); // January 1, startYear UTC
        const yearEnd = new Date(Date.UTC(startYear, 11, 31, 23, 59, 59, 999)); // December 31, startYear UTC

        // Base query - start with session filter
        const sessionDateFilter = {
            $or: [
                {
                    $and: [
                        { 'personalDetails.registrationDate': { $exists: true, $ne: null } },
                        { 'personalDetails.registrationDate': { $gte: yearStart, $lte: yearEnd } }
                    ]
                },
                {
                    $and: [
                        {
                            $or: [
                                { 'personalDetails.registrationDate': { $exists: false } },
                                { 'personalDetails.registrationDate': null }
                            ]
                        },
                        { createdAt: { $gte: yearStart, $lte: yearEnd } }
                    ]
                }
            ]
        };

        let query = { $and: [sessionDateFilter] };

        // Add status filter if not 'all' and reviewFilter is not provided
        // When reviewFilter is used, we want to see all applications regardless of status
        // (they will be filtered by document review status instead)
        if (status !== 'all' && !reviewFilter) {
            query.$and.push({ status: status.toUpperCase() });
        } else if (reviewFilter) {
            // When using reviewFilter, prioritize SUBMITTED and UNDER_REVIEW applications
            // These are the main statuses that need staff review
            // Also include APPROVED and REJECTED to show completed reviews
            // Include DRAFT only if they have documents (will be filtered by reviewFilter)
            query.$and.push({ 
                status: { 
                    $in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DRAFT'] 
                } 
            });
            console.log('📋 Including applications with status: SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, DRAFT');
        } else {
            // No reviewFilter and status is 'all' - show all statuses except maybe DRAFT
            // But for staff review, we typically want to see submitted/review statuses
            query.$and.push({ 
                status: { 
                    $in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] 
                } 
            });
        }

        // Get all applications first, then filter by document review status
        console.log('🔍 Query being executed:', JSON.stringify(query, null, 2));
        let applications = await StudentApplication.find(query)
            .populate('user', 'fullName email phoneNumber')
            .populate('referralInfo.referredBy', 'firstName lastName referralCode')
            .populate('assignedAgent', 'firstName lastName referralCode')
            .sort({ createdAt: -1 });

        console.log(`📊 Found ${applications.length} applications matching session and status filters`);
        console.log(`📋 Application statuses:`, applications.map(app => ({ id: app._id, status: app.status, name: app.personalDetails?.fullName })));

        // Apply document review filtering (treat PENDING and NOT_VERIFIED as not reviewed)
        if (reviewFilter) {
            console.log(`🔍 Filtering applications by reviewFilter: ${reviewFilter}`);
            console.log(`📊 Total applications before reviewFilter: ${applications.length}`);

            applications = applications.filter(app => {
                const documents = app.documents || [];
                const totalDocs = documents.length;
                // Treat undefined, null, 'PENDING', and 'NOT_VERIFIED' as not reviewed
                const reviewedDocs = documents.filter(doc => {
                    const status = doc.status;
                    return status && status !== 'PENDING' && status !== 'NOT_VERIFIED';
                }).length;
                const approvedDocs = documents.filter(doc => doc.status === 'APPROVED').length;
                const rejectedDocs = documents.filter(doc => doc.status === 'REJECTED').length;

                console.log(`Checking application ${app._id}:`, {
                    appStatus: app.status,
                    totalDocs, reviewedDocs, approvedDocs, rejectedDocs,
                    documents: documents.map(d => ({ type: d.documentType, status: d.status })),
                    allDocumentStatuses: documents.map(d => d.status),
                    uniqueStatuses: [...new Set(documents.map(d => d.status))]
                });

                let matches = false;
                
                // Check if application matches the document review filter
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

                // Special handling: If application is UNDER_REVIEW, ensure it's always visible
                // If it doesn't match the current filter based on document status, 
                // include it in "not_reviewed" tab as a fallback to ensure visibility
                if (!matches && app.status === 'UNDER_REVIEW') {
                    if (reviewFilter === 'not_reviewed') {
                        matches = true;
                        console.log(`✅ Including UNDER_REVIEW application ${app._id} in 'not_reviewed' tab (fallback to ensure visibility)`);
                    }
                }

                console.log(`Application ${app._id} (status: ${app.status}) ${matches ? 'MATCHES' : 'DOES NOT MATCH'} filter ${reviewFilter}`);

                return matches;
            });

            console.log(`✅ Total applications after reviewFilter: ${applications.length}`);
            if (applications.length === 0) {
                console.log('⚠️ No applications match the reviewFilter criteria');
                console.log('💡 This might mean:');
                console.log('   - No applications have documents matching the filter');
                console.log('   - All documents are in a different review state');
                console.log('   - Applications exist but documents are not in the expected state');
            }
        } else {
            console.log(`📋 No reviewFilter applied, showing all ${applications.length} applications`);
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
                    // All documents approved - already in UNDER_REVIEW, ready for final approval
                    // Status remains UNDER_REVIEW
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

        console.log(`✅ Returning ${applicationsWithStats.length} applications to frontend`);
        console.log(`📊 Response summary:`, {
            total: applicationsWithStats.length,
            reviewFilter: reviewFilter || 'none',
            status: status,
            session: sessionParam
        });

        return res.status(200).json({
            success: true,
            data: {
                applications: applicationsWithStats,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                },
                filters: {
                    session: sessionParam,
                    status: status,
                    reviewFilter: reviewFilter || null
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
            StudentApplication.countDocuments({ status: 'UNDER_REVIEW' }),
            StudentApplication.countDocuments({ status: 'APPROVED' }),
            StudentApplication.countDocuments({ status: 'REJECTED' })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                total: totals[0],
                underReview: totals[1],
                approved: totals[2],
                rejected: totals[3]
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
        const { session: sessionParam } = req.query;

        // SESSION IS REQUIRED - Always filter by session
        if (!sessionParam) {
            return res.status(400).json({
                success: false,
                message: 'Session parameter is required',
                error: 'Missing session parameter'
            });
        }

        // Parse session to extract start year (e.g., "2025-26" → 2025, "26-27" → 2026)
        let startYear;
        try {
            const parts = sessionParam.split('-');
            if (parts.length !== 2) {
                throw new Error(`Invalid session format: ${sessionParam}`);
            }
            
            startYear = parseInt(parts[0], 10);
            // Handle 2-digit year format (e.g., "26-27" → 2026)
            if (startYear < 100) {
                startYear = 2000 + startYear;
            }
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: `Invalid session format: ${error.message}`,
                error: process.env.NODE_ENV === "development" ? error.message : "Invalid session"
            });
        }

        // Create date range for the entire calendar year (Jan 1 to Dec 31) in UTC
        const yearStart = new Date(Date.UTC(startYear, 0, 1, 0, 0, 0, 0)); // January 1, startYear UTC
        const yearEnd = new Date(Date.UTC(startYear, 11, 31, 23, 59, 59, 999)); // December 31, startYear UTC

        // Base query - start with session filter
        const sessionDateFilter = {
            $or: [
                {
                    $and: [
                        { 'personalDetails.registrationDate': { $exists: true, $ne: null } },
                        { 'personalDetails.registrationDate': { $gte: yearStart, $lte: yearEnd } }
                    ]
                },
                {
                    $and: [
                        {
                            $or: [
                                { 'personalDetails.registrationDate': { $exists: false } },
                                { 'personalDetails.registrationDate': null }
                            ]
                        },
                        { createdAt: { $gte: yearStart, $lte: yearEnd } }
                    ]
                }
            ]
        };

        // Only count SUBMITTED applications in this session to match the filtered endpoints
        const query = {
            $and: [
                sessionDateFilter,
                { status: 'UNDER_REVIEW' }
            ]
        };

        const applications = await StudentApplication.find(query)
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

        let application = await StudentApplication.findOne({ applicationId });
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

        // Build update operations for each document
        const updateOperations = {};
        
        decisions.forEach((d) => {
            const existing = docMap.get(d.documentType);
            if (existing) {
                const oldStatus = existing.status;
                console.log(`  - Updating ${d.documentType}: ${oldStatus} → ${d.status}`);
                
                // Find the index of this document in the array
                const docIndex = application.documents.findIndex(doc => doc.documentType === d.documentType);
                
                if (docIndex !== -1) {
                    // Build update path for this document
                    const basePath = `documents.${docIndex}`;
                    
                    // Update document properties using $set operator paths
                    updateOperations[`${basePath}.status`] = d.status || 'PENDING';
                    
                    // For approvals, use default remark if none provided. For rejections, require remarks.
                    if (d.status === 'APPROVED') {
                        updateOperations[`${basePath}.remarks`] = d.remarks || 'Document approved';
                    } else if (d.status === 'REJECTED') {
                        updateOperations[`${basePath}.remarks`] = d.remarks || 'Document rejected - no reason provided';
                    }
                    
                    updateOperations[`${basePath}.reviewedBy`] = req.user?._id;
                    updateOperations[`${basePath}.reviewedAt`] = new Date();
                    
                    updatedDocuments++;
                } else {
                    console.warn(`  - Document type ${d.documentType} not found in application documents array`);
                }
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

        console.log(`✅ Prepared updates for ${updatedDocuments} documents`);
        console.log('📝 Update operations:', JSON.stringify(updateOperations, null, 2));

        // Use findOneAndUpdate with $set to ensure nested document updates are saved
        const updatedApplication = await StudentApplication.findOneAndUpdate(
            { applicationId },
            { $set: updateOperations },
            { new: true, runValidators: true }
        );

        if (!updatedApplication) {
            return res.status(404).json({
                success: false,
                message: 'Application not found after update'
            });
        }

        // Reload the application to get the updated documents
        application = await StudentApplication.findOne({ applicationId });
        console.log('✅ Documents updated using findOneAndUpdate');
        
        // Verify the updates were saved
        console.log('📋 Document statuses after update:');
        if (application && application.documents) {
            application.documents.forEach(doc => {
                console.log(`  - ${doc.documentType}: ${doc.status} ${doc.remarks ? `(${doc.remarks.substring(0, 50)})` : ''}`);
            });
        }

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

        // If any document is rejected, automatically set application status to REJECTED
        if (counts.rejected > 0) {
            // Any document rejected - automatically reject the application
            application.status = 'REJECTED';
            application.currentStage = 'REJECTED';
            
            // Update review info with rejection details
            if (!application.reviewInfo) {
                application.reviewInfo = {};
            }
            application.reviewInfo.rejectionReason = `Application rejected due to ${counts.rejected} rejected document(s)`;
            application.reviewInfo.reviewedBy = req.user._id;
            application.reviewInfo.reviewedAt = new Date();
            application.reviewInfo.remarks = feedbackSummary || `Application rejected: ${counts.rejected} document(s) rejected`;
        } else if (allApproved) {
            // All documents approved - ready for final approval, stay in UNDER_REVIEW
            application.status = 'UNDER_REVIEW';
            application.currentStage = 'UNDER_REVIEW';
        } else if (anyReviewed && counts.rejected === 0) {
            // Partially reviewed but no rejections yet - stay in UNDER_REVIEW
            application.status = 'UNDER_REVIEW';
            application.currentStage = 'DOCUMENTS';
        }
        // If no documents reviewed, keep current status (should be UNDER_REVIEW)

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

        // Update reviewStatus and application status using findOneAndUpdate
        const statusUpdateOperations = {
            'reviewStatus.documentsVerified': allApproved,
            'reviewStatus.reviewedBy': req.user._id,
            'reviewStatus.reviewedAt': new Date(),
            'reviewStatus.documentCounts': counts,
            'reviewStatus.overallDocumentReviewStatus': overallStatus,
            'lastModified': new Date()
        };
        
        // If any document is rejected, update application status to REJECTED
        if (counts.rejected > 0) {
            statusUpdateOperations.status = 'REJECTED';
            statusUpdateOperations.currentStage = 'REJECTED';
            statusUpdateOperations['reviewStatus.overallApproved'] = false;
            
            // Update review info
            if (!application.reviewInfo) {
                application.reviewInfo = {};
            }
            statusUpdateOperations['reviewInfo.rejectionReason'] = `Application rejected due to ${counts.rejected} rejected document(s)`;
            statusUpdateOperations['reviewInfo.reviewedBy'] = req.user._id;
            statusUpdateOperations['reviewInfo.reviewedAt'] = new Date();
            statusUpdateOperations['reviewInfo.remarks'] = feedbackSummary || `Application rejected: ${counts.rejected} document(s) rejected`;
        }

        if (feedbackSummary) {
            statusUpdateOperations['reviewStatus.feedbackSummary'] = feedbackSummary;
        }

        // Update status based on document review results
        // If any document is rejected, application status becomes REJECTED (already set above)
        // Otherwise, update status based on review progress
        if (counts.rejected === 0) {
            if (allApproved) {
                // All documents approved - ready for final approval, stay in UNDER_REVIEW
                statusUpdateOperations.status = 'UNDER_REVIEW';
                statusUpdateOperations.currentStage = 'UNDER_REVIEW';
            } else if (anyReviewed) {
                // Partially reviewed but no rejections - stay in UNDER_REVIEW
                statusUpdateOperations.status = 'UNDER_REVIEW';
                statusUpdateOperations.currentStage = 'DOCUMENTS';
            }
            // If no documents reviewed, keep current status (should be UNDER_REVIEW)
        }
        // If rejected > 0, status is already set to REJECTED above
        // If no documents reviewed, keep current status (should already be UNDER_REVIEW)

        // Update workflow history using $push
        const workflowHistoryEntry = {
            stage: statusUpdateOperations.currentStage || application.currentStage,
            status: statusUpdateOperations.status || application.status,
            updatedBy: req.user._id,
            action: workflowAction,
            remarks: `Document review completed: ${counts.approved} approved, ${counts.rejected} rejected, ${counts.pending} pending`,
            timestamp: new Date()
        };

        // Final update with all status changes
        const finalApplication = await StudentApplication.findOneAndUpdate(
            { applicationId },
            {
                $set: statusUpdateOperations,
                $push: { workflowHistory: workflowHistoryEntry }
            },
            { new: true, runValidators: true }
        );

        if (!finalApplication) {
            return res.status(404).json({
                success: false,
                message: 'Application not found after final update'
            });
        }

        // Reload to get the complete updated application
        application = await StudentApplication.findOne({ applicationId })
            .populate('user', 'fullName email phoneNumber')
            .populate('assignedAgent', 'fullName email phoneNumber');

        console.log('✅ Application fully updated and saved');
        console.log('📋 Final document statuses:');
        if (application && application.documents) {
            application.documents.forEach(doc => {
                console.log(`  - ${doc.documentType}: ${doc.status} ${doc.remarks ? `(${doc.remarks.substring(0, 50)})` : ''}`);
            });
        }

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

        // Update application record with the generated URL (Cloudinary or local)
        application.combinedPdfUrl = result.url || `/api/files/download/${result.fileName}`;
        application.progress.applicationPdfGenerated = true;
        await application.save();

        // If Cloudinary URL, return metadata for frontend to download directly
        if (result.cloudinaryUrl) {
            return res.status(200).json({
                success: true,
                message: 'Combined PDF generated successfully',
                data: {
                    fileName: result.fileName,
                    filePath: result.filePath,
                    url: result.cloudinaryUrl,
                    pdfUrl: result.cloudinaryUrl,
                    size: result.size,
                    storageType: 'cloudinary'
                }
            });
        }

        // For local files, verify existence and send directly
        const fs = require('fs');
        if (!fs.existsSync(result.filePath)) {
            console.error(`❌ Generated file not found at: ${result.filePath}`);
            return res.status(500).json({
                success: false,
                message: 'PDF was generated but file not found. Please try again.'
            });
        }

        // Return file directly instead of just URL
        const fileName = result.fileName.replace(/['"]/g, '');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', result.size);
        res.setHeader('Cache-Control', 'no-cache');

        // Send file directly (need absolute path)
        const path = require('path');
        const absoluteFilePath = path.resolve(result.filePath);
        return res.sendFile(absoluteFilePath, (err) => {
            if (err) {
                console.error('Error sending PDF file:', err);
                if (!res.headersSent) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to send PDF file',
                        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
                    });
                }
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

        // Update application record with the generated URL (Cloudinary or local)
        application.documentsZipUrl = result.url || `/api/files/download/${result.fileName}`;
        await application.save();

        // If Cloudinary URL, return metadata for frontend to download directly
        if (result.cloudinaryUrl) {
            return res.status(200).json({
                success: true,
                message: 'Documents ZIP generated successfully',
                data: {
                    fileName: result.fileName,
                    filePath: result.filePath,
                    url: result.cloudinaryUrl,
                    zipUrl: result.cloudinaryUrl,
                    size: result.size,
                    storageType: 'cloudinary'
                }
            });
        }

        // For local files, verify existence and send directly
        const fs = require('fs');
        if (!fs.existsSync(result.filePath)) {
            console.error(`❌ Generated ZIP file not found at: ${result.filePath}`);
            return res.status(500).json({
                success: false,
                message: 'ZIP was generated but file not found. Please try again.'
            });
        }

        // Return file directly instead of just URL
        const fileName = result.fileName.replace(/['"]/g, '');
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', result.size);
        res.setHeader('Cache-Control', 'no-cache');

        // Send file directly (need absolute path)
        const path = require('path');
        const absoluteFilePath = path.resolve(result.filePath);
        return res.sendFile(absoluteFilePath, (err) => {
            if (err) {
                console.error('Error sending ZIP file:', err);
                if (!res.headersSent) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to send ZIP file',
                        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
                    });
                }
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

// Upload application PDF (from frontend-generated PDF)
const uploadApplicationPDF = async (req, res) => {
    try {
        const { applicationId } = req.params;
        
        console.log('📤 PDF Upload Request:', {
            applicationId,
            hasFile: !!req.file,
            fileSize: req.file?.size,
            mimetype: req.file?.mimetype,
            userId: req.user?._id,
            userRole: req.user?.role
        });
        
        if (!req.file) {
            console.error('❌ No file provided in request');
            return res.status(400).json({
                success: false,
                message: 'No PDF file provided'
            });
        }

        if (req.file.mimetype !== 'application/pdf') {
            console.error('❌ Invalid file type:', req.file.mimetype);
            return res.status(400).json({
                success: false,
                message: 'File must be a PDF'
            });
        }

        const application = await StudentApplication.findOne({ applicationId });
        if (!application) {
            console.error('❌ Application not found:', applicationId);
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if user owns this application
        if (application.user.toString() !== req.user._id.toString() && 
            req.user.role !== 'super_admin' && 
            req.user.role !== 'staff') {
            console.error('❌ Unauthorized PDF upload attempt:', {
                applicationUserId: application.user.toString(),
                requestUserId: req.user._id.toString(),
                userRole: req.user.role
            });
            return res.status(403).json({
                success: false,
                message: 'Not authorized to upload PDF for this application'
            });
        }

        // Upload to Cloudinary
        const cloudinary = require('cloudinary').v2;
        const streamifier = require('streamifier');

        console.log('📄 Uploading application PDF to Cloudinary...', {
            fileSize: req.file.size,
            applicationId
        });
        
        const cloudinaryResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'raw',
                    folder: `swagat-odisha/application-pdfs/${applicationId}`,
                    public_id: `application_${applicationId}_${Date.now()}`,
                    use_filename: false,
                    unique_filename: true
                },
                (error, result) => {
                    if (error) {
                        console.error('❌ Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        console.log('✅ Cloudinary upload successful:', result.secure_url);
                        resolve(result);
                    }
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        });

        console.log('✅ Application PDF uploaded to Cloudinary:', cloudinaryResult.secure_url);

        // Update application with PDF URL
        application.applicationPdf = {
            filePath: cloudinaryResult.secure_url,
            generatedAt: new Date(),
            version: '1.0'
        };
        application.progress.applicationPdfGenerated = true;
        await application.save();

        console.log('✅ Application updated with PDF URL:', application.applicationId);

        return res.status(200).json({
            success: true,
            message: 'Application PDF uploaded and stored successfully',
            data: {
                pdfUrl: cloudinaryResult.secure_url,
                applicationId: application.applicationId,
                generatedAt: application.applicationPdf.generatedAt
            }
        });
    } catch (error) {
        console.error('❌ Upload application PDF error:', error);
        console.error('Error stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Failed to upload application PDF',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get application PDF URL
const getApplicationPDF = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await StudentApplication.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if user owns this application
        if (application.user.toString() !== req.user._id.toString() && 
            req.user.role !== 'super_admin' && 
            req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view PDF for this application'
            });
        }

        if (!application.applicationPdf || !application.applicationPdf.filePath) {
            return res.status(404).json({
                success: false,
                message: 'Application PDF not found. Please generate the PDF first.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Application PDF retrieved successfully',
            data: {
                pdfUrl: application.applicationPdf.filePath,
                generatedAt: application.applicationPdf.generatedAt,
                version: application.applicationPdf.version,
                applicationId: application.applicationId
            }
        });
    } catch (error) {
        console.error('Get application PDF error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve application PDF',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Download/Serve application PDF with proper headers
const serveApplicationPDF = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await StudentApplication.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if user owns this application
        if (application.user.toString() !== req.user._id.toString() && 
            req.user.role !== 'super_admin' && 
            req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view PDF for this application'
            });
        }

        if (!application.applicationPdf || !application.applicationPdf.filePath) {
            return res.status(404).json({
                success: false,
                message: 'Application PDF not found. Please generate the PDF first.'
            });
        }

        const pdfUrl = application.applicationPdf.filePath;
        const studentName = (application.personalDetails?.fullName || 'application').replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `Application_${application.applicationId}_${studentName}.pdf`;

        // Fetch PDF from Cloudinary and stream to response
        const https = require('https');
        const http = require('http');
        
        return new Promise((resolve, reject) => {
            try {
                const parsedUrl = new URL(pdfUrl);
                const client = parsedUrl.protocol === 'https:' ? https : http;
                
                client.get(pdfUrl, (response) => {
                    if (response.statusCode !== 200) {
                        res.status(404).json({
                            success: false,
                            message: 'PDF file not found on server'
                        });
                        return resolve();
                    }

                    // Set proper headers for PDF viewing/downloading
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
                    res.setHeader('Cache-Control', 'public, max-age=3600');
                    
                    // Pipe the PDF to response
                    response.on('end', () => resolve());
                    response.on('error', (err) => {
                        console.error('Error streaming PDF:', err);
                        if (!res.headersSent) {
                            res.status(500).json({
                                success: false,
                                message: 'Failed to stream PDF file'
                            });
                        }
                        resolve();
                    });
                    
                    response.pipe(res);
                }).on('error', (error) => {
                    console.error('Error fetching PDF from Cloudinary:', error);
                    if (!res.headersSent) {
                        res.status(500).json({
                            success: false,
                            message: 'Failed to retrieve PDF file'
                        });
                    }
                    resolve();
                });
            } catch (urlError) {
                console.error('Error parsing PDF URL:', urlError);
                res.status(500).json({
                    success: false,
                    message: 'Invalid PDF URL'
                });
                resolve();
            }
        });
    } catch (error) {
        console.error('Serve application PDF error:', error);
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: 'Failed to serve application PDF',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
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
    uploadApplicationPDF,
    getApplicationPDF,
    serveApplicationPDF,
};
