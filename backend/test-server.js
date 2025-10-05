const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Test results tracking
let testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
};

// Utility functions
const log = (message, color = 'reset') => {
    console.log(`${colors[color]}${message}${colors.reset}`);
};

const logTest = (testName, status, details = '') => {
    testResults.total++;
    if (status === 'PASS') {
        testResults.passed++;
        log(`✅ ${testName}`, 'green');
    } else {
        testResults.failed++;
        log(`❌ ${testName}`, 'red');
        if (details) log(`   Details: ${details}`, 'yellow');
    }
    testResults.details.push({ testName, status, details });
};

const makeRequest = async (method, url, data = null, headers = {}) => {
    try {
        const config = {
            method,
            url: `${API_BASE_URL}${url}`,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            timeout: 10000
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message,
            status: error.response?.status || 0
        };
    }
};

// Test functions
const testServerHealth = async () => {
    log('\n🔍 Testing Server Health...', 'cyan');
    
    const result = await makeRequest('GET', '/health');
    if (result.success && result.status === 200) {
        logTest('Server Health Check', 'PASS', 'Server is running and responding');
    } else {
        logTest('Server Health Check', 'FAIL', `Status: ${result.status}, Error: ${JSON.stringify(result.error)}`);
    }
};

const testRootEndpoint = async () => {
    log('\n🔍 Testing Root Endpoint...', 'cyan');
    
    const result = await makeRequest('GET', '/');
    if (result.success && result.status === 200) {
        logTest('Root Endpoint', 'PASS', 'Root endpoint accessible');
    } else {
        logTest('Root Endpoint', 'FAIL', `Status: ${result.status}, Error: ${JSON.stringify(result.error)}`);
    }
};

const testAuthEndpoints = async () => {
    log('\n🔍 Testing Authentication Endpoints...', 'cyan');
    
    // Test registration
    const testUser = {
        fullName: 'Test User',
        email: 'testuser@example.com',
        password: 'testpassword123',
        phoneNumber: '9876543210',
        role: 'student'
    };
    
    const registerResult = await makeRequest('POST', '/auth/register', testUser);
    if (registerResult.success && registerResult.status === 201) {
        logTest('User Registration', 'PASS', 'User registered successfully');
    } else {
        logTest('User Registration', 'FAIL', `Status: ${registerResult.status}, Error: ${JSON.stringify(registerResult.error)}`);
    }
    
    // Test login
    const loginData = {
        email: 'testuser@example.com',
        password: 'testpassword123'
    };
    
    const loginResult = await makeRequest('POST', '/auth/login', loginData);
    if (loginResult.success && loginResult.status === 200 && loginResult.data.token) {
        logTest('User Login', 'PASS', 'Login successful, token received');
        return loginResult.data.token; // Return token for other tests
    } else {
        logTest('User Login', 'FAIL', `Status: ${loginResult.status}, Error: ${JSON.stringify(loginResult.error)}`);
        return null;
    }
};

const testProtectedEndpoints = async (token) => {
    if (!token) {
        log('\n⚠️ Skipping Protected Endpoints Test - No valid token', 'yellow');
        return;
    }
    
    log('\n🔍 Testing Protected Endpoints...', 'cyan');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Test user profile
    const profileResult = await makeRequest('GET', '/auth/profile', null, headers);
    if (profileResult.success && profileResult.status === 200) {
        logTest('User Profile Access', 'PASS', 'Profile accessible with token');
    } else {
        logTest('User Profile Access', 'FAIL', `Status: ${profileResult.status}, Error: ${JSON.stringify(profileResult.error)}`);
    }
    
    // Test student applications
    const applicationsResult = await makeRequest('GET', '/student-application/my-application', null, headers);
    if (applicationsResult.success) {
        logTest('Student Applications Access', 'PASS', 'Applications endpoint accessible');
    } else {
        logTest('Student Applications Access', 'FAIL', `Status: ${applicationsResult.status}, Error: ${JSON.stringify(applicationsResult.error)}`);
    }
};

const testApplicationEndpoints = async () => {
    log('\n🔍 Testing Application Endpoints...', 'cyan');
    
    // Test create test application
    const createAppResult = await makeRequest('POST', '/student-application/create-test');
    if (createAppResult.success && createAppResult.status === 200) {
        logTest('Create Test Application', 'PASS', 'Test application created');
    } else {
        logTest('Create Test Application', 'FAIL', `Status: ${createAppResult.status}, Error: ${JSON.stringify(createAppResult.error)}`);
    }
    
    // Test get submitted applications
    const submittedResult = await makeRequest('GET', '/student-application/submitted-debug');
    if (submittedResult.success && submittedResult.status === 200) {
        logTest('Get Submitted Applications', 'PASS', 'Submitted applications retrieved');
    } else {
        logTest('Get Submitted Applications', 'FAIL', `Status: ${submittedResult.status}, Error: ${JSON.stringify(submittedResult.error)}`);
    }
    
    // Test applications count
    const countResult = await makeRequest('GET', '/debug/applications-count');
    if (countResult.success && countResult.status === 200) {
        logTest('Applications Count', 'PASS', `Total applications: ${countResult.data.data?.totalApplications || 0}`);
    } else {
        logTest('Applications Count', 'FAIL', `Status: ${countResult.status}, Error: ${JSON.stringify(countResult.error)}`);
    }
};

const testFileUpload = async () => {
    log('\n🔍 Testing File Upload...', 'cyan');
    
    // Create a test file
    const testFilePath = path.join(__dirname, 'test-file.txt');
    const testContent = 'This is a test file for upload testing.';
    fs.writeFileSync(testFilePath, testContent);
    
    try {
        // Test file upload using FormData
        const FormData = require('form-data');
        const form = new FormData();
        form.append('file', fs.createReadStream(testFilePath));
        form.append('documentType', 'test');
        
        const uploadResult = await axios.post(`${API_BASE_URL}/documents/upload`, form, {
            headers: {
                ...form.getHeaders(),
                'Content-Type': 'multipart/form-data'
            },
            timeout: 15000
        });
        
        if (uploadResult.status === 201) {
            logTest('File Upload', 'PASS', 'File uploaded successfully');
        } else {
            logTest('File Upload', 'FAIL', `Status: ${uploadResult.status}`);
        }
    } catch (error) {
        logTest('File Upload', 'FAIL', `Error: ${error.message}`);
    } finally {
        // Clean up test file
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    }
};

const testDatabaseConnection = async () => {
    log('\n🔍 Testing Database Connection...', 'cyan');
    
    // Test MongoDB connection by trying to create a user
    const testUser = {
        fullName: 'DB Test User',
        email: 'dbtest@example.com',
        password: 'dbtest123',
        phoneNumber: '9876543211',
        role: 'student'
    };
    
    const result = await makeRequest('POST', '/auth/register', testUser);
    if (result.success && result.status === 201) {
        logTest('Database Connection', 'PASS', 'Database is accessible and working');
    } else if (result.status === 400 && result.error?.message?.includes('already exists')) {
        logTest('Database Connection', 'PASS', 'Database is accessible (user already exists)');
    } else {
        logTest('Database Connection', 'FAIL', `Status: ${result.status}, Error: ${JSON.stringify(result.error)}`);
    }
};

const testCORS = async () => {
    log('\n🔍 Testing CORS Configuration...', 'cyan');
    
    try {
        const response = await axios.options(`${API_BASE_URL}/auth/login`, {
            headers: {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });
        
        if (response.status === 200) {
            logTest('CORS Preflight', 'PASS', 'CORS preflight request successful');
        } else {
            logTest('CORS Preflight', 'FAIL', `Status: ${response.status}`);
        }
    } catch (error) {
        logTest('CORS Preflight', 'FAIL', `Error: ${error.message}`);
    }
};

const testPerformance = async () => {
    log('\n🔍 Testing Performance Endpoints...', 'cyan');
    
    const startTime = Date.now();
    
    // Test multiple concurrent requests
    const promises = [];
    for (let i = 0; i < 5; i++) {
        promises.push(makeRequest('GET', '/health'));
    }
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const successCount = results.filter(r => r.success).length;
    
    if (successCount === 5) {
        logTest('Concurrent Requests', 'PASS', `All 5 requests successful in ${duration}ms`);
    } else {
        logTest('Concurrent Requests', 'FAIL', `${successCount}/5 requests successful`);
    }
};

// Main test runner
const runAllTests = async () => {
    log('🚀 Starting Server Tests...', 'bright');
    log(`📡 Testing server at: ${BASE_URL}`, 'blue');
    log('=' * 50, 'cyan');
    
    try {
        // Basic connectivity tests
        await testServerHealth();
        await testRootEndpoint();
        
        // Authentication tests
        const token = await testAuthEndpoints();
        
        // Protected endpoint tests
        await testProtectedEndpoints(token);
        
        // Application tests
        await testApplicationEndpoints();
        
        // Database tests
        await testDatabaseConnection();
        
        // CORS tests
        await testCORS();
        
        // Performance tests
        await testPerformance();
        
        // File upload tests (optional - requires form-data)
        try {
            await testFileUpload();
        } catch (error) {
            logTest('File Upload', 'SKIP', 'form-data package not available');
        }
        
    } catch (error) {
        log(`\n💥 Test runner error: ${error.message}`, 'red');
    }
    
    // Print summary
    log('\n' + '=' * 50, 'cyan');
    log('📊 Test Summary:', 'bright');
    log(`✅ Passed: ${testResults.passed}`, 'green');
    log(`❌ Failed: ${testResults.failed}`, 'red');
    log(`📈 Total: ${testResults.total}`, 'blue');
    
    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    log(`🎯 Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
    
    if (testResults.failed > 0) {
        log('\n❌ Failed Tests:', 'red');
        testResults.details
            .filter(test => test.status === 'FAIL')
            .forEach(test => {
                log(`   • ${test.testName}: ${test.details}`, 'yellow');
            });
    }
    
    log('\n🏁 Testing Complete!', 'bright');
    
    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
};

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(error => {
        log(`\n💥 Fatal error: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = {
    runAllTests,
    testServerHealth,
    testAuthEndpoints,
    testApplicationEndpoints,
    testDatabaseConnection,
    makeRequest
};


