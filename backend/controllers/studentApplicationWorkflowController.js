const StudentApplication = require('../models/StudentApplication');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Create new application
const createApplication = async (req, res) => {
    try {
        console.log('createApplication called with user:', req.user);
        console.log('Request body:', req.body);

        const {
            personalDetails,
            contactDetails,
            courseDetails,
            guardianDetails,
            financialDetails = {},
            referralCode
        } = req.body;

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Check if user already has an application
        const existingApplication = await StudentApplication.findOne({ user: req.user._id });
        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You already have an application. Please update the existing one.'
            });
        }

        // Check if Aadhar number is already used
        if (personalDetails && personalDetails.aadharNumber) {
            const existingAadhar = await StudentApplication.findOne({
                'personalDetails.aadharNumber': personalDetails.aadharNumber
            });
            if (existingAadhar) {
                return res.status(400).json({
                    success: false,
                    message: 'An application with this Aadhar number already exists.'
                });
            }
        }

        // Handle referral code if provided
        let referralInfo = {};
        if (referralCode) {
            const referrer = await User.findOne({ referralCode });
            if (referrer) {
                referralInfo = {
                    referredBy: referrer._id,
                    referralCode,
                    referralType: referrer.role
                };
            }
        }

        // Convert date string to Date object for personalDetails.dateOfBirth
        if (personalDetails && personalDetails.dateOfBirth) {
            personalDetails.dateOfBirth = new Date(personalDetails.dateOfBirth);
        }

        // Create application
        const applicationData = {
            user: req.user._id,
            personalDetails,
            contactDetails,
            courseDetails,
            guardianDetails,
            financialDetails,
            referralInfo,
            progress: {
                registrationComplete: true
            }
        };

        console.log('Creating application with data:', JSON.stringify(applicationData, null, 2));

        const application = new StudentApplication(applicationData);

        console.log('Application object created, saving...');
        await application.save();
        console.log('Application saved successfully');
        await application.populate('user', 'fullName email phoneNumber');

        // Emit real-time update
        req.socketManager.notifyApplicationCreated({
            applicationId: application.applicationId,
            userId: req.user._id,
            stage: application.currentStage,
            status: application.status
        });

        res.status(201).json({
            success: true,
            message: 'Application created successfully',
            data: application
        });

    } catch (error) {
        console.error('Create application error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
            errors: error.errors
        });
        res.status(500).json({
            success: false,
            message: 'Failed to create application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? {
                name: error.name,
                code: error.code,
                errors: error.errors
            } : undefined
        });
    }
};

// Get application by user
const getApplication = async (req, res) => {
    try {
        console.log('getApplication called with user:', req.user);

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const application = await StudentApplication.findOne({ user: req.user._id })
            .populate('user', 'fullName email phoneNumber')
            .populate('assignedAgent', 'fullName email phoneNumber')
            .populate('assignedStaff', 'fullName email phoneNumber');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'No application found'
            });
        }

        res.status(200).json({
            success: true,
            data: application
        });

    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update application stage
const updateApplicationStage = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { stage, data, action = 'SAVE_DRAFT' } = req.body;

        const application = await StudentApplication.findOne({
            applicationId,
            user: req.user._id
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Update application data based on stage
        if (data) {
            Object.keys(data).forEach(key => {
                if (application.schema.paths[key]) {
                    application[key] = data[key];
                }
            });
        }

        // Update stage and progress
        await application.updateStage(stage, req.user._id, '', action);

        // Update progress flags
        switch (stage) {
            case 'REGISTRATION':
                application.progress.registrationComplete = true;
                break;
            case 'DOCUMENTS':
                application.progress.documentsComplete = true;
                break;
            case 'APPLICATION_PDF':
                application.progress.applicationPdfGenerated = true;
                break;
            case 'TERMS_CONDITIONS':
                application.progress.termsAccepted = true;
                break;
        }

        await application.save();

        // Emit real-time update
        req.socketManager.notifyApplicationUpdated({
            applicationId: application.applicationId,
            userId: req.user._id,
            stage: application.currentStage,
            status: application.status,
            progress: application.progress
        });

        res.status(200).json({
            success: true,
            message: 'Application updated successfully',
            data: application
        });

    } catch (error) {
        console.error('Update application stage error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Save draft
const saveDraft = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { data, stage } = req.body;

        const application = await StudentApplication.findOne({
            applicationId,
            user: req.user._id
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Update application data
        if (data) {
            Object.keys(data).forEach(key => {
                if (application.schema.paths[key]) {
                    application[key] = data[key];
                }
            });
        }

        // Update stage if provided
        if (stage) {
            application.currentStage = stage;
        }

        await application.saveDraft(req.user._id);

        // Emit real-time update
        req.socketManager.notifyApplicationDraftSaved({
            applicationId: application.applicationId,
            userId: req.user._id,
            stage: application.currentStage,
            status: application.status
        });

        res.status(200).json({
            success: true,
            message: 'Draft saved successfully',
            data: application
        });

    } catch (error) {
        console.error('Save draft error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save draft',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Submit application
const submitApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { termsAccepted } = req.body;

        const application = await StudentApplication.findOne({
            applicationId,
            user: req.user._id
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Validate that all required stages are completed
        if (!application.progress.registrationComplete ||
            !application.progress.documentsComplete ||
            !application.progress.applicationPdfGenerated) {
            return res.status(400).json({
                success: false,
                message: 'Please complete all required stages before submitting'
            });
        }

        if (!termsAccepted) {
            return res.status(400).json({
                success: false,
                message: 'Please accept the terms and conditions'
            });
        }

        // Update terms acceptance
        application.termsAccepted = true;
        application.termsAcceptedAt = new Date();
        application.progress.termsAccepted = true;

        // Submit application
        await application.submitApplication(req.user._id);

        // Assign to agent if referral exists
        if (application.referralInfo.referredBy) {
            await application.assignToAgent(application.referralInfo.referredBy);
        }

        // Emit real-time update
        req.socketManager.notifyApplicationSubmitted({
            applicationId: application.applicationId,
            userId: req.user._id,
            stage: application.currentStage,
            status: application.status,
            assignedAgent: application.assignedAgent
        });

        res.status(200).json({
            success: true,
            message: 'Application submitted successfully',
            data: application
        });

    } catch (error) {
        console.error('Submit application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Generate application PDF
const generateApplicationPDF = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await StudentApplication.findOne({
            applicationId,
            user: req.user._id
        }).populate('user', 'fullName email phoneNumber');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Create PDF
        const doc = new PDFDocument();
        const fileName = `application_${application.applicationId}_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '../uploads/processed', fileName);

        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Create write stream
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Add content to PDF
        doc.fontSize(20).text('Student Application Form', { align: 'center' });
        doc.moveDown();

        // Personal Details
        doc.fontSize(16).text('Personal Details', { underline: true });
        doc.fontSize(12);
        doc.text(`Full Name: ${application.personalDetails.fullName}`);
        doc.text(`Father's Name: ${application.personalDetails.fathersName}`);
        doc.text(`Mother's Name: ${application.personalDetails.mothersName}`);
        doc.text(`Date of Birth: ${application.personalDetails.dateOfBirth.toLocaleDateString()}`);
        doc.text(`Gender: ${application.personalDetails.gender}`);
        doc.text(`Aadhar Number: ${application.personalDetails.aadharNumber}`);
        doc.moveDown();

        // Contact Details
        doc.fontSize(16).text('Contact Details', { underline: true });
        doc.fontSize(12);
        doc.text(`Phone: ${application.contactDetails.primaryPhone}`);
        doc.text(`Email: ${application.contactDetails.email}`);
        doc.text(`Address: ${application.contactDetails.permanentAddress.street}, ${application.contactDetails.permanentAddress.city}, ${application.contactDetails.permanentAddress.state} - ${application.contactDetails.permanentAddress.pincode}`);
        doc.moveDown();

        // Course Details
        doc.fontSize(16).text('Course Details', { underline: true });
        doc.fontSize(12);
        doc.text(`Selected Course: ${application.courseDetails.selectedCourse}`);
        doc.text(`Campus: ${application.courseDetails.campus}`);
        if (application.courseDetails.stream) {
            doc.text(`Stream: ${application.courseDetails.stream}`);
        }
        doc.moveDown();

        // Guardian Details
        doc.fontSize(16).text('Guardian Details', { underline: true });
        doc.fontSize(12);
        doc.text(`Guardian Name: ${application.guardianDetails.guardianName}`);
        doc.text(`Relationship: ${application.guardianDetails.relationship}`);
        doc.text(`Phone: ${application.guardianDetails.guardianPhone}`);
        if (application.guardianDetails.guardianEmail) {
            doc.text(`Email: ${application.guardianDetails.guardianEmail}`);
        }

        // Finalize PDF
        doc.end();

        // Wait for stream to finish
        stream.on('finish', async () => {
            // Update application with PDF info
            application.applicationPdf = {
                filePath: filePath,
                generatedAt: new Date(),
                version: '1.0'
            };
            application.progress.applicationPdfGenerated = true;
            await application.save();

            // Emit real-time update
            req.socketManager.notifyApplicationPDFGenerated({
                applicationId: application.applicationId,
                userId: req.user._id,
                pdfPath: filePath
            });

            res.status(200).json({
                success: true,
                message: 'PDF generated successfully',
                data: {
                    pdfPath: filePath,
                    fileName: fileName
                }
            });
        });

    } catch (error) {
        console.error('Generate PDF error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate PDF',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Download application PDF
const downloadApplicationPDF = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await StudentApplication.findOne({
            applicationId,
            user: req.user._id
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        if (!application.applicationPdf || !application.applicationPdf.filePath) {
            return res.status(400).json({
                success: false,
                message: 'PDF not generated yet'
            });
        }

        const filePath = application.applicationPdf.filePath;

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'PDF file not found'
            });
        }

        res.download(filePath, `application_${application.applicationId}.pdf`);

    } catch (error) {
        console.error('Download PDF error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download PDF',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get applications by status (for staff/admin)
const getApplicationsByStatus = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const userRole = req.user.role;

        let query = {};

        // Filter based on user role
        if (userRole === 'agent') {
            query.assignedAgent = req.user._id;
        } else if (userRole === 'staff') {
            query.assignedStaff = req.user._id;
        }

        if (status) {
            query.status = status;
        }

        const applications = await StudentApplication.find(query)
            .populate('user', 'fullName email phoneNumber')
            .populate('assignedAgent', 'fullName email phoneNumber')
            .populate('assignedStaff', 'fullName email phoneNumber')
            .sort({ lastModified: -1 })
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
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get applications by status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get applications',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Approve application
const approveApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { remarks = '' } = req.body;

        const application = await StudentApplication.findOne({ applicationId });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        await application.approveApplication(req.user._id, remarks);

        // Emit real-time update
        req.socketManager.notifyApplicationApproved({
            applicationId: application.applicationId,
            userId: application.user,
            stage: application.currentStage,
            status: application.status,
            reviewedBy: req.user._id
        });

        res.status(200).json({
            success: true,
            message: 'Application approved successfully',
            data: application
        });

    } catch (error) {
        console.error('Approve application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Reject application
const rejectApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { rejectionReason, remarks = '' } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const application = await StudentApplication.findOne({ applicationId });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        await application.rejectApplication(req.user._id, rejectionReason, remarks);

        // Emit real-time update
        req.socketManager.notifyApplicationRejected({
            applicationId: application.applicationId,
            userId: application.user,
            stage: application.currentStage,
            status: application.status,
            reviewedBy: req.user._id,
            rejectionReason
        });

        res.status(200).json({
            success: true,
            message: 'Application rejected successfully',
            data: application
        });

    } catch (error) {
        console.error('Reject application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get workflow statistics
const getWorkflowStats = async (req, res) => {
    try {
        const userRole = req.user.role;
        let query = {};

        // Filter based on user role
        if (userRole === 'agent') {
            query.assignedAgent = req.user._id;
        } else if (userRole === 'staff') {
            query.assignedStaff = req.user._id;
        }

        const totalApplications = await StudentApplication.countDocuments(query);

        const byStatus = await StudentApplication.aggregate([
            { $match: query },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const byStage = await StudentApplication.aggregate([
            { $match: query },
            { $group: { _id: '$currentStage', count: { $sum: 1 } } }
        ]);

        const recentApplications = await StudentApplication.find(query)
            .populate('user', 'fullName email phoneNumber')
            .sort({ lastModified: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                totalApplications,
                byStatus: byStatus.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                byStage: byStage.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                recentApplications
            }
        });

    } catch (error) {
        console.error('Get workflow stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get workflow statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    createApplication,
    getApplication,
    updateApplicationStage,
    saveDraft,
    submitApplication,
    generateApplicationPDF,
    downloadApplicationPDF,
    getApplicationsByStatus,
    approveApplication,
    rejectApplication,
    getWorkflowStats
};
