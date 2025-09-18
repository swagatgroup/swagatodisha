#!/usr/bin/env node

const axios = require('axios');

async function testServerStatus() {
    console.log('🔍 Testing Server Status');
    console.log('========================\n');

    const baseURL = 'http://localhost:5000';

    try {
        // Step 1: Check server health
        console.log('1️⃣ Checking server health...');
        const healthResponse = await axios.get(`${baseURL}/health`);
        console.log('   ✅ Server is running');
        console.log('   📊 Status:', healthResponse.data.status);

        // Step 2: Check if database is connected by testing a simple endpoint
        console.log('\n2️⃣ Testing database connection...');
        try {
            const usersResponse = await axios.get(`${baseURL}/api/users`);
            console.log('   ✅ Database connection working');
            console.log('   📊 Users endpoint status:', usersResponse.status);
        } catch (error) {
            console.log('   ❌ Database connection issue:');
            console.log('   📊 Status:', error.response?.status);
            console.log('   📝 Message:', error.response?.data?.message || error.message);
        }

        // Step 3: Test a simple POST endpoint that doesn't require auth
        console.log('\n3️⃣ Testing simple POST endpoint...');
        try {
            const testResponse = await axios.post(`${baseURL}/api/test`, { test: 'data' });
            console.log('   ✅ Simple POST endpoint working');
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('   ⚠️  Simple POST endpoint not found (expected)');
            } else {
                console.log('   ❌ Simple POST endpoint error:');
                console.log('   📊 Status:', error.response?.status);
                console.log('   📝 Message:', error.response?.data?.message || error.message);
            }
        }

        // Step 4: Test Redis endpoint without auth (should fail with 401)
        console.log('\n4️⃣ Testing Redis endpoint without auth...');
        try {
            const redisResponse = await axios.post(`${baseURL}/api/redis/application/create`, { test: 'data' });
            console.log('   ❌ Redis endpoint should require auth!');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('   ✅ Redis endpoint correctly requires auth');
            } else {
                console.log('   ❌ Redis endpoint unexpected error:');
                console.log('   📊 Status:', error.response?.status);
                console.log('   📝 Message:', error.response?.data?.message || error.message);
            }
        }

        console.log('\n🎉 Server status test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure the server is running:');
            console.log('   npm run dev');
        }

        process.exit(1);
    }
}

// Run the test
testServerStatus();
