const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Student = require("../models/Student");
const StudentApplication = require("../models/StudentApplication");
const User = require("../models/User");
const Payment = require("../models/Payment");
const Document = require("../models/Document");
const { getSessionDateRange, getCurrentSession } = require("../utils/sessionHelper");

// All routes are protected
router.use(protect);

// Get students for staff processing
router.get("/students", async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, session: sessionParam } = req.query;

    // SESSION IS REQUIRED - Always filter by session
    if (!sessionParam) {
      return res.status(400).json({
        success: false,
        message: 'Session parameter is required',
        error: 'Missing session parameter'
      });
    }

    let query = {};

    // Add session filter - REQUIRED
    // Session is based on registration year: registered in 2025 → session 2025-26
    try {
      // Parse session to extract start year (e.g., "2025-26" → 2025, "26-27" → 2026)
      const parts = sessionParam.split('-');
      if (parts.length !== 2) {
        throw new Error(`Invalid session format: ${sessionParam}`);
      }
      
      let startYear = parseInt(parts[0], 10);
      // Handle 2-digit year format (e.g., "26-27" → 2026)
      if (startYear < 100) {
        startYear = 2000 + startYear;
      }
      
      console.log(`📅 Staff route - Filtering by session ${sessionParam} (registration year: ${startYear})`);
      
      // Create date range for the entire year (Jan 1 to Dec 31) in UTC
      const yearStart = new Date(Date.UTC(startYear, 0, 1, 0, 0, 0, 0)); // January 1, startYear UTC
      const yearEnd = new Date(Date.UTC(startYear, 11, 31, 23, 59, 59, 999)); // December 31, startYear UTC
      
      // Match students where registrationDate year OR createdAt year equals session start year
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
      
      // Combine session filter with existing query using $and
      if (Object.keys(query).length > 0) {
        query = { $and: [query, sessionDateFilter] };
      } else {
        Object.assign(query, sessionDateFilter);
      }
    } catch (error) {
      console.error('❌ Session date range error:', error);
      return res.status(400).json({
        success: false,
        message: `Invalid session format: ${error.message}`,
        error: process.env.NODE_ENV === "development" ? error.message : "Invalid session"
      });
    }

    if (status && status !== "all") {
      // Combine status filter with existing query
      if (query.$and) {
        query.$and.push({ "workflowStatus.currentStage": status });
      } else {
        query["workflowStatus.currentStage"] = status;
      }
    }

    if (search) {
      const searchFilter = {
        $or: [
          { "personalDetails.fullName": { $regex: search, $options: "i" } },
          { applicationId: { $regex: search, $options: "i" } },
          { "personalDetails.aadharNumber": { $regex: search, $options: "i" } },
        ]
      };
      
      // Combine search filter with existing query using $and
      if (query.$and) {
        query.$and.push(searchFilter);
      } else {
        query = { $and: [query, searchFilter] };
      }
    }

    const students = await StudentApplication.find(query)
      .populate("user", "fullName email phoneNumber")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StudentApplication.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        students,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get staff students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get students",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Get processing statistics
router.get("/processing-stats", async (req, res) => {
  try {
    // Get session from query parameter, default to current session
    const sessionParam = req.query.session || getCurrentSession();
    console.log('📊 Processing stats requested for session:', sessionParam);

    // Parse session to extract start year (e.g., "2025-26" → 2025, "26-27" → 2026)
    // Session is based on registration year: registered in 2025 → session 2025-26
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
      console.error('❌ Session parsing error:', error);
      return res.status(400).json({
        success: false,
        message: `Invalid session format: ${error.message}`,
        error: process.env.NODE_ENV === "development" ? error.message : "Invalid session"
      });
    }

    // Create date range for the entire calendar year (Jan 1 to Dec 31) in UTC
    // This matches the filtering logic used in student listing endpoints
    const yearStart = new Date(Date.UTC(startYear, 0, 1, 0, 0, 0, 0)); // January 1, startYear UTC
    const yearEnd = new Date(Date.UTC(startYear, 11, 31, 23, 59, 59, 999)); // December 31, startYear UTC

    console.log('📅 Calendar year range:', { yearStart, yearEnd });

    // Base query for session-based filtering
    // Match students where registrationDate year OR createdAt year equals session start year
    // This matches the same logic used in /students endpoint
    const sessionQuery = {
      $or: [
        // Match by registrationDate year (if registrationDate exists)
        {
          $and: [
            { 'personalDetails.registrationDate': { $exists: true, $ne: null } },
            { 'personalDetails.registrationDate': { $gte: yearStart, $lte: yearEnd } }
          ]
        },
        // OR match by createdAt year (if registrationDate doesn't exist or is null)
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

    console.log('🔍 Query filter:', JSON.stringify(sessionQuery, null, 2));

    // Total applications/students in this session
    const totalStudents = await StudentApplication.countDocuments(sessionQuery);
    console.log('👥 Total students in session:', totalStudents);

    // Also check total without session filter for debugging
    const totalAllStudents = await StudentApplication.countDocuments({});
    console.log('👥 Total students (all time):', totalAllStudents);

    // Pending verification - applications that are submitted but not yet approved/rejected (in this session)
    const pendingVerification = await StudentApplication.countDocuments({
      ...sessionQuery,
      status: 'UNDER_REVIEW'
    });
    console.log('⏳ Pending verification:', pendingVerification);

    // Approved in this session - applications approved within session date range
    const approvedInSession = await StudentApplication.countDocuments({
      ...sessionQuery,
      status: 'APPROVED'
    });
    console.log('✅ Approved:', approvedInSession);

    // Rejected in this session - applications rejected within session date range
    const rejectedInSession = await StudentApplication.countDocuments({
      ...sessionQuery,
      status: 'REJECTED'
    });
    console.log('❌ Rejected:', rejectedInSession);

    // Draft applications in this session
    const draftInSession = await StudentApplication.countDocuments({
      ...sessionQuery,
      status: 'DRAFT'
    });
    console.log('📝 Draft:', draftInSession);

    // Submitted applications in this session (separate from pending)
    const submittedInSession = await StudentApplication.countDocuments({
      ...sessionQuery,
      status: 'SUBMITTED'
    });
    console.log('📤 Submitted:', submittedInSession);

    // Under Review applications in this session
    const underReviewInSession = await StudentApplication.countDocuments({
      ...sessionQuery,
      status: 'UNDER_REVIEW'
    });
    console.log('🔍 Under Review:', underReviewInSession);

    // Calculate average processing time from workflow history (for this session)
    // Get all approved applications with workflow history in this session
    const approvedApplications = await StudentApplication.find({
      ...sessionQuery,
      status: 'APPROVED',
      'workflowHistory': { $exists: true, $ne: [] },
      submittedAt: { $exists: true }
    }).select('submittedAt workflowHistory reviewInfo createdAt');

    let totalProcessingTime = 0;
    let validApplications = 0;

    approvedApplications.forEach(app => {
      // Find when application was submitted
      const submittedAt = app.submittedAt || app.createdAt;

      // Find when application was approved (from reviewInfo or workflowHistory)
      let approvedAt = null;

      if (app.reviewInfo?.reviewedAt) {
        approvedAt = app.reviewInfo.reviewedAt;
      } else if (app.workflowHistory && app.workflowHistory.length > 0) {
        // Find the APPROVED entry in workflow history
        const approvedEntry = app.workflowHistory
          .slice()
          .reverse()
          .find(entry => entry.action === 'APPROVE' || entry.stage === 'APPROVED');

        if (approvedEntry && approvedEntry.timestamp) {
          approvedAt = approvedEntry.timestamp;
        }
      }

      // If we have both dates, calculate processing time in hours
      if (submittedAt && approvedAt) {
        const timeDiff = approvedAt.getTime() - submittedAt.getTime();
        const hours = timeDiff / (1000 * 60 * 60); // Convert milliseconds to hours

        // Only count if processing time is reasonable (not negative and less than 1 year)
        if (hours >= 0 && hours < 8760) {
          totalProcessingTime += hours;
          validApplications++;
        }
      }
    });

    // Calculate average processing time (in hours)
    const averageProcessingTime = validApplications > 0
      ? Math.round(totalProcessingTime / validApplications)
      : 0;

    // If no valid applications, use a default based on recent processing if available
    let finalAverageProcessingTime = averageProcessingTime;

    if (averageProcessingTime === 0 && approvedApplications.length > 0) {
      // Fallback: calculate from creation to now for pending applications in this session
      const recentPending = await StudentApplication.find({
        ...sessionQuery,
        status: 'UNDER_REVIEW',
        submittedAt: { $exists: true }
      })
        .select('submittedAt createdAt')
        .limit(100);

      if (recentPending.length > 0) {
        const now = new Date();
        let totalPendingTime = 0;
        recentPending.forEach(app => {
          const submittedAt = app.submittedAt || app.createdAt;
          if (submittedAt) {
            const hours = (now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60);
            if (hours >= 0 && hours < 8760) {
              totalPendingTime += hours;
            }
          }
        });

        if (recentPending.length > 0) {
          finalAverageProcessingTime = Math.round(totalPendingTime / recentPending.length);
        }
      }
    }

    // Ensure we have a reasonable default if still 0
    if (finalAverageProcessingTime === 0) {
      finalAverageProcessingTime = 24; // Default 24 hours
    }

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        pendingVerification,
        approvedInSession,
        rejectedInSession,
        draftInSession,
        submittedInSession,
        underReviewInSession,
        averageProcessingTime: finalAverageProcessingTime,
        session: sessionParam,
        sessionStartDate: yearStart,
        sessionEndDate: yearEnd
      },
    });
  } catch (error) {
    console.error("Get processing stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get processing statistics",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Get agents for staff management
router.get("/agents", async (req, res) => {
  try {
    const agents = await User.find({ role: "agent" })
      .select("fullName email phoneNumber createdAt")
      .sort({ createdAt: -1 });

    // Add mock performance data
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const assignedStudents = await Student.countDocuments({
          "workflowStatus.assignedAgent": agent._id,
        });

        const completedStudents = await Student.countDocuments({
          "workflowStatus.assignedAgent": agent._id,
          "workflowStatus.currentStage": "completed",
        });

        return {
          ...agent.toObject(),
          assignedStudents,
          completedStudents,
          performanceScore:
            assignedStudents > 0
              ? Math.round((completedStudents / assignedStudents) * 100)
              : 0,
          totalCommission: completedStudents * 5000,
          pendingCommission: Math.floor(completedStudents * 5000 * 0.7),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: agentsWithStats,
    });
  } catch (error) {
    console.error("Get agents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get agents",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Document verification routes
router.get("/documents/pending", async (req, res) => {
  try {
    const documents = await Document.find({ status: "pending" })
      .populate("student", "personalDetails.fullName studentId")
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("Get pending documents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get pending documents",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Approve document
router.put("/documents/:documentId/approve", async (req, res) => {
  try {
    const { documentId } = req.params;
    const { remarks } = req.body;

    const document = await Document.findByIdAndUpdate(
      documentId,
      {
        status: "approved",
        remarks: remarks || "Document approved by staff",
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Document approved successfully",
      data: document,
    });
  } catch (error) {
    console.error("Approve document error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve document",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Reject document
router.put("/documents/:documentId/reject", async (req, res) => {
  try {
    const { documentId } = req.params;
    const { reason, remarks } = req.body;

    const document = await Document.findByIdAndUpdate(
      documentId,
      {
        status: "rejected",
        rejectionReason: reason,
        remarks: remarks || reason,
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Document rejected successfully",
      data: document,
    });
  } catch (error) {
    console.error("Reject document error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject document",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Bulk document actions
router.post("/documents/bulk-action", async (req, res) => {
  try {
    const { action, documentIds, remarks } = req.body;

    const updateData = {
      status: action,
      remarks: remarks || `Bulk ${action} by staff`,
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
    };

    const result = await Document.updateMany(
      { _id: { $in: documentIds } },
      updateData
    );

    res.status(200).json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error("Bulk document action error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to perform bulk action",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Content management routes
router.get("/content", async (req, res) => {
  try {
    // Mock content data
    const content = [
      {
        _id: "1",
        title: "B.Tech Computer Science - Semester 1",
        type: "study_material",
        course: "B.Tech Computer Science",
        subject: "Programming Fundamentals",
        fileName: "programming_fundamentals.pdf",
        fileSize: 2048576,
        uploadedAt: new Date(),
        description: "Introduction to programming concepts",
      },
      {
        _id: "2",
        title: "Mathematics Assignment 1",
        type: "assignment",
        course: "B.Tech Computer Science",
        subject: "Mathematics",
        fileName: "math_assignment_1.pdf",
        fileSize: 1024000,
        uploadedAt: new Date(Date.now() - 86400000),
        description: "Calculus and Algebra problems",
      },
    ];

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("Get content error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get content",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Upload content
router.post("/content/upload", async (req, res) => {
  try {
    // This would handle file upload
    // For now, return a mock response
    res.status(200).json({
      success: true,
      message: "Content uploaded successfully",
      data: {
        _id: Date.now().toString(),
        title: req.body.title,
        type: req.body.type,
        course: req.body.course,
        subject: req.body.subject,
        uploadedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Upload content error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload content",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Delete content
router.delete("/content/:contentId", async (req, res) => {
  try {
    const { contentId } = req.params;

    // Mock deletion
    res.status(200).json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Delete content error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete content",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Submit application for a student (staff can submit multiple applications)
router.post("/submit-application", async (req, res) => {
  try {
    const {
      studentId,
      personalDetails,
      contactDetails,
      courseDetails,
      guardianDetails,
      financialDetails = {},
      referralCode,
    } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

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
    if (personalDetails && personalDetails.registrationDate) {
      personalDetails.registrationDate = new Date(personalDetails.registrationDate);
    }

    // Create application data
    const applicationData = {
      user: studentId, // Student for whom application is being submitted
      personalDetails,
      contactDetails,
      courseDetails,
      guardianDetails,
      financialDetails,
      referralInfo,
      submittedBy: req.user._id, // Staff who is submitting
      submitterRole: req.user.role,
      status: "UNDER_REVIEW",
      currentStage: "UNDER_REVIEW",
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

    const application = new StudentApplication(applicationData);
    await application.save();
    await application.populate("user", "fullName email phoneNumber");
    await application.populate("submittedBy", "fullName email");

    res.status(201).json({
      success: true,
      message: "Application submitted successfully for student",
      data: application,
    });
  } catch (error) {
    console.error("Submit application error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit application",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Get applications submitted by this staff member
router.get("/my-submitted-applications", async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const staffId = req.user._id;

    let query = { submittedBy: staffId };
    if (status && status !== "all") {
      query.status = status.toUpperCase();
    }

    const applications = await StudentApplication.find(query)
      .populate("user", "fullName email phoneNumber")
      .populate("submittedBy", "fullName email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StudentApplication.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total: total,
        },
      },
    });
  } catch (error) {
    console.error("Get submitted applications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get submitted applications",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

module.exports = router;
