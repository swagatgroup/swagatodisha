const redisManager = require("../config/redis");
const StudentApplication = require("../models/StudentApplication");
const Document = require("../models/Document");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

class WorkflowEngine {
  constructor() {
    this.workflows = new Map();
    this.initializeWorkflows();
  }

  initializeWorkflows() {
    // Application submission workflow
    this.workflows.set("application_submission", {
      steps: [
        "validation",
        "document_processing",
        "database_creation",
        "notification",
        "completion",
      ],
      timeout: 300000, // 5 minutes
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2,
        initialDelay: 1000,
      },
    });

    // Document processing workflow
    this.workflows.set("document_processing", {
      steps: [
        "upload_validation",
        "file_processing",
        "database_storage",
        "status_update",
      ],
      timeout: 600000, // 10 minutes
      retryPolicy: {
        maxRetries: 5,
        backoffMultiplier: 1.5,
        initialDelay: 2000,
      },
    });
  }

  // Main application submission workflow
  async startApplicationSubmission(userId, applicationData) {
    const submissionId = `sub_${Date.now()}_${uuidv4().substr(0, 8)}`;
    const lockKey = `lock:submission:${userId}`;

    try {
      // Acquire distributed lock to prevent duplicate submissions
      const lockValue = await redisManager.acquireLock(lockKey, 60);
      if (!lockValue) {
        throw new Error(
          "Another submission is already in progress for this user"
        );
      }

      // Initialize workflow state
      await this.initializeWorkflowState(submissionId, userId, applicationData);

      // Start the workflow steps
      const result = await this.executeWorkflow(
        "application_submission",
        submissionId,
        {
          userId,
          applicationData,
          submissionId,
        }
      );

      return {
        success: true,
        submissionId,
        result,
      };
    } catch (error) {
      console.error("Application submission failed:", error);
      await this.handleWorkflowError(submissionId, error);
      throw error;
    } finally {
      // Release lock
      await redisManager.releaseLock(lockKey, lockValue);
    }
  }

  async initializeWorkflowState(submissionId, userId, applicationData) {
    const workflowState = {
      submissionId,
      userId,
      applicationData,
      status: "initialized",
      currentStep: "validation",
      steps: {},
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    await redisManager.set(
      `workflow:${submissionId}`,
      JSON.stringify(workflowState)
    );
    await redisManager.expire(`workflow:${submissionId}`, 3600); // 1 hour TTL

    // Save application state for resumability
    await redisManager.saveApplicationState(userId, submissionId, {
      formData: applicationData,
      currentStep: "validation",
      progress: 0,
    });

    return workflowState;
  }

  async executeWorkflow(workflowName, submissionId, context) {
    const workflow = this.workflows.get(workflowName);
    if (!workflow) {
      throw new Error(`Workflow ${workflowName} not found`);
    }

    const results = {};
    let currentStepIndex = 0;

    for (const step of workflow.steps) {
      try {
        console.log(`Executing step: ${step} for submission: ${submissionId}`);

        // Update workflow state
        await this.updateWorkflowStep(submissionId, step, "in_progress");

        // Execute step
        const stepResult = await this.executeStep(step, submissionId, context);
        results[step] = stepResult;

        // Mark step as completed
        await this.updateWorkflowStep(
          submissionId,
          step,
          "completed",
          stepResult
        );

        // Update progress
        const progress = ((currentStepIndex + 1) / workflow.steps.length) * 100;
        await this.updateWorkflowProgress(submissionId, progress);

        // Publish progress update
        await redisManager.publishEvent("workflow:progress", "step_completed", {
          submissionId,
          step,
          progress,
          result: stepResult,
        });

        currentStepIndex++;
      } catch (error) {
        console.error(
          `Step ${step} failed for submission ${submissionId}:`,
          error
        );

        // Mark step as failed
        await this.updateWorkflowStep(submissionId, step, "failed", {
          error: error.message,
        });

        // Handle retry logic
        const retryResult = await this.handleStepRetry(
          workflowName,
          submissionId,
          step,
          error,
          context
        );
        if (!retryResult.success) {
          throw new Error(
            `Step ${step} failed after retries: ${error.message}`
          );
        }

        results[step] = retryResult.result;
      }
    }

    // Mark workflow as completed
    await this.completeWorkflow(submissionId, results);

    return results;
  }

  async executeStep(step, submissionId, context) {
    switch (step) {
      case "validation":
        return await this.validateApplicationData(context);

      case "document_processing":
        return await this.processDocuments(context);

      case "database_creation":
        return await this.createApplicationInDatabase(context);

      case "notification":
        return await this.sendNotifications(context);

      case "completion":
        return await this.completeApplicationSubmission(context);

      default:
        throw new Error(`Unknown step: ${step}`);
    }
  }

  async validateApplicationData(context) {
    const { applicationData, userId } = context;

    // Validate required fields
    const requiredFields = [
      "personalDetails.fullName",
      "personalDetails.dateOfBirth",
      "contactDetails.email",
      "contactDetails.primaryPhone",
      "courseDetails.selectedCourse",
    ];

    const errors = [];

    for (const field of requiredFields) {
      const value = this.getNestedValue(applicationData, field);
      if (!value || value.trim() === "") {
        errors.push(`${field} is required`);
      }
    }

    // Validate email format
    if (applicationData.contactDetails?.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(applicationData.contactDetails.email)) {
        errors.push("Invalid email format");
      }
    }

    // Validate phone number
    if (applicationData.contactDetails?.primaryPhone) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(applicationData.contactDetails.primaryPhone)) {
        errors.push("Invalid phone number format");
      }
    }

    // Check for duplicate Aadhar number (only if not submitted by staff/agent)
    if (applicationData.personalDetails?.aadharNumber && applicationData.submitterRole === 'student') {
      const existingApplication = await StudentApplication.findOne({
        "personalDetails.aadharNumber":
          applicationData.personalDetails.aadharNumber,
      });

      if (existingApplication) {
        errors.push("An application with this Aadhar number already exists");
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    return {
      valid: true,
      validatedAt: Date.now(),
    };
  }

  async processDocuments(context) {
    const { applicationData, submissionId } = context;
    const documents = applicationData.documents || {};

    const processedDocuments = [];
    const documentTypes = [
      "aadharCard",
      "passportPhoto",
      "marksheet10th",
      "marksheet12th",
      "characterCertificate",
      "migrationCertificate",
      "casteCertificate",
      "incomeCertificate",
    ];

    for (const docType of documentTypes) {
      if (documents[docType]) {
        try {
          const documentResult = await this.processDocument(
            docType,
            documents[docType],
            submissionId
          );
          processedDocuments.push(documentResult);
        } catch (error) {
          console.error(`Document processing failed for ${docType}:`, error);
          // Continue with other documents
        }
      }
    }

    return {
      processedDocuments,
      totalDocuments: processedDocuments.length,
      processedAt: Date.now(),
    };
  }

  async processDocument(docType, documentData, submissionId) {
    // Add document to processing queue
    const jobId = await redisManager.addToQueue(
      "document_processing",
      {
        docType,
        documentData,
        submissionId,
        userId: documentData.userId,
      },
      1
    ); // High priority

    // Wait for processing to complete (with timeout)
    const result = await this.waitForJobCompletion(
      "document_processing",
      jobId,
      30000
    );

    return {
      docType,
      jobId,
      result,
      processedAt: Date.now(),
    };
  }

  async createApplicationInDatabase(context) {
    const { applicationData, userId, submissionId } = context;

    // Generate application ID
    const applicationId = `APP${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;

    // Handle referral code if provided
    let referralInfo = {};
    if (applicationData.referralCode) {
      const referrer = await User.findOne({
        referralCode: applicationData.referralCode,
      });
      if (referrer) {
        referralInfo = {
          referredBy: referrer._id,
          referralCode: applicationData.referralCode,
          referralType: referrer.role,
        };
      }
    }

    // Create application data
    const applicationDataToSave = {
      user: userId,
      applicationId,
      personalDetails: applicationData.personalDetails,
      contactDetails: applicationData.contactDetails,
      courseDetails: applicationData.courseDetails,
      guardianDetails: applicationData.guardianDetails,
      financialDetails: applicationData.financialDetails || {},
      referralInfo,
      submittedBy: applicationData.submittedBy || userId,
      submitterRole: applicationData.submitterRole || 'student',
      status: "SUBMITTED",
      currentStage: "SUBMITTED",
      progress: {
        registrationComplete: true,
        documentsComplete: true,
        applicationPdfGenerated: false,
        termsAccepted: true,
        submissionComplete: true,
      },
      submittedAt: new Date(),
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    };

    // Save to database
    const application = new StudentApplication(applicationDataToSave);
    // Assign agent immediately if referral is an agent
    if (
      referralInfo &&
      referralInfo.referredBy &&
      referralInfo.referralType === "agent"
    ) {
      application.assignedAgent = referralInfo.referredBy;
    }
    await application.save();
    await application.populate("user", "fullName email phoneNumber");

    // Store application ID in workflow context
    context.applicationId = applicationId;
    context.application = application;

    return {
      applicationId,
      application: application.toObject(),
      savedAt: Date.now(),
    };
  }

  async sendNotifications(context) {
    const { application, userId, submissionId } = context;

    // Notify all stakeholders
    const notifications = [
      {
        channel: "application:created",
        event: "new_application",
        data: {
          applicationId: application.applicationId,
          userId,
          studentName: application.user.fullName,
          course: application.courseDetails.selectedCourse,
          submittedAt: application.submittedAt,
        },
      },
      {
        channel: "dashboard:staff",
        event: "application_submitted",
        data: {
          applicationId: application.applicationId,
          userId,
          studentName: application.user.fullName,
          status: "pending_review",
        },
      },
      {
        channel: "dashboard:admin",
        event: "application_submitted",
        data: {
          applicationId: application.applicationId,
          userId,
          studentName: application.user.fullName,
          status: "pending_review",
        },
      },
    ];

    // Send notifications
    for (const notification of notifications) {
      await redisManager.publishEvent(
        notification.channel,
        notification.event,
        notification.data
      );
    }

    return {
      notificationsSent: notifications.length,
      sentAt: Date.now(),
    };
  }

  async completeApplicationSubmission(context) {
    const { application, submissionId } = context;

    // Update workflow status
    await this.updateWorkflowStep(submissionId, "completion", "completed");

    // Clean up temporary data
    await redisManager.deleteApplicationState(context.userId, submissionId);

    // Publish completion event
    await redisManager.publishEvent(
      "workflow:completed",
      "application_submitted",
      {
        submissionId,
        applicationId: application.applicationId,
        userId: context.userId,
        completedAt: Date.now(),
      }
    );

    return {
      completed: true,
      applicationId: application.applicationId,
      completedAt: Date.now(),
    };
  }

  async updateWorkflowStep(submissionId, step, status, data = {}) {
    const stepData = {
      status,
      data,
      timestamp: Date.now(),
    };

    await redisManager.setWorkflowStep(submissionId, step, status, data);

    // Update overall workflow state
    const workflowState = await redisManager.get(`workflow:${submissionId}`);
    if (workflowState) {
      const state = JSON.parse(workflowState);
      state.steps[step] = stepData;
      state.lastUpdated = Date.now();
      await redisManager.set(`workflow:${submissionId}`, JSON.stringify(state));
    }
  }

  async updateWorkflowProgress(submissionId, progress) {
    const workflowState = await redisManager.get(`workflow:${submissionId}`);
    if (workflowState) {
      const state = JSON.parse(workflowState);
      state.progress = progress;
      state.lastUpdated = Date.now();
      await redisManager.set(`workflow:${submissionId}`, JSON.stringify(state));
    }
  }

  async completeWorkflow(submissionId, results) {
    const workflowState = await redisManager.get(`workflow:${submissionId}`);
    if (workflowState) {
      const state = JSON.parse(workflowState);
      state.status = "completed";
      state.results = results;
      state.completedAt = Date.now();
      await redisManager.set(`workflow:${submissionId}`, JSON.stringify(state));
    }
  }

  async handleStepRetry(workflowName, submissionId, step, error, context) {
    const workflow = this.workflows.get(workflowName);
    const retryPolicy = workflow.retryPolicy;

    // Get current retry count for this step
    const retryKey = `retry:${submissionId}:${step}`;
    const retryCount = (await redisManager.get(retryKey)) || 0;

    if (retryCount >= retryPolicy.maxRetries) {
      return { success: false, error: "Max retries exceeded" };
    }

    // Calculate delay
    const delay =
      retryPolicy.initialDelay *
      Math.pow(retryPolicy.backoffMultiplier, retryCount);

    console.log(
      `Retrying step ${step} in ${delay}ms (attempt ${parseInt(retryCount) + 1
      })`
    );

    // Wait for delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Increment retry count
    await redisManager.set(retryKey, parseInt(retryCount) + 1);
    await redisManager.expire(retryKey, 3600);

    try {
      // Retry the step
      const result = await this.executeStep(step, submissionId, context);
      await redisManager.del(retryKey); // Clear retry count on success
      return { success: true, result };
    } catch (retryError) {
      return { success: false, error: retryError.message };
    }
  }

  async handleWorkflowError(submissionId, error) {
    // Update workflow state
    await this.updateWorkflowStep(submissionId, "error", "failed", {
      error: error.message,
    });

    // Publish error event
    await redisManager.publishEvent("workflow:error", "workflow_failed", {
      submissionId,
      error: error.message,
      failedAt: Date.now(),
    });
  }

  async waitForJobCompletion(queueName, jobId, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Job ${jobId} timed out after ${timeout}ms`));
      }, timeout);

      // Subscribe to job completion events
      redisManager.subscribeToChannel("job:completed", (event) => {
        if (event.data.jobId === jobId) {
          clearTimeout(timeoutId);
          resolve(event.data.result);
        }
      });
    });
  }

  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  // Resume workflow from any step
  async resumeWorkflow(submissionId) {
    const workflowState = await redisManager.get(`workflow:${submissionId}`);
    if (!workflowState) {
      throw new Error("Workflow not found");
    }

    const state = JSON.parse(workflowState);
    const workflow = this.workflows.get("application_submission");

    // Find the last completed step
    let lastCompletedIndex = -1;
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      if (state.steps[step] && state.steps[step].status === "completed") {
        lastCompletedIndex = i;
      } else {
        break;
      }
    }

    // Resume from the next step
    const remainingSteps = workflow.steps.slice(lastCompletedIndex + 1);
    const context = {
      userId: state.userId,
      applicationData: state.applicationData,
      submissionId,
    };

    return await this.executeWorkflow(
      "application_submission",
      submissionId,
      context
    );
  }
}

module.exports = new WorkflowEngine();
