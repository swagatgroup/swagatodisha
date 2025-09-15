const Student = require('../models/Student');
const User = require('../models/User');
// const { sendNotification } = require('../utils/notificationService');

// Register a new student with enhanced classification
const registerStudent = async (req, res) => {
    try {
        const {
            personalDetails,
            contactDetails,
            courseDetails,
            guardianDetails,
            registrationSource = 'direct'
        } = req.body;

        // Determine registration category based on source
        let registrationCategory = 'A'; // Direct registration
        if (registrationSource === 'agent_dashboard') {
            registrationCategory = 'B1'; // Agent-assisted registration
        } else if (registrationSource === 'referral') {
            registrationCategory = 'B2'; // Referral-based registration
        }

        // Create user account
        const user = new User({
            fullName: personalDetails.fullName,
            email: contactDetails.email,
            phoneNumber: contactDetails.primaryPhone,
            role: 'student',
            password: 'temp123', // Will be changed on first login
            guardianName: guardianDetails.guardianName,
            guardianPhone: guardianDetails.guardianPhone,
            isActive: true
        });

        await user.save();

        // Create student record
        const student = new Student({
            user: user._id,
            studentId: `STU${Date.now()}`,
            personalDetails,
            contactDetails,
            courseDetails,
            guardianDetails,
            registrationCategory,
            workflowStatus: {
                currentStage: 'registration_complete',
                stageHistory: [{
                    stage: 'registration_complete',
                    timestamp: new Date(),
                    updatedBy: req.user._id,
                    notes: 'Student registration completed'
                }],
                assignedAgent: req.user.role === 'agent' ? req.user._id : null,
                assignedStaff: null,
                priority: 'normal'
            },
            profileCompletionStatus: {
                completionPercentage: 0,
                lastUpdated: new Date(),
                requiredFields: [
                    'personalDetails.fullName',
                    'personalDetails.fathersName',
                    'personalDetails.mothersName',
                    'personalDetails.dateOfBirth',
                    'personalDetails.gender',
                    'personalDetails.aadharNumber',
                    'contactDetails.primaryPhone',
                    'contactDetails.email',
                    'contactDetails.permanentAddress.street',
                    'contactDetails.permanentAddress.city',
                    'contactDetails.permanentAddress.state',
                    'contactDetails.permanentAddress.pincode',
                    'courseDetails.selectedCourse',
                    'guardianDetails.guardianName',
                    'guardianDetails.relationship',
                    'guardianDetails.guardianPhone'
                ],
                missingFields: []
            }
        });

        // Calculate initial profile completion
        await student.calculateProfileCompletion();

        await student.save();

        // Send notification
        // await sendNotification({
        //     type: 'student_registered',
        //     recipient: user._id,
        //     title: 'Registration Successful',
        //     message: 'Your student registration has been completed successfully.',
        //     data: { studentId: student.studentId }
        // });

        res.status(201).json({
            success: true,
            message: 'Student registered successfully',
            data: {
                student: await Student.findById(student._id).populate('user', 'fullName email phoneNumber'),
                user
            }
        });

    } catch (error) {
        console.error('Register student error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register student',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update workflow stage
const updateWorkflowStage = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { stage, notes, assignedTo } = req.body;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        await student.updateWorkflowStage(stage, req.user._id, notes);

        // Update assignments if provided
        if (assignedTo) {
            if (assignedTo.agent) {
                await student.assignToAgent(assignedTo.agent);
            }
            if (assignedTo.staff) {
                await student.assignToStaff(assignedTo.staff);
            }
        }

        // Send notification
        // await sendNotification({
        //     type: 'workflow_update',
        //     recipient: student.user,
        //     title: 'Application Status Updated',
        //     message: `Your application status has been updated to: ${stage}`,
        //     data: { stage, studentId: student.studentId }
        // });

        res.status(200).json({
            success: true,
            message: 'Workflow stage updated successfully',
            data: { student: await Student.findById(studentId).populate('user', 'fullName email phoneNumber') }
        });

    } catch (error) {
        console.error('Update workflow stage error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update workflow stage',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get students by workflow stage
const getStudentsByStage = async (req, res) => {
    try {
        const { stage } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const students = await Student.getByWorkflowStage(stage)
            .populate('user', 'fullName email phoneNumber')
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Student.countDocuments({ 'workflowStatus.currentStage': stage });

        res.status(200).json({
            success: true,
            data: {
                students,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get students by stage error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get students by stage',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get dashboard analytics
const getDashboardAnalytics = async (req, res) => {
    try {
        const userRole = req.user.role;
        let analytics = {};

        if (userRole === 'agent') {
            // Agent-specific analytics
            const totalStudents = await Student.countDocuments({ 'workflowStatus.assignedAgent': req.user._id });
            const pendingStudents = await Student.countDocuments({
                'workflowStatus.assignedAgent': req.user._id,
                'workflowStatus.currentStage': { $in: ['pending_review', 'under_review'] }
            });
            const completedStudents = await Student.countDocuments({
                'workflowStatus.assignedAgent': req.user._id,
                'workflowStatus.currentStage': 'completed'
            });

            analytics = {
                totalStudents,
                pendingStudents,
                completedStudents,
                thisMonthRegistrations: await Student.countDocuments({
                    'workflowStatus.assignedAgent': req.user._id,
                    createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
                })
            };

        } else if (userRole === 'staff') {
            // Staff-specific analytics
            const totalStudents = await Student.countDocuments();
            const pendingVerification = await Student.countDocuments({
                'workflowStatus.currentStage': 'pending_verification'
            });
            const approvedToday = await Student.countDocuments({
                'workflowStatus.currentStage': 'approved',
                'workflowStatus.stageHistory.0.timestamp': {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            });
            const rejectedToday = await Student.countDocuments({
                'workflowStatus.currentStage': 'rejected',
                'workflowStatus.stageHistory.0.timestamp': {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            });

            analytics = {
                totalStudents,
                pendingVerification,
                approvedToday,
                rejectedToday,
                averageProcessingTime: 24 // This would be calculated from actual data
            };

        } else {
            // Super admin analytics
            const totalStudents = await Student.countDocuments();
            const byStage = await Student.aggregate([
                {
                    $group: {
                        _id: '$workflowStatus.currentStage',
                        count: { $sum: 1 }
                    }
                }
            ]);

            analytics = {
                totalStudents,
                byStage: byStage.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            };
        }

        res.status(200).json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('Get dashboard analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    registerStudent,
    updateWorkflowStage,
    getStudentsByStage,
    getDashboardAnalytics
};