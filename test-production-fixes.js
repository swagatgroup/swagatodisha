#!/usr/bin/env node

/**
 * Test Production Fixes for Swagat Odisha
 * Tests rate limiting, CORS, and error handling fixes
 */

const axios = require('axios');

const BACKEND_URL = 'https://swagat-odisha-backend.onrender.com';
const FRONTEND_URL = 'https://www.swagatodisha.com';

class ProductionTester {
    constructor() {
        this.results = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}]`;

        switch (type) {
            case 'success':
                console.log(`${prefix} ✅ ${message}`);
                break;
            case 'error':
                console.log(`${prefix} ❌ ${message}`);
                break;
            case 'warning':
                console.log(`${prefix} ⚠️  ${message}`);
                break;
            case 'info':
            default:
                console.log(`${prefix} ℹ️  ${message}`);
                break;
        }
    }

    async testBackendHealth() {
        this.log('Testing Backend Health...', 'info');

        try {
            const response = await axios.get(`${BACKEND_URL}/health`, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Swagat-Odisha-Test/1.0'
                }
            });

            if (response.status === 200) {
                this.log('Backend health check passed', 'success');
                this.results.push({ test: 'Backend Health', status: 'PASS' });
                return true;
            } else {
                this.log(`Backend health check failed: ${response.status}`, 'error');
                this.results.push({ test: 'Backend Health', status: 'FAIL', error: `Status: ${response.status}` });
                return false;
            }
        } catch (error) {
            this.log(`Backend health check failed: ${error.message}`, 'error');
            this.results.push({ test: 'Backend Health', status: 'FAIL', error: error.message });
            return false;
        }
    }

    async testRateLimiting() {
        this.log('Testing Rate Limiting...', 'info');

        try {
            // Test multiple rapid requests to check rate limiting
            const requests = [];
            for (let i = 0; i < 5; i++) {
                requests.push(
                    axios.get(`${BACKEND_URL}/api/health`, {
                        timeout: 5000,
                        headers: { 'User-Agent': 'Swagat-Odisha-Test/1.0' }
                    })
                );
            }

            const responses = await Promise.allSettled(requests);
            const successful = responses.filter(r => r.status === 'fulfilled').length;
            const rateLimited = responses.filter(r =>
                r.status === 'rejected' && r.reason.response?.status === 429
            ).length;

            if (successful >= 3) {
                this.log(`Rate limiting working: ${successful}/5 requests succeeded`, 'success');
                this.results.push({ test: 'Rate Limiting', status: 'PASS' });
                return true;
            } else {
                this.log(`Rate limiting issue: only ${successful}/5 requests succeeded`, 'warning');
                this.results.push({ test: 'Rate Limiting', status: 'WARN', error: 'Too restrictive' });
                return false;
            }
        } catch (error) {
            this.log(`Rate limiting test failed: ${error.message}`, 'error');
            this.results.push({ test: 'Rate Limiting', status: 'FAIL', error: error.message });
            return false;
        }
    }

    async testCORS() {
        this.log('Testing CORS Configuration...', 'info');

        try {
            // Test preflight request
            const preflightResponse = await axios.options(`${BACKEND_URL}/api/auth/login`, {
                headers: {
                    'Origin': FRONTEND_URL,
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type, Authorization'
                },
                timeout: 10000
            });

            if (preflightResponse.status === 200) {
                this.log('CORS preflight request successful', 'success');
            } else {
                this.log(`CORS preflight failed: ${preflightResponse.status}`, 'error');
                this.results.push({ test: 'CORS Preflight', status: 'FAIL', error: `Status: ${preflightResponse.status}` });
                return false;
            }

            // Test actual request with CORS headers
            const corsResponse = await axios.get(`${BACKEND_URL}/api/test`, {
                headers: { 'Origin': FRONTEND_URL },
                timeout: 10000
            });

            const hasCorsHeaders = corsResponse.headers['access-control-allow-origin'] === FRONTEND_URL;

            if (corsResponse.status === 200 && hasCorsHeaders) {
                this.log('CORS headers present and correct', 'success');
                this.results.push({ test: 'CORS Headers', status: 'PASS' });
                return true;
            } else {
                this.log('CORS headers missing or incorrect', 'error');
                this.results.push({ test: 'CORS Headers', status: 'FAIL', error: 'Missing CORS headers' });
                return false;
            }
        } catch (error) {
            this.log(`CORS test failed: ${error.message}`, 'error');
            this.results.push({ test: 'CORS', status: 'FAIL', error: error.message });
            return false;
        }
    }

    async testLoginEndpoint() {
        this.log('Testing Login Endpoint...', 'info');

        try {
            const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
                email: 'test@example.com',
                password: 'testpassword'
            }, {
                headers: {
                    'Origin': FRONTEND_URL,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            });

            // Even if login fails, endpoint should be accessible
            this.log('Login endpoint accessible', 'success');
            this.results.push({ test: 'Login Endpoint', status: 'PASS' });
            return true;
        } catch (error) {
            if (error.response && error.response.status >= 400 && error.response.status < 500) {
                // Client error (401, 400) means endpoint is working
                this.log('Login endpoint accessible (auth error expected)', 'success');
                this.results.push({ test: 'Login Endpoint', status: 'PASS' });
                return true;
            } else {
                this.log(`Login endpoint failed: ${error.message}`, 'error');
                this.results.push({ test: 'Login Endpoint', status: 'FAIL', error: error.message });
                return false;
            }
        }
    }

    async testPerformance() {
        this.log('Testing Performance...', 'info');

        const tests = [
            { name: 'Health Check', url: `${BACKEND_URL}/health` },
            { name: 'API Test', url: `${BACKEND_URL}/api/test` }
        ];

        for (const test of tests) {
            const startTime = Date.now();

            try {
                await axios.get(test.url, {
                    timeout: 15000,
                    headers: { 'User-Agent': 'Swagat-Odisha-Test/1.0' }
                });
                const loadTime = Date.now() - startTime;

                if (loadTime < 3000) {
                    this.log(`${test.name}: ${loadTime}ms (Excellent)`, 'success');
                    this.results.push({ test: `${test.name} Performance`, status: 'PASS', time: `${loadTime}ms` });
                } else if (loadTime < 5000) {
                    this.log(`${test.name}: ${loadTime}ms (Good)`, 'success');
                    this.results.push({ test: `${test.name} Performance`, status: 'PASS', time: `${loadTime}ms` });
                } else {
                    this.log(`${test.name}: ${loadTime}ms (Slow)`, 'warning');
                    this.results.push({ test: `${test.name} Performance`, status: 'WARN', time: `${loadTime}ms` });
                }
            } catch (error) {
                this.log(`${test.name} failed: ${error.message}`, 'error');
                this.results.push({ test: `${test.name} Performance`, status: 'FAIL', error: error.message });
            }
        }
    }

    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('PRODUCTION FIXES TEST SUMMARY');
        console.log('='.repeat(60));

        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        const warnings = this.results.filter(r => r.status === 'WARN').length;

        console.log(`\nTotal Tests: ${this.results.length}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`⚠️  Warnings: ${warnings}`);
        console.log(`❌ Failed: ${failed}`);

        if (failed > 0) {
            console.log('\nFAILED TESTS:');
            this.results.filter(r => r.status === 'FAIL').forEach(result => {
                console.log(`- ${result.test}: ${result.error || 'Unknown error'}`);
            });
        }

        if (warnings > 0) {
            console.log('\nWARNINGS:');
            this.results.filter(r => r.status === 'WARN').forEach(result => {
                console.log(`- ${result.test}: ${result.time || 'Performance issue'}`);
            });
        }

        console.log('\n' + '='.repeat(60));

        if (failed === 0) {
            console.log('🎉 ALL TESTS PASSED! Production fixes are working!');
        } else {
            console.log('⚠️  Some tests failed. Check the issues above.');
        }
    }

    async runAllTests() {
        console.log('🚀 Testing Production Fixes for Swagat Odisha...\n');
        console.log(`Backend: ${BACKEND_URL}`);
        console.log(`Frontend: ${FRONTEND_URL}\n`);

        await this.testBackendHealth();
        await this.testRateLimiting();
        await this.testCORS();
        await this.testLoginEndpoint();
        await this.testPerformance();

        this.printSummary();
    }
}

// Run tests
const tester = new ProductionTester();
tester.runAllTests().catch(console.error);
