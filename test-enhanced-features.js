const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'TestPassword123!';

// Test data
let authToken = '';
let testUserId = '';
let testDocumentId = '';
let testReferralCode = '';

// Helper function to make authenticated requests
const apiRequest = async (method, endpoint, data = null) => {
    const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };

    if (data) {
        config.data = data;
    }

    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error(`API Error (${method} ${endpoint}):`, error.response?.data || error.message);
        throw error;
    }
};

// Test functions
const testAuthentication = async () => {
    console.log('🔐 Testing Authentication...');

    try {
        // Test login
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });

        if (loginResponse.data.success) {
            authToken = loginResponse.data.token;
            testUserId = loginResponse.data.user._id;
            console.log('✅ Authentication successful');
            return true;
        }
    } catch (error) {
        console.log('❌ Authentication failed:', error.response?.data?.message);
        return false;
    }
};

const testReferralSystem = async () => {
    console.log('👥 Testing Referral System...');

    try {
        // Test generate referral code
        const generateResponse = await apiRequest('POST', '/referrals/generate', {
            userId: testUserId,
            customCode: 'TEST123'
        });

        if (generateResponse.success) {
            testReferralCode = generateResponse.data.referralCode;
            console.log('✅ Referral code generated:', testReferralCode);
        }

        // Test get referral stats
        const statsResponse = await apiRequest('GET', `/referrals/stats/${testUserId}`);
        if (statsResponse.success) {
            console.log('✅ Referral stats retrieved');
        }

        // Test validate referral code
        const validateResponse = await apiRequest('POST', '/referrals/validate', {
            referralCode: testReferralCode
        });

        if (validateResponse.success) {
            console.log('✅ Referral code validation successful');
        }

        return true;
    } catch (error) {
        console.log('❌ Referral system test failed:', error.message);
        return false;
    }
};

const testDocumentUpload = async () => {
    console.log('📄 Testing Document Upload...');

    try {
        // Create a test file buffer (simulating file upload)
        const testFileBuffer = Buffer.from('Test document content');

        const formData = new FormData();
        formData.append('file', new Blob([testFileBuffer], { type: 'application/pdf' }), 'test-document.pdf');
        formData.append('documentType', 'identity_proof');
        formData.append('priority', 'medium');

        const uploadResponse = await axios.post(`${BASE_URL}/documents/upload`, formData, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        if (uploadResponse.data.success) {
            testDocumentId = uploadResponse.data.data._id;
            console.log('✅ Document upload successful:', testDocumentId);
        }

        return true;
    } catch (error) {
        console.log('❌ Document upload test failed:', error.message);
        return false;
    }
};

const testDocumentReview = async () => {
    console.log('🔍 Testing Document Review...');

    try {
        if (!testDocumentId) {
            console.log('⚠️ No document ID available for review test');
            return false;
        }

        // Test review document
        const reviewResponse = await apiRequest('PUT', `/documents/${testDocumentId}/review`, {
            action: 'approved',
            remarks: 'Test approval - looks good!',
            isCustomRemarks: true
        });

        if (reviewResponse.success) {
            console.log('✅ Document review successful');
        }

        return true;
    } catch (error) {
        console.log('❌ Document review test failed:', error.message);
        return false;
    }
};

const testNotificationSystem = async () => {
    console.log('🔔 Testing Notification System...');

    try {
        // Test get notifications
        const notificationsResponse = await apiRequest('GET', '/notifications');
        if (notificationsResponse.success) {
            console.log('✅ Notifications retrieved');
        }

        // Test get unread count
        const unreadResponse = await apiRequest('GET', '/notifications/unread-count');
        if (unreadResponse.success) {
            console.log('✅ Unread count retrieved:', unreadResponse.data.unreadCount);
        }

        return true;
    } catch (error) {
        console.log('❌ Notification system test failed:', error.message);
        return false;
    }
};

const testDashboardData = async () => {
    console.log('📊 Testing Dashboard Data...');

    try {
        const dashboardResponse = await apiRequest('GET', '/dashboard');
        if (dashboardResponse.success) {
            console.log('✅ Dashboard data retrieved');
            console.log('📈 Statistics:', dashboardResponse.data.statistics);
        }

        return true;
    } catch (error) {
        console.log('❌ Dashboard data test failed:', error.message);
        return false;
    }
};

// Main test runner
const runTests = async () => {
    console.log('🚀 Starting Enhanced Features Integration Test\n');

    const tests = [
        { name: 'Authentication', fn: testAuthentication },
        { name: 'Referral System', fn: testReferralSystem },
        { name: 'Document Upload', fn: testDocumentUpload },
        { name: 'Document Review', fn: testDocumentReview },
        { name: 'Notification System', fn: testNotificationSystem },
        { name: 'Dashboard Data', fn: testDashboardData }
    ];

    const results = [];

    for (const test of tests) {
        try {
            const success = await test.fn();
            results.push({ name: test.name, success });
            console.log(''); // Empty line for readability
        } catch (error) {
            console.log(`❌ ${test.name} test crashed:`, error.message);
            results.push({ name: test.name, success: false });
            console.log('');
        }
    }

    // Summary
    console.log('📋 Test Results Summary:');
    console.log('========================');

    const passed = results.filter(r => r.success).length;
    const total = results.length;

    results.forEach(result => {
        console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
    });

    console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);

    if (passed === total) {
        console.log('🎉 All tests passed! Enhanced features are working correctly.');
    } else {
        console.log('⚠️ Some tests failed. Please check the implementation.');
    }
};

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    runTests,
    testAuthentication,
    testReferralSystem,
    testDocumentUpload,
    testDocumentReview,
    testNotificationSystem,
    testDashboardData
};
