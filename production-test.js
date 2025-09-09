#!/usr/bin/env node

/**
 * Production Testing Script for Swagat Odisha
 * Tests all critical functionality in production environment
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const PRODUCTION_URL = 'https://www.swagatodisha.com';
const BACKEND_URL = 'https://swagat-odisha-backend.onrender.com';

// Test credentials (replace with actual test accounts)
const TEST_ACCOUNTS = {
    student: {
        email: 'student@test.com',
        password: 'password123'
    },
    agent: {
        email: 'agent@test.com',
        password: 'password123'
    },
    staff: {
        email: 'staff@test.com',
        password: 'password123'
    },
    admin: {
        email: 'admin@test.com',
        password: 'password123'
    }
};

class ProductionTester {
    constructor() {
        this.results = [];
        this.tokens = {};
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}]`;

        switch (type) {
            case 'success':
                console.log(`${prefix} ✅ ${message}`.green);
                break;
            case 'error':
                console.log(`${prefix} ❌ ${message}`.red);
                break;
            case 'warning':
                console.log(`${prefix} ⚠️  ${message}`.yellow);
                break;
            case 'info':
            default:
                console.log(`${prefix} ℹ️  ${message}`.blue);
                break;
        }
    }

    async testBackendHealth() {
        this.log('Testing Backend Health...', 'info');

        try {
            const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 10000 });

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

    async testFrontendLoading() {
        this.log('Testing Frontend Loading...', 'info');

        try {
            const response = await axios.get(PRODUCTION_URL, { timeout: 15000 });

            if (response.status === 200 && response.data.includes('Swagat Group of Institutions')) {
                this.log('Frontend loads successfully', 'success');
                this.results.push({ test: 'Frontend Loading', status: 'PASS' });
                return true;
            } else {
                this.log('Frontend loading failed or content mismatch', 'error');
                this.results.push({ test: 'Frontend Loading', status: 'FAIL', error: 'Content mismatch' });
                return false;
            }
        } catch (error) {
            this.log(`Frontend loading failed: ${error.message}`, 'error');
            this.results.push({ test: 'Frontend Loading', status: 'FAIL', error: error.message });
            return false;
        }
    }

    async testCSSLoading() {
        this.log('Testing CSS Loading...', 'info');

        try {
            // Check if CSS file exists by looking for CSS links in HTML
            const response = await axios.get(PRODUCTION_URL, { timeout: 10000 });
            const html = response.data;

            if (html.includes('index-') && html.includes('.css')) {
                this.log('CSS files are properly linked', 'success');
                this.results.push({ test: 'CSS Loading', status: 'PASS' });
                return true;
            } else {
                this.log('CSS files not found in HTML', 'error');
                this.results.push({ test: 'CSS Loading', status: 'FAIL', error: 'CSS not linked' });
                return false;
            }
        } catch (error) {
            this.log(`CSS loading test failed: ${error.message}`, 'error');
            this.results.push({ test: 'CSS Loading', status: 'FAIL', error: error.message });
            return false;
        }
    }

    async testLogin(role, credentials) {
        this.log(`Testing ${role} login...`, 'info');

        try {
            const response = await axios.post(`${BACKEND_URL}/api/auth/login`, credentials, {
                timeout: 30000,
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.data.success && response.data.token) {
                this.tokens[role] = response.data.token;
                this.log(`${role} login successful`, 'success');
                this.results.push({ test: `${role} Login`, status: 'PASS' });
                return true;
            } else {
                this.log(`${role} login failed: ${response.data.message}`, 'error');
                this.results.push({ test: `${role} Login`, status: 'FAIL', error: response.data.message });
                return false;
            }
        } catch (error) {
            this.log(`${role} login failed: ${error.response?.data?.message || error.message}`, 'error');
            this.results.push({ test: `${role} Login`, status: 'FAIL', error: error.response?.data?.message || error.message });
            return false;
        }
    }

    async testDashboardAccess(role) {
        this.log(`Testing ${role} dashboard access...`, 'info');

        const token = this.tokens[role];
        if (!token) {
            this.log(`${role} dashboard test skipped - no token`, 'warning');
            return false;
        }

        try {
            let endpoint;
            switch (role) {
                case 'student':
                    endpoint = '/api/dashboard/student';
                    break;
                case 'agent':
                    endpoint = '/api/dashboard/agents/dashboard';
                    break;
                case 'staff':
                    endpoint = '/api/dashboard/staff/dashboard';
                    break;
                case 'admin':
                    endpoint = '/api/dashboard/super-admin';
                    break;
            }

            const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 15000
            });

            if (response.data.success) {
                this.log(`${role} dashboard accessible`, 'success');
                this.results.push({ test: `${role} Dashboard`, status: 'PASS' });
                return true;
            } else {
                this.log(`${role} dashboard failed: ${response.data.message}`, 'error');
                this.results.push({ test: `${role} Dashboard`, status: 'FAIL', error: response.data.message });
                return false;
            }
        } catch (error) {
            this.log(`${role} dashboard failed: ${error.response?.data?.message || error.message}`, 'error');
            this.results.push({ test: `${role} Dashboard`, status: 'FAIL', error: error.response?.data?.message || error.message });
            return false;
        }
    }

    async testAPIEndpoints() {
        this.log('Testing API Endpoints...', 'info');

        const endpoints = [
            '/api/health',
            '/api/test',
            '/api/auth/me'
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(`${BACKEND_URL}${endpoint}`, { timeout: 10000 });

                if (response.status === 200) {
                    this.log(`Endpoint ${endpoint} working`, 'success');
                    this.results.push({ test: `API ${endpoint}`, status: 'PASS' });
                } else {
                    this.log(`Endpoint ${endpoint} failed: ${response.status}`, 'error');
                    this.results.push({ test: `API ${endpoint}`, status: 'FAIL', error: `Status: ${response.status}` });
                }
            } catch (error) {
                this.log(`Endpoint ${endpoint} failed: ${error.message}`, 'error');
                this.results.push({ test: `API ${endpoint}`, status: 'FAIL', error: error.message });
            }
        }
    }

    async testPerformance() {
        this.log('Testing Performance...', 'info');

        const tests = [
            { name: 'Frontend Load Time', url: PRODUCTION_URL },
            { name: 'Backend Response Time', url: `${BACKEND_URL}/health` }
        ];

        for (const test of tests) {
            const startTime = Date.now();

            try {
                await axios.get(test.url, { timeout: 30000 });
                const loadTime = Date.now() - startTime;

                if (loadTime < 5000) {
                    this.log(`${test.name}: ${loadTime}ms (Good)`, 'success');
                    this.results.push({ test: test.name, status: 'PASS', time: `${loadTime}ms` });
                } else if (loadTime < 10000) {
                    this.log(`${test.name}: ${loadTime}ms (Acceptable)`, 'warning');
                    this.results.push({ test: test.name, status: 'WARN', time: `${loadTime}ms` });
                } else {
                    this.log(`${test.name}: ${loadTime}ms (Slow)`, 'error');
                    this.results.push({ test: test.name, status: 'FAIL', time: `${loadTime}ms` });
                }
            } catch (error) {
                this.log(`${test.name} failed: ${error.message}`, 'error');
                this.results.push({ test: test.name, status: 'FAIL', error: error.message });
            }
        }
    }

    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('PRODUCTION TEST SUMMARY'.bold);
        console.log('='.repeat(60));

        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        const warnings = this.results.filter(r => r.status === 'WARN').length;

        console.log(`\nTotal Tests: ${this.results.length}`);
        console.log(`✅ Passed: ${passed}`.green);
        console.log(`⚠️  Warnings: ${warnings}`.yellow);
        console.log(`❌ Failed: ${failed}`.red);

        if (failed > 0) {
            console.log('\nFAILED TESTS:'.red.bold);
            this.results.filter(r => r.status === 'FAIL').forEach(result => {
                console.log(`- ${result.test}: ${result.error || 'Unknown error'}`.red);
            });
        }

        if (warnings > 0) {
            console.log('\nWARNINGS:'.yellow.bold);
            this.results.filter(r => r.status === 'WARN').forEach(result => {
                console.log(`- ${result.test}: ${result.time || 'Performance issue'}`.yellow);
            });
        }

        console.log('\n' + '='.repeat(60));

        if (failed === 0) {
            console.log('🎉 ALL TESTS PASSED! Production is ready!'.green.bold);
        } else {
            console.log('⚠️  Some tests failed. Please check the issues above.'.red.bold);
        }
    }

    async runAllTests() {
        console.log('🚀 Starting Production Tests for Swagat Odisha...'.bold);
        console.log(`Frontend: ${PRODUCTION_URL}`);
        console.log(`Backend: ${BACKEND_URL}\n`);

        // Basic connectivity tests
        await this.testBackendHealth();
        await this.testFrontendLoading();
        await this.testCSSLoading();
        await this.testAPIEndpoints();
        await this.testPerformance();

        // Authentication tests
        for (const [role, credentials] of Object.entries(TEST_ACCOUNTS)) {
            await this.testLogin(role, credentials);
            await this.testDashboardAccess(role);
        }

        this.printSummary();
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new ProductionTester();
    tester.runAllTests().catch(console.error);
}

module.exports = ProductionTester;
