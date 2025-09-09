#!/usr/bin/env node

/**
 * Test Backend Server Locally
 */

const axios = require('axios');

async function testBackend() {
    console.log('🧪 Testing Backend Server...\n');

    const tests = [
        {
            name: 'Health Check',
            url: 'http://localhost:5000/health',
            method: 'GET'
        },
        {
            name: 'API Health Check',
            url: 'http://localhost:5000/api/health',
            method: 'GET'
        },
        {
            name: 'CORS Test',
            url: 'http://localhost:5000/api/test',
            method: 'GET',
            headers: {
                'Origin': 'https://www.swagatodisha.com'
            }
        }
    ];

    for (const test of tests) {
        try {
            console.log(`Testing ${test.name}...`);
            const response = await axios({
                method: test.method,
                url: test.url,
                headers: test.headers || {},
                timeout: 5000
            });

            console.log(`✅ ${test.name}: ${response.status} - ${response.data.message || 'OK'}`);
        } catch (error) {
            console.log(`❌ ${test.name}: ${error.message}`);
        }
    }
}

testBackend().catch(console.error);
