const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const adminRoutes = require('./routes/admin');
const adminAuthRoutes = require('./routes/adminAuth');
const dashboardRoutes = require('./routes/dashboard');

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
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
            'https://swagatodisha.vercel.app'
        ];

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
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
        'Pragma'
    ],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// CORS debugging middleware
app.use((req, res, next) => {
    console.log('Request origin:', req.headers.origin);
    console.log('Request method:', req.method);
    console.log('Request path:', req.path);
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
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
app.use('/api/auth', authRoutes);
app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);

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

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        validateEnvironment();

        // Start server first, then connect to database
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`📊 API Health check: http://localhost:${PORT}/api/health`);
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

module.exports = app;
