const StudentApplication = require('../models/StudentApplication');
const User = require('../models/User');

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
    res.status(501).json({
        success: false,
        message: "Function not implemented (Socket.IO removed)"
    });
};

const downloadApplicationPDF = async (req, res) => {
    res.status(501).json({
        success: false,
        message: "Function not implemented (Socket.IO removed)"
    });
};

const getApplicationsByStatus = async (req, res) => {
    res.status(501).json({
        success: false,
        message: "Function not implemented (Socket.IO removed)"
    });
};

const approveApplication = async (req, res) => {
    res.status(501).json({
        success: false,
        message: "Function not implemented (Socket.IO removed)"
    });
};

const rejectApplication = async (req, res) => {
    res.status(501).json({
        success: false,
        message: "Function not implemented (Socket.IO removed)"
    });
};

const getWorkflowStats = async (req, res) => {
    res.status(501).json({
        success: false,
        message: "Function not implemented (Socket.IO removed)"
    });
};

const getSubmittedApplications = async (req, res) => {
    res.status(501).json({
        success: false,
        message: "Function not implemented (Socket.IO removed)"
    });
};

const verifyDocuments = async (req, res) => {
    res.status(501).json({
        success: false,
        message: "Function not implemented (Socket.IO removed)"
    });
};

const generateCombinedPDF = async (req, res) => {
    res.status(501).json({
        success: false,
        message: "Function not implemented (Socket.IO removed)"
    });
};

const generateDocumentsZIP = async (req, res) => {
    res.status(501).json({
        success: false,
        message: "Function not implemented (Socket.IO removed)"
    });
};

const getApplicationReview = async (req, res) => {
    res.status(501).json({
        success: false,
        message: "Function not implemented (Socket.IO removed)"
    });
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
