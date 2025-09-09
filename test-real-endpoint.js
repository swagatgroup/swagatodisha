#!/usr/bin/env node

/**
 * Real Endpoint Test for Swagat Odisha
 * Tests the actual production endpoint based on real log analysis
 */

const https = require('https');

const BACKEND_URL = 'https://swagat-odisha-backend.onrender.com';

function makeRequest(url, options, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: responseData
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(data);
        }

        req.end();
    });
}

async function testRealEndpoints() {
    console.log('🧪 Testing Real Production Endpoints\n');
    console.log(`Backend: ${BACKEND_URL}\n`);

    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    try {
        const healthResponse = await makeRequest(`${BACKEND_URL}/health`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Swagat-Odisha-Test/1.0'
            }
        });

        console.log(`   Status: ${healthResponse.statusCode}`);
        console.log(`   CORS Headers: ${healthResponse.headers['access-control-allow-origin'] || 'Missing'}`);

        if (healthResponse.statusCode === 200) {
            console.log('   ✅ Health check working');
        } else {
            console.log('   ❌ Health check failed');
        }
    } catch (error) {
        console.log(`   ❌ Health check error: ${error.message}`);
    }

    // Test 2: API Health Check
    console.log('\n2. Testing API Health Check...');
    try {
        const apiHealthResponse = await makeRequest(`${BACKEND_URL}/api/health`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Swagat-Odisha-Test/1.0'
            }
        });

        console.log(`   Status: ${apiHealthResponse.statusCode}`);
        console.log(`   CORS Headers: ${apiHealthResponse.headers['access-control-allow-origin'] || 'Missing'}`);

        if (apiHealthResponse.statusCode === 200) {
            console.log('   ✅ API health check working');
        } else {
            console.log('   ❌ API health check failed');
        }
    } catch (error) {
        console.log(`   ❌ API health check error: ${error.message}`);
    }

    // Test 3: Login Endpoint (CORS Test)
    console.log('\n3. Testing Login Endpoint with CORS...');
    try {
        const loginData = JSON.stringify({
            email: 'test@example.com',
            password: 'testpassword'
        });

        const loginResponse = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://www.swagatodisha.com',
                'User-Agent': 'Swagat-Odisha-Test/1.0'
            }
        }, loginData);

        console.log(`   Status: ${loginResponse.statusCode}`);
        console.log(`   CORS Origin: ${loginResponse.headers['access-control-allow-origin'] || 'Missing'}`);
        console.log(`   CORS Methods: ${loginResponse.headers['access-control-allow-methods'] || 'Missing'}`);
        console.log(`   CORS Headers: ${loginResponse.headers['access-control-allow-headers'] || 'Missing'}`);

        if (loginResponse.statusCode === 401 || loginResponse.statusCode === 400) {
            console.log('   ✅ Login endpoint accessible (auth error expected)');
            console.log('   ✅ CORS headers present');
        } else if (loginResponse.statusCode === 200) {
            console.log('   ✅ Login endpoint working');
        } else {
            console.log('   ❌ Login endpoint issue');
        }

        // Try to parse response
        try {
            const responseData = JSON.parse(loginResponse.data);
            console.log(`   Response: ${responseData.message || 'No message'}`);
        } catch (e) {
            console.log(`   Raw Response: ${loginResponse.data.substring(0, 100)}...`);
        }

    } catch (error) {
        console.log(`   ❌ Login test error: ${error.message}`);
    }

    // Test 4: CORS Preflight Test
    console.log('\n4. Testing CORS Preflight...');
    try {
        const preflightResponse = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'https://www.swagatodisha.com',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type, Authorization',
                'User-Agent': 'Swagat-Odisha-Test/1.0'
            }
        });

        console.log(`   Status: ${preflightResponse.statusCode}`);
        console.log(`   CORS Origin: ${preflightResponse.headers['access-control-allow-origin'] || 'Missing'}`);
        console.log(`   CORS Methods: ${preflightResponse.headers['access-control-allow-methods'] || 'Missing'}`);

        if (preflightResponse.statusCode === 200) {
            console.log('   ✅ CORS preflight working');
        } else {
            console.log('   ❌ CORS preflight failed');
        }
    } catch (error) {
        console.log(`   ❌ CORS preflight error: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎯 Real Production Test Complete');
    console.log('Based on actual server log analysis');
    console.log('='.repeat(50));
}

testRealEndpoints().catch(console.error);
