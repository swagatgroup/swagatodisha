/**
 * Production Endpoint Test Script
 * Run with: node backend/test-production-endpoints.js
 * 
 * This script tests critical API endpoints to ensure they're working in production
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'https://swagat-odisha-backend.onrender.com';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword';

let authToken = null;

// Helper function to make authenticated requests
async function makeRequest(method, endpoint, data = null, token = null) {
    try {
        const config = {
            method,
            url: `${API_BASE_URL}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
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
}

// Test functions
async function testHealthCheck() {
    console.log('\n🏥 Testing Health Check...');
    const result = await makeRequest('GET', '/api/health');
    if (result.success) {
        console.log('✅ Health check passed');
        return true;
    } else {
        console.log('❌ Health check failed:', result.error);
        return false;
    }
}

async function testLogin() {
    console.log('\n🔐 Testing Login...');
    const result = await makeRequest('POST', '/api/auth/login', {
        email: TEST_EMAIL,
        password: TEST_PASSWORD
    });

    if (result.success && result.data.token) {
        authToken = result.data.token;
        console.log('✅ Login successful');
        return true;
    } else {
        console.log('❌ Login failed:', result.error);
        console.log('⚠️  Note: You may need to create a test user first');
        return false;
    }
}

async function testCreateDraftApplication() {
    console.log('\n📝 Testing Draft Application Creation...');
    
    const testData = {
        personalDetails: {
            fullName: 'Test User',
            dateOfBirth: '2000-01-01',
            registrationDate: '2024-01-01',
            gender: 'Male',
            aadharNumber: '123456789012',
            category: 'General',
            fathersName: 'Test Father',
            mothersName: 'Test Mother'
        },
        contactDetails: {
            email: 'test@example.com',
            primaryPhone: '9876543210',
            whatsappNumber: '9876543210',
            permanentAddress: {
                street: '123 Test St',
                city: 'Test City',
                state: 'Odisha',
                district: 'Test District',
                pincode: '123456'
            }
        },
        courseDetails: {
            selectedCourse: 'Test Course',
            institutionName: 'Test Institution'
        },
        guardianDetails: {
            guardianName: 'Test Guardian',
            relationship: 'Father', // Valid enum value
            guardianPhone: '9876543210',
            guardianEmail: 'guardian@example.com'
        },
        financialDetails: {}
    };

    const result = await makeRequest('POST', '/api/student-application/create', testData, authToken);
    
    if (result.success) {
        console.log('✅ Draft application created successfully');
        console.log('   Application ID:', result.data.data?.applicationId);
        return result.data.data;
    } else {
        console.log('❌ Draft creation failed:', result.error);
        return null;
    }
}

async function testGuardianRelationshipNormalization() {
    console.log('\n🔄 Testing Guardian Relationship Normalization...');
    
    const testData = {
        personalDetails: {
            fullName: 'Test User 2',
            dateOfBirth: '2000-01-01',
            registrationDate: '2024-01-01',
            gender: 'Female',
            aadharNumber: '123456789013',
            category: 'OBC',
            fathersName: 'Test Father 2',
            mothersName: 'Test Mother 2'
        },
        contactDetails: {
            email: 'test2@example.com',
            primaryPhone: '9876543211',
            permanentAddress: {
                street: '456 Test St',
                city: 'Test City',
                state: 'Odisha',
                district: 'Test District',
                pincode: '123456'
            }
        },
        courseDetails: {
            selectedCourse: 'Test Course 2'
        },
        guardianDetails: {
            guardianName: 'Test Guardian 2',
            relationship: 'Guardian', // Invalid enum value - should be normalized to 'Other'
            guardianPhone: '9876543211'
        }
    };

    const result = await makeRequest('POST', '/api/student-application/create', testData, authToken);
    
    if (result.success) {
        const relationship = result.data.data?.guardianDetails?.relationship;
        if (relationship === 'Other') {
            console.log('✅ Invalid relationship normalized correctly to "Other"');
            return true;
        } else {
            console.log(`⚠️  Relationship is "${relationship}" - normalization may not be working`);
            return false;
        }
    } else {
        console.log('❌ Test failed:', result.error);
        return false;
    }
}

async function testGetMyApplication() {
    console.log('\n📋 Testing Get My Application...');
    const result = await makeRequest('GET', '/api/student-application/my-application', null, authToken);
    
    if (result.success) {
        console.log('✅ Retrieved application successfully');
        return true;
    } else {
        console.log('❌ Failed to retrieve application:', result.error);
        return false;
    }
}

async function testContactForm() {
    console.log('\n📧 Testing Contact Form...');
    
    const formData = new FormData();
    formData.append('name', 'Test User');
    formData.append('email', 'test@example.com');
    formData.append('phone', '9876543210');
    formData.append('subject', 'Test Subject');
    formData.append('message', 'This is a test message');

    try {
        const response = await axios.post(`${API_BASE_URL}/api/contact/submit`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.success) {
            console.log('✅ Contact form submitted successfully');
            return true;
        } else {
            console.log('❌ Contact form failed:', response.data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ Contact form error:', error.response?.data || error.message);
        return false;
    }
}

async function testCollegesEndpoint() {
    console.log('\n🏫 Testing Colleges Endpoint...');
    const result = await makeRequest('GET', '/api/colleges/public');
    
    if (result.success) {
        console.log('✅ Colleges endpoint working');
        return true;
    } else {
        console.log('❌ Colleges endpoint failed:', result.error);
        return false;
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting Production Endpoint Tests...');
    console.log(`📍 API Base URL: ${API_BASE_URL}`);
    
    const results = {
        healthCheck: false,
        login: false,
        draftCreation: false,
        relationshipNormalization: false,
        getApplication: false,
        contactForm: false,
        colleges: false
    };

    // Run tests
    results.healthCheck = await testHealthCheck();
    results.colleges = await testCollegesEndpoint();
    
    // Authentication required tests
    if (authToken || await testLogin()) {
        results.draftCreation = await testCreateDraftApplication() !== null;
        results.relationshipNormalization = await testGuardianRelationshipNormalization();
        results.getApplication = await testGetMyApplication();
    } else {
        console.log('\n⚠️  Skipping authenticated tests - login failed');
    }
    
    // Public endpoint test
    results.contactForm = await testContactForm();

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Results Summary');
    console.log('='.repeat(50));
    
    const passed = Object.values(results).filter(r => r).length;
    const total = Object.keys(results).length;
    
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    console.log(`\n📈 Total: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log('⚠️  Some tests failed. Please review the output above.');
        process.exit(1);
    }
}

// Run tests
runTests().catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
});

