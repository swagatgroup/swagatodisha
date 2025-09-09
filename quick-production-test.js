#!/usr/bin/env node

/**
 * Quick Production Test for Swagat Odisha
 * Fast verification of critical functionality
 */

const axios = require('axios');

const PRODUCTION_URL = 'https://www.swagatodisha.com';
const BACKEND_URL = 'https://swagat-odisha-backend.onrender.com';

async function quickTest() {
    console.log('🚀 Quick Production Test for Swagat Odisha\n');

    const tests = [
        {
            name: 'Frontend Loading',
            test: async () => {
                const response = await axios.get(PRODUCTION_URL, { timeout: 10000 });
                return response.status === 200 && response.data.includes('Swagat');
            }
        },
        {
            name: 'Backend Health',
            test: async () => {
                const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 10000 });
                return response.status === 200;
            }
        },
        {
            name: 'CSS Loading',
            test: async () => {
                const response = await axios.get(PRODUCTION_URL, { timeout: 10000 });
                return response.data.includes('.css');
            }
        },
        {
            name: 'API Endpoints',
            test: async () => {
                const response = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 10000 });
                return response.status === 200;
            }
        }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            const result = await test.test();
            if (result) {
                console.log(`✅ ${test.name} - PASS`);
                passed++;
            } else {
                console.log(`❌ ${test.name} - FAIL`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name} - ERROR: ${error.message}`);
            failed++;
        }
    }

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
        console.log('🎉 All tests passed! Production is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Check the issues above.');
    }
}

quickTest().catch(console.error);
