#!/usr/bin/env node

const axios = require('axios');

async function checkRegistrationResponse() {
    console.log('🔍 Checking Registration Response');
    console.log('=================================\n');

    const baseURL = 'http://localhost:5000';

    try {
        // Step 1: Check server health
        console.log('1️⃣ Checking server health...');
        const healthResponse = await axios.get(`${baseURL}/health`);
        console.log('   ✅ Server is running');

        // Step 2: Create a user and log the full response
        console.log('\n2️⃣ Creating user and logging full response...');
        const timestamp = Date.now();

        try {
            const userResponse = await axios.post(`${baseURL}/api/auth/register`, {
                fullName: 'Response Debug User',
                email: `responsedebug${timestamp}@example.com`,
                phoneNumber: `9876543${timestamp.toString().slice(-3)}`,
                password: 'Password123!',
                role: 'student',
                guardianName: 'Response Debug Guardian'
            });

            console.log('   ✅ Registration request successful!');
            console.log('   📊 Status:', userResponse.status);
            console.log('   📋 Full response:');
            console.log(JSON.stringify(userResponse.data, null, 2));

            if (userResponse.data.success) {
                console.log('\n   ✅ Registration successful!');
                console.log('   🔑 Token exists:', !!userResponse.data.token);
                console.log('   👤 User exists:', !!userResponse.data.data?.user);

                if (userResponse.data.token) {
                    console.log('   🔑 Token (first 20 chars):', userResponse.data.token.substring(0, 20) + '...');
                }

                if (userResponse.data.data?.user) {
                    console.log('   👤 User ID:', userResponse.data.data.user.id);
                    console.log('   📧 Email:', userResponse.data.data.user.email);
                }
            } else {
                console.log('   ❌ Registration failed:', userResponse.data.message);
            }

        } catch (error) {
            console.log('   ❌ Registration request failed:');
            console.log('   📊 Status:', error.response?.status);
            console.log('   📝 Message:', error.response?.data?.message || error.message);
            console.log('   📋 Error data:', JSON.stringify(error.response?.data, null, 2));
        }

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

// Run the debug
checkRegistrationResponse();
