const mongoose = require('mongoose');
const { r2Client, testR2Connection } = require('./config/r2');
require('dotenv').config();

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

const log = (message, color = 'reset') => {
    console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSuccess = (message) => log(`✅ ${message}`, 'green');
const logError = (message) => log(`❌ ${message}`, 'red');
const logWarning = (message) => log(`⚠️ ${message}`, 'yellow');
const logInfo = (message) => log(`ℹ️ ${message}`, 'blue');
const logBold = (message) => log(`\n${message}`, 'bold');

// Test MongoDB connection
const testMongoDB = async () => {
    logBold('Testing MongoDB Connection...');

    try {
        if (!process.env.MONGO_URI) {
            logWarning('MONGO_URI not set in environment variables');
            return false;
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });

        logSuccess(`MongoDB Connected: ${conn.connection.host}`);
        logInfo(`Database: ${conn.connection.name}`);

        // Test a simple operation
        const collections = await conn.connection.db.listCollections().toArray();
        logInfo(`Collections found: ${collections.length}`);

        await mongoose.connection.close();
        return true;
    } catch (error) {
        logError(`MongoDB connection failed: ${error.message}`);
        return false;
    }
};

// Test Cloudflare R2 connection
const testR2 = async () => {
    logBold('Testing Cloudflare R2 Connection...');

    try {
        const requiredEnvVars = [
            'R2_ACCOUNT_ID',
            'R2_ACCESS_KEY_ID',
            'R2_SECRET_ACCESS_KEY',
            'R2_BUCKET_NAME',
            'R2_ENDPOINT'
        ];

        const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
        if (missingVars.length > 0) {
            logError(`Missing environment variables: ${missingVars.join(', ')}`);
            return false;
        }

        logInfo(`Account ID: ${process.env.R2_ACCOUNT_ID}`);
        logInfo(`Bucket: ${process.env.R2_BUCKET_NAME}`);
        logInfo(`Endpoint: ${process.env.R2_ENDPOINT}`);

        const connected = await testR2Connection();
        if (connected) {
            logSuccess('Cloudflare R2 connection successful');
            return true;
        } else {
            logError('Cloudflare R2 connection failed');
            return false;
        }
    } catch (error) {
        logError(`R2 connection error: ${error.message}`);
        return false;
    }
};

// Test file upload functionality
const testFileUpload = async () => {
    logBold('Testing File Upload Functionality...');

    try {
        const { PutObjectCommand } = require('@aws-sdk/client-s3');

        // Create a test file
        const testContent = 'This is a test file for Swagat Odisha backend';
        const testFileName = `test-${Date.now()}.txt`;

        const uploadCommand = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: testFileName,
            Body: testContent,
            ContentType: 'text/plain',
            Metadata: {
                test: 'true',
                uploadedBy: 'test-script'
            }
        });

        await r2Client.send(uploadCommand);
        logSuccess(`Test file uploaded: ${testFileName}`);

        // Clean up test file
        const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: testFileName
        });

        await r2Client.send(deleteCommand);
        logInfo('Test file cleaned up');

        return true;
    } catch (error) {
        logError(`File upload test failed: ${error.message}`);
        return false;
    }
};

// Test environment variables
const testEnvironment = () => {
    logBold('Testing Environment Variables...');

    const requiredVars = {
        'MONGO_URI': 'MongoDB connection string',
        'R2_ACCOUNT_ID': 'Cloudflare R2 Account ID',
        'R2_ACCESS_KEY_ID': 'Cloudflare R2 Access Key ID',
        'R2_SECRET_ACCESS_KEY': 'Cloudflare R2 Secret Access Key',
        'R2_BUCKET_NAME': 'Cloudflare R2 Bucket Name',
        'R2_ENDPOINT': 'Cloudflare R2 Endpoint URL',
        'PORT': 'Server Port (optional)',
        'NODE_ENV': 'Node Environment (optional)',
        'MAX_FILE_SIZE': 'Maximum file size (optional)'
    };

    let allPresent = true;

    Object.entries(requiredVars).forEach(([varName, description]) => {
        if (process.env[varName]) {
            logSuccess(`${varName}: Set`);
        } else {
            logError(`${varName}: Missing - ${description}`);
            allPresent = false;
        }
    });

    return allPresent;
};

// Main test function
const runTests = async () => {
    logBold('🚀 Swagat Odisha Backend Connection Test');
    log('='.repeat(50));

    const results = {
        environment: false,
        mongodb: false,
        r2: false,
        fileUpload: false
    };

    // Test environment variables
    results.environment = testEnvironment();

    if (!results.environment) {
        logError('\n❌ Environment test failed. Please set all required environment variables.');
        process.exit(1);
    }

    // Test MongoDB
    results.mongodb = await testMongoDB();

    // Test R2
    results.r2 = await testR2();

    // Test file upload if R2 is working
    if (results.r2) {
        results.fileUpload = await testFileUpload();
    }

    // Summary
    logBold('\n📊 Test Results Summary:');
    log('='.repeat(30));

    Object.entries(results).forEach(([test, passed]) => {
        if (passed) {
            logSuccess(`${test.toUpperCase()}: PASSED`);
        } else {
            logError(`${test.toUpperCase()}: FAILED`);
        }
    });

    const allPassed = Object.values(results).every(result => result);

    if (allPassed) {
        logBold('\n🎉 All tests passed! Your backend is ready for production.');
        process.exit(0);
    } else {
        logBold('\n⚠️ Some tests failed. Please check the errors above.');
        process.exit(1);
    }
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    logError(`Uncaught Exception: ${error.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    process.exit(1);
});

// Run tests
runTests().catch(error => {
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
});
