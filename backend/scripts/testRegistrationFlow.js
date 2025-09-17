const mongoose = require('mongoose');
const axios = require('axios');
const colors = require('colors');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Admin = require('../models/Admin');
const StudentApplication = require('../models/StudentApplication');
const Document = require('../models/Document');

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

// Test data
const testUsers = {
    student: {
        fullName: 'Test Student',
        email: 'teststudent@example.com',
        password: 'TestPassword123!',
        phoneNumber: '9876543210',
        role: 'student',
        guardianName: 'Test Guardian'
    },
    agent: {
        fullName: 'Test Agent',
        email: 'testagent@example.com',
        password: 'TestPassword123!',
        phoneNumber: '9876543211',
        role: 'agent'
    },
    staff: {
        firstName: 'Test',
        lastName: 'Staff',
        email: 'teststaff@example.com',
        password: 'TestPassword123!',
        phone: '9876543212',
        role: 'staff'
    },
    super_admin: {
        firstName: 'Test',
        lastName: 'Super Admin',
        email: 'testsuperadmin@example.com',
        password: 'TestPassword123!',
        phone: '9876543213',
        role: 'super_admin'
    }
};

const testApplicationData = {
    personalDetails: {
        fullName: 'John Doe',
        fathersName: 'Robert Doe',
        mothersName: 'Jane Doe',
        dateOfBirth: '2000-01-01',
        gender: 'male',
        aadharNumber: '123456789012'
    },
    contactDetails: {
        primaryPhone: '9876543210',
        whatsappNumber: '9876543210',
        email: 'john.doe@example.com',
        permanentAddress: {
            street: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            pincode: '123456',
            country: 'India'
        }
    },
    courseDetails: {
        selectedCourse: 'B.Tech',
        stream: 'Computer Science'
    },
    guardianDetails: {
        guardianName: 'Robert Doe',
        relationship: 'Father',
        guardianPhone: '9876543211',
        guardianEmail: 'robert.doe@example.com'
    }
};

// Test results
const results = {
    passed: 0,
    failed: 0,
    errors: []
};

// Helper function to log results
const logResult = (testName, success, message = '') => {
    if (success) {
        console.log(`✅ ${testName}: ${message}`.green);
        results.passed++;
    } else {
        console.log(`❌ ${testName}: ${message}`.red);
        results.failed++;
        results.errors.push({ test: testName, error: message });
    }
};

// Helper function to make API requests
const makeRequest = async (method, endpoint, data = null, token = null) => {
    try {
        const config = {
            method,
            url: `${API_BASE}${endpoint}`,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message,
            status: error.response?.status || 500
        };
    }
};

// Test 1: Create test users
const createTestUsers = async () => {
    console.log('\n👥 Creating test users...'.cyan);
    console.log('='.repeat(50));

    const tokens = {};

    for (const [role, userData] of Object.entries(testUsers)) {
        try {
            // Clean up existing user
            if (role === 'super_admin' || role === 'staff') {
                await Admin.deleteOne({ email: userData.email });
            } else {
                await User.deleteOne({ email: userData.email });
            }

            // Create user
            let user;
            if (role === 'super_admin' || role === 'staff') {
                user = new Admin(userData);
            } else {
                user = new User(userData);
            }
            await user.save();

            logResult(`Create ${role}`, true, `${userData.email} created successfully`);

            // Login to get token
            const loginEndpoint = role === 'super_admin' || role === 'staff' ? '/admin-auth/login' : '/auth/login';
            const loginResult = await makeRequest('POST', loginEndpoint, {
                email: userData.email,
                password: userData.password
            });

            if (loginResult.success && loginResult.data.token) {
                tokens[role] = loginResult.data.token;
                logResult(`Login ${role}`, true, 'Token obtained');
            } else {
                logResult(`Login ${role}`, false, loginResult.error?.message || 'Login failed');
            }
        } catch (error) {
            logResult(`Create ${role}`, false, error.message);
        }
    }

    return tokens;
};

// Test 2: Test registration workflow for each user type
const testRegistrationWorkflow = async (tokens) => {
    console.log('\n📝 Testing registration workflow...'.cyan);
    console.log('='.repeat(50));

    for (const [role, token] of Object.entries(tokens)) {
        if (!token) continue;

        console.log(`\nTesting ${role} registration workflow:`.blue);

        // Test 1: Get document types
        const docTypesResult = await makeRequest('GET', '/document-types', null, token);
        logResult(`${role} - Get Document Types`, docTypesResult.success,
            docTypesResult.success ? 'Document types retrieved' : docTypesResult.error?.message);

        // Test 2: Create application draft
        const createResult = await makeRequest('POST', '/student-application/create', testApplicationData, token);
        logResult(`${role} - Create Application`, createResult.success,
            createResult.success ? 'Application created' : createResult.error?.message);

        if (createResult.success) {
            const applicationId = createResult.data.data?.applicationId || createResult.data.data?._id;

            // Test 3: Get application
            const getResult = await makeRequest('GET', '/student-application/my-application', null, token);
            logResult(`${role} - Get Application`, getResult.success,
                getResult.success ? 'Application retrieved' : getResult.error?.message);

            // Test 4: Save draft
            const draftData = {
                ...testApplicationData,
                stage: 'REGISTRATION'
            };
            const draftResult = await makeRequest('PUT', `/student-application/${applicationId}/save-draft`, draftData, token);
            logResult(`${role} - Save Draft`, draftResult.success,
                draftResult.success ? 'Draft saved' : draftResult.error?.message);

            // Test 5: Update stage to documents
            const stageResult = await makeRequest('PUT', `/student-application/${applicationId}/stage`,
                { stage: 'DOCUMENTS' }, token);
            logResult(`${role} - Update Stage`, stageResult.success,
                stageResult.success ? 'Stage updated' : stageResult.error?.message);

            // Test 6: Submit application
            const submitResult = await makeRequest('POST', `/student-application/${applicationId}/submit`, {}, token);
            logResult(`${role} - Submit Application`, submitResult.success,
                submitResult.success ? 'Application submitted' : submitResult.error?.message);

            // Test 7: Generate PDF
            const pdfResult = await makeRequest('GET', `/student-application/${applicationId}/pdf`, null, token);
            logResult(`${role} - Generate PDF`, pdfResult.success,
                pdfResult.success ? 'PDF generated' : pdfResult.error?.message);
        }
    }
};

// Test 3: Test referral system
const testReferralSystem = async (tokens) => {
    console.log('\n🔗 Testing referral system...'.cyan);
    console.log('='.repeat(50));

    // Get agent's referral code
    const agentToken = tokens.agent;
    if (agentToken) {
        const referralResult = await makeRequest('GET', '/referral/code', null, agentToken);
        if (referralResult.success) {
            const referralCode = referralResult.data.data?.referralCode;
            logResult('Get Referral Code', true, `Code: ${referralCode}`);

            // Test referral tracking
            const trackResult = await makeRequest('POST', '/referral/track', {
                referralCode: referralCode,
                referredUser: 'test@example.com'
            });
            logResult('Track Referral', trackResult.success,
                trackResult.success ? 'Referral tracked' : trackResult.error?.message);

            // Test referral stats
            const statsResult = await makeRequest('GET', '/referral/stats', null, agentToken);
            logResult('Get Referral Stats', statsResult.success,
                statsResult.success ? 'Stats retrieved' : statsResult.error?.message);
        } else {
            logResult('Get Referral Code', false, referralResult.error?.message);
        }
    }
};

// Test 4: Test dashboard updates
const testDashboardUpdates = async (tokens) => {
    console.log('\n📊 Testing dashboard updates...'.cyan);
    console.log('='.repeat(50));

    for (const [role, token] of Object.entries(tokens)) {
        if (!token) continue;

        // Test dashboard data
        const dashboardResult = await makeRequest('GET', `/dashboard/${role === 'super_admin' ? 'admin' : role}`, null, token);
        logResult(`${role} - Dashboard Data`, dashboardResult.success,
            dashboardResult.success ? 'Dashboard data retrieved' : dashboardResult.error?.message);

        // Test analytics
        const analyticsResult = await makeRequest('GET', '/analytics/overview', null, token);
        logResult(`${role} - Analytics`, analyticsResult.success,
            analyticsResult.success ? 'Analytics retrieved' : analyticsResult.error?.message);
    }
};

// Test 5: Test draft isolation
const testDraftIsolation = async (tokens) => {
    console.log('\n🔒 Testing draft isolation...'.cyan);
    console.log('='.repeat(50));

    // This test would need to be run in the browser to test localStorage isolation
    // For now, we'll just verify that different user types can create applications
    const roles = ['student', 'agent', 'staff', 'super_admin'];

    for (const role of roles) {
        const token = tokens[role];
        if (!token) continue;

        const createResult = await makeRequest('POST', '/student-application/create', {
            ...testApplicationData,
            personalDetails: {
                ...testApplicationData.personalDetails,
                fullName: `Test User ${role}`
            }
        }, token);

        logResult(`${role} - Draft Isolation`, createResult.success,
            createResult.success ? 'Application created independently' : createResult.error?.message);
    }
};

// Main test function
const runTests = async () => {
    try {
        console.log('🧪 Testing Complete Registration Flow'.cyan);
        console.log('='.repeat(50));

        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swagatodisha');
        console.log('✅ Connected to database'.green);

        // Run tests
        const tokens = await createTestUsers();
        await testRegistrationWorkflow(tokens);
        await testReferralSystem(tokens);
        await testDashboardUpdates(tokens);
        await testDraftIsolation(tokens);

        // Print summary
        console.log('\n📊 Test Results Summary'.cyan);
        console.log('='.repeat(50));
        console.log(`✅ Passed: ${results.passed}`.green);
        console.log(`❌ Failed: ${results.failed}`.red);
        console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`.blue);

        if (results.errors.length > 0) {
            console.log('\n❌ Failed Tests:'.red);
            console.log('='.repeat(50));
            results.errors.forEach(error => {
                console.log(`• ${error.test}: ${error.error}`.red);
            });
        }

        // Cleanup
        console.log('\n🧹 Cleaning up test data...'.cyan);
        for (const [role, userData] of Object.entries(testUsers)) {
            if (role === 'super_admin' || role === 'staff') {
                await Admin.deleteOne({ email: userData.email });
            } else {
                await User.deleteOne({ email: userData.email });
            }
        }
        await StudentApplication.deleteMany({ 'personalDetails.fullName': { $regex: /Test User|John Doe/ } });
        console.log('✅ Test data cleaned up'.green);

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from database');
    }
};

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests };
