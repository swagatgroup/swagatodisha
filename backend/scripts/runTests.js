#!/usr/bin/env node

const RedisSystemTester = require('./testRedisSystem');
const axios = require('axios');

async function checkServerHealth() {
    try {
        const response = await axios.get('http://localhost:5000/health');
        if (response.data.status === 'healthy') {
            console.log('✅ Server is running and healthy');
            return true;
        } else {
            console.log('❌ Server is running but not healthy');
            return false;
        }
    } catch (error) {
        console.log('❌ Server is not running or not accessible');
        console.log('   Please start the server with: npm run dev:redis');
        return false;
    }
}

async function main() {
    console.log('🚀 Redis System Test Runner');
    console.log('============================\n');

    // Check if server is running
    const isHealthy = await checkServerHealth();
    if (!isHealthy) {
        process.exit(1);
    }

    console.log('\nStarting comprehensive Redis system tests...\n');

    // Run all tests
    const tester = new RedisSystemTester();
    await tester.runAllTests();
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run the tests
main().catch(console.error);
