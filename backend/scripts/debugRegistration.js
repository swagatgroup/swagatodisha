#!/usr/bin/env node

const axios = require('axios');

async function debugRegistration() {
    console.log('🔍 Debugging Registration Process');
    console.log('=================================\n');

    const baseURL = 'http://localhost:5000';

    try {
        // Step 1: Check server health
        console.log('1️⃣ Checking server health...');
        const healthResponse = await axios.get(`${baseURL}/health`);
        console.log('   ✅ Server is running');

        // Step 2: Test registration with detailed logging
        console.log('\n2️⃣ Testing registration with detailed logging...');
        const timestamp = Date.now();

        const userData = {
            fullName: 'Debug User',
            email: `debug${timestamp}@example.com`,
            phoneNumber: `9876543${timestamp.toString().slice(-3)}`,
            password: 'Password123!',
            role: 'student',
            guardianName: 'Debug Guardian'
        };

        console.log('   📤 Sending registration request...');
        console.log('   📋 User data:', JSON.stringify(userData, null, 2));

        try {
            const userResponse = await axios.post(`${baseURL}/api/auth/register`, userData);

            console.log('   ✅ Registration successful!');
            console.log('   📊 Status:', userResponse.status);
            console.log('   📋 Response:', JSON.stringify(userResponse.data, null, 2));

        } catch (error) {
            console.log('   ❌ Registration failed:');
            console.log('   📊 Status:', error.response?.status);
            console.log('   📝 Message:', error.response?.data?.message || error.message);
            console.log('   📋 Error data:', JSON.stringify(error.response?.data, null, 2));

            if (error.response?.status === 500) {
                console.log('\n   🔍 500 Error Details:');
                console.log('   📋 Full error response:', error.response.data);
            }
        }

        // Step 3: Test with a simpler user data
        console.log('\n3️⃣ Testing with simpler user data...');

        const simpleUserData = {
            fullName: 'Simple User',
            email: `simple${timestamp}@example.com`,
            phoneNumber: `9876543${(timestamp + 1).toString().slice(-3)}`,
            password: 'Password123!',
            role: 'student',
            guardianName: 'Simple Guardian'
        };

        try {
            const simpleResponse = await axios.post(`${baseURL}/api/auth/register`, simpleUserData);

            console.log('   ✅ Simple registration successful!');
            console.log('   📊 Status:', simpleResponse.status);
            console.log('   👤 User ID:', simpleResponse.data.user?._id || 'Not found');
            console.log('   📧 Email:', simpleResponse.data.user?.email || 'Not found');

        } catch (error) {
            console.log('   ❌ Simple registration also failed:');
            console.log('   📊 Status:', error.response?.status);
            console.log('   📝 Message:', error.response?.data?.message || error.message);
            console.log('   📋 Error data:', JSON.stringify(error.response?.data, null, 2));
        }

        console.log('\n🎉 Debug completed!');

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
        process.exit(1);
    }
}

// Run the debug
debugRegistration();
