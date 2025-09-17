const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const SocketManager = require('./utils/socket');
require('dotenv').config();

// Import database and R2 connections
const connectDB = require('./config/db');
const { testR2Connection } = require('./config/r2');

const app = express();
const server = http.createServer(app);
// Initialize Socket.IO early so it's available to middleware
const socketManager = new SocketManager(server);

// CORS Fix for undefined origin - Add this FIRST
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
        'https://www.swagatodisha.com',
        'https://swagatodisha.com',
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

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const adminRoutes = require('./routes/admin');
const adminAuthRoutes = require('./routes/adminAuth');
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

// Import error handling middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import socket middleware
const { addSocketManager } = require('./middleware/socket');

// Middleware
app.use(securityHeaders);
app.use(compression());
app.use(morgan('tiny')); // Reduced logging
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

// Attach socket manager before routes so controllers can use req.socketManager
app.use(addSocketManager(socketManager));

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

// Debug endpoint for student application (before auth middleware)
app.post('/api/student-application/create', async (req, res) => {
    console.log('=== STUDENT APPLICATION CREATE DEBUG ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('User:', req.user);

    try {
        // Import the StudentApplication model
        const StudentApplication = require('./models/StudentApplication');

        // Convert date string to Date object
        if (req.body.personalDetails && req.body.personalDetails.dateOfBirth) {
            req.body.personalDetails.dateOfBirth = new Date(req.body.personalDetails.dateOfBirth);
        }

        // Create application in database
        const applicationData = {
            user: req.body.userId || '507f1f77bcf86cd799439011', // Mock user ID for testing
            personalDetails: req.body.personalDetails || {},
            contactDetails: req.body.contactDetails || {},
            courseDetails: req.body.courseDetails || {},
            guardianDetails: req.body.guardianDetails || {},
            financialDetails: req.body.financialDetails || {},
            status: 'DRAFT',
            currentStage: 'REGISTRATION',
            progress: {
                registrationComplete: true
            }
        };

        console.log('Creating application with data:', JSON.stringify(applicationData, null, 2));

        const application = new StudentApplication(applicationData);
        await application.save();

        console.log('Application saved successfully:', application);

        res.status(201).json({
            success: true,
            message: 'Application created successfully',
            data: application
        });
    } catch (error) {
        console.error('Error in debug endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Debug endpoint error',
            error: error.message
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
app.use('/api/dashboard', apiRateLimit, dashboardRoutes);
app.use('/api/security', apiRateLimit, securityRoutes);
app.use('/api/performance', apiRateLimit, performanceRoutes);
app.use('/api/contact', apiRateLimit, contactRoutes);
app.use('/api/files', uploadRateLimit, fileRoutes);
app.use('/api/analytics', apiRateLimit, analyticsRoutes);
app.use('/api/agents', apiRateLimit, agentRoutes);
app.use('/api/staff', apiRateLimit, staffRoutes);

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

// Database and R2 connection initialization
const initializeConnections = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Test R2 connection
        const r2Connected = await testR2Connection();
        if (!r2Connected) {
            console.warn('⚠️ Cloudflare R2 connection failed. File uploads will not work.');
        }
    } catch (error) {
        console.error('❌ Connection initialization failed:', error.message);
        // Don't exit the process, let the server run
    }
};

// Environment variable validation


// Socket.IO already initialized above

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
                console.log(`🔌 Socket.IO initialized`);
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

module.exports = { app, server, socketManager };
