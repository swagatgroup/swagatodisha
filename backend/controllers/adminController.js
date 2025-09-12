const User = require('../models/User');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const WebsiteSettings = require('../models/WebsiteSettings');
const bcrypt = require('bcryptjs');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Calculating dashboard stats

        const [
            totalStudents,
            totalAgents,
            totalStaff,
            newStudents,
            newAgents,
            pendingApplications,
            approvedApplications,
            agentStats,
            recentStudents,
            recentAgents
        ] = await Promise.all([
            // Total Students
            Student.countDocuments({ status: 'active' }),

            // Total Agents
            User.countDocuments({ role: 'agent', isActive: true }),

            // Total Staff
            Admin.countDocuments({ role: 'staff', isActive: true }),

            // New Students in last 30 days
            Student.countDocuments({
                createdAt: { $gte: thirtyDaysAgo },
                status: 'active'
            }),

            // New Agents in last 30 days
            User.countDocuments({
                role: 'agent',
                isActive: true,
                createdAt: { $gte: thirtyDaysAgo }
            }),

            // Pending Applications
            Student.countDocuments({ status: 'pending' }),

            // Approved Applications
            Student.countDocuments({ status: 'approved' }),

            // Agent Performance Stats
            User.aggregate([
                { $match: { role: 'agent', isActive: true } },
                {
                    $group: {
                        _id: null,
                        totalReferrals: { $sum: '$referralStats.totalReferrals' },
                        successfulReferrals: { $sum: '$referralStats.successfulReferrals' },
                        totalCommission: { $sum: '$referralStats.totalCommission' }
                    }
                }
            ]),

            // Recent Students
            Student.find({ status: 'active' })
                .populate('user', 'firstName lastName email phone')
                .populate('agentReferral.agent', 'firstName lastName referralCode')
                .sort({ createdAt: -1 })
                .limit(5),

            // Recent Agents
            User.find({ role: 'agent', isActive: true })
                .select('firstName lastName email phone referralCode referralStats createdAt')
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        const agentStatsData = agentStats[0] || {
            totalReferrals: 0,
            successfulReferrals: 0,
            totalCommission: 0
        };

        res.json({
            success: true,
            data: {
                overview: {
                    totalStudents,
                    totalAgents,
                    totalStaff,
                    newStudents,
                    newAgents,
                    pendingApplications,
                    approvedApplications
                },
                agentPerformance: {
                    totalReferrals: agentStatsData.totalReferrals,
                    successfulReferrals: agentStatsData.successfulReferrals,
                    totalCommission: agentStatsData.totalCommission,
                    successRate: agentStatsData.totalReferrals > 0
                        ? Math.round((agentStatsData.successfulReferrals / agentStatsData.totalReferrals) * 100)
                        : 0
                },
                recentStudents,
                recentAgents
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
        const {
            page = 1,
            limit = 10,
            search,
            isActive,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter query
        const filter = { role: 'agent' };

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { referralCode: { $regex: search, $options: 'i' } }
            ];
        }

        if (isActive !== undefined) filter.isActive = isActive === 'true';

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const agents = await User.find(filter)
            .select('-password')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(filter);

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
    } catch (error) {
        console.error('Error getting agents:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching agents',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
        const {
            page = 1,
            limit = 10,
            search,
            role,
            isActive,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter query
        const filter = {};

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const staff = await Admin.find(filter)
            .select('-password')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Admin.countDocuments(filter);

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
    } catch (error) {
        console.error('Error getting staff:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching staff',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

exports.createStaff = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            phone,
            role = 'staff',
            department,
            designation
        } = req.body;

        // Check if staff already exists
        const existingStaff = await Admin.findOne({ email });
        if (existingStaff) {
            return res.status(400).json({
                success: false,
                message: 'Staff with this email already exists'
            });
        }

        const staff = new Admin({
            firstName,
            lastName,
            email,
            password,
            phone,
            role,
            department,
            designation,
            createdBy: req.user._id
        });

        await staff.save();

        res.status(201).json({
            success: true,
            message: 'Staff created successfully',
            data: {
                id: staff._id,
                firstName: staff.firstName,
                lastName: staff.lastName,
                email: staff.email,
                role: staff.role,
                employeeId: staff.employeeId
            }
        });
    } catch (error) {
        console.error('Error creating staff:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating staff',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
