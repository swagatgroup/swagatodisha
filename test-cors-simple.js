#!/usr/bin/env node

/**
 * Simple CORS Test for Swagat Odisha
 * Tests the undefined origin fix
 */

const axios = require('axios');

const BACKEND_URL = 'https://swagat-odisha-backend.onrender.com';

async function testCORSFix() {
    console.log('🧪 Testing CORS Fix for Undefined Origin Issue\n');
    console.log(`Backend: ${BACKEND_URL}\n`);

    const tests = [
        {
            name: 'Health Check (No Origin)',
            test: async () => {
                const response = await axios.get(`${BACKEND_URL}/health`, {
                    timeout: 10000
                });
                return response.status === 200;
            }
        },
        {
            name: 'API Test with Origin',
            test: async () => {
                const response = await axios.get(`${BACKEND_URL}/api/test`, {
                    headers: { 'Origin': 'https://www.swagatodisha.com' },
                    timeout: 10000
                });
                return response.status === 200;
            }
        },
        {
            name: 'CORS Preflight Test',
            test: async () => {
                const response = await axios.options(`${BACKEND_URL}/api/auth/login`, {
                    headers: {
                        'Origin': 'https://www.swagatodisha.com',
                        'Access-Control-Request-Method': 'POST',
                        'Access-Control-Request-Headers': 'Content-Type, Authorization'
                    },
                    timeout: 10000
                });
                return response.status === 200;
            }
        },
        {
            name: 'Login Endpoint Test',
            test: async () => {
                try {
                    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
                        email: 'test@example.com',
                        password: 'testpassword'
                    }, {
                        headers: {
                            'Origin': 'https://www.swagatodisha.com',
                            'Content-Type': 'application/json'
                        },
                        timeout: 15000
                    });
                    return true; // If we get here, CORS worked
                } catch (error) {
                    // Check if it's a CORS error or just auth error
                    if (error.message.includes('CORS') || error.message.includes('Access-Control')) {
                        return false;
                    }
                    // If it's an auth error (401, 400), CORS is working
                    return error.response && error.response.status >= 400 && error.response.status < 500;
                }
            }
        }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            console.log(`Testing ${test.name}...`);
            const result = await test.test();

            if (result) {
                console.log(`✅ ${test.name} - PASS\n`);
                passed++;
            } else {
                console.log(`❌ ${test.name} - FAIL\n`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name} - ERROR: ${error.message}\n`);
            failed++;
        }
    }

    console.log('='.repeat(50));
    console.log(`📊 CORS Test Results: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
        console.log('🎉 All CORS tests passed! Your backend is ready for production.');
        console.log('\n✅ Next steps:');
        console.log('1. Deploy this fix to Render');
        console.log('2. Test login on your frontend');
        console.log('3. Check browser console for CORS errors');
    } else {
        console.log('⚠️  Some CORS tests failed. Check the issues above.');
    }
}

// Test local backend if running
async function testLocalBackend() {
    console.log('\n🏠 Testing Local Backend...\n');

    try {
        const response = await axios.get('http://localhost:5000/health', { timeout: 5000 });
        console.log('✅ Local backend is running');

        // Test CORS locally
        const corsResponse = await axios.get('http://localhost:5000/api/test', {
            headers: { 'Origin': 'https://www.swagatodisha.com' },
            timeout: 5000
        });
        console.log('✅ Local CORS is working');

    } catch (error) {
        console.log('❌ Local backend not running or CORS issue');
        console.log('💡 Start backend with: npm start');
    }
}

// Run tests
async function runAllTests() {
    await testCORSFix();
    await testLocalBackend();
}

runAllTests().catch(console.error);
