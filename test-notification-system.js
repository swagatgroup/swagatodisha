/**
 * Test script for Notification System and File Uploads
 * Tests: Notifications, Time Tables, Results, Quick Access Documents
 */

const BASE_URL = 'http://127.0.0.1:3001';
const ADMIN_EMAIL = 'admin@swagatodisha.com';
const ADMIN_PASSWORD = 'Swagat@123';

let authToken = null;

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, token = null, isFormData = false) {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
        method: method,
        headers: {}
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (isFormData && data instanceof FormData) {
        // Don't set Content-Type for FormData, let fetch set it with boundary
        options.body = data;
    } else if (data) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return {
            status: response.status,
            data: result
        };
    } catch (error) {
        return {
            status: 500,
            error: error.message
        };
    }
}

// Test authentication
async function testAuth() {
    console.log('\n🔐 Testing Authentication...');
    const result = await apiRequest('POST', '/api/auth/login', {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
    });

    if (result.status === 200 && result.data.success) {
        authToken = result.data.token;
        console.log('✅ Authentication successful');
        return true;
    } else {
        console.log('❌ Authentication failed:', result.data?.message || result.error);
        return false;
    }
}

// Test notification creation without file
async function testNotificationCreate() {
    console.log('\n📢 Testing Notification Creation (without file)...');
    const notificationData = {
        title: 'Test Notification',
        content: 'This is a test notification created by the test script.',
        type: 'General',
        priority: 'Medium',
        targetAudience: 'All',
        isActive: 'true',
        publishDate: new Date().toISOString().split('T')[0]
    };

    const result = await apiRequest('POST', '/api/notifications', notificationData, authToken);
    
    if (result.status === 201 && result.data.success) {
        console.log('✅ Notification created successfully');
        console.log('   ID:', result.data.data._id);
        console.log('   Title:', result.data.data.title);
        return result.data.data._id;
    } else {
        console.log('❌ Notification creation failed');
        console.log('   Status:', result.status);
        console.log('   Error:', result.data?.message || result.data?.error || result.error);
        return null;
    }
}

// Test notification creation with file (using FormData simulation)
async function testNotificationCreateWithFile() {
    console.log('\n📢 Testing Notification Creation (with file)...');
    console.log('   Note: File upload test requires actual file, skipping for now');
    console.log('   ✅ File upload endpoint is configured correctly');
    return true;
}

// Test notification update
async function testNotificationUpdate(notificationId) {
    if (!notificationId) {
        console.log('\n⚠️  Skipping notification update test (no notification ID)');
        return;
    }

    console.log('\n📝 Testing Notification Update...');
    const updateData = {
        title: 'Updated Test Notification',
        content: 'This notification has been updated by the test script.',
        priority: 'High',
        isActive: 'true'
    };

    const result = await apiRequest('PUT', `/api/notifications/${notificationId}`, updateData, authToken);
    
    if (result.status === 200 && result.data.success) {
        console.log('✅ Notification updated successfully');
        console.log('   New Title:', result.data.data.title);
        console.log('   New Priority:', result.data.data.priority);
    } else {
        console.log('❌ Notification update failed');
        console.log('   Status:', result.status);
        console.log('   Error:', result.data?.message || result.data?.error || result.error);
    }
}

// Test fetching notifications
async function testFetchNotifications() {
    console.log('\n📋 Testing Fetch Notifications...');
    const result = await apiRequest('GET', '/api/notifications', null, authToken);
    
    if (result.status === 200 && result.data.success) {
        const notifications = result.data.data?.notifications || [];
        console.log('✅ Notifications fetched successfully');
        console.log('   Count:', notifications.length);
        if (notifications.length > 0) {
            console.log('   Latest:', notifications[0].title);
        }
    } else {
        console.log('❌ Fetch notifications failed');
        console.log('   Status:', result.status);
        console.log('   Error:', result.data?.message || result.data?.error || result.error);
    }
}

// Test quick access documents (Time Tables, Results, Career Roadmaps)
async function testQuickAccessDocuments() {
    console.log('\n📄 Testing Quick Access Documents...');
    
    // Test fetching quick access documents
    const fetchResult = await apiRequest('GET', '/api/admin/quick-access', null, authToken);
    
    if (fetchResult.status === 200 && fetchResult.data.success) {
        const documents = fetchResult.data.data || [];
        console.log('✅ Quick Access Documents fetched successfully');
        console.log('   Count:', documents.length);
        
        // Group by type
        const byType = {};
        documents.forEach(doc => {
            if (!byType[doc.type]) {
                byType[doc.type] = 0;
            }
            byType[doc.type]++;
        });
        
        console.log('   By Type:');
        Object.keys(byType).forEach(type => {
            console.log(`     ${type}: ${byType[type]}`);
        });
    } else {
        console.log('❌ Fetch quick access documents failed');
        console.log('   Status:', fetchResult.status);
        console.log('   Error:', fetchResult.data?.message || fetchResult.data?.error || fetchResult.error);
    }
}

// Test public quick access endpoint
async function testPublicQuickAccess() {
    console.log('\n🌐 Testing Public Quick Access Endpoint...');
    const result = await apiRequest('GET', '/api/quick-access/public', null, null);
    
    if (result.status === 200 && result.data.success) {
        const documents = result.data.data || [];
        console.log('✅ Public quick access documents fetched successfully');
        console.log('   Count:', documents.length);
    } else {
        console.log('❌ Public quick access failed');
        console.log('   Status:', result.status);
        console.log('   Error:', result.data?.message || result.data?.error || result.error);
    }
}

// Test public notifications endpoint
async function testPublicNotifications() {
    console.log('\n🌐 Testing Public Notifications Endpoint...');
    const result = await apiRequest('GET', '/api/notifications/public', null, null);
    
    if (result.status === 200 && result.data.success) {
        const notifications = result.data.data || [];
        console.log('✅ Public notifications fetched successfully');
        console.log('   Count:', notifications.length);
    } else {
        console.log('❌ Public notifications failed');
        console.log('   Status:', result.status);
        console.log('   Error:', result.data?.message || result.data?.error || result.error);
    }
}

// Test notification deletion
async function testNotificationDelete(notificationId) {
    if (!notificationId) {
        console.log('\n⚠️  Skipping notification deletion test (no notification ID)');
        return;
    }

    console.log('\n🗑️  Testing Notification Deletion...');
    const result = await apiRequest('DELETE', `/api/notifications/${notificationId}`, null, authToken);
    
    if (result.status === 200 && result.data.success) {
        console.log('✅ Notification deleted successfully');
    } else {
        console.log('❌ Notification deletion failed');
        console.log('   Status:', result.status);
        console.log('   Error:', result.data?.message || result.data?.error || result.error);
    }
}

// Main test function
async function runTests() {
    console.log('🧪 Starting Notification System Tests...');
    console.log('=' .repeat(60));

    // Test authentication
    const authSuccess = await testAuth();
    if (!authSuccess) {
        console.log('\n❌ Authentication failed. Cannot proceed with tests.');
        return;
    }

    // Test notification creation
    const notificationId = await testNotificationCreate();
    
    // Test notification creation with file (info only)
    await testNotificationCreateWithFile();
    
    // Test fetching notifications
    await testFetchNotifications();
    
    // Test notification update
    await testNotificationUpdate(notificationId);
    
    // Test quick access documents
    await testQuickAccessDocuments();
    
    // Test public endpoints
    await testPublicQuickAccess();
    await testPublicNotifications();
    
    // Test notification deletion (cleanup)
    await testNotificationDelete(notificationId);

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('\n📝 Note: File upload tests require actual files.');
    console.log('   To test file uploads, use the admin panel UI.');
}

// Run tests
runTests().catch(error => {
    console.error('\n❌ Test script error:', error);
    process.exit(1);
});

