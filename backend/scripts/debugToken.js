#!/usr/bin/env node

const axios = require('axios');
const jwt = require('jsonwebtoken');

async function debugToken() {
    console.log('🔍 Debugging Token Issue');
    console.log('=========================\n');

    const baseURL = 'http://localhost:5000';

    try {
        // Step 1: Check server health
        console.log('1️⃣ Checking server health...');
        const healthResponse = await axios.get(`${baseURL}/health`);
        console.log('   ✅ Server is running');

        // Step 2: Create a user
        console.log('\n2️⃣ Creating user...');
        const timestamp = Date.now();

        const userResponse = await axios.post(`${baseURL}/api/auth/register`, {
            fullName: 'Token Debug User',
            email: `tokendebug${timestamp}@example.com`,
            phoneNumber: `9876543${timestamp.toString().slice(-3)}`,
            password: 'Password123!',
            role: 'student',
            guardianName: 'Token Debug Guardian'
        });

        if (userResponse.data.success) {
            const token = userResponse.data.token;
            const userId = userResponse.data.data.user.id;

            console.log('   ✅ User created!');
            console.log('   👤 User ID:', userId);
            console.log('   🔑 Token (first 50 chars):', token.substring(0, 50) + '...');
            console.log('   🔑 Token length:', token.length);

            // Step 3: Check JWT_SECRET
            console.log('\n3️⃣ Checking JWT_SECRET...');
            const jwtSecret = process.env.JWT_SECRET || 'swagat_odisha_jwt_secret_key_2024_development';
            console.log('   🔑 JWT_SECRET (first 20 chars):', jwtSecret.substring(0, 20) + '...');
            console.log('   🔑 JWT_SECRET length:', jwtSecret.length);

            // Step 4: Try to decode token
            console.log('\n4️⃣ Trying to decode token...');
            try {
                const decoded = jwt.verify(token, jwtSecret);
                console.log('   ✅ Token decoded successfully!');
                console.log('   👤 Decoded ID:', decoded.id);
                console.log('   🔑 Decoded role:', decoded.role);
                console.log('   📅 Decoded iat:', new Date(decoded.iat * 1000));
                console.log('   📅 Decoded exp:', new Date(decoded.exp * 1000));
            } catch (jwtError) {
                console.log('   ❌ Token decode failed:', jwtError.message);
                console.log('   🔍 Error type:', jwtError.name);

                // Try to decode without verification
                try {
                    const decoded = jwt.decode(token);
                    console.log('   🔍 Decoded without verification:', decoded);
                } catch (decodeError) {
                    console.log('   ❌ Even decode without verification failed:', decodeError.message);
                }
            }

            // Step 5: Test with a simple token
            console.log('\n5️⃣ Testing with simple token...');
            try {
                const simpleToken = jwt.sign({ id: userId, role: 'student' }, jwtSecret, { expiresIn: '7d' });
                console.log('   ✅ Simple token created');

                const decoded = jwt.verify(simpleToken, jwtSecret);
                console.log('   ✅ Simple token decoded successfully!');
                console.log('   👤 Decoded ID:', decoded.id);
            } catch (simpleError) {
                console.log('   ❌ Simple token test failed:', simpleError.message);
            }

        } else {
            console.log('   ❌ User creation failed:', userResponse.data.message);
        }

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

// Run the debug
debugToken();
