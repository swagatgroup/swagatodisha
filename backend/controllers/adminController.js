const User = require('../models/User');
const Student = require('../models/Student');
const StudentApplication = require('../models/StudentApplication');
const Admin = require('../models/Admin');
const WebsiteSettings = require('../models/WebsiteSettings');
const bcrypt = require('bcryptjs');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { mockStaff, mockAgents } = require('./mockData');
const { getSessionDateRange, getCurrentSession } = require('../utils/sessionHelper');

// Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
    try {
        // Get session from query parameter, default to current session
        const sessionParam = req.query.session || getCurrentSession();

        // Get date range for the session
        let sessionDateRange;
        try {
            sessionDateRange = getSessionDateRange(sessionParam);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: `Invalid session format: ${error.message}`,
                error: process.env.NODE_ENV === "development" ? error.message : "Invalid session"
            });
        }

        const { startDate, endDate } = sessionDateRange;

        // Base query for session-based filtering
        const sessionQuery = {
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        };

        // Calculating dashboard stats

        const [
            totalStudents,
            totalAgents,
            totalStaff,
            pendingApplications,
            approvedApplications,
            draftApplications,
            submittedApplications,
            underReviewApplications,
            rejectedApplications,
            completeApplications,
            recentStudents
        ] = await Promise.all([
            // Total Students in this session
            StudentApplication.countDocuments(sessionQuery),

            // Total Agents (not session-dependent)
            User.countDocuments({ role: 'agent', isActive: true }),

            // Total Staff (not session-dependent)
            Admin.countDocuments({ role: 'staff', isActive: true }),

            // Pending Applications in this session
            StudentApplication.countDocuments({
                ...sessionQuery,
                status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] }
            }),

            // Approved Applications in this session
            StudentApplication.countDocuments({
                ...sessionQuery,
                status: 'APPROVED'
            }),

            // Draft Applications in this session
            StudentApplication.countDocuments({
                ...sessionQuery,
                status: 'DRAFT'
            }),

            // Submitted Applications in this session
            StudentApplication.countDocuments({
                ...sessionQuery,
                status: 'SUBMITTED'
            }),

            // Under Review Applications in this session
            StudentApplication.countDocuments({
                ...sessionQuery,
                status: 'UNDER_REVIEW'
            }),

            // Rejected Applications in this session
            StudentApplication.countDocuments({
                ...sessionQuery,
                status: 'REJECTED'
            }),

            // Complete Applications (Graduated Students) in this session
            StudentApplication.countDocuments({
                ...sessionQuery,
                status: 'COMPLETE'
            }),

            // Recent Students in this session
            StudentApplication.find(sessionQuery)
                .populate('user', 'fullName email phoneNumber')
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        res.json({
            success: true,
            data: {
                totalStudents,
                totalAgents,
                totalStaff,
                totalApplications: totalStudents,
                pendingApplications,
                approvedApplications,
                draftApplications,
                submittedApplications,
                underReviewApplications,
                rejectedApplications,
                completeApplications,
                session: sessionParam,
                sessionStartDate: startDate,
                sessionEndDate: endDate
            }
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Student Management
exports.getAllStudents = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            currentClass,
            academicYear,
            hasAgent,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter query
        const filter = {};

        if (search) {
            filter.$or = [
                { 'user.firstName': { $regex: search, $options: 'i' } },
                { 'user.lastName': { $regex: search, $options: 'i' } },
                { studentId: { $regex: search, $options: 'i' } },
                { aadharNumber: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) filter.status = status;
        if (currentClass) filter.currentClass = currentClass;
        if (academicYear) filter.academicYear = academicYear;
        if (hasAgent === 'true') filter['agentReferral.agent'] = { $exists: true, $ne: null };
        if (hasAgent === 'false') filter['agentReferral.agent'] = { $exists: false };

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const students = await Student.find(filter)
            .populate('user', 'firstName lastName email phone profilePicture')
            .populate('agentReferral.agent', 'firstName lastName referralCode')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Student.countDocuments(filter);

        res.json({
            success: true,
            data: {
                students,
                pagination: {
                    current: parseInt(page),
                    total: Math.ceil(total / limit),
                    totalItems: total,
                    hasNext: skip + students.length < total,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Error getting students:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching students',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const updateData = req.body;

        // Remove sensitive fields that only super admin can modify
        if (req.user.role !== 'super_admin') {
            delete updateData.aadharNumber;
        }

        const student = await Student.findByIdAndUpdate(
            studentId,
            updateData,
            { new: true, runValidators: true }
        ).populate('user', 'firstName lastName email phone')
            .populate('agentReferral.agent', 'firstName lastName referralCode');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            message: 'Student updated successfully',
            data: student
        });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating student',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Only super admin can delete
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can delete student records'
            });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Delete associated user account
        await User.findByIdAndDelete(student.user);

        // Delete student record
        await Student.findByIdAndDelete(studentId);

        res.json({
            success: true,
            message: 'Student record deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting student',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Agent Management
exports.getAllAgents = async (req, res) => {
    try {
        console.log('getAllAgents called with query:', req.query);

        const {
            page = 1,
            limit = 10,
            search,
            isActive,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Try to use database first
        try {
            // Build filter query
            const filter = { role: 'agent' };

            if (search) {
                filter.$or = [
                    { fullName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { referralCode: { $regex: search, $options: 'i' } }
                ];
            }

            if (isActive !== undefined) filter.isActive = isActive === 'true';

            console.log('Filter query:', filter);

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            console.log('About to query User collection for agents...');
            const agents = await User.find(filter)
                .select('-password')
                .populate('assignedStaff', 'firstName lastName email department designation employeeId')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit));

            console.log('Found agents:', agents.length);

            const total = await User.countDocuments(filter);
            console.log('Total agents count:', total);

            res.json({
                success: true,
                data: {
                    agents,
                    pagination: {
                        current: parseInt(page),
                        total: Math.ceil(total / limit),
                        totalItems: total,
                        hasNext: skip + agents.length < total,
                        hasPrev: page > 1
                    }
                }
            });
        } catch (dbError) {
            console.log('Database error, using mock data:', dbError.message);

            // Use mock data as fallback
            let filteredAgents = [...mockAgents];

            // Apply search filter
            if (search) {
                const searchLower = search.toLowerCase();
                filteredAgents = filteredAgents.filter(agent =>
                    agent.fullName.toLowerCase().includes(searchLower) ||
                    agent.email.toLowerCase().includes(searchLower) ||
                    agent.referralCode.toLowerCase().includes(searchLower)
                );
            }

            // Apply active filter
            if (isActive !== undefined) {
                filteredAgents = filteredAgents.filter(agent => agent.isActive === (isActive === 'true'));
            }

            // Apply pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const paginatedAgents = filteredAgents.slice(skip, skip + parseInt(limit));

            res.json({
                success: true,
                data: {
                    agents: paginatedAgents,
                    pagination: {
                        current: parseInt(page),
                        total: Math.ceil(filteredAgents.length / limit),
                        totalItems: filteredAgents.length,
                        hasNext: skip + paginatedAgents.length < filteredAgents.length,
                        hasPrev: page > 1
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error getting agents:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching agents',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

exports.createAgent = async (req, res) => {
    try {
        console.log('Creating agent with data:', req.body);

        const {
            fullName,
            email,
            password,
            phoneNumber,
            assignedStaff,
            address,
            dateOfBirth,
            gender
        } = req.body;

        // Check if agent already exists
        const existingAgent = await User.findOne({ email });
        if (existingAgent) {
            return res.status(400).json({
                success: false,
                message: 'Agent with this email already exists'
            });
        }

        // Validate assigned staff if provided
        if (assignedStaff) {
            const staff = await Admin.findById(assignedStaff);
            if (!staff || staff.role !== 'staff') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid staff assignment'
                });
            }
        }

        console.log('Creating new User instance...');
        const agent = new User({
            fullName,
            email,
            password,
            phoneNumber,
            role: 'agent',
            assignedStaff,
            address,
            dateOfBirth,
            gender,
            isReferralActive: true,
            createdBy: req.user._id
        });

        console.log('Generating referral code...');
        // Generate referral code
        agent.referralCode = agent.generateReferralCode();
        console.log('Generated referral code:', agent.referralCode);

        console.log('Saving agent to database...');
        await agent.save();
        console.log('Agent saved successfully');

        // Populate the assigned staff information
        await agent.populate('assignedStaff', 'firstName lastName email department designation employeeId');

        res.status(201).json({
            success: true,
            message: 'Agent created successfully',
            data: {
                id: agent._id,
                fullName: agent.fullName,
                email: agent.email,
                phoneNumber: agent.phoneNumber,
                referralCode: agent.referralCode,
                assignedStaff: agent.assignedStaff,
                role: agent.role
            }
        });
    } catch (error) {
        console.error('Error creating agent:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            errors: error.errors
        });
        res.status(500).json({
            success: false,
            message: 'Server error while creating agent',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.errors : undefined
        });
    }
};

exports.updateAgent = async (req, res) => {
    try {
        const { agentId } = req.params;
        const updateData = req.body;

        // Remove password from update data
        delete updateData.password;

        const agent = await User.findByIdAndUpdate(
            agentId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        res.json({
            success: true,
            message: 'Agent updated successfully',
            data: agent
        });
    } catch (error) {
        console.error('Error updating agent:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating agent',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

exports.deleteAgent = async (req, res) => {
    try {
        const { agentId } = req.params;

        // Only super admin can delete
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can delete agent records'
            });
        }

        const agent = await User.findById(agentId);
        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        // Update all students referred by this agent
        await Student.updateMany(
            { 'agentReferral.agent': agentId },
            { $unset: { agentReferral: 1 } }
        );

        // Delete agent
        await User.findByIdAndDelete(agentId);

        res.json({
            success: true,
            message: 'Agent deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting agent:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting agent',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Staff Management
exports.getAllStaff = async (req, res) => {
    try {
        console.log('getAllStaff called with query:', req.query);

        const {
            page = 1,
            limit = 10,
            search,
            role,
            isActive,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Try to use database first
        try {
            // Build filter query
            const filter = {};

            if (search) {
                filter.$or = [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { employeeId: { $regex: search, $options: 'i' } },
                    { department: { $regex: search, $options: 'i' } },
                    { designation: { $regex: search, $options: 'i' } }
                ];
            }

            if (role) filter.role = role;
            if (isActive !== undefined) filter.isActive = isActive === 'true';

            console.log('Filter query:', filter);

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            console.log('About to query Admin collection...');
            const staff = await Admin.find(filter)
                .select('-password')
                .populate('assignedAgents', 'fullName email referralCode')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit));

            console.log('Found staff:', staff.length);

            const total = await Admin.countDocuments(filter);
            console.log('Total staff count:', total);

            res.json({
                success: true,
                data: {
                    staff,
                    pagination: {
                        current: parseInt(page),
                        total: Math.ceil(total / limit),
                        totalItems: total,
                        hasNext: skip + staff.length < total,
                        hasPrev: page > 1
                    }
                }
            });
        } catch (dbError) {
            console.log('Database error, using mock data:', dbError.message);

            // Use mock data as fallback
            let filteredStaff = [...mockStaff];

            // Apply search filter
            if (search) {
                const searchLower = search.toLowerCase();
                filteredStaff = filteredStaff.filter(staff =>
                    staff.firstName.toLowerCase().includes(searchLower) ||
                    staff.lastName.toLowerCase().includes(searchLower) ||
                    staff.email.toLowerCase().includes(searchLower) ||
                    staff.employeeId.toLowerCase().includes(searchLower) ||
                    staff.department.toLowerCase().includes(searchLower) ||
                    staff.designation.toLowerCase().includes(searchLower)
                );
            }

            // Apply role filter
            if (role) {
                filteredStaff = filteredStaff.filter(staff => staff.role === role);
            }

            // Apply active filter
            if (isActive !== undefined) {
                filteredStaff = filteredStaff.filter(staff => staff.isActive === (isActive === 'true'));
            }

            // Apply pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const paginatedStaff = filteredStaff.slice(skip, skip + parseInt(limit));

            res.json({
                success: true,
                data: {
                    staff: paginatedStaff,
                    pagination: {
                        current: parseInt(page),
                        total: Math.ceil(filteredStaff.length / limit),
                        totalItems: filteredStaff.length,
                        hasNext: skip + paginatedStaff.length < filteredStaff.length,
                        hasPrev: page > 1
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error getting staff:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching staff',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get all staff for agent assignment dropdown
exports.getStaffForAssignment = async (req, res) => {
    try {
        try {
            const staff = await Admin.find({
                role: 'staff',
                isActive: true
            })
                .select('firstName lastName email department designation employeeId')
                .sort({ firstName: 1 });

            res.json({
                success: true,
                data: staff
            });
        } catch (dbError) {
            console.log('Database error, using mock data for staff assignment:', dbError.message);

            // Use mock data as fallback
            const staff = mockStaff
                .filter(s => s.role === 'staff' && s.isActive)
                .map(s => ({
                    _id: s._id,
                    firstName: s.firstName,
                    lastName: s.lastName,
                    email: s.email,
                    department: s.department,
                    designation: s.designation,
                    employeeId: s.employeeId
                }))
                .sort((a, b) => a.firstName.localeCompare(b.firstName));

            res.json({
                success: true,
                data: staff
            });
        }
    } catch (error) {
        console.error('Error getting staff for assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching staff for assignment',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

exports.createStaff = async (req, res) => {
    try {
        console.log('Creating staff with data:', req.body);

        const {
            firstName,
            lastName,
            email,
            password,
            phone,
            role = 'staff',
            department,
            designation,
            assignedAgents
        } = req.body;

        // Check if staff already exists
        const existingStaff = await Admin.findOne({ email });
        if (existingStaff) {
            return res.status(400).json({
                success: false,
                message: 'Staff with this email already exists'
            });
        }

        console.log('Creating new Admin instance...');
        const staff = new Admin({
            firstName,
            lastName,
            email,
            password,
            phone,
            role,
            department,
            designation,
            gender: 'male', // Set default gender to avoid validation issues
            createdBy: req.user._id
        });

        console.log('Saving staff to database...');
        await staff.save();
        console.log('Staff saved successfully');

        // If agents are assigned to this staff, update them
        if (assignedAgents && assignedAgents.length > 0) {
            await User.updateMany(
                { _id: { $in: assignedAgents }, role: 'agent' },
                { assignedStaff: staff._id }
            );
        }

        res.status(201).json({
            success: true,
            message: 'Staff created successfully',
            data: {
                id: staff._id,
                firstName: staff.firstName,
                lastName: staff.lastName,
                email: staff.email,
                role: staff.role,
                employeeId: staff.employeeId,
                department: staff.department,
                designation: staff.designation
            }
        });
    } catch (error) {
        console.error('Error creating staff:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            errors: error.errors
        });
        res.status(500).json({
            success: false,
            message: 'Server error while creating staff',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.errors : undefined
        });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        const { staffId } = req.params;
        const updateData = req.body;

        // Remove password from update data
        delete updateData.password;

        const staff = await Admin.findByIdAndUpdate(
            staffId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found'
            });
        }

        res.json({
            success: true,
            message: 'Staff updated successfully',
            data: staff
        });
    } catch (error) {
        console.error('Error updating staff:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating staff',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        const { staffId } = req.params;

        // Only super admin can delete
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can delete staff records'
            });
        }

        // Prevent deleting super admin
        const staff = await Admin.findById(staffId);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found'
            });
        }

        if (staff.role === 'super_admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete Super Admin account'
            });
        }

        await Admin.findByIdAndDelete(staffId);

        res.json({
            success: true,
            message: 'Staff deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting staff:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting staff',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Password Management
exports.resetPassword = async (req, res) => {
    try {
        const { userId, userType, newPassword } = req.body;

        if (!userId || !userType || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'User ID, user type, and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        let user;
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        if (userType === 'student' || userType === 'agent') {
            user = await User.findByIdAndUpdate(
                userId,
                {
                    password: hashedPassword,
                    passwordChangedAt: new Date()
                },
                { new: true }
            ).select('-password');
        } else if (userType === 'staff' || userType === 'super_admin') {
            user = await Admin.findByIdAndUpdate(
                userId,
                {
                    password: hashedPassword,
                    passwordChangedAt: new Date()
                },
                { new: true }
            ).select('-password');
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid user type'
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Password reset successfully',
            data: {
                id: user._id,
                name: user.firstName + ' ' + user.lastName,
                email: user.email,
                userType: userType
            }
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while resetting password',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Website Settings Management
exports.getWebsiteSettings = async (req, res) => {
    try {
        let settings = await WebsiteSettings.findOne();

        if (!settings) {
            // Create default settings
            settings = new WebsiteSettings();
            await settings.save();
        }

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error getting website settings:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching website settings',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

exports.updateWebsiteSettings = async (req, res) => {
    try {
        let settings = await WebsiteSettings.findOne();

        if (!settings) {
            settings = new WebsiteSettings();
        }

        // Update settings with request body
        Object.assign(settings, req.body);
        await settings.save();

        res.json({
            success: true,
            message: 'Website settings updated successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error updating website settings:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating website settings',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Upload website images
exports.uploadWebsiteImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const { imageType } = req.body; // e.g., 'heroBackground', 'aboutImage', etc.

        if (!imageType) {
            return res.status(400).json({
                success: false,
                message: 'Image type is required'
            });
        }

        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, {
            folder: 'swagat-odisha/website',
            public_id: `${imageType}_${Date.now()}`,
            transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        });

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                imageType,
                url: result.secure_url,
                public_id: result.public_id
            }
        });
    } catch (error) {
        console.error('Error uploading website image:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while uploading image',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
