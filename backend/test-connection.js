const mongoose = require('mongoose');
require('dotenv').config();

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bold: '\x1b[1m',
    reset: '\x1b[0m'
};

const logSuccess = (message) => console.log(`${colors.green}✅ ${message}${colors.reset}`);
const logError = (message) => console.log(`${colors.red}❌ ${message}${colors.reset}`);
const logInfo = (message) => console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
const logWarning = (message) => console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
const logBold = (message) => console.log(`${colors.bold}${colors.cyan}${message}${colors.reset}`);

// Test MongoDB connection
const testMongoDB = async () => {
    logBold('Testing MongoDB Connection...');

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        logSuccess('MongoDB connection successful');
        return true;
    } catch (error) {
        logError(`MongoDB connection failed: ${error.message}`);
        return false;
    }
};

// Test Cloudinary connection
const testCloudinary = async () => {
    logBold('Testing Cloudinary Connection...');

    try {
        const cloudinary = require('cloudinary').v2;

        const requiredEnvVars = [
            'CLOUDINARY_CLOUD_NAME',
            'CLOUDINARY_API_KEY',
            'CLOUDINARY_API_SECRET'
        ];

        const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
        if (missingVars.length > 0) {
            logError(`Missing Cloudinary environment variables: ${missingVars.join(', ')}`);
            return false;
        }

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        // Test connection by getting account info
        const result = await cloudinary.api.ping();
        if (result.status === 'ok') {
            logSuccess('Cloudinary connection successful');
            logInfo(`Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
            return true;
        } else {
            logError('Cloudinary connection failed');
            return false;
        }
    } catch (error) {
        logError(`Cloudinary connection error: ${error.message}`);
        return false;
    }
};

// Main test function
const runTests = async () => {
    console.log(`${colors.bold}${colors.magenta}🚀 Swagat Odisha Backend Connection Tests${colors.reset}\n`);

    const results = {
        mongodb: false,
        cloudinary: false
    };

    // Test MongoDB
    results.mongodb = await testMongoDB();

    // Test Cloudinary
    results.cloudinary = await testCloudinary();

    // Summary
    console.log(`\n${colors.bold}${colors.cyan}📊 Test Results Summary:${colors.reset}`);
    console.log(`${results.mongodb ? '✅' : '❌'} MongoDB: ${results.mongodb ? 'Connected' : 'Failed'}`);
    console.log(`${results.cloudinary ? '✅' : '❌'} Cloudinary: ${results.cloudinary ? 'Connected' : 'Failed'}`);

    const allPassed = Object.values(results).every(result => result);

    if (allPassed) {
        console.log(`\n${colors.green}${colors.bold}🎉 All tests passed! Your backend is ready to go!${colors.reset}`);
    } else {
        console.log(`\n${colors.red}${colors.bold}⚠️  Some tests failed. Please check your configuration.${colors.reset}`);
    }

    // Close MongoDB connection
    if (results.mongodb) {
        await mongoose.connection.close();
        logInfo('MongoDB connection closed');
    }

    process.exit(allPassed ? 0 : 1);
};

// Run tests
runTests().catch(error => {
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
});