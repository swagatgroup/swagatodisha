const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Student = require("../models/Student");
const StudentApplication = require("../models/StudentApplication");
const User = require("../models/User");
const Payment = require("../models/Payment");
const Document = require("../models/Document");

// All routes are protected
router.use(protect);

// Get students for staff processing
router.get("/students", async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    let query = {};

    if (status && status !== "all") {
      query["workflowStatus.currentStage"] = status;
    }

    if (search) {
      query.$or = [
        { "personalDetails.fullName": { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
        { "personalDetails.aadharNumber": { $regex: search, $options: "i" } },
      ];
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
    const totalStudents = await Student.countDocuments();

    const pendingVerification = await Student.countDocuments({
      "workflowStatus.currentStage": "pending_verification",
    });

    const approvedToday = await Student.countDocuments({
      "workflowStatus.currentStage": "approved",
      "workflowStatus.stageHistory.0.timestamp": {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });

    const rejectedToday = await Student.countDocuments({
      "workflowStatus.currentStage": "rejected",
      "workflowStatus.stageHistory.0.timestamp": {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        pendingVerification,
        approvedToday,
        rejectedToday,
        averageProcessingTime: 24, // This would be calculated from actual data
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

module.exports = router;
