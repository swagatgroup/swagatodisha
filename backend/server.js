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

const app = express();
const server = http.createServer(app);

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const adminRoutes = require('./routes/admin');
const adminAuthRoutes = require('./routes/adminAuth');
const dashboardRoutes = require('./routes/dashboard');
const documentRoutes = require('./routes/documents');
const securityRoutes = require('./routes/security');
const performanceRoutes = require('./routes/performance');
const contactRoutes = require('./routes/contact');

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

// Middleware
app.use(securityHeaders);
app.use(compression());
app.use(morgan('combined'));
app.use(securityLogger);
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
            console.log('✅ CORS allowed origin:', origin);
            callback(null, true);
        } else {
            console.log('❌ CORS blocked origin:', origin);
            console.log('📋 Allowed origins:', allowedOrigins);
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
        console.log('✅ CORS: Allowed origin:', origin);
    } else if (origin) {
        console.log('❌ CORS: Blocked origin:', origin);
        console.log('📋 Allowed origins:', allowedOrigins);
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log('🔄 CORS: Handling preflight request for:', req.path);
        res.status(200).end();
        return;
    }

    next();
});

// Enhanced request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const origin = req.headers.origin || 'No Origin';
    const userAgent = req.get('User-Agent') || 'Unknown';

    console.log(`[${timestamp}] 🌐 ${req.method} ${req.path}`);
    console.log(`[${timestamp}] 📍 Origin: ${origin}`);
    console.log(`[${timestamp}] 🤖 User-Agent: ${userAgent.substring(0, 50)}...`);

    // Log rate limiting info
    if (req.get('X-RateLimit-Limit')) {
        console.log(`[${timestamp}] ⚡ Rate Limit: ${req.get('X-RateLimit-Remaining')}/${req.get('X-RateLimit-Limit')}`);
    }

    next();
});

// Rate limiting - Fixed to allow health checks and Render monitoring
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Increased limit
    message: {
        error: 'Too many requests, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health checks and Render's monitoring
        if (req.path === '/health' || req.path === '/api/health') return true;
        if (req.get('User-Agent') && req.get('User-Agent').includes('Render')) return true;
        if (req.get('User-Agent') && req.get('User-Agent').includes('UptimeRobot')) return true;
        return false;
    }
});
app.use('/api/', limiter);

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
            dashboard: '/api/dashboard'
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

// API Routes
app.use('/api/auth', authRateLimit, authRoutes);
app.use('/api/admin-auth', authRateLimit, adminAuthRoutes);
app.use('/api/students', apiRateLimit, studentRoutes);
app.use('/api/admin', apiRateLimit, adminRoutes);
app.use('/api/dashboard', apiRateLimit, dashboardRoutes);
app.use('/api/documents', uploadRateLimit, documentRoutes);
app.use('/api/security', apiRateLimit, securityRoutes);
app.use('/api/performance', apiRateLimit, performanceRoutes);
app.use('/api/contact', apiRateLimit, contactRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate field value entered'
        });
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// Database connection
const connectDB = async () => {
    try {
        // Check if MONGODB_URI is set
        if (!process.env.MONGODB_URI) {
            console.warn('⚠️ MONGODB_URI environment variable is not set. Using default local MongoDB.');
            process.env.MONGODB_URI = 'mongodb://localhost:27017/swagat_odisha';
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        console.error('Please ensure MONGODB_URI environment variable is set correctly or MongoDB is running locally.');
        // Don't exit the process, let the server run without database
        console.log('⚠️ Server will continue running without database connection.');
    }
};

// Environment variable validation
const validateEnvironment = () => {
    // Set default values for development
    if (!process.env.MONGODB_URI) {
        process.env.MONGODB_URI = 'mongodb://localhost:27017/swagat_odisha';
        console.warn('⚠️ MONGODB_URI not set, using default:', process.env.MONGODB_URI);
    }

    if (!process.env.JWT_SECRET) {
        process.env.JWT_SECRET = 'your_jwt_secret_key_here_development_only_change_in_production';
        console.warn('⚠️ JWT_SECRET not set, using default (CHANGE IN PRODUCTION!)');
    }

    console.log('✅ Environment variables configured');
};

// Initialize Socket.IO
const socketManager = new SocketManager(server);

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        validateEnvironment();

        // Start server first, then connect to database
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`📊 API Health check: http://localhost:${PORT}/api/health`);
            console.log(`🔌 Socket.IO server initialized`);
        });

        // Try to connect to database (non-blocking)
        connectDB().catch(error => {
            console.error('⚠️ Database connection failed, but server is running:', error.message);
            console.log('🔄 Will retry database connection...');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();

module.exports = { app, server, socketManager };
