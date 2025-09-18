const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Redis and workflow imports
const redisManager = require('./config/redis');
const workflowEngine = require('./utils/workflowEngine');
const queueProcessor = require('./utils/queueProcessor');
const RealTimeManager = require('./utils/realTimeManager');
const redisApplicationController = require('./controllers/redisApplicationController');

// Database imports
const mongoose = require('mongoose');
const User = require('./models/User');
const StudentApplication = require('./models/StudentApplication');

// Middleware imports
const auth = require('./middleware/auth');
const { addSocketManager } = require('./middleware/socket');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Redis connection
async function initializeRedis() {
    console.log('Initializing Redis connection...');
    const connected = await redisManager.connect();
    if (!connected) {
        console.error('Failed to connect to Redis. Exiting...');
        process.exit(1);
    }
    console.log('Redis connected successfully');
}

// Initialize database connection
async function initializeDatabase() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swagatodisha';
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
}

// Middleware setup
app.use(helmet());
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://www.swagatodisha.com',
        'https://swagatodisha.com',
        'https://swagatodisha.vercel.app'
    ],
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads/documents');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF, JPG, PNG, DOC, and DOCX files are allowed'));
        }
    }
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const redisHealth = await redisManager.healthCheck();
        const queueHealth = await queueProcessor.healthCheck();

        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                redis: redisHealth,
                queue: queueHealth,
                database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Redis Application Routes
app.post('/api/redis/application/create', auth, redisApplicationController.createApplication.bind(redisApplicationController));
app.get('/api/redis/application/status/:submissionId', auth, redisApplicationController.getApplicationStatus.bind(redisApplicationController));
app.post('/api/redis/application/draft', auth, redisApplicationController.saveDraft.bind(redisApplicationController));
app.get('/api/redis/application/draft/:draftId', auth, redisApplicationController.loadDraft.bind(redisApplicationController));
app.post('/api/redis/document/upload', auth, upload.single('file'), redisApplicationController.uploadDocument.bind(redisApplicationController));
app.get('/api/redis/document/status/:jobId', auth, redisApplicationController.getDocumentStatus.bind(redisApplicationController));
app.post('/api/redis/workflow/resume/:submissionId', auth, redisApplicationController.resumeWorkflow.bind(redisApplicationController));
app.get('/api/redis/applications', auth, redisApplicationController.getUserApplications.bind(redisApplicationController));
app.get('/api/redis/applications/all', auth, redisApplicationController.getAllApplications.bind(redisApplicationController));
app.put('/api/redis/application/:applicationId/status', auth, redisApplicationController.updateApplicationStatus.bind(redisApplicationController));
app.get('/api/redis/health', redisApplicationController.healthCheck.bind(redisApplicationController));

// Test endpoints for development
if (process.env.NODE_ENV === 'development') {
    app.post('/api/test/create-dummy-student', async (req, res) => {
        try {
            const { count = 1 } = req.body;
            const students = [];

            for (let i = 0; i < count; i++) {
                const student = new User({
                    fullName: `Test Student ${i + 1}`,
                    email: `teststudent${i + 1}@example.com`,
                    phoneNumber: `987654321${i}`,
                    password: 'password123',
                    role: 'student',
                    isActive: true,
                    referralCode: `REF${Date.now()}${i}`
                });

                await student.save();
                students.push(student);
            }

            res.json({
                success: true,
                message: `Created ${count} dummy students`,
                students: students.map(s => ({
                    id: s._id,
                    name: s.fullName,
                    email: s.email,
                    referralCode: s.referralCode
                }))
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    app.post('/api/test/create-dummy-application', async (req, res) => {
        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'userId is required'
                });
            }

            const applicationData = {
                personalDetails: {
                    fullName: 'Test Student',
                    fathersName: 'Test Father',
                    mothersName: 'Test Mother',
                    dateOfBirth: new Date('2000-01-01'),
                    gender: 'Male',
                    aadharNumber: `1234567890${Date.now()}`
                },
                contactDetails: {
                    primaryPhone: '9876543210',
                    whatsappNumber: '9876543210',
                    email: 'test@example.com',
                    permanentAddress: {
                        street: 'Test Street',
                        city: 'Test City',
                        state: 'Odisha',
                        pincode: '751001',
                        country: 'India'
                    }
                },
                courseDetails: {
                    selectedCourse: 'B.Tech Computer Science',
                    stream: 'Engineering'
                },
                guardianDetails: {
                    guardianName: 'Test Guardian',
                    relationship: 'Father',
                    guardianPhone: '9876543210',
                    guardianEmail: 'guardian@example.com'
                },
                financialDetails: {
                    annualIncome: '500000',
                    occupation: 'Business'
                },
                referralCode: '',
                documents: {}
            };

            const result = await workflowEngine.startApplicationSubmission(userId, applicationData);

            res.json({
                success: true,
                message: 'Dummy application created',
                submissionId: result.submissionId
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    app.get('/api/test/redis-stats', async (req, res) => {
        try {
            const stats = await queueProcessor.getQueueStats();
            const redisHealth = await redisManager.healthCheck();

            res.json({
                success: true,
                data: {
                    redis: redisHealth,
                    queues: stats,
                    timestamp: new Date()
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    app.post('/api/test/cleanup', async (req, res) => {
        try {
            // Clean up test data
            await User.deleteMany({ email: /teststudent/ });
            await StudentApplication.deleteMany({ 'personalDetails.fullName': 'Test Student' });

            // Clean up Redis test data
            const keys = await redisManager.client.keys('*test*');
            if (keys.length > 0) {
                await redisManager.client.del(keys);
            }

            res.json({
                success: true,
                message: 'Test data cleaned up'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Initialize server
async function startServer() {
    try {
        // Initialize Redis
        await initializeRedis();

        // Initialize Database
        await initializeDatabase();

        // Start queue processors
        await queueProcessor.startAllWorkers();

        // Create HTTP server
        const server = require('http').createServer(app);

        // Initialize real-time manager
        const realTimeManager = new RealTimeManager(server);

        // Add socket manager to requests
        app.use(addSocketManager(realTimeManager));

        // Start server
        server.listen(PORT, () => {
            console.log(`🚀 Redis-powered server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`🧪 Test endpoints available in development mode`);
        });

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('SIGTERM received, shutting down gracefully...');
            await queueProcessor.stopAllWorkers();
            await redisManager.cleanup();
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });

        process.on('SIGINT', async () => {
            console.log('SIGINT received, shutting down gracefully...');
            await queueProcessor.stopAllWorkers();
            await redisManager.cleanup();
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = app;
