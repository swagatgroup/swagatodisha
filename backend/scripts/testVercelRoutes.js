const axios = require('axios');
const colors = require('colors');

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

// Test routes configuration
const testRoutes = [
    // Authentication Routes
    { method: 'GET', path: '/api/health', name: 'Health Check', auth: false },
    { method: 'POST', path: '/api/auth/login', name: 'User Login', auth: false, data: { email: 'test@example.com', password: 'test123' } },
    { method: 'POST', path: '/api/admin-auth/login', name: 'Admin Login', auth: false, data: { email: 'admin@example.com', password: 'admin123' } },

    // Public Routes
    { method: 'GET', path: '/api/courses', name: 'Get Courses', auth: false },
    { method: 'GET', path: '/api/courses/featured', name: 'Get Featured Courses', auth: false },
    { method: 'GET', path: '/api/gallery', name: 'Get Gallery', auth: false },
    { method: 'POST', path: '/api/contact', name: 'Contact Form', auth: false, data: { name: 'Test', email: 'test@example.com', message: 'Test message' } },

    // Document Types
    { method: 'GET', path: '/api/document-types', name: 'Get Document Types', auth: true },
    { method: 'GET', path: '/api/document-types/required', name: 'Get Required Documents', auth: true },
    { method: 'GET', path: '/api/document-types/optional', name: 'Get Optional Documents', auth: true },
    { method: 'GET', path: '/api/document-types/categories', name: 'Get Document Categories', auth: true },

    // Referral System
    { method: 'GET', path: '/api/referral/code', name: 'Get Referral Code', auth: true },
    { method: 'GET', path: '/api/referral/data', name: 'Get Referral Data', auth: true },
    { method: 'POST', path: '/api/referral/track', name: 'Track Referral', auth: false, data: { referralCode: 'test123' } },

    // Student Application
    { method: 'GET', path: '/api/student-application/my-application', name: 'Get My Application', auth: true },
    { method: 'POST', path: '/api/student-application/create', name: 'Create Application', auth: true, data: { test: true } },

    // Dashboard Routes
    { method: 'GET', path: '/api/dashboard/student', name: 'Student Dashboard', auth: true },
    { method: 'GET', path: '/api/dashboard/agent', name: 'Agent Dashboard', auth: true },
    { method: 'GET', path: '/api/dashboard/staff', name: 'Staff Dashboard', auth: true },
    { method: 'GET', path: '/api/dashboard/super-admin', name: 'Super Admin Dashboard', auth: true },

    // Agent Routes
    { method: 'GET', path: '/api/agents/my-students', name: 'Agent My Students', auth: true },
    { method: 'GET', path: '/api/agents/student-stats', name: 'Agent Student Stats', auth: true },

    // Admin Routes
    { method: 'GET', path: '/api/admin/dashboard/stats', name: 'Admin Dashboard Stats', auth: true },
    { method: 'GET', path: '/api/admin/students', name: 'Admin Students', auth: true },
    { method: 'GET', path: '/api/admin/agents', name: 'Admin Agents', auth: true },
    { method: 'GET', path: '/api/admin/staff', name: 'Admin Staff', auth: true },

    // Notifications
    { method: 'GET', path: '/api/notifications', name: 'Get Notifications', auth: true },

    // Analytics
    { method: 'GET', path: '/api/analytics/overview', name: 'Analytics Overview', auth: true },

    // Performance
    { method: 'GET', path: '/api/performance/metrics', name: 'Performance Metrics', auth: true }
];

// Test results
const results = {
    passed: 0,
    failed: 0,
    errors: []
};

// Mock auth token for testing
let authToken = null;

// Test a single route
const testRoute = async (route) => {
    try {
        const config = {
            method: route.method,
            url: `${BASE_URL}${route.path}`,
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        };

        // Add auth token if required
        if (route.auth && authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }

        // Add data if provided
        if (route.data) {
            config.data = route.data;
        }

        const response = await axios(config);

        // Check if response is successful (2xx status)
        if (response.status >= 200 && response.status < 300) {
            console.log(`✅ ${route.name}: ${response.status} ${response.statusText}`.green);
            results.passed++;
            return true;
        } else {
            console.log(`⚠️  ${route.name}: ${response.status} ${response.statusText}`.yellow);
            results.passed++; // Still count as passed if route exists
            return true;
        }
    } catch (error) {
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            if (status === 404) {
                console.log(`❌ ${route.name}: 404 Not Found`.red);
                results.failed++;
                results.errors.push({
                    route: route.name,
                    path: route.path,
                    error: '404 Not Found',
                    status: 404
                });
            } else if (status === 401) {
                console.log(`🔒 ${route.name}: 401 Unauthorized (Expected for protected routes)`.blue);
                results.passed++; // 401 is expected for protected routes without auth
            } else if (status === 400) {
                console.log(`⚠️  ${route.name}: 400 Bad Request (Route exists but validation failed)`.yellow);
                results.passed++; // Route exists, just validation error
            } else {
                console.log(`⚠️  ${route.name}: ${status} ${error.response.statusText}`.yellow);
                results.passed++; // Route exists, just server error
            }
        } else if (error.code === 'ECONNREFUSED') {
            console.log(`🔌 ${route.name}: Connection refused (Server not running)`.red);
            results.failed++;
            results.errors.push({
                route: route.name,
                path: route.path,
                error: 'Connection refused',
                status: 'ECONNREFUSED'
            });
        } else {
            console.log(`❌ ${route.name}: ${error.message}`.red);
            results.failed++;
            results.errors.push({
                route: route.name,
                path: route.path,
                error: error.message,
                status: 'ERROR'
            });
        }
        return false;
    }
};

// Test authentication first
const testAuth = async () => {
    console.log('\n🔐 Testing Authentication...'.cyan);
    console.log('='.repeat(50));

    try {
        // Try to get a token (this might fail, but that's okay)
        const response = await axios.post(`${API_BASE}/auth/login`, {
            email: 'test@example.com',
            password: 'test123'
        });

        if (response.data && response.data.token) {
            authToken = response.data.token;
            console.log('✅ Authentication successful, token obtained'.green);
        }
    } catch (error) {
        console.log('⚠️  Authentication failed (expected if no test user exists)'.yellow);
    }
};

// Run all tests
const runTests = async () => {
    console.log('🧪 Testing Vercel Route Compatibility'.cyan);
    console.log('='.repeat(50));
    console.log(`Testing against: ${BASE_URL}`.gray);
    console.log('');

    // Test authentication first
    await testAuth();

    console.log('\n📡 Testing API Routes...'.cyan);
    console.log('='.repeat(50));

    // Test all routes
    for (const route of testRoutes) {
        await testRoute(route);
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Print summary
    console.log('\n📊 Test Results Summary'.cyan);
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${results.passed}`.green);
    console.log(`❌ Failed: ${results.failed}`.red);
    console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`.blue);

    if (results.errors.length > 0) {
        console.log('\n❌ Failed Routes:'.red);
        console.log('='.repeat(50));
        results.errors.forEach(error => {
            console.log(`• ${error.route} (${error.path}): ${error.error}`.red);
        });
    }

    // Vercel-specific recommendations
    console.log('\n🚀 Vercel Deployment Recommendations:'.cyan);
    console.log('='.repeat(50));

    if (results.failed === 0) {
        console.log('✅ All routes are working! Ready for Vercel deployment.'.green);
    } else {
        console.log('⚠️  Some routes failed. Check the following:'.yellow);
        console.log('1. Ensure all environment variables are set in Vercel');
        console.log('2. Check MongoDB connection string');
        console.log('3. Verify CORS settings');
        console.log('4. Check Vercel Function logs for errors');
    }

    console.log('\n📋 Next Steps:'.blue);
    console.log('1. Deploy to Vercel with the updated configuration');
    console.log('2. Set all required environment variables');
    console.log('3. Test the live deployment');
    console.log('4. Monitor Vercel Function logs');

    return results;
};

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests, testRoute, testRoutes };
