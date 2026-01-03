/**
 * Website Management Test Script
 * 
 * This script tests the Website Management functionality including:
 * 1. Colleges & Courses Management
 * 2. Slider Management
 * 3. Quick Access Documents Management
 * 
 * Uses Node's built-in fetch (Node 18+) - no external dependencies needed
 */

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@swagatodisha.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Swagat@123';

let authToken = null;

// Helper function to make authenticated requests using Node's built-in fetch
async function makeRequest(method, endpoint, data = null, headers = {}) {
    try {
        const url = `${BASE_URL}${endpoint}`;
        const requestHeaders = {
            'Content-Type': 'application/json',
            ...headers
        };

        if (authToken) {
            requestHeaders.Authorization = `Bearer ${authToken}`;
        }

        const options = {
            method,
            headers: requestHeaders
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        
        // Handle non-JSON responses
        let responseData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            const text = await response.text();
            try {
                responseData = JSON.parse(text);
            } catch {
                responseData = { message: text || 'Unknown error' };
            }
        }

        if (response.ok) {
            return { success: true, data: responseData };
        } else {
            return {
                success: false,
                error: responseData,
                status: response.status
            };
        }
    } catch (error) {
        const errorMessage = error.message || 'Unknown error';
        const isNetworkError = errorMessage.includes('fetch') || 
                               errorMessage.includes('ECONNREFUSED') ||
                               errorMessage.includes('network');
        
        return {
            success: false,
            error: {
                message: isNetworkError 
                    ? `Network error: ${errorMessage}. Is the backend server running on ${BASE_URL}?`
                    : errorMessage,
                code: error.code || 'UNKNOWN'
            },
            status: null
        };
    }
}

// Test authentication
async function testAuth() {
    console.log('\n🔐 Testing Authentication...');
    const result = await makeRequest('POST', '/api/admin-auth/login', {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
    });

    // Handle different response structures
    const token = result.data?.data?.token || result.data?.token;
    if (result.success && token) {
        authToken = token;
        console.log('✅ Authentication successful');
        return true;
    } else {
        console.log('❌ Authentication failed');
        if (result.error) {
            if (typeof result.error === 'object') {
                console.log('   Error:', JSON.stringify(result.error, null, 2));
            } else {
                console.log('   Error:', result.error);
            }
        } else {
            console.log('   Error: No error details available');
        }
        console.log('   Status:', result.status || 'N/A');
        console.log('   💡 Tip: Make sure the backend server is running on', BASE_URL);
        return false;
    }
}

// Test Colleges & Courses Management
async function testCollegesManagement() {
    console.log('\n🏫 Testing Colleges & Courses Management...');

    // Test 1: Get all colleges
    console.log('\n1. Testing GET /api/admin/colleges');
    const getColleges = await makeRequest('GET', '/api/admin/colleges');
    if (getColleges.success) {
        console.log('✅ Get colleges successful');
        console.log(`   Found ${getColleges.data.data?.length || 0} colleges`);
    } else {
        console.log('❌ Get colleges failed:', getColleges.error);
    }

    // Test 2: Get public colleges
    console.log('\n2. Testing GET /api/colleges/public');
    const getPublicColleges = await makeRequest('GET', '/api/colleges/public');
    if (getPublicColleges.success) {
        console.log('✅ Get public colleges successful');
        console.log(`   Found ${getPublicColleges.data.data?.length || 0} active colleges`);
    } else {
        console.log('❌ Get public colleges failed:', getPublicColleges.error);
    }

    // Test 3: Create a test college
    console.log('\n3. Testing POST /api/admin/colleges');
    const testCollege = {
        name: 'Test College',
        code: 'TEST001',
        description: 'Test College Description',
        isActive: true
    };
    const createCollege = await makeRequest('POST', '/api/admin/colleges', testCollege);
    if (createCollege.success) {
        console.log('✅ Create college successful');
        console.log(`   College ID: ${createCollege.data.data?._id}`);
        return createCollege.data.data?._id;
    } else {
        console.log('❌ Create college failed:', createCollege.error);
        return null;
    }
}

// Test Slider Management
async function testSliderManagement() {
    console.log('\n🖼️  Testing Slider Management...');

    // Test 1: Get all sliders
    console.log('\n1. Testing GET /api/admin/sliders');
    const getSliders = await makeRequest('GET', '/api/admin/sliders');
    if (getSliders.success) {
        console.log('✅ Get sliders successful');
        console.log(`   Found ${getSliders.data.data?.length || 0} sliders`);
    } else {
        console.log('❌ Get sliders failed:', getSliders.error);
    }

    // Test 2: Get public sliders
    console.log('\n2. Testing GET /api/sliders/public');
    const getPublicSliders = await makeRequest('GET', '/api/sliders/public');
    if (getPublicSliders.success) {
        console.log('✅ Get public sliders successful');
        console.log(`   Found ${getPublicSliders.data.data?.length || 0} active sliders`);
    } else {
        console.log('❌ Get public sliders failed:', getPublicSliders.error);
    }
}

// Test Quick Access Documents Management
async function testQuickAccessManagement() {
    console.log('\n📄 Testing Quick Access Documents Management...');

    // Test 1: Get all documents
    console.log('\n1. Testing GET /api/admin/quick-access');
    const getDocuments = await makeRequest('GET', '/api/admin/quick-access');
    if (getDocuments.success) {
        console.log('✅ Get documents successful');
        console.log(`   Found ${getDocuments.data.data?.length || 0} documents`);
    } else {
        console.log('❌ Get documents failed:', getDocuments.error);
    }

    // Test 2: Get public documents
    console.log('\n2. Testing GET /api/quick-access/public');
    const getPublicDocuments = await makeRequest('GET', '/api/quick-access/public');
    if (getPublicDocuments.success) {
        console.log('✅ Get public documents successful');
        console.log(`   Found ${getPublicDocuments.data.data?.length || 0} active documents`);
    } else {
        console.log('❌ Get public documents failed:', getPublicDocuments.error);
    }
}

// Main test function
async function runTests() {
    console.log('🚀 Starting Website Management Tests...');
    console.log(`📍 Base URL: ${BASE_URL}`);

    // Test authentication first
    const authSuccess = await testAuth();
    if (!authSuccess) {
        console.log('\n❌ Authentication failed. Cannot proceed with tests.');
        console.log('💡 Make sure the backend server is running and credentials are correct.');
        return;
    }

    // Run all tests
    await testCollegesManagement();
    await testSliderManagement();
    await testQuickAccessManagement();

    console.log('\n✅ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests, testAuth, testCollegesManagement, testSliderManagement, testQuickAccessManagement };
