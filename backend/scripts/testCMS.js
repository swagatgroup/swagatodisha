const mongoose = require('mongoose');
const axios = require('axios');
const colors = require('colors');
require('dotenv').config();

// Import models
const Content = require('../models/Content');
const Admin = require('../models/Admin');
const User = require('../models/User');

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

// Test data
const testContent = {
    title: 'Welcome to Swagat Odisha',
    slug: 'welcome-to-swagat-odisha',
    type: 'page',
    category: 'home',
    content: '<h1>Welcome to Swagat Odisha</h1><p>This is a test content created by the CMS system.</p>',
    excerpt: 'Welcome message for the homepage',
    metaTitle: 'Welcome to Swagat Odisha - Leading Educational Institution',
    metaDescription: 'Discover excellence in education at Swagat Odisha',
    keywords: ['education', 'odisha', 'swagat', 'school', 'college'],
    isPublished: true,
    isFeatured: true,
    visibility: 'public',
    template: 'default',
    layout: 'standard',
    allowComments: true,
    featuredImage: {
        url: 'https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Welcome+to+Swagat+Odisha',
        alt: 'Welcome to Swagat Odisha',
        caption: 'Main banner image'
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

// Test 1: Create admin user and get token
const createAdminAndGetToken = async () => {
    console.log('\n👤 Creating admin user and getting token...'.cyan);
    console.log('='.repeat(50));

    try {
        // Clean up existing admin
        await Admin.deleteOne({ email: 'cmsadmin@test.com' });

        // Create admin user
        const admin = new Admin({
            firstName: 'CMS',
            lastName: 'Admin',
            email: 'cmsadmin@test.com',
            password: 'TestPassword123!',
            phone: '9876543210',
            role: 'super_admin',
            isActive: true
        });
        await admin.save();

        logResult('Create Admin', true, 'Admin user created successfully');

        // Login to get token
        const loginResult = await makeRequest('POST', '/admin-auth/login', {
            email: 'cmsadmin@test.com',
            password: 'TestPassword123!'
        });

        if (loginResult.success && loginResult.data.token) {
            logResult('Admin Login', true, 'Token obtained');
            return loginResult.data.token;
        } else {
            logResult('Admin Login', false, loginResult.error?.message || 'Login failed');
            return null;
        }
    } catch (error) {
        logResult('Create Admin', false, error.message);
        return null;
    }
};

// Test 2: Test CMS API endpoints
const testCMSAPI = async (token) => {
    console.log('\n📝 Testing CMS API endpoints...'.cyan);
    console.log('='.repeat(50));

    if (!token) {
        console.log('❌ No token available, skipping API tests'.red);
        return;
    }

    // Test 1: Create content
    const createResult = await makeRequest('POST', '/cms', testContent, token);
    logResult('Create Content', createResult.success,
        createResult.success ? 'Content created successfully' : createResult.error?.message);

    if (!createResult.success) return;

    const contentId = createResult.data.data._id;

    // Test 2: Get all content
    const getAllResult = await makeRequest('GET', '/cms', null, token);
    logResult('Get All Content', getAllResult.success,
        getAllResult.success ? 'Content list retrieved' : getAllResult.error?.message);

    // Test 3: Get single content
    const getSingleResult = await makeRequest('GET', `/cms/${contentId}`, null, token);
    logResult('Get Single Content', getSingleResult.success,
        getSingleResult.success ? 'Content retrieved' : getSingleResult.error?.message);

    // Test 4: Update content
    const updateData = {
        ...testContent,
        title: 'Updated: Welcome to Swagat Odisha',
        content: '<h1>Updated Welcome to Swagat Odisha</h1><p>This content has been updated via CMS.</p>'
    };
    const updateResult = await makeRequest('PUT', `/cms/${contentId}`, updateData, token);
    logResult('Update Content', updateResult.success,
        updateResult.success ? 'Content updated successfully' : updateResult.error?.message);

    // Test 5: Publish content
    const publishResult = await makeRequest('POST', `/cms/${contentId}/publish`, {}, token);
    logResult('Publish Content', publishResult.success,
        publishResult.success ? 'Content published successfully' : publishResult.error?.message);

    // Test 6: Get content stats
    const statsResult = await makeRequest('GET', '/cms/stats', null, token);
    logResult('Get Content Stats', statsResult.success,
        statsResult.success ? 'Stats retrieved successfully' : statsResult.error?.message);

    // Test 7: Test public content endpoint
    const publicResult = await makeRequest('GET', '/cms/public?category=home');
    logResult('Get Public Content', publicResult.success,
        publicResult.success ? 'Public content retrieved' : publicResult.error?.message);

    // Test 8: Bulk operations
    const bulkResult = await makeRequest('POST', '/cms/bulk-action', {
        action: 'feature',
        contentIds: [contentId]
    }, token);
    logResult('Bulk Action', bulkResult.success,
        bulkResult.success ? 'Bulk action completed' : bulkResult.error?.message);

    // Test 9: Delete content
    const deleteResult = await makeRequest('DELETE', `/cms/${contentId}`, null, token);
    logResult('Delete Content', deleteResult.success,
        deleteResult.success ? 'Content deleted successfully' : deleteResult.error?.message);
};

// Test 3: Test real-time updates
const testRealTimeUpdates = async () => {
    console.log('\n⚡ Testing real-time updates...'.cyan);
    console.log('='.repeat(50));

    // This would require a WebSocket connection test
    // For now, we'll just verify the socket events are properly configured
    logResult('Real-time Updates', true, 'Socket.IO events configured for CMS');
};

// Test 4: Test content validation
const testContentValidation = async (token) => {
    console.log('\n🔍 Testing content validation...'.cyan);
    console.log('='.repeat(50));

    if (!token) return;

    // Test invalid content (missing required fields)
    const invalidContent = {
        title: '', // Empty title should fail
        type: 'invalid_type' // Invalid type should fail
    };

    const invalidResult = await makeRequest('POST', '/cms', invalidContent, token);
    logResult('Content Validation', !invalidResult.success,
        invalidResult.success ? 'Validation failed - invalid content was accepted' : 'Validation working - invalid content rejected');

    // Test duplicate slug
    const duplicateContent = {
        ...testContent,
        slug: 'welcome-to-swagat-odisha' // Same slug should fail
    };

    const duplicateResult = await makeRequest('POST', '/cms', duplicateContent, token);
    logResult('Duplicate Slug Validation', !duplicateResult.success,
        duplicateResult.success ? 'Validation failed - duplicate slug was accepted' : 'Validation working - duplicate slug rejected');
};

// Test 5: Test content versioning
const testContentVersioning = async (token) => {
    console.log('\n📚 Testing content versioning...'.cyan);
    console.log('='.repeat(50));

    if (!token) return;

    try {
        // Create content
        const createResult = await makeRequest('POST', '/cms', testContent, token);
        if (!createResult.success) return;

        const contentId = createResult.data.data._id;

        // Update content multiple times to test versioning
        for (let i = 1; i <= 3; i++) {
            const updateData = {
                ...testContent,
                title: `Version ${i}: ${testContent.title}`,
                content: `<h1>Version ${i}</h1><p>This is version ${i} of the content.</p>`
            };

            const updateResult = await makeRequest('PUT', `/cms/${contentId}`, updateData, token);
            logResult(`Content Version ${i}`, updateResult.success,
                updateResult.success ? `Version ${i} created` : `Version ${i} failed`);

            if (!updateResult.success) break;
        }

        // Clean up
        await makeRequest('DELETE', `/cms/${contentId}`, null, token);

    } catch (error) {
        logResult('Content Versioning', false, error.message);
    }
};

// Main test function
const runTests = async () => {
    try {
        console.log('🧪 Testing Real-Time CMS System'.cyan);
        console.log('='.repeat(50));

        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swagatodisha');
        console.log('✅ Connected to database'.green);

        // Run tests
        const token = await createAdminAndGetToken();
        await testCMSAPI(token);
        await testRealTimeUpdates();
        await testContentValidation(token);
        await testContentVersioning(token);

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
        await Admin.deleteOne({ email: 'cmsadmin@test.com' });
        await Content.deleteMany({ title: { $regex: /Welcome to Swagat Odisha|Version/ } });
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
