const Student = require('../models/Student');
const Document = require('../models/Document');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get application stages for a student
const getApplicationStages = async (req, res) => {
    try {
        const { studentId } = req.params;
        const userId = req.user._id;

        // Check if user can access this student's data
        if (req.user.role !== 'super_admin' && req.user.role !== 'staff' && req.user._id.toString() !== studentId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const student = await Student.findOne({ user: studentId }).populate('user', 'fullName email');
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Define application stages
        const stages = {
            STAGE_1: {
                name: 'Complete Student Profile',
                description: 'Fill in all required personal and academic information',
                requiredActions: ['complete_profile'],
                status: student.profileCompletionStatus.isProfileComplete ? 'completed' : 'current',
                completedAt: student.profileCompletionStatus.isProfileComplete ? student.updatedAt : null
            },
            STAGE_2: {
                name: 'Upload Required Documents',
                description: 'Upload all necessary certificates and documents',
                requiredActions: ['upload_documents'],
                status: student.applicationStage.currentStage === 'DOCUMENT_UPLOAD' ? 'current' :
                    student.applicationStage.currentStage === 'VERIFICATION_PENDING' ? 'completed' : 'locked',
                completedAt: student.applicationStage.currentStage === 'VERIFICATION_PENDING' ? student.updatedAt : null
            },
            STAGE_3: {
                name: 'Document Verification',
                description: 'Staff will review and verify your documents',
                requiredActions: ['staff_verification'],
                status: student.applicationStage.currentStage === 'VERIFICATION_PENDING' ? 'current' :
                    student.applicationStage.currentStage === 'APPROVED' ? 'completed' : 'locked',
                completedAt: student.applicationStage.currentStage === 'APPROVED' ? student.updatedAt : null
            },
            STAGE_4: {
                name: 'Final Approval',
                description: 'Application approved and enrollment confirmed',
                requiredActions: ['final_approval'],
                status: student.applicationStage.currentStage === 'APPROVED' ? 'completed' : 'locked',
                completedAt: student.applicationStage.currentStage === 'APPROVED' ? student.updatedAt : null
            }
        };

        // Get document statistics
        const documentStats = await Document.aggregate([
            { $match: { uploadedBy: studentId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const docStats = {
            PENDING: 0,
            UNDER_REVIEW: 0,
            APPROVED: 0,
            REJECTED: 0
        };

        documentStats.forEach(stat => {
            docStats[stat._id] = stat.count;
        });

        res.status(200).json({
            success: true,
            data: {
                student: {
                    id: student._id,
                    name: student.user.fullName,
                    email: student.user.email,
                    currentStage: student.applicationStage.currentStage,
                    profileCompletion: student.profileCompletionStatus.completionPercentage
                },
                stages,
                documentStats: docStats,
                stageHistory: student.applicationStage.stageHistory
            }
        });
    } catch (error) {
        console.error('Get application stages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get application stages',
            error: error.message
        });
    }
};

// Advance application stage
const advanceApplicationStage = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { newStage, remarks } = req.body;
        const userId = req.user._id;

        // Check permissions
        if (req.user.role !== 'super_admin' && req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Only staff can advance application stages'
            });
        }

        const student = await Student.findOne({ user: studentId });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Update stage
        const oldStage = student.applicationStage.currentStage;
        student.applicationStage.currentStage = newStage;
        student.applicationStage.stageHistory.push({
            stage: newStage,
            timestamp: new Date(),
            remarks: remarks || `Stage advanced from ${oldStage} to ${newStage}`
        });

        await student.save();

        // Create notification for student
        await Notification.createNotification({
            recipient: studentId,
            sender: userId,
            type: 'application_update',
            title: 'Application Stage Updated',
            message: `Your application has been moved to ${newStage} stage.`,
            priority: 'high'
        });

        res.status(200).json({
            success: true,
            message: 'Application stage advanced successfully',
            data: {
                oldStage,
                newStage,
                updatedAt: student.updatedAt
            }
        });
    } catch (error) {
        console.error('Advance application stage error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to advance application stage',
            error: error.message
        });
    }
};

// Revert application stage
const revertApplicationStage = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { newStage, remarks } = req.body;
        const userId = req.user._id;

        // Check permissions
        if (req.user.role !== 'super_admin' && req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Only staff can revert application stages'
            });
        }

        const student = await Student.findOne({ user: studentId });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Update stage
        const oldStage = student.applicationStage.currentStage;
        student.applicationStage.currentStage = newStage;
        student.applicationStage.stageHistory.push({
            stage: newStage,
            timestamp: new Date(),
            remarks: remarks || `Stage reverted from ${oldStage} to ${newStage}`
        });

        await student.save();

        // Create notification for student
        await Notification.createNotification({
            recipient: studentId,
            sender: userId,
            type: 'application_update',
            title: 'Application Stage Reverted',
            message: `Your application has been reverted to ${newStage} stage.`,
            priority: 'high'
        });

        res.status(200).json({
            success: true,
            message: 'Application stage reverted successfully',
            data: {
                oldStage,
                newStage,
                updatedAt: student.updatedAt
            }
        });
    } catch (error) {
        console.error('Revert application stage error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to revert application stage',
            error: error.message
        });
    }
};

// Get pending applications for staff
const getPendingApplications = async (req, res) => {
    try {
        const { staffId } = req.params;
        const userId = req.user._id;

        // Check permissions
        if (req.user.role !== 'super_admin' && req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Only staff can view pending applications'
            });
        }

        // Get students in different stages
        const pendingStudents = await Student.find({
            'applicationStage.currentStage': { $in: ['DOCUMENT_UPLOAD', 'VERIFICATION_PENDING'] }
        }).populate('user', 'fullName email phoneNumber').sort({ updatedAt: -1 });

        // Get document counts for each student
        const studentsWithDocCounts = await Promise.all(
            pendingStudents.map(async (student) => {
                const docCounts = await Document.aggregate([
                    { $match: { uploadedBy: student.user._id } },
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 }
                        }
                    }
                ]);

                const docStats = {
                    PENDING: 0,
                    UNDER_REVIEW: 0,
                    APPROVED: 0,
                    REJECTED: 0
                };

                docCounts.forEach(stat => {
                    docStats[stat._id] = stat.count;
                });

                return {
                    ...student.toObject(),
                    documentStats: docStats
                };
            })
        );

        res.status(200).json({
            success: true,
            data: {
                pendingApplications: studentsWithDocCounts,
                totalCount: studentsWithDocCounts.length
            }
        });
    } catch (error) {
        console.error('Get pending applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get pending applications',
            error: error.message
        });
    }
};

// Update profile completion status
const updateProfileCompletion = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { completedSteps, currentStep, completionPercentage } = req.body;
        const userId = req.user._id;

        // Check if user can update their own profile
        if (req.user._id.toString() !== studentId && req.user.role !== 'super_admin' && req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const student = await Student.findOne({ user: studentId });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Update profile completion status
        student.profileCompletionStatus.completedSteps = completedSteps;
        student.profileCompletionStatus.currentStep = currentStep;
        student.profileCompletionStatus.completionPercentage = completionPercentage;
        student.profileCompletionStatus.isProfileComplete = completionPercentage === 100;

        // If profile is complete, advance to document upload stage
        if (completionPercentage === 100) {
            student.applicationStage.currentStage = 'DOCUMENT_UPLOAD';
            student.applicationStage.stageHistory.push({
                stage: 'DOCUMENT_UPLOAD',
                timestamp: new Date(),
                remarks: 'Profile completed, moved to document upload stage'
            });
        }

        await student.save();

        res.status(200).json({
            success: true,
            message: 'Profile completion status updated successfully',
            data: {
                isProfileComplete: student.profileCompletionStatus.isProfileComplete,
                completionPercentage: student.profileCompletionStatus.completionPercentage,
                currentStage: student.applicationStage.currentStage
            }
        });
    } catch (error) {
        console.error('Update profile completion error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile completion status',
            error: error.message
        });
    }
};

module.exports = {
    getApplicationStages,
    advanceApplicationStage,
    revertApplicationStage,
    getPendingApplications,
    updateProfileCompletion
};
