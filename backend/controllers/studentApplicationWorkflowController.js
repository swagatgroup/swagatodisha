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

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found",
            });
        }

        // Update application data
        if (data) {
            Object.keys(data).forEach((key) => {
                if (data[key] !== undefined) {
                    application[key] = data[key];
                }
            });
        }

        if (stage) {
            application.currentStage = stage;
        }

        await application.save();

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
        const { status = 'SUBMITTED', page = 1, limit = 20 } = req.query;

        const query = status === 'all' ? {} : { status: status.toUpperCase() };

        const applications = await StudentApplication.find(query)
            .populate('user', 'fullName email phoneNumber')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await StudentApplication.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                applications,
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

        const application = await StudentApplication.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        await application.approveApplication(req.user._id, remarks || 'Approved by staff');
        application.reviewStatus.overallApproved = true;
        application.reviewStatus.reviewedBy = req.user._id;
        application.reviewStatus.reviewedAt = new Date();
        await application.save();

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

        const application = await StudentApplication.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        await application.rejectApplication(req.user._id, rejectionReason || 'Insufficient/invalid documents', remarks);
        application.reviewStatus.overallApproved = false;
        application.reviewStatus.reviewedBy = req.user._id;
        application.reviewStatus.reviewedAt = new Date();
        await application.save();

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


const verifyDocuments = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { decisions = [] } = req.body;

        const application = await StudentApplication.findOne({ applicationId });
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (!Array.isArray(decisions) || decisions.length === 0) {
            return res.status(400).json({ success: false, message: 'No document decisions provided' });
        }

        // Update embedded documents by documentType
        const docMap = new Map((application.documents || []).map((d) => [d.documentType, d]));
        decisions.forEach((d) => {
            const existing = docMap.get(d.documentType);
            if (existing) {
                existing.status = (d.status || 'PENDING').toUpperCase();
                if (d.remarks) existing.remarks = d.remarks;
                existing.reviewedBy = req.user?._id;
                existing.reviewedAt = new Date();
            }
        });

        // Compute verification flags
        const allDocs = application.documents || [];
        const hasAny = allDocs.length > 0;
        const allApproved = hasAny && allDocs.every((d) => d.status === 'APPROVED');

        application.reviewStatus.documentsVerified = allApproved;
        application.reviewStatus.reviewedBy = req.user._id;
        application.reviewStatus.reviewedAt = new Date();
        application.status = allApproved ? 'UNDER_REVIEW' : application.status;
        application.currentStage = allApproved ? 'UNDER_REVIEW' : application.currentStage;

        await application.save();

        return res.status(200).json({
            success: true,
            message: 'Documents reviewed successfully',
            data: application
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
    verifyDocuments,
    generateCombinedPDF,
    generateDocumentsZIP,
    getApplicationReview,
};
