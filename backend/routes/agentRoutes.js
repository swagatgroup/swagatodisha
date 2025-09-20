const express = require("express");
const router = express.Router();
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

// Get students assigned to agent (alias for my-students)
router.get("/my-students", async (req, res) => {
  try {
    const agentId = req.user._id;

    console.log("Agent ID:", agentId);

    // Get all applications and filter by agent referral
    const allApplications = await StudentApplication.find({})
      .populate("user", "fullName email phoneNumber")
      .sort({ createdAt: -1 });

    // Filter applications that have this agent in referral info
    const filteredApplications = allApplications.filter((app) => {
      // Check if agent is in referralInfo.referredBy
      const referredBy = app.referralInfo?.referredBy;
      const assignedAgent = app.assignedAgent;

      return (
        (referredBy && referredBy.toString() === agentId.toString()) ||
        (assignedAgent && assignedAgent.toString() === agentId.toString())
      );
    });

    console.log("Total all applications:", allApplications.length);
    console.log(
      "Filtered applications for agent:",
      filteredApplications.length
    );

    res.status(200).json({
      success: true,
      data: {
        students: filteredApplications,
        total: filteredApplications.length,
      },
    });
  } catch (error) {
    console.error("Get agent students error:", error);
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

// Get students assigned to agent (original endpoint)
router.get("/students", async (req, res) => {
  try {
    const agentId = req.user._id;

    console.log("Agent ID:", agentId);

    // Get all applications and filter by agent referral
    const allApplications = await StudentApplication.find({})
      .populate("user", "fullName email phoneNumber")
      .sort({ createdAt: -1 });

    // Filter applications that have this agent in referral info
    const filteredApplications = allApplications.filter((app) => {
      // Check if agent is in referralInfo.referredBy
      const referredBy = app.referralInfo?.referredBy;
      const assignedAgent = app.assignedAgent;

      return (
        (referredBy && referredBy.toString() === agentId.toString()) ||
        (assignedAgent && assignedAgent.toString() === agentId.toString())
      );
    });

    console.log("Total all applications:", allApplications.length);
    console.log(
      "Filtered applications for agent:",
      filteredApplications.length
    );

    res.status(200).json({
      success: true,
      data: {
        students: filteredApplications,
        total: filteredApplications.length,
      },
    });
  } catch (error) {
    console.error("Get agent students error:", error);
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

    // Prefer stats from StudentApplication (new workflow) - include both assigned and referred
    const agentQuery = {
      $or: [
        { assignedAgent: req.user._id },
        { "referralInfo.referredBy": req.user._id },
      ],
    };

    const totalStudents = await StudentApplication.countDocuments(agentQuery);
    const pendingStudents = await StudentApplication.countDocuments({
      ...agentQuery,
      status: { $in: ["SUBMITTED", "UNDER_REVIEW"] },
    });
    const completedStudents = await StudentApplication.countDocuments({
      ...agentQuery,
      status: "APPROVED",
    });
    const thisMonthRegistrations = await StudentApplication.countDocuments({
      ...agentQuery,
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

module.exports = router;
