const Application = require('../models/Application');
const User = require('../models/User');

// Get student applications
const getStudentApplications = async (req, res) => {
    try {
        console.log('Getting applications for student:', req.user._id);

        const { status, page = 1, limit = 20 } = req.query;
        const studentId = req.user._id;

        let query = { student: studentId };

        if (status) {
            query.status = status;
        }

        console.log('Application query:', query);

        const applications = await Application.find(query)
            .populate('student', 'fullName email phoneNumber')
            .sort({ applicationDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Application.countDocuments(query);

        console.log('Found applications:', applications.length);

        res.status(200).json({
            success: true,
            data: {
                applications,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get student applications error:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to get applications',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Create new application
const createApplication = async (req, res) => {
    try {
        console.log('Creating application for student:', req.user._id);
        console.log('Application data:', req.body);

        const { course, institution, preferredStartDate, notes } = req.body;
        const studentId = req.user._id;

        // Generate application ID
        const applicationId = `APP${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        const application = new Application({
            student: studentId,
            course,
            institution,
            preferredStartDate: preferredStartDate ? new Date(preferredStartDate) : null,
            notes,
            applicationId,
            status: 'pending',
            applicationDate: new Date()
        });

        await application.save();
        await application.populate('student', 'fullName email phoneNumber');

        console.log('Application created successfully:', application._id);

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: application
        });
    } catch (error) {
        console.error('Create application error:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to create application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update application
const updateApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const updateData = req.body;

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if user owns this application
        if (application.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Only allow updates if application is pending
        if (application.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update application that is not pending'
            });
        }

        Object.assign(application, updateData);
        await application.save();
        await application.populate('student', 'fullName email phoneNumber');

        res.status(200).json({
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
};

// Withdraw application
const withdrawApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if user owns this application
        if (application.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Only allow withdrawal if application is pending
        if (application.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Cannot withdraw application that is not pending'
            });
        }

        application.status = 'withdrawn';
        application.withdrawnDate = new Date();
        await application.save();
        await application.populate('student', 'fullName email phoneNumber');

        res.status(200).json({
            success: true,
            message: 'Application withdrawn successfully',
            data: application
        });
    } catch (error) {
        console.error('Withdraw application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to withdraw application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get application by ID
const getApplicationById = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await Application.findById(applicationId)
            .populate('student', 'fullName email phoneNumber');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if user owns this application
        if (application.student._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        console.error('Get application by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    getStudentApplications,
    createApplication,
    updateApplication,
    withdrawApplication,
    getApplicationById
};
