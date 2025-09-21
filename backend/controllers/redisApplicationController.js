const redisManager = require("../config/redis");
const workflowEngine = require("../utils/workflowEngine");
const queueProcessor = require("../utils/queueProcessor");
const StudentApplication = require("../models/StudentApplication");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");

class RedisApplicationController {
  constructor() {
    this.initializeController();
  }

  async initializeController() {
    // Start queue processors
    await queueProcessor.startAllWorkers();
    console.log("Redis Application Controller initialized");
  }

  // Create new application with Redis workflow
  async createApplication(req, res) {
    const sessionId = `session_${Date.now()}_${uuidv4().substr(0, 8)}`;

    try {
      console.log(
        "Creating application with Redis workflow for user:",
        req.user._id
      );

      // Validate user authentication
      if (!req.user || !req.user._id) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // Extract application data
      const {
        personalDetails,
        contactDetails,
        courseDetails,
        guardianDetails,
        financialDetails = {},
        referralCode,
        documents = {},
      } = req.body;

      // Normalize documents keys from frontend to backend expected keys
      const normalizedDocuments = {
        aadharCard: documents.aadhar_card || documents.aadharCard,
        passportPhoto: documents.passport_photo || documents.passportPhoto,
        marksheet10th: documents.marksheet_10th || documents.marksheet10th,
        marksheet12th: documents.marksheet_12th || documents.marksheet12th,
        characterCertificate:
          documents.character_certificate || documents.characterCertificate,
        migrationCertificate:
          documents.migration_certificate || documents.migrationCertificate,
        casteCertificate:
          documents.caste_certificate || documents.casteCertificate,
        incomeCertificate:
          documents.income_certificate || documents.incomeCertificate,
      };

      // Sanitize basic strings (avoid undefined/trim errors)
      const sanitize = (v) => (typeof v === "string" ? v.trim() : v);
      if (personalDetails) {
        personalDetails.fullName = sanitize(personalDetails.fullName);
        personalDetails.fathersName = sanitize(personalDetails.fathersName);
        personalDetails.mothersName = sanitize(personalDetails.mothersName);
        personalDetails.gender = sanitize(personalDetails.gender);
        personalDetails.aadharNumber = sanitize(personalDetails.aadharNumber);
      }
      if (contactDetails) {
        contactDetails.email = sanitize(contactDetails.email);
        contactDetails.primaryPhone = sanitize(contactDetails.primaryPhone);
      }
      if (courseDetails) {
        courseDetails.selectedCourse = sanitize(courseDetails.selectedCourse);
        courseDetails.stream = sanitize(courseDetails.stream);
      }

      // Check for existing application (only for students)
      if (req.user.role === 'student') {
        const existingApplication = await StudentApplication.findOne({
          user: req.user._id,
        });
        if (existingApplication) {
          return res.status(400).json({
            success: false,
            message:
              "You already have an application. Please update the existing one.",
            applicationId: existingApplication.applicationId,
          });
        }
      }

      // Prepare application data
      const applicationData = {
        personalDetails,
        contactDetails,
        courseDetails,
        guardianDetails,
        financialDetails,
        referralCode,
        documents: normalizedDocuments,
        userId: req.user._id,
        submitterRole: req.user.role,
      };

      // Start workflow
      const workflowResult = await workflowEngine.startApplicationSubmission(
        req.user._id,
        applicationData
      );

      // Create session for tracking
      await redisManager.createSession(req.user._id, {
        applicationData,
        submissionId: workflowResult.submissionId,
        status: "processing",
      });

      // Return immediate response
      res.status(202).json({
        success: true,
        message: "Application submission started",
        submissionId: workflowResult.submissionId,
        sessionId,
        status: "processing",
        estimatedCompletion: "2-3 minutes",
      });
    } catch (error) {
      console.error("Create application error:", error);

      // Surface validation errors as 400s for clearer UX
      const isValidation =
        typeof error.message === "string" &&
        error.message.toLowerCase().includes("validation");
      const statusCode = isValidation ? 400 : 500;

      res.status(statusCode).json({
        success: false,
        message: isValidation
          ? error.message
          : "Failed to start application submission",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Get application status
  async getApplicationStatus(req, res) {
    try {
      const { submissionId } = req.params;
      const userId = req.user._id;

      // Get workflow status from Redis
      const workflowStatus = await redisManager.getWorkflowStatus(submissionId);

      if (!workflowStatus) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      // Get application from database if workflow is complete
      let application = null;
      if (
        workflowStatus.submission &&
        workflowStatus.submission.status === "completed"
      ) {
        application = await StudentApplication.findOne({
          user: userId,
        }).populate("user", "fullName email phoneNumber");
      }

      // Calculate progress percentage
      const totalSteps = Object.keys(workflowStatus).length;
      const completedSteps = Object.values(workflowStatus).filter(
        (step) => step.status === "completed"
      ).length;
      const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

      res.status(200).json({
        success: true,
        data: {
          submissionId,
          status: workflowStatus,
          progress: Math.round(progress),
          application,
          lastUpdated: Date.now(),
        },
      });
    } catch (error) {
      console.error("Get application status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get application status",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // Save application draft
  async saveDraft(req, res) {
    try {
      const userId = req.user._id;
      const { formData, currentStep } = req.body;

      // Generate draft ID
      const draftId = `draft_${Date.now()}_${uuidv4().substr(0, 8)}`;

      // Save draft to Redis
      await redisManager.saveApplicationState(userId, draftId, {
        formData,
        currentStep,
        isDraft: true,
        savedAt: Date.now(),
      });

      res.status(200).json({
        success: true,
        message: "Draft saved successfully",
        draftId,
        savedAt: new Date(),
      });
    } catch (error) {
      console.error("Save draft error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save draft",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // Load application draft
  async loadDraft(req, res) {
    try {
      const { draftId } = req.params;
      const userId = req.user._id;

      // Get draft from Redis
      const draft = await redisManager.getApplicationState(userId, draftId);

      if (!draft) {
        return res.status(404).json({
          success: false,
          message: "Draft not found",
        });
      }

      res.status(200).json({
        success: true,
        data: draft,
      });
    } catch (error) {
      console.error("Load draft error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to load draft",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // Upload document
  async uploadDocument(req, res) {
    try {
      const { documentType } = req.body;
      const file = req.file;
      const userId = req.user._id;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      if (!documentType) {
        return res.status(400).json({
          success: false,
          message: "Document type is required",
        });
      }

      // Prepare document data
      const documentData = {
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        documentType,
        userId,
        uploadedAt: Date.now(),
      };

      // Add to document processing queue
      const jobId = await queueProcessor.addToQueue(
        "document_processing",
        documentData,
        1
      );

      res.status(202).json({
        success: true,
        message: "Document upload started",
        jobId,
        documentType,
        status: "processing",
      });
    } catch (error) {
      console.error("Upload document error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload document",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // Get document status
  async getDocumentStatus(req, res) {
    try {
      const { jobId } = req.params;

      // Check if job is completed
      const jobStatus = await redisManager.get(`job:${jobId}:status`);

      if (!jobStatus) {
        return res.status(404).json({
          success: false,
          message: "Job not found",
        });
      }

      const status = JSON.parse(jobStatus);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      console.error("Get document status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get document status",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // Resume workflow
  async resumeWorkflow(req, res) {
    try {
      const { submissionId } = req.params;
      const userId = req.user._id;

      // Check if user owns this submission
      const workflowState = await redisManager.get(`workflow:${submissionId}`);
      if (!workflowState) {
        return res.status(404).json({
          success: false,
          message: "Workflow not found",
        });
      }

      const state = JSON.parse(workflowState);
      if (state.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Resume workflow
      const result = await workflowEngine.resumeWorkflow(submissionId);

      res.status(200).json({
        success: true,
        message: "Workflow resumed",
        result,
      });
    } catch (error) {
      console.error("Resume workflow error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to resume workflow",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // Get user applications
  async getUserApplications(req, res) {
    try {
      const userId = req.user._id;
      const { status, limit = 10, offset = 0 } = req.query;

      let query = { user: userId };
      if (status) {
        query.status = status;
      }

      const applications = await StudentApplication.find(query)
        .populate("user", "fullName email phoneNumber")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset));

      const total = await StudentApplication.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          applications,
          pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get user applications error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get applications",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // Get all applications (for staff/admin)
  async getAllApplications(req, res) {
    try {
      const { status, stage, role, limit = 20, offset = 0 } = req.query;

      let query = {};
      if (status) query.status = status;
      if (stage) query.currentStage = stage;
      if (role) query["referralInfo.referralType"] = role;

      const applications = await StudentApplication.find(query)
        .populate("user", "fullName email phoneNumber")
        .populate("referralInfo.referredBy", "fullName email")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset));

      const total = await StudentApplication.countDocuments(query);

      // Get real-time stats
      const stats = await this.getApplicationStats();

      res.status(200).json({
        success: true,
        data: {
          applications,
          stats,
          pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get all applications error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get applications",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // Get application statistics
  async getApplicationStats() {
    try {
      const stats = await StudentApplication.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const result = {
        total: 0,
        submitted: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
      };

      stats.forEach((stat) => {
        result.total += stat.count;
        result[stat._id.toLowerCase()] = stat.count;
      });

      return result;
    } catch (error) {
      console.error("Get application stats error:", error);
      return {
        total: 0,
        submitted: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
      };
    }
  }

  // Update application status (for staff/admin)
  async updateApplicationStatus(req, res) {
    try {
      const { applicationId } = req.params;
      const { status, comments } = req.body;
      const userId = req.user._id;

      const application = await StudentApplication.findOne({ applicationId });
      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      // Update application
      application.status = status;
      application.reviewedBy = userId;
      application.reviewedAt = new Date();

      if (comments) {
        application.reviewComments = comments;
      }

      await application.save();

      // Publish status update event
      await redisManager.publishEvent("application:updated", "status_changed", {
        applicationId,
        status,
        reviewedBy: userId,
        reviewedAt: new Date(),
        comments,
      });

      res.status(200).json({
        success: true,
        message: "Application status updated",
        data: application,
      });
    } catch (error) {
      console.error("Update application status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update application status",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // Health check
  async healthCheck(req, res) {
    try {
      const redisHealth = await redisManager.healthCheck();
      const queueHealth = await queueProcessor.healthCheck();

      res.status(200).json({
        success: true,
        data: {
          redis: redisHealth,
          queue: queueHealth,
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json({
        success: false,
        message: "Health check failed",
        error: error.message,
      });
    }
  }
}

module.exports = new RedisApplicationController();
