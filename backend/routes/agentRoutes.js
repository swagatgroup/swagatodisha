const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { protect } = require("../middleware/auth");
const Student = require("../models/Student");
const StudentApplication = require("../models/StudentApplication");
const User = require("../models/User");
const Payment = require("../models/Payment");

// All routes are protected
router.use(protect);

// Debug endpoint to check agent data
router.get("/debug", async (req, res) => {
  try {
    const agentId = req.user._id;
    console.log("Debug - Agent ID:", agentId);

    // Check StudentApplication model
    const allApplications = await StudentApplication.find({}).limit(5);
    const agentApplications = await StudentApplication.find({
      $or: [{ assignedAgent: agentId }, { "referralInfo.referredBy": agentId }],
    });

    // Check Student model
    const allStudents = await Student.find({}).limit(5);
    const agentStudents = await Student.find({
      "workflowStatus.assignedAgent": agentId,
    });

    res.json({
      success: true,
      data: {
        agentId,
        totalApplications: await StudentApplication.countDocuments({}),
        agentApplications: agentApplications.length,
        totalStudents: await Student.countDocuments({}),
        agentStudents: agentStudents.length,
        sampleApplications: allApplications.map((app) => ({
          id: app._id,
          assignedAgent: app.assignedAgent,
          referredBy: app.referralInfo?.referredBy,
          status: app.status,
          fullName: app.personalDetails?.fullName,
        })),
        sampleStudents: allStudents.map((student) => ({
          id: student._id,
          assignedAgent: student.workflowStatus?.assignedAgent,
          status: student.workflowStatus?.currentStage,
          fullName: student.personalDetails?.fullName,
        })),
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({
      success: false,
      message: "Debug failed",
      error: error.message,
    });
  }
});

// Get ALL student applications (for debugging)
router.get("/all-applications", async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const allApplications = await StudentApplication.find({})
      .populate("user", "fullName email phoneNumber")
      .populate("assignedAgent", "fullName email")
      .populate("referralInfo.referredBy", "fullName email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StudentApplication.countDocuments({});

    res.json({
      success: true,
      data: {
        applications: allApplications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total: total,
        },
      },
    });
  } catch (error) {
    console.error("Get all applications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get all applications",
      error: error.message,
    });
  }
});

// Get students assigned to agent (using StudentApplication model - temporary fix)
router.get("/my-students", async (req, res) => {
  try {
    const agentId = req.user._id;
    const {
      page = 1,
      limit = 1000, // Increased default limit to show all submissions
      search,
      status,
      currentClass,
      academicYear,
      session: sessionParam,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log("🔍 Agent ID:", agentId);
    console.log("🔍 Request query params:", req.query);

    // Import StudentApplication model (temporary fix)
    const StudentApplication = require('../models/StudentApplication');
    const { getSessionDateRange } = require('../utils/sessionHelper');

    // Build filter query - applications either referred by this agent, assigned to this agent, or submitted by this agent
    const filter = {
      $or: [
        { 'referralInfo.referredBy': new mongoose.Types.ObjectId(agentId) }, // Applications that used this agent's referral code
        { 'assignedAgent': new mongoose.Types.ObjectId(agentId) }, // Applications assigned to this agent
        { 'submittedBy': new mongoose.Types.ObjectId(agentId) }, // Applications submitted by this agent
      ]
    };

    // Add search filter
    if (search) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { 'personalDetails.fullName': { $regex: search, $options: 'i' } },
          { 'personalDetails.aadharNumber': { $regex: search, $options: 'i' } },
          { 'contactDetails.primaryPhone': { $regex: search, $options: 'i' } },
          { applicationId: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Add status filter
    if (status) filter.status = status;
    if (currentClass) filter.currentClass = currentClass;
    if (academicYear) filter.academicYear = academicYear;

    // Add session filter if provided (after other filters to avoid conflicts)
    if (sessionParam) {
      try {
        const { startDate, endDate } = getSessionDateRange(sessionParam);
        console.log(`📅 Agent route - Filtering by session ${sessionParam}: ${startDate.toISOString()} to ${endDate.toISOString()}`);
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
    }

    console.log("🔍 Filter query:", JSON.stringify(filter, null, 2));

    // Check total count before query
    const totalCount = await StudentApplication.countDocuments(filter);
    console.log("🔍 Total applications found for agent:", totalCount);

    // Build sort query
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination - increased limit to get all submissions
    const parsedLimit = parseInt(limit) || 1000;
    const parsedPage = parseInt(page) || 1;

    const applications = await StudentApplication.find(filter)
      .populate('user', 'fullName email phoneNumber')
      .populate('referralInfo.referredBy', 'fullName email phoneNumber referralCode')
      .populate('assignedAgent', 'fullName email phoneNumber referralCode')
      .sort(sort)
      .limit(parsedLimit)
      .skip((parsedPage - 1) * parsedLimit)
      .exec();

    console.log("🔍 Applications retrieved:", applications.length);
    console.log("🔍 First few application IDs:", applications.slice(0, 5).map(a => a.applicationId || a._id));

    // Get total count for pagination
    const total = await StudentApplication.countDocuments(filter);
    console.log("🔍 Total count after query:", total);

    // Transform data for frontend (convert StudentApplication to Student-like format)
    const transformedStudents = applications.map(app => ({
      _id: app._id,
      applicationId: app.applicationId,
      studentId: app.applicationId, // Use applicationId as studentId for now
      personalDetails: app.personalDetails,
      contactDetails: app.contactDetails,
      courseDetails: app.courseDetails,
      guardianDetails: app.guardianDetails,
      status: app.status,
      currentStage: app.currentStage,
      referralInfo: app.referralInfo,
      assignedAgent: app.assignedAgent,
      user: app.user,
      documents: app.documents || [], // Include documents for view functionality
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      submittedBy: app.submittedBy, // Include submittedBy for tracking
      submitterRole: app.submitterRole,
      // Add relationship type for agent reference
      relationshipType: app.referralInfo?.referredBy?.toString() === agentId.toString()
        ? 'referral'
        : 'assigned'
    }));

    console.log("✅ Total applications for agent:", total);
    console.log("✅ Transformed applications returned:", transformedStudents.length);
    console.log("✅ Application IDs:", transformedStudents.map(s => s.applicationId || s._id).join(', '));

    res.status(200).json({
      success: true,
      data: {
        students: transformedStudents,
        pagination: {
          current: parsedPage,
          pages: Math.ceil(total / parsedLimit),
          total
        }
      }
    });
  } catch (error) {
    console.error("Get agent students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get students",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    });
  }
});

// Get students assigned to agent (original endpoint - now uses StudentApplication model)
router.get("/students", async (req, res) => {
  try {
    const agentId = req.user._id;
    const {
      page = 1,
      limit = 10,
      search,
      status,
      currentClass,
      academicYear,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log("Agent ID:", agentId);

    // Import StudentApplication model (temporary fix)
    const StudentApplication = require('../models/StudentApplication');

    // Build filter query - applications either referred by this agent, assigned to this agent, or submitted by this agent
    const filter = {
      $or: [
        { 'referralInfo.referredBy': new mongoose.Types.ObjectId(agentId) }, // Applications that used this agent's referral code
        { 'assignedAgent': new mongoose.Types.ObjectId(agentId) }, // Applications assigned to this agent
        { 'submittedBy': new mongoose.Types.ObjectId(agentId) }, // Applications submitted by this agent
        { 'submittedBy._id': new mongoose.Types.ObjectId(agentId) } // Applications submitted by this agent (populated)
      ]
    };

    // Add search filter
    if (search) {
      filter.$and = [
        {
          $or: [
            { 'personalDetails.fullName': { $regex: search, $options: 'i' } },
            { 'personalDetails.aadharNumber': { $regex: search, $options: 'i' } },
            { 'contactDetails.primaryPhone': { $regex: search, $options: 'i' } },
            { applicationId: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    // Add status filter
    if (status) filter.status = status;
    if (currentClass) filter.currentClass = currentClass;
    if (academicYear) filter.academicYear = academicYear;

    // Build sort query
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const applications = await StudentApplication.find(filter)
      .populate('user', 'firstName lastName email phone')
      .populate('referralInfo.referredBy', 'firstName lastName referralCode')
      .populate('assignedAgent', 'firstName lastName referralCode')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const total = await StudentApplication.countDocuments(filter);

    // Transform data for frontend (convert StudentApplication to Student-like format)
    const transformedStudents = applications.map(app => ({
      _id: app._id,
      applicationId: app.applicationId,
      studentId: app.applicationId, // Use applicationId as studentId for now
      personalDetails: app.personalDetails,
      contactDetails: app.contactDetails,
      courseDetails: app.courseDetails,
      guardianDetails: app.guardianDetails,
      status: app.status,
      currentStage: app.currentStage,
      referralInfo: app.referralInfo,
      assignedAgent: app.assignedAgent,
      user: app.user,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      // Add relationship type for agent reference
      relationshipType: app.referralInfo?.referredBy?.toString() === agentId.toString()
        ? 'referral'
        : 'assigned'
    }));

    console.log("Total applications for agent:", total);
    console.log("Filtered applications:", transformedStudents.length);

    res.status(200).json({
      success: true,
      data: {
        students: transformedStudents,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error("Get agent students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get students",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    });
  }
});

// Get agent commission data
router.get("/commission", async (req, res) => {
  try {
    // Calculate commission based on completed students
    const completedStudents = await Student.countDocuments({
      "workflowStatus.assignedAgent": req.user._id,
      "workflowStatus.currentStage": "completed",
    });

    const totalCommission = completedStudents * 5000; // ₹5000 per completed student
    const advance = Math.floor(totalCommission * 0.3); // 30% advance
    const due = totalCommission - advance;

    // Mock recent payments
    const recentPayments = [
      {
        _id: "1",
        amount: 15000,
        description: "Commission Payment - March 2024",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        _id: "2",
        amount: 10000,
        description: "Commission Payment - February 2024",
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        totalCommission,
        advance,
        due,
        recentPayments,
      },
    });
  } catch (error) {
    console.error("Get agent commission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get commission data",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Get agent student statistics (alias for student-stats)
router.get("/student-stats", async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({
      "workflowStatus.assignedAgent": req.user._id,
    });

    const pendingStudents = await Student.countDocuments({
      "workflowStatus.assignedAgent": req.user._id,
      "workflowStatus.currentStage": {
        $in: ["pending_review", "under_review"],
      },
    });

    const completedStudents = await Student.countDocuments({
      "workflowStatus.assignedAgent": req.user._id,
      "workflowStatus.currentStage": "completed",
    });

    const thisMonthRegistrations = await Student.countDocuments({
      "workflowStatus.assignedAgent": req.user._id,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        pendingStudents,
        completedStudents,
        thisMonthRegistrations,
      },
    });
  } catch (error) {
    console.error("Get agent student stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get student statistics",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Get agent statistics (original endpoint)
router.get("/stats", async (req, res) => {
  try {
    console.log("Stats - Agent ID:", req.user._id);
    const { session: sessionParam } = req.query;

    // Prefer stats from StudentApplication (new workflow) - include both assigned and referred
    // Match the same query logic as /my-students endpoint
    const agentQuery = {
      $or: [
        { 'referralInfo.referredBy': new mongoose.Types.ObjectId(req.user._id) },
        { 'assignedAgent': new mongoose.Types.ObjectId(req.user._id) },
        { 'submittedBy': new mongoose.Types.ObjectId(req.user._id) },
        { 'submittedBy._id': new mongoose.Types.ObjectId(req.user._id) }
      ],
    };

    // Add session filter if provided
    if (sessionParam) {
      try {
        const { getSessionDateRange } = require('../utils/sessionHelper');
        const { startDate, endDate } = getSessionDateRange(sessionParam);
        console.log(`📅 Agent stats - Filtering by session ${sessionParam}: ${startDate.toISOString()} to ${endDate.toISOString()}`);
        agentQuery.createdAt = {
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
    }

    const totalStudents = await StudentApplication.countDocuments(agentQuery);
    const pendingStudents = await StudentApplication.countDocuments({
      ...agentQuery,
      status: "SUBMITTED",
    });
    const underReviewStudents = await StudentApplication.countDocuments({
      ...agentQuery,
      status: "UNDER_REVIEW",
    });
    const approvedStudents = await StudentApplication.countDocuments({
      ...agentQuery,
      status: "APPROVED",
    });
    const rejectedStudents = await StudentApplication.countDocuments({
      ...agentQuery,
      status: "REJECTED",
    });

    // Debug logging
    console.log("📊 Stats Debug - Agent ID:", req.user._id);
    console.log("📊 Total students query:", agentQuery);
    console.log("📊 Total students count:", totalStudents);
    console.log("📊 Pending (SUBMITTED) count:", pendingStudents);
    console.log("📊 Under Review count:", underReviewStudents);
    console.log("📊 Approved count:", approvedStudents);
    console.log("📊 Rejected count:", rejectedStudents);

    res.status(200).json({
      success: true,
      data: {
        total: totalStudents,
        pending: pendingStudents,
        underReview: underReviewStudents,
        approved: approvedStudents,
        rejected: rejectedStudents,
      },
    });
  } catch (error) {
    console.error("Get agent stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get statistics",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Bulk import students
router.post("/bulk-import", async (req, res) => {
  try {
    // This would handle file upload and CSV parsing
    // For now, return a mock response
    res.status(200).json({
      success: true,
      data: {
        imported: 5,
        failed: 0,
        message: "Students imported successfully",
      },
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to import students",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Submit application for a student (agent can submit multiple applications)
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
    } else {
      // If no referral code provided, set the submitting agent as the referrer
      referralInfo = {
        referredBy: req.user._id,
        referralCode: req.user.referralCode || null,
        referralType: req.user.role,
      };
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
      submittedBy: req.user._id, // Agent who is submitting
      submitterRole: req.user.role,
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

// Get specific application submitted by this agent
router.get("/submitted-applications/:id", async (req, res) => {
  try {
    const applicationId = req.params.id;
    const agentId = req.user._id;

    console.log('🔍 Fetching application details for:', applicationId);
    console.log('👤 Agent ID:', agentId);

    // Build query - always search by applicationId first, never cast _id
    let application;

    // Try to find by applicationId (string)
    application = await StudentApplication.findOne({
      submittedBy: agentId,
      applicationId: applicationId
    })
      .populate("user", "fullName email phoneNumber")
      .populate("submittedBy", "fullName email")
      .populate("referralInfo.referredBy", "fullName email")
      .populate("assignedAgent", "fullName email");

    // If not found and the ID looks like an ObjectId, try that
    if (!application && mongoose.Types.ObjectId.isValid(applicationId)) {
      console.log('📝 Trying with _id as ObjectId');
      application = await StudentApplication.findOne({
        submittedBy: agentId,
        _id: new mongoose.Types.ObjectId(applicationId)
      })
        .populate("user", "fullName email phoneNumber")
        .populate("submittedBy", "fullName email")
        .populate("referralInfo.referredBy", "fullName email")
        .populate("assignedAgent", "fullName email");
    }

    console.log('📝 Found application:', application ? 'Yes' : 'No');

    if (!application) {
      console.warn('❌ Application not found');
      return res.status(404).json({
        success: false,
        message: 'Application not found or you do not have access'
      });
    }

    console.log('✅ Application found:', application._id);

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error("❌ Get application details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get application details",
      error: process.env.NODE_ENV === "development" ? error.message : 'Internal server error'
    });
  }
});

// Get applications submitted by this agent
router.get("/my-submitted-applications", async (req, res) => {
  try {
    const { page = 1, limit = 20, status, session: sessionParam } = req.query;
    const agentId = req.user._id;

    let query = { submittedBy: agentId };
    if (status && status !== "all") {
      query.status = status.toUpperCase();
    }

    // Add session filter if provided
    if (sessionParam) {
      try {
        const { getSessionDateRange } = require('../utils/sessionHelper');
        const { startDate, endDate } = getSessionDateRange(sessionParam);
        console.log(`📅 Agent applications - Filtering by session ${sessionParam}: ${startDate.toISOString()} to ${endDate.toISOString()}`);
        query.createdAt = {
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
    }

    const applications = await StudentApplication.find(query)
      .populate("user", "fullName email phoneNumber")
      .populate("submittedBy", "fullName email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Add document review status information for each application
    const applicationsWithReviewStatus = applications.map(app => {
      const documents = app.documents || [];
      const totalDocs = documents.length;
      const reviewedDocs = documents.filter(doc => doc.status && doc.status !== 'PENDING' && doc.status !== 'NOT_VERIFIED').length;
      const approvedDocs = documents.filter(doc => doc.status === 'APPROVED').length;
      const rejectedDocs = documents.filter(doc => doc.status === 'REJECTED').length;
      const pendingDocs = documents.filter(doc => doc.status === 'PENDING').length;

      let reviewStatus = 'not_reviewed';
      if (totalDocs === 0) {
        reviewStatus = 'no_documents';
      } else if (reviewedDocs === totalDocs) {
        if (rejectedDocs === 0) {
          reviewStatus = 'all_approved';
        } else if (approvedDocs === 0) {
          reviewStatus = 'all_rejected';
        } else {
          reviewStatus = 'mixed_results';
        }
      } else if (reviewedDocs > 0) {
        reviewStatus = 'partially_reviewed';
      }

      return {
        ...app.toObject(),
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

    const total = await StudentApplication.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        applications: applicationsWithReviewStatus,
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

// Get agent referral information
router.get("/referral-info", async (req, res) => {
  try {
    const agent = await User.findById(req.user._id).select('referralCode referralStats isReferralActive fullName');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found"
      });
    }

    // Get referral statistics from applications
    const referralStats = await StudentApplication.aggregate([
      { $match: { 'referralInfo.referredBy': req.user._id } },
      {
        $group: {
          _id: null,
          totalReferrals: { $sum: 1 },
          successfulReferrals: { $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] } },
          pendingReferrals: { $sum: { $cond: [{ $eq: ['$status', 'SUBMITTED'] }, 1, 0] } },
          rejectedReferrals: { $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] } }
        }
      }
    ]);

    const stats = referralStats[0] || {
      totalReferrals: 0,
      successfulReferrals: 0,
      pendingReferrals: 0,
      rejectedReferrals: 0
    };

    res.status(200).json({
      success: true,
      data: {
        agent: {
          fullName: agent.fullName,
          referralCode: agent.referralCode,
          isReferralActive: agent.isReferralActive
        },
        stats: {
          totalReferrals: stats.totalReferrals,
          successfulReferrals: stats.successfulReferrals,
          pendingReferrals: stats.pendingReferrals,
          rejectedReferrals: stats.rejectedReferrals
        },
        referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?ref=${agent.referralCode}`
      }
    });
  } catch (error) {
    console.error("Get referral info error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get referral information",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    });
  }
});

// Get rejection details for agent's students
router.get('/students/:id/rejection-details', async (req, res) => {
  try {
    const applicationId = req.params.id;
    const agentId = req.user._id;

    console.log('🔍 Fetching rejection details for application:', applicationId);
    console.log('👤 Agent ID:', agentId);

    // Validate applicationId format
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      console.warn('❌ Invalid application ID format:', applicationId);
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format'
      });
    }

    // Check if this application belongs to the agent
    const application = await StudentApplication.findOne({
      _id: applicationId,
      $or: [
        { 'referralInfo.referredBy': agentId },
        { 'assignedAgent': agentId },
        { 'submittedBy': agentId }
      ]
    });

    if (!application) {
      console.warn('❌ Application not found or agent does not have access');
      return res.status(404).json({
        success: false,
        message: 'Application not found or you do not have access to this application'
      });
    }

    console.log('✅ Application found - Status:', application.status);

    // Check if application is rejected
    if (application.status !== 'REJECTED') {
      console.warn('⚠️ Application is not rejected - Current status:', application.status);
      return res.status(400).json({
        success: false,
        message: 'Application is not rejected'
      });
    }

    console.log('✅ Rejection details found, sending response');

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
    console.error('❌ Get rejection details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rejection details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Resubmit rejected application for agent's students
router.post('/students/:id/resubmit', async (req, res) => {
  try {
    const applicationId = req.params.id;
    const agentId = req.user._id;

    console.log('📤 Resubmitting application:', applicationId);
    console.log('👤 Agent ID:', agentId);

    // Check if this application belongs to the agent
    const application = await StudentApplication.findOne({
      _id: applicationId,
      $or: [
        { 'referralInfo.referredBy': agentId },
        { 'assignedAgent': agentId },
        { 'submittedBy': agentId }
      ]
    });

    if (!application) {
      console.warn('❌ Application not found or agent does not have access');
      return res.status(404).json({
        success: false,
        message: 'Application not found or you do not have access to this application'
      });
    }

    console.log('✅ Application found - Status:', application.status);

    // Check if application is rejected
    if (application.status !== 'REJECTED') {
      console.warn('⚠️ Application is not rejected - Current status:', application.status);
      return res.status(400).json({
        success: false,
        message: `This application cannot be resubmitted. Current status: ${application.status}`
      });
    }

    console.log('✅ Application is rejected, proceeding with resubmission');

    // Reset status to SUBMITTED for review
    application.status = 'SUBMITTED';
    application.currentStage = 'SUBMITTED';
    application.submittedAt = new Date();

    // Clear review info fields to allow fresh review
    application.reviewInfo.reviewedBy = undefined;
    application.reviewInfo.reviewedAt = undefined;
    application.reviewInfo.remarks = '';
    application.reviewInfo.rejectionReason = '';
    application.reviewInfo.rejectionMessage = '';
    application.reviewInfo.rejectionDetails = [];

    // Add resubmission note
    if (!application.adminNotes) {
      application.adminNotes = [];
    }
    application.adminNotes.push({
      note: 'Application resubmitted by agent after addressing rejection feedback',
      addedBy: agentId,
      addedAt: new Date(),
      type: 'RESUBMISSION'
    });

    // Add to workflow history
    if (!application.workflowHistory) {
      application.workflowHistory = [];
    }
    application.workflowHistory.push({
      stage: 'SUBMITTED',
      status: 'SUBMITTED',
      updatedBy: agentId,
      action: 'RESUBMIT',
      remarks: 'Application resubmitted after addressing rejection feedback',
      timestamp: new Date()
    });

    await application.save();
    console.log('✅ Application resubmitted successfully');

    res.json({
      success: true,
      message: 'Application resubmitted successfully! It will be reviewed by admin again.',
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

// Update student application for agent's students
router.put('/students/:id', async (req, res) => {
  try {
    const applicationId = req.params.id;
    const agentId = req.user._id;

    // Check if this application belongs to the agent
    const application = await StudentApplication.findOne({
      _id: applicationId,
      $or: [
        { 'referralInfo.referredBy': agentId },
        { 'assignedAgent': agentId },
        { 'submittedBy': agentId }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or you do not have access to this application'
      });
    }

    // Check if application can be edited (not approved)
    // Allow editing REJECTED applications so agents can fix issues and resubmit
    if (application.status === 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit approved applications'
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

    // Add edit note
    if (!application.adminNotes) {
      application.adminNotes = [];
    }
    application.adminNotes.push({
      note: 'Application edited by agent',
      addedBy: agentId,
      addedAt: new Date(),
      type: 'EDIT'
    });

    await application.save();

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: application
    });

  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
