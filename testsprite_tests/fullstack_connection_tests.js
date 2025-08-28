const axios = require('axios');
const mongoose = require('mongoose');

// Test Configuration
const BACKEND_URL = 'https://swagat-odisha-backend.onrender.com';
const HEALTH_ENDPOINT = '/health';
const AUTH_ENDPOINT = '/api/auth';
const STUDENTS_ENDPOINT = '/api/students';

// Test Results Storage
const testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
};

// Utility Functions
const logTest = (testName, passed, details = '') => {
    testResults.total++;
    if (passed) {
        testResults.passed++;
        console.log(`✅ ${testName}: PASSED`);
    } else {
        testResults.failed++;
        console.log(`❌ ${testName}: FAILED - ${details}`);
    }
    testResults.details.push({ testName, passed, details });
};

const logSection = (title) => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🧪 ${title}`);
    console.log(`${'='.repeat(50)}`);
};

// Test 1: Backend Health Check
const testBackendHealth = async () => {
    logSection('Backend Health Check');
    
    try {
        const response = await axios.get(`${BACKEND_URL}${HEALTH_ENDPOINT}`);
        
        if (response.status === 200 && response.data.status === 'OK') {
            logTest('Health Endpoint', true, `Response: ${JSON.stringify(response.data)}`);
        } else {
            logTest('Health Endpoint', false, `Unexpected response: ${JSON.stringify(response.data)}`);
        }
    } catch (error) {
        logTest('Health Endpoint', false, `Error: ${error.message}`);
    }
};

// Test 2: Frontend Environment Configuration
const testFrontendConfig = () => {
    logSection('Frontend Configuration Check');
    
    // Check if environment.js exists and has correct configuration
    try {
        const fs = require('fs');
        const path = require('path');
        
        const envFile = path.join(__dirname, '../frontend/src/config/environment.js');
        if (fs.existsSync(envFile)) {
            const content = fs.readFileSync(envFile, 'utf8');
            
            if (content.includes('https://swagat-odisha-backend.onrender.com')) {
                logTest('Production API URL', true, 'Correct backend URL configured');
            } else {
                logTest('Production API URL', false, 'Backend URL not found in environment config');
            }
            
            if (content.includes('axios')) {
                logTest('Axios Import', true, 'Axios is properly imported');
            } else {
                logTest('Axios Import', false, 'Axios import not found');
            }
        } else {
            logTest('Environment Config File', false, 'environment.js file not found');
        }
    } catch (error) {
        logTest('Environment Config Check', false, `Error: ${error.message}`);
    }
};

// Test 3: Package Dependencies Check
const testDependencies = () => {
    logSection('Package Dependencies Check');
    
    try {
        const fs = require('fs');
        const path = require('path');
        
        // Check frontend package.json
        const frontendPackage = path.join(__dirname, '../frontend/package.json');
        if (fs.existsSync(frontendPackage)) {
            const pkg = JSON.parse(fs.readFileSync(frontendPackage, 'utf8'));
            
            if (pkg.dependencies.axios) {
                logTest('Frontend Axios', true, `Version: ${pkg.dependencies.axios}`);
            } else {
                logTest('Frontend Axios', false, 'Axios not found in dependencies');
            }
        }
        
        // Check backend package.json
        const backendPackage = path.join(__dirname, '../backend/package.json');
        if (fs.existsSync(backendPackage)) {
            const pkg = JSON.parse(fs.readFileSync(backendPackage, 'utf8'));
            
            if (pkg.dependencies.mongodb && pkg.dependencies.mongoose) {
                logTest('Backend MongoDB', true, `MongoDB: ${pkg.dependencies.mongodb}, Mongoose: ${pkg.dependencies.mongoose}`);
            } else {
                logTest('Backend MongoDB', false, 'MongoDB dependencies not found');
            }
            
            if (pkg.dependencies.cloudinary) {
                logTest('Backend Cloudinary', true, `Version: ${pkg.dependencies.cloudinary}`);
            } else {
                logTest('Backend Cloudinary', false, 'Cloudinary not found in dependencies');
            }
            
            if (pkg.dependencies.axios) {
                logTest('Backend Axios', true, `Version: ${pkg.dependencies.axios}`);
            } else {
                logTest('Backend Axios', false, 'Axios not found in dependencies');
            }
        }
    } catch (error) {
        logTest('Dependencies Check', false, `Error: ${error.message}`);
    }
};

// Test 4: API Endpoints Test
const testAPIEndpoints = async () => {
    logSection('API Endpoints Test');
    
    try {
        // Test auth endpoint
        const authResponse = await axios.get(`${BACKEND_URL}${AUTH_ENDPOINT}`);
        logTest('Auth Endpoint', true, `Status: ${authResponse.status}`);
    } catch (error) {
        if (error.response?.status === 404) {
            logTest('Auth Endpoint', false, 'Endpoint not found (404)');
        } else {
            logTest('Auth Endpoint', false, `Error: ${error.message}`);
        }
    }
    
    try {
        // Test students endpoint
        const studentsResponse = await axios.get(`${BACKEND_URL}${STUDENTS_ENDPOINT}`);
        logTest('Students Endpoint', true, `Status: ${studentsResponse.status}`);
    } catch (error) {
        if (error.response?.status === 404) {
            logTest('Students Endpoint', false, 'Endpoint not found (404)');
        } else {
            logTest('Students Endpoint', false, `Error: ${error.message}`);
        }
    }
};

// Test 5: CORS Configuration Test
const testCORS = async () => {
    logSection('CORS Configuration Test');
    
    try {
        const response = await axios.get(`${BACKEND_URL}${HEALTH_ENDPOINT}`, {
            headers: {
                'Origin': 'http://localhost:5173'
            }
        });
        
        if (response.headers['access-control-allow-origin']) {
            logTest('CORS Headers', true, `CORS headers present: ${response.headers['access-control-allow-origin']}`);
        } else {
            logTest('CORS Headers', false, 'CORS headers not found');
        }
    } catch (error) {
        logTest('CORS Test', false, `Error: ${error.message}`);
    }
};

// Test 6: Response Time Test
const testResponseTime = async () => {
    logSection('Response Time Test');
    
    try {
        const startTime = Date.now();
        await axios.get(`${BACKEND_URL}${HEALTH_ENDPOINT}`);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        if (responseTime < 5000) {
            logTest('Response Time', true, `Response time: ${responseTime}ms`);
        } else {
            logTest('Response Time', false, `Response time too slow: ${responseTime}ms`);
        }
    } catch (error) {
        logTest('Response Time', false, `Error: ${error.message}`);
    }
};

// Test 7: Database Connection Test (via health endpoint)
const testDatabaseConnection = async () => {
    logSection('Database Connection Test');
    
    try {
        const response = await axios.get(`${BACKEND_URL}${HEALTH_ENDPOINT}`);
        
        if (response.data.status === 'OK') {
            logTest('Database Health', true, 'Backend reports healthy status');
        } else {
            logTest('Database Health', false, 'Backend reports unhealthy status');
        }
    } catch (error) {
        logTest('Database Health', false, `Error: ${error.message}`);
    }
};

// Test 8: Frontend API Utility Test
const testFrontendAPI = () => {
    logSection('Frontend API Utility Test');
    
    try {
        const fs = require('fs');
        const path = require('path');
        
        const apiFile = path.join(__dirname, '../frontend/src/utils/api.js');
        if (fs.existsSync(apiFile)) {
            const content = fs.readFileSync(apiFile, 'utf8');
            
            if (content.includes('axios.create')) {
                logTest('Axios Instance', true, 'Axios instance properly configured');
            } else {
                logTest('Axios Instance', false, 'Axios instance not found');
            }
            
            if (content.includes('interceptors.request')) {
                logTest('Request Interceptors', true, 'Request interceptors configured');
            } else {
                logTest('Request Interceptors', false, 'Request interceptors not found');
            }
            
            if (content.includes('interceptors.response')) {
                logTest('Response Interceptors', true, 'Response interceptors configured');
            } else {
                logTest('Response Interceptors', false, 'Response interceptors not found');
            }
        } else {
            logTest('API Utility File', false, 'api.js file not found');
        }
    } catch (error) {
        logTest('Frontend API Test', false, `Error: ${error.message}`);
    }
};

// Test 9: Environment Variables Check
const testEnvironmentVariables = () => {
    logSection('Environment Variables Check');
    
    try {
        const fs = require('fs');
        const path = require('path');
        
        const envExample = path.join(__dirname, '../backend/env.example');
        if (fs.existsSync(envExample)) {
            const content = fs.readFileSync(envExample, 'utf8');
            
            const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME'];
            requiredVars.forEach(varName => {
                if (content.includes(varName)) {
                    logTest(`Env Var: ${varName}`, true, 'Variable defined in example');
                } else {
                    logTest(`Env Var: ${varName}`, false, 'Variable not found in example');
                }
            });
        } else {
            logTest('Environment Example', false, 'env.example file not found');
        }
    } catch (error) {
        logTest('Environment Variables', false, `Error: ${error.message}`);
    }
};

// Test 10: Health Check Endpoint Configuration
const testHealthCheckConfig = () => {
    logSection('Health Check Configuration Test');
    
    try {
        const fs = require('fs');
        const path = require('path');
        
        const serverFile = path.join(__dirname, '../backend/server.js');
        if (fs.existsSync(serverFile)) {
            const content = fs.readFileSync(serverFile, 'utf8');
            
            if (content.includes('/health')) {
                logTest('Health Endpoint Route', true, 'Health endpoint route configured');
            } else {
                logTest('Health Endpoint Route', false, 'Health endpoint route not found');
            }
            
            if (content.includes('api/health')) {
                logTest('API Health Route', false, 'Found api/health - should be just /health for Render');
            } else {
                logTest('API Health Route', true, 'Health endpoint correctly configured as /health');
            }
        } else {
            logTest('Server File', false, 'server.js file not found');
        }
    } catch (error) {
        logTest('Health Check Config', false, `Error: ${error.message}`);
    }
};

// Main Test Runner
const runAllTests = async () => {
    console.log('🚀 Starting Fullstack Connection Tests...\n');
    
    try {
        await testBackendHealth();
        testFrontendConfig();
        testDependencies();
        await testAPIEndpoints();
        await testCORS();
        await testResponseTime();
        await testDatabaseConnection();
        testFrontendAPI();
        testEnvironmentVariables();
        testHealthCheckConfig();
        
        // Summary
        logSection('Test Summary');
        console.log(`📊 Total Tests: ${testResults.total}`);
        console.log(`✅ Passed: ${testResults.passed}`);
        console.log(`❌ Failed: ${testResults.failed}`);
        console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
        
        if (testResults.failed === 0) {
            console.log('\n🎉 All tests passed! Your fullstack setup is working correctly.');
        } else {
            console.log('\n⚠️  Some tests failed. Please review the details above.');
        }
        
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
    }
};

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = {
    runAllTests,
    testResults
};
