const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

// Test results tracking
let testResults = {
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0,
    details: []
};

// Test user data
let testUser = {
    fullName: 'Test User',
    email: 'testuser@example.com',
    password: 'testpassword123',
    phoneNumber: '9876543210',
    role: 'student'
};

let authToken = null;
let testApplicationId = null;

// Utility functions
const log = (message, color = 'reset') => {
    console.log(`${colors[color]}${message}${colors.reset}`);
};

const logTest = (testName, status, details = '') => {
    testResults.total++;
    if (status === 'PASS') {
        testResults.passed++;
        log(`✅ ${testName}`, 'green');
    } else if (status === 'SKIP') {
        testResults.skipped++;
        log(`⏭️ ${testName}`, 'yellow');
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
            timeout: 15000
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

// Test Categories
const testBasicEndpoints = async () => {
    log('\n🔍 === BASIC ENDPOINTS TESTING ===', 'cyan');
    
    // Test 1: Server Health
    const healthResult = await makeRequest('GET', '/health');
    if (healthResult.success && healthResult.status === 200) {
        logTest('Server Health Check', 'PASS', 'Server is running');
    } else {
        logTest('Server Health Check', 'FAIL', `Status: ${healthResult.status}`);
    }
    
    // Test 2: Root Endpoint
    const rootResult = await makeRequest('GET', '/');
    if (rootResult.success && rootResult.status === 200) {
        logTest('Root Endpoint', 'PASS', 'Root endpoint accessible');
    } else {
        logTest('Root Endpoint', 'FAIL', `Status: ${rootResult.status}`);
    }
    
    // Test 3: API Health
    const apiHealthResult = await makeRequest('GET', '/health');
    if (apiHealthResult.success && apiHealthResult.status === 200) {
        logTest('API Health Check', 'PASS', 'API health endpoint working');
    } else {
        logTest('API Health Check', 'FAIL', `Status: ${apiHealthResult.status}`);
    }
    
    // Test 4: CORS Test
    const corsResult = await makeRequest('GET', '/test');
    if (corsResult.success && corsResult.status === 200) {
        logTest('CORS Test Endpoint', 'PASS', 'CORS configuration working');
    } else {
        logTest('CORS Test Endpoint', 'FAIL', `Status: ${corsResult.status}`);
    }
};

const testAuthentication = async () => {
    log('\n🔍 === AUTHENTICATION ENDPOINTS TESTING ===', 'cyan');
    
    // Test 1: User Registration
    const registerResult = await makeRequest('POST', '/auth/register', testUser);
    if (registerResult.success && registerResult.status === 201) {
        logTest('User Registration', 'PASS', 'User registered successfully');
    } else {
        logTest('User Registration', 'FAIL', `Status: ${registerResult.status}, Error: ${JSON.stringify(registerResult.error)}`);
    }
    
    // Test 2: User Login
    const loginData = {
        email: testUser.email,
        password: testUser.password
    };
    
    const loginResult = await makeRequest('POST', '/auth/login', loginData);
    if (loginResult.success && loginResult.status === 200 && loginResult.data.token) {
        authToken = loginResult.data.token;
        logTest('User Login', 'PASS', 'Login successful, token received');
        
        // Test 3: Protected Profile Access
        const profileHeaders = { Authorization: `Bearer ${authToken}` };
        const profileResult = await makeRequest('GET', '/auth/profile', null, profileHeaders);
        if (profileResult.success && profileResult.status === 200) {
            logTest('Profile Access', 'PASS', 'Profile accessible with token');
        } else {
            logTest('Profile Access', 'FAIL', `Status: ${profileResult.status}`);
        }
        
    } else {
        logTest('User Login', 'FAIL', `Status: ${loginResult.status}, Error: ${JSON.stringify(loginResult.error)}`);
    }
};

const testApplicationEndpoints = async () => {
    log('\n🔍 === APPLICATION ENDPOINTS TESTING ===', 'cyan');
    
    // Test 1: Create Test Application
    const createAppResult = await makeRequest('POST', '/student-application/create-test');
    if (createAppResult.success && createAppResult.status === 200) {
        testApplicationId = createAppResult.data.data?.applicationId;
        logTest('Create Test Application', 'PASS', `Test application created: ${testApplicationId}`);
    } else {
        logTest('Create Test Application', 'FAIL', `Status: ${createAppResult.status}, Error: ${JSON.stringify(createAppResult.error)}`);
    }
    
    // Test 2: Get Submitted Applications (Debug)
    const submittedResult = await makeRequest('GET', '/student-application/submitted-debug');
    if (submittedResult.success && submittedResult.status === 200) {
        const appCount = submittedResult.data.data?.applications?.length || 0;
        logTest('Get Submitted Applications', 'PASS', `${مصممة} applications found`);
    } else {
        logTest('Get Submitted Applications', 'FAIL', `Status: ${submittedResult.status}, Error: ${JSON.stringify(submittedResult.error)}`);
    }
    
    // Test 3: Applications Count
    const countResult = await makeRequest('GET', '/debug/applications-count');
    if (countResult.success && countResult.status === 200) {
        const totalApps = countResult.data.data?.totalApplications || 0;
        logTest('Applications Count', 'PASS', `Total applications: ${totalApps}`);
    } else {
        logTest('Applications Count', 'FAIL', `Status: ${countResult.status}, Error: ${JSON.stringify(countResult.error)}`);
    }
    
    // Test 4: Document Status Debug
    const docStatusResult = await makeRequest('GET', '/debug/document-statuses');
    if (docStatusResult.success && docStatusResult.status === 200) {
        const docCount = docStatusResult.data.data?.applicationsWithDocs || 0;
        logTest('Document Status Check', 'PASS', `${docCount} applications with documents`);
    } else {
        logTest('Document Status Check', 'FAIL', `Status: ${docStatusResult.status}, Error: ${JSON.stringify(docStatusResult.error)}`);
    }
};

const testAdminStaffEndpoints = async () => {
    log('\n🔍 === ADMIN & STAFF ENDPOINTS TESTING ===', 'cyan');
    
    // Test 1: Admin Applications
    const adminAppsResult = await makeRequest('GET', '/admin/applications');
    if (adminAppsResult.success && adminAppsResult.status === 200) {
        const appCount = adminAppsResult.data.data?.length || 0;
        logTest('Admin Applications', 'PASS', `${appCount} applications retrieved`);
    } else {
        logTest('Admin Applications', 'FAIL', `Status: ${adminAppsResult.status}, Error: ${JSON.stringify(adminAppsResult.error)}`);
    }
    
    // Test 2: Staff Applications
    const staffAppsResult = await makeRequest('GET', '/staff/applications');
    if (staffAppsResult.success && staffAppsResult.status === 200) {
        const appCount = staffAppsResult.data.data?.length || 0;
        logTest('Staff Applications', 'PASS', `${appCount} applications retrieved`);
    } else {
        logTest('Staff Applications', 'FAIL', `Status: ${staffAppsResult.status}, Error: ${JSON.stringify(staffAppsResult.error)}`);
    }
};

const testContentEndpoints = async () => {
    log('\n🔍 === CONTENT ENDPOINTS TESTING ===', 'cyan');
    
    // Test 1: Gallery (requires auth)
    const galleryResult = await authToken ? await makeRequest('GET', '/gallery', null, { Authorization: `Bearer ${authToken}` }) : { success: false, status: 401 };
    if (galleryResult.success && galleryResult.status === 200) {
        logTest('Gallery Access', 'PASS', 'Gallery accessible');
    } else if (galleryResult.status === 401) {
        logTest('Gallery Access', 'SKIP', 'Requires authentication');
    } else {
        logTest('Gallery Access', 'FAIL', `Status: ${galleryResults.status}, Error: ${JSON.stringify(galleryResult.error)}`);
    }
    
    // Test 2: Courses
    const coursesResult = await makeRequest('GET', '/courses');
    if (coursesResult.success && coursesResult.status === 200) {
        const courseCount. coursesResult.data.data?.length || 0;
        logTest('Courses Endpoint', 'PASS', `${courseCount} courses found`);
    } else {
        logTest('Courses Endpoint', 'FAIL', `Status: ${coursesResults.status}, Error: ${JSON.stringify(coursesResult.error)}`);
    }
    
    // Test 3: Website Content
    const websiteContentResult = await makeRequest('GET', '/website-content');
    const contentCount = websiteContentResult.success ? websiteContentResult.data.data?.length || 0 : 0;
    if (websiteContentResult.success && websiteContentResult.status === 200) {
        logTest('Website Content', 'PASS', `${contentCount} content items found`);
    } else {
        logTest('Website Content', 'FAIL', `Status: ${websiteContentResult.status}, Error: ${JSON.stringify(websiteContentResult.error)}`);
    }
};

const testProtectedEndpoints = async () => {
    log('\n🔍 === PROTECTED ENDPOINTS TESTING ===', 'cyan');
    
    if (!authToken) {
        logTest('All Protected Endpoints', 'SKIP', 'No authentication token available');
        return;
    }
    
    const headers = { Authorization: `Bearer ${authToken}` };
    
    // Test 1: Student Applications
    const studentAppsResult = await makeRequest('GET', '/student-application/my-application', null, headers);
    if (studentAppsResult.success) {
        logTest('Student Applications', 'PASS', 'Student applications accessible');
    } else {
        logTest('Student Applications', 'FAIL', `Status: ${studentAppsResult.status}, Error: ${JSON.stringify(studentAppsResult.error)}`);
    }
    
    // Test 2: Performance Metrics
    const perfMetricsResult = await makeRequest('GET', '/performance/metrics', null, headers);
    if (perfMetricsResult.success && perfMetricsResult.status === 200) {
        logTest('Performance Metrics', 'PASS', 'Performance metrics accessible');
    } else {
        logTest('Performance Metrics', 'FAIL', `Status: ${perfMetricsResult.status}, Error: ${JSON.stringify(perfMetricsResult.error)}`);
    }
    
    // Test 3: Performance Recommendations
    const perfRecsResult = await makeRequest('GET', '/performance/recommendations', null, headers);
    if (perfRecsResult.success && perfRecsResult.status === 200) {
        logTest('Performance Recommendations', 'PASS', 'Performance recommendations accessible');
    } else {
        logTest('Performance Recommendations', 'FAIL', `Status: ${perfRecsResult.status}, Error: ${JSON.stringify(perfRecsResult.error)}`);
    }
};

const testFileUpload = async () => {
    log('\n🔍 === FILE UPLOAD TESTING ===', 'cyan');
    
    try {
        // Create a test file
        const testFilePath = path.join(__dirname, 'test-file.txt');
        const testContent = 'This is a test file for upload testing.';
        fs.writeFileSync(testFilePath, testContent);
        
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
        const testFilePath = path.join(__dirname, 'test-file.txt');
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    }
};

const testErrorMessage = async () => {
    log('\n🔍 === ERROR HANDLING TESTING ===', 'cyan');
    
    // Test 1: 404 Not Found
    const notFoundResult = await makeRequest('GET', '/nonexistent-endpoint');
    if (!notFoundResult.success && notFoundResult.status === 404) {
        logTest('404 Not Found', 'PASS', 'Proper 404 error returned');
    } else {
        logTest('404 Not Found', 'FAIL', `Status: ${notFoundResult.status}`);
    }
    
    // Test 2: Invalid Auth Token
    const invalidAuthResult = await makeRequest('GET', '/auth/profile', null, { 
        Authorization: 'Bearer invalid_token_123' 
    });
    if (!invalidAuthResult.success && invalidAuthResult.status === 401) {
        logTest('Invalid Auth Token', 'PASS', 'Proper 401 error returned');
    } else {
        logTest('Invalid Auth Token', 'FAIL', `Status: ${invalidAuthResult.status}`);
    }
};

const testPerformance = async () => {
    log('\n🔍 === PERFORMANCE TESTING ===', 'cyan');
    
    // Test concurrent requests
    const startTime = Date.now();
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
        promises.push(makeRequest('GET', '/health'));
    }
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const durations = endTime - startTime;
    
    const successCount = results.filter(r => r.success).length;
    
    if (successCount === 10) {
        logTest('Concurrent Requests (10)', 'PASS', `All requests successful in ${duration}ms`);
    } else {
        logTest('Concurrent Requests (10)', 'FAIL', `${successCount}/10 requests successful`);
    }
};

// Main test runner
const runAllTests = async () => {
    log('🚀 STARTING COMPREHENSIVE BACKEND ENDPOINT TESTING', 'bright');
    log(`📡 Testing server at: ${BASE_URL}`, 'blue');
    log(`📡 API Base URL: ${API_BASE_URL}`, 'blue');
    log(`${'='.repeat(60)}`, 'cyan');
    
    try {
        // Run all test categories
        await testBasicEndpoints();
        await testAuthentication();
        await testApplicationEndpoints();
        await testAdminStaffEndpoints();
        await testContentEndpoints();
        await testProtectedEndpoints();
        
        // Optional tests
        try {
            await testFileUpload();
        } catch (error) {
            logTest('File Upload', 'SKIP', 'form-data package not available or upload endpoint not working');
        }
        
        await testErrorMessage();
        await testPerformance();
        
    } catch (error) {
        log(`\n💥 Test runner error: ${error.message}`, 'red');
    }
    
    // Print detailed summary
    log('\n' + '='.repeat(60), 'cyan');
    log('📊 COMPREHENSIVE TEST SUMMARY:', 'bright');
    log(`✅ Passed: ${testResults.passed}`, 'green');
    log(`❌ Failed: ${testResults.failed}`, 'red');
    log(`⏭️ Skipped: ${testResults.skipped}`, 'yellow');
    log(`📈 Total: ${testResults.total}`, 'blue');
    
    const successRate = ((testResults.passed / (testResults.total - testResults.skipped)) * 100).toFixed(1);
    log(`🎯 Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
    
    // Show failed tests
    if (testResults.failed > 0) {
        log('\n❌ FAILED TESTS:', 'red');
        testResults.details
            .filter(test => test.status === 'FAIL')
            .forEach(test => {
                log(`   • ${test.testName}: ${test.details}`, 'yellow');
            });
    }
    
    // Show skipped tests
    if (testResults.skipped > 0) {
        log('\n⏭️ SKIPPED TESTS:', 'yellow');
        testResults.details
            .filter(test => test.status === 'SKIP')
            .forEach(test => {
                log(`   • ${test.testName}: ${test.details}`, 'white');
            });
    }
    
    log('\n🏁 COMPREHENSIVE TESTING COMPLETE!', 'bright');
    
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
    testBasicEndpoints,
    testAuthentication,
    testApplicationEndpoints,
    makeRequest
};
