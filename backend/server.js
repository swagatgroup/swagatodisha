const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/db');

// Import middleware
const { protect } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

// CORS Fix for undefined origin - Add this FIRST
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
        'https://www.swagatodisha.com',
        'https://swagatodisha.com',
        'https://swagatodisha.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173'
    ];

    if (allowedOrigins.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin || '*');
    }

    // Always set CORS headers for all responses
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

// Import error handling middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const adminRoutes = require('./routes/admin');
const adminAuthRoutes = require('./routes/adminAuth');
const adminStudentsRoutes = require('./routes/adminStudents');
const dashboardRoutes = require('./routes/dashboard');
const documentRoutes = require('./routes/documents');
const referralRoutes = require('./routes/referral');
const notificationRoutes = require('./routes/notifications');
const securityRoutes = require('./routes/security');
const performanceRoutes = require('./routes/performance');
const contactRoutes = require('./routes/contact');
const fileRoutes = require('./routes/fileRoutes');
const analyticsRoutes = require('./routes/analytics');
const agentRoutes = require('./routes/agentRoutes');
const staffRoutes = require('./routes/staffRoutes');

// Import security middleware
const {
    securityHeaders,
    sanitizeInput,
    preventSQLInjection,
    preventXSS,
    securityLogger,
    authRateLimit,
    uploadRateLimit,
    apiRateLimit,
    passwordResetRateLimit
} = require('./middleware/security');

// Import performance monitoring
const performanceMonitor = require('./utils/performance');
const databaseOptimization = require('./utils/databaseOptimization');

// Middleware
app.use(securityHeaders);
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'tiny'));
// app.use(securityLogger); // Disabled verbose security logging
app.use(performanceMonitor.performanceMiddleware());
app.use(sanitizeInput);
app.use(preventSQLInjection);
app.use(preventXSS);
// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'https://www.swagatodisha.com',
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'http://localhost:5173',
            'https://www.swagatodisha.com',
            'https://swagatodisha.com',
            'https://swagatodisha.vercel.app',
            'https://swagat-odisha.vercel.app',
            'https://swagatodisha.netlify.app'
        ];

        // Check if origin is allowed
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'Pragma',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    preflightContinue: false
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Enhanced CORS middleware for edge cases
app.use((req, res, next) => {
    // Set CORS headers for all responses
    const origin = req.headers.origin;
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://www.swagatodisha.com',
        'https://swagatodisha.com',
        'https://swagatodisha.vercel.app',
        'https://swagat-odisha.vercel.app',
        'https://swagatodisha.netlify.app'
    ];

    // Set CORS headers
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    next();
});

// Enhanced request logging middleware
// app.use((req, res, next) => {
//     const timestamp = new Date().toISOString();
//     const origin = req.headers.origin || 'No Origin';
//     const userAgent = req.get('User-Agent') || 'Unknown';

//     console.log(`[${timestamp}] 🌐 ${req.method} ${req.path}`);
//     console.log(`[${timestamp}] 📍 Origin: ${origin}`);
//     console.log(`[${timestamp}] 🤖 User-Agent: ${userAgent.substring(0, 50)}...`);

//     // Log rate limiting info
//     if (req.get('X-RateLimit-Limit')) {
//         console.log(`[${timestamp}] ⚡ Rate Limit: ${req.get('X-RateLimit-Remaining')}/${req.get('X-RateLimit-Limit')}`);
//     }

//     next();
// });

// Rate limiting - Only apply to non-auth routes to avoid double limiting
// const generalLimiter = rateLimit({
//     windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//     max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Increased limit
//     message: {
//         error: 'Too many requests, please try again later.',
//         retryAfter: '15 minutes'
//     },
//     standardHeaders: true,
//     legacyHeaders: false,
//     skip: (req) => {
//         // Skip rate limiting for health checks, auth routes, and Render's monitoring
//         if (req.path === '/health' || req.path === '/api/health') return true;
//         if (req.path.startsWith('/api/auth')) return true; // Skip auth routes (handled by authRateLimit)
//         if (req.get('User-Agent') && req.get('User-Agent').includes('Render')) return true;
//         if (req.get('User-Agent') && req.get('User-Agent').includes('UptimeRobot')) return true;
//         return false;
//     }
// });
// app.use('/api/', generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Static files
app.use('/uploads', express.static('uploads'));

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Swagat Odisha Backend API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            adminAuth: '/api/admin-auth',
            students: '/api/students',
            admin: '/api/admin',
            dashboard: '/api/dashboard',
            files: '/api/files'
        }
    });
});

// Simple test endpoint for Vercel
app.get('/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Backend is working',
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Swagat Odisha Backend is running',
        timestamp: new Date().toISOString()
    });
});

// API Health check endpoint (for Render)
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Swagat Odisha Backend API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Test endpoint for CORS
app.get('/api/test', (req, res) => {
    res.status(200).json({
        message: 'CORS test successful',
        origin: req.headers.origin,
        timestamp: new Date().toISOString()
    });
});

// Import new student routes
const studentPaymentRoutes = require('./routes/studentPayments');
const studentApplicationRoutes = require('./routes/studentApplications');
const studentAcademicRoutes = require('./routes/studentAcademic');
const workflowRoutes = require('./routes/workflow');
const paymentRoutes = require('./routes/paymentRoutes');
const studentApplicationWorkflowRoutes = require('./routes/studentApplicationWorkflow');
const websiteContentRoutes = require('./routes/websiteContent');
const courseRoutes = require('./routes/courses');
const galleryRoutes = require('./routes/gallery');
const pdfRoutes = require('./routes/pdf');
const documentTypesRoutes = require('./routes/documentTypes');
const cmsRoutes = require('./routes/cms');
const applicationVerificationRoutes = require('./routes/applicationVerification');

// MongoDB Application Routes
app.post('/api/application/create', protect, async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Import the StudentApplication model
        const StudentApplication = require('./models/StudentApplication');

        // Check if user already has an application (only for students)
        if (req.user.role === 'student') {
            const existingApplication = await StudentApplication.findOne({ user: req.user._id });
            if (existingApplication) {
                return res.status(400).json({
                    success: false,
                    message: 'You already have an application. Please update the existing one.',
                    applicationId: existingApplication.applicationId
                });
            }
        }

        // Convert date string to Date object
        if (req.body.personalDetails && req.body.personalDetails.dateOfBirth) {
            req.body.personalDetails.dateOfBirth = new Date(req.body.personalDetails.dateOfBirth);
        }

        // Handle referral code linking
        let referralInfo = {};
        if (req.body.referralCode) {
            // Find the agent who owns this referral code
            const User = require('./models/User');
            const referrer = await User.findOne({ referralCode: req.body.referralCode });
            if (referrer) {
                referralInfo = {
                    referredBy: referrer._id,
                    referralCode: req.body.referralCode,
                    referralType: referrer.role
                };
            } else {
                referralInfo = {
                    referralCode: req.body.referralCode
                };
            }
        }

        // Create application in database
        const applicationData = {
            user: req.user._id, // Use authenticated user ID
            personalDetails: req.body.personalDetails || {},
            contactDetails: req.body.contactDetails || {},
            courseDetails: req.body.courseDetails || {},
            guardianDetails: req.body.guardianDetails || {},
            financialDetails: req.body.financialDetails || {},
            status: 'SUBMITTED',
            currentStage: 'SUBMITTED',
            progress: {
                registrationComplete: true,
                documentsComplete: true,
                applicationPdfGenerated: false,
                termsAccepted: true,
                submissionComplete: true
            },
            submittedAt: new Date(),
            termsAccepted: true,
            termsAcceptedAt: new Date(),
            submittedBy: req.user._id,
            submitterRole: req.user.role,
            referralInfo: referralInfo
        };

        // Generate applicationId if not provided
        if (!applicationData.applicationId) {
            const year = new Date().getFullYear().toString().substr(-2);
            const random = Math.random().toString().substr(2, 6).toUpperCase();
            applicationData.applicationId = `APP${year}${random}`;
        }

        const application = new StudentApplication(applicationData);
        await application.save();
        await application.populate('user', 'fullName email phoneNumber');

        res.status(201).json({
            success: true,
            message: 'Application created successfully',
            data: application
        });
    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Application status endpoint (MongoDB only)
app.get('/api/application/status/:applicationId', protect, async (req, res) => {
    try {
        const { applicationId } = req.params;
        const StudentApplication = require('./models/StudentApplication');

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

        res.status(200).json({
            success: true,
            data: {
                applicationId: application.applicationId,
                status: application.status,
                currentStage: application.currentStage,
                progress: application.progress,
                application: application,
                lastUpdated: application.updatedAt
            }
        });
    } catch (error) {
        console.error('Error getting application status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get application status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Updated endpoint for student application with proper auth
app.post('/api/student-application/create', protect, async (req, res) => {
    console.log('=== STUDENT APPLICATION CREATE ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('User:', req.user);

    try {
        // Check if user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Import the StudentApplication model
        const StudentApplication = require('./models/StudentApplication');

        // Debug logging
        console.log('Application endpoint - User role:', req.user.role);
        console.log('Application endpoint - User ID:', req.user._id);
        console.log('Application endpoint - User type:', req.userType);
        console.log('Application endpoint - User object keys:', Object.keys(req.user));

        // Check if user already has an application (only for students)
        if (req.user.role === 'student') {
            const existingApplication = await StudentApplication.findOne({ user: req.user._id });
            if (existingApplication) {
                console.log('Found existing application for student:', existingApplication.applicationId);
                return res.status(400).json({
                    success: false,
                    message: 'You already have an application. Please update the existing one.',
                    applicationId: existingApplication.applicationId
                });
            }
        } else {
            console.log('User is not a student, skipping application check');
        }

        // Convert date string to Date object
        if (req.body.personalDetails && req.body.personalDetails.dateOfBirth) {
            req.body.personalDetails.dateOfBirth = new Date(req.body.personalDetails.dateOfBirth);
        }

        // Create application in database
        const applicationData = {
            user: req.user._id, // Use authenticated user ID
            personalDetails: req.body.personalDetails || {},
            contactDetails: req.body.contactDetails || {},
            courseDetails: req.body.courseDetails || {},
            guardianDetails: req.body.guardianDetails || {},
            financialDetails: req.body.financialDetails || {},
            submittedBy: req.user._id,
            submitterRole: req.user.role || 'student',
            status: 'DRAFT',
            currentStage: 'REGISTRATION',
            progress: {
                registrationComplete: true
            }
        };


        const application = new StudentApplication(applicationData);
        await application.save();
        await application.populate('user', 'fullName email phoneNumber');


        res.status(201).json({
            success: true,
            message: 'Application created successfully',
            data: application
        });
    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create application',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get applications for student review
app.get('/api/student-application/my-application', async (req, res) => {
    try {
        const StudentApplication = require('./models/StudentApplication');
        const applications = await StudentApplication.find({}).sort({ createdAt: -1 }).limit(1);

        if (applications.length > 0) {
            res.json({
                success: true,
                data: applications[0]
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No application found'
            });
        }
    } catch (error) {
        console.error('Error getting applications:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving applications',
            error: error.message
        });
    }
});

// Get applications for staff dashboard
app.get('/api/staff/applications', async (req, res) => {
    try {
        const StudentApplication = require('./models/StudentApplication');
        const applications = await StudentApplication.find({}).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: applications
        });
    } catch (error) {
        console.error('Error getting applications for staff:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving applications',
            error: error.message
        });
    }
});

// Get applications for super admin dashboard
app.get('/api/admin/applications', async (req, res) => {
    try {
        const StudentApplication = require('./models/StudentApplication');
        const applications = await StudentApplication.find({}).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: applications
        });
    } catch (error) {
        console.error('Error getting applications for admin:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving applications',
            error: error.message
        });
    }
});

// Test route for submitted applications (before auth middleware)
app.get('/api/student-application/submitted-test', async (req, res) => {
    try {
        console.log('=== TEST SUBMITTED APPLICATIONS ROUTE ===');
        const StudentApplication = require('./models/StudentApplication');
        const applications = await StudentApplication.find({ status: 'SUBMITTED' }).sort({ submittedAt: -1 });

        res.json({
            success: true,
            message: 'Test route working',
            data: {
                applications,
                count: applications.length
            }
        });
    } catch (error) {
        console.error('Error in test route:', error);
        res.status(500).json({
            success: false,
            message: 'Test route error',
            error: error.message
        });
    }
});

// Debug route for submitted applications (without auth for testing)
app.get('/api/student-application/submitted-debug', async (req, res) => {
    try {
        console.log('=== DEBUG SUBMITTED APPLICATIONS ROUTE ===');
        console.log('Query params:', req.query);

        const StudentApplication = require('./models/StudentApplication');
        const { status = 'SUBMITTED', page = 1, limit = 20 } = req.query;

        let query = { status };

        const applications = await StudentApplication.find(query)
            .populate('user', 'fullName email phoneNumber')
            .populate('assignedAgent', 'fullName email phoneNumber')
            .populate('assignedStaff', 'fullName email phoneNumber')
            .sort({ submittedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await StudentApplication.countDocuments(query);

        res.json({
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
        console.error('Error in debug route:', error);
        res.status(500).json({
            success: false,
            message: 'Debug route error',
            error: error.message
        });
    }
});

// Create test application route (without auth for testing)
app.post('/api/student-application/create-test', async (req, res) => {
    try {
        console.log('=== CREATE TEST APPLICATION ===');

        const StudentApplication = require('./models/StudentApplication');
        const User = require('./models/User');

        // Find existing test user
        let testUser = await User.findOne({ email: 'teststudent@example.com' });

        if (!testUser) {
            return res.status(404).json({
                success: false,
                message: 'Test user not found. Please create a user first.'
            });
        }

        console.log('Using existing test user:', testUser.email);

        // Create test application
        const testApplication = new StudentApplication({
            user: testUser._id,
            applicationId: 'SO2024001',
            status: 'SUBMITTED',
            currentStage: 'UNDER_REVIEW',
            personalDetails: {
                fullName: 'Test Student',
                email: 'teststudent@example.com',
                phoneNumber: '8888888888',
                dateOfBirth: new Date('2000-01-01'),
                gender: 'Male',
                aadharNumber: '123456789012',
                address: 'Test Address, Test City, Test State'
            },
            academicDetails: {
                courseName: 'Bachelor of Technology',
                previousInstitution: 'Test School',
                previousCourse: '12th Standard',
                yearOfPassing: '2020',
                percentage: '85'
            },
            guardianDetails: {
                guardianName: 'Test Guardian',
                guardianPhone: '9876543211',
                guardianEmail: 'guardian@example.com',
                relationship: 'Father',
                guardianAddress: 'Test Guardian Address'
            },
            financialDetails: {
                annualIncome: '500000',
                paymentMethod: 'Online',
                scholarshipApplied: false
            },
            documents: {
                aadharCard: { url: 'https://example.com/aadhar.pdf', fileType: 'pdf' },
                passportPhoto: { url: 'https://example.com/photo.jpg', fileType: 'jpg' },
                tenthMarksheet: { url: 'https://example.com/10th.pdf', fileType: 'pdf' },
                twelfthMarksheet: { url: 'https://example.com/12th.pdf', fileType: 'pdf' },
                migrationCertificate: { url: 'https://example.com/migration.pdf', fileType: 'pdf' },
                characterCertificate: { url: 'https://example.com/character.pdf', fileType: 'pdf' }
            },
            progress: {
                registrationComplete: true,
                documentsComplete: true,
                applicationPdfGenerated: true,
                termsAccepted: true,
                submissionComplete: true
            },
            submittedAt: new Date(),
            termsAccepted: true,
            termsAcceptedAt: new Date(),
            reviewStatus: {
                documentsVerified: false,
                personalDetailsVerified: false,
                academicDetailsVerified: false,
                guardianDetailsVerified: false,
                financialDetailsVerified: false,
                overallApproved: false,
                reviewedBy: null,
                reviewedAt: null,
                comments: []
            }
        });

        await testApplication.save();
        console.log('Test application created successfully:', testApplication.applicationId);

        res.json({
            success: true,
            message: 'Test application created successfully',
            data: testApplication
        });

    } catch (error) {
        console.error('Error creating test application:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating test application',
            error: error.message
        });
    }
});

// Debug endpoint to check document statuses
app.get('/api/debug/document-statuses', async (req, res) => {
    try {
        const StudentApplication = require('./models/StudentApplication');

        // Get all applications with documents
        const applications = await StudentApplication.find({
            documents: { $exists: true, $not: { $size: 0 } }
        }).limit(10);

        const statusAnalysis = applications.map(app => {
            const documents = app.documents || [];
            const statuses = documents.map(doc => doc.status);
            const uniqueStatuses = [...new Set(statuses)];

            return {
                applicationId: app.applicationId,
                fullName: app.personalDetails?.fullName || 'N/A',
                totalDocs: documents.length,
                statuses: statuses,
                uniqueStatuses: uniqueStatuses,
                documents: documents.map(d => ({
                    type: d.documentType,
                    status: d.status,
                    fileName: d.fileName
                }))
            };
        });

        res.json({
            success: true,
            data: {
                applicationsWithDocs: applications.length,
                statusAnalysis: statusAnalysis,
                allUniqueStatuses: [...new Set(applications.flatMap(app =>
                    (app.documents || []).map(doc => doc.status)
                ))]
            }
        });
    } catch (error) {
        console.error('Debug document statuses error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking document statuses',
            error: error.message
        });
    }
});

// Debug endpoint to check applications count
app.get('/api/debug/applications-count', async (req, res) => {
    try {
        const StudentApplication = require('./models/StudentApplication');
        const User = require('./models/User');

        const totalApplications = await StudentApplication.countDocuments();
        const totalUsers = await User.countDocuments();

        // Get a few sample applications
        const sampleApplications = await StudentApplication.find({})
            .populate('user', 'fullName email')
            .limit(5)
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                totalApplications,
                totalUsers,
                sampleApplications: sampleApplications.map(app => ({
                    id: app._id,
                    applicationId: app.applicationId,
                    status: app.status,
                    fullName: app.personalDetails?.fullName || app.user?.fullName || 'N/A',
                    email: app.personalDetails?.email || app.user?.email || 'N/A',
                    documentsCount: app.documents?.length || 0,
                    createdAt: app.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('Debug applications count error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking applications count',
            error: error.message
        });
    }
});

// API Routes
app.use('/api/auth', authRateLimit, authRoutes);
app.use('/api/admin-auth', authRateLimit, adminAuthRoutes);
app.use('/api/students', apiRateLimit, studentRoutes);
app.use('/api/students/payments', apiRateLimit, studentPaymentRoutes);
app.use('/api/students/applications', apiRateLimit, studentApplicationRoutes);
app.use('/api/students/academic', apiRateLimit, studentAcademicRoutes);
app.use('/api/student-application', apiRateLimit, studentApplicationWorkflowRoutes);
app.use('/api/documents', uploadRateLimit, documentRoutes);
app.use('/api/document-types', apiRateLimit, documentTypesRoutes);
app.use('/api/cms', apiRateLimit, cmsRoutes);
app.use('/api/website-content', apiRateLimit, websiteContentRoutes);
app.use('/api/courses', apiRateLimit, courseRoutes);
app.use('/api/notifications', apiRateLimit, notificationRoutes);
app.use('/api/gallery', apiRateLimit, galleryRoutes);
// Removed duplicate agents mount
app.use('/api/referral', apiRateLimit, referralRoutes);
app.use('/api/pdf', apiRateLimit, pdfRoutes);
app.use('/api/workflow', apiRateLimit, workflowRoutes);
app.use('/api/payments', apiRateLimit, paymentRoutes);
app.use('/api/admin', apiRateLimit, adminRoutes);
app.use('/api/admin/students', apiRateLimit, adminStudentsRoutes);
app.use('/api/dashboard', apiRateLimit, dashboardRoutes);
app.use('/api/security', apiRateLimit, securityRoutes);
app.use('/api/performance', apiRateLimit, performanceRoutes);
app.use('/api/contact', apiRateLimit, contactRoutes);
app.use('/api/files', uploadRateLimit, fileRoutes);
app.use('/api/analytics', apiRateLimit, analyticsRoutes);
app.use('/api/agents', apiRateLimit, agentRoutes);
app.use('/api/staff', apiRateLimit, staffRoutes);
app.use('/api/verification', apiRateLimit, applicationVerificationRoutes);

// Performance monitoring routes
app.get('/api/health', async (req, res) => {
    try {
        const healthStatus = performanceMonitor.getHealthStatus();
        const dbHealth = await databaseOptimization.getDatabaseHealth();

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            performance: healthStatus,
            database: dbHealth
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});


app.get('/api/performance/metrics', (req, res) => {
    const metrics = performanceMonitor.getAllMetrics();
    res.json(metrics);
});

app.get('/api/performance/recommendations', (req, res) => {
    const recommendations = performanceMonitor.getRecommendations();
    res.json(recommendations);
});

// 404 handler
app.use('*', notFound);

// Global error handler
app.use(errorHandler);

// Production error handling
if (process.env.NODE_ENV === 'production') {
    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
        console.error('🚨 Uncaught Exception:', err);
        process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
        console.error('🚨 Unhandled Rejection:', err);
        process.exit(1);
    });
}

// Database connection initialization
const initializeConnections = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ Connection initialization failed:', error.message);
        // Don't exit the process, let the server run
    }
};

// Environment variable validation



// Initialize database optimization (disabled to avoid duplicate index warnings)
// databaseOptimization.createOptimizedIndexes();

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        // Only start server if not in Vercel environment
        if (process.env.VERCEL !== '1') {
            server.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT}`);
                console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log(`📊 Health: http://localhost:${PORT}/health`);
            });
        } else {
            console.log('🚀 Running in Vercel environment');
        }

        // Initialize connections (non-blocking)
        initializeConnections().catch(error => {
            console.error('⚠️ Connection initialization failed, but server is running:', error.message);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        if (process.env.VERCEL !== '1') {
            process.exit(1);
        }
    }
};

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
    startServer();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log('❌ Unhandled Rejection:', err.message);
    // Close server & exit process
    server.close(() => {
        process.exit(1);
    });
});

module.exports = { app, server };
