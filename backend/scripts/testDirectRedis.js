#!/usr/bin/env node

const axios = require('axios');

async function testDirectRedis() {
    console.log('🔍 Testing Redis Endpoint Directly');
    console.log('==================================\n');

    const baseURL = 'http://localhost:5000';

    try {
        // Step 1: Check server health
        console.log('1️⃣ Checking server health...');
        const healthResponse = await axios.get(`${baseURL}/health`);
        console.log('   ✅ Server is running');

        // Step 2: Try to login with an existing user
        console.log('\n2️⃣ Trying to login with existing user...');
        let token, userId;

        // Try common test emails
        const testEmails = [
            'test@example.com',
            'testuser@example.com',
            'student@example.com',
            'admin@example.com'
        ];

        for (const email of testEmails) {
            try {
                console.log(`   🔍 Trying email: ${email}`);
                const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
                    email: email,
                    password: 'Password123!'
                });

                if (loginResponse.data.success) {
                    token = loginResponse.data.token;
                    userId = loginResponse.data.user._id;
                    console.log(`   ✅ Login successful with ${email}`);
                    console.log('   👤 User ID:', userId);
                    break;
                }
            } catch (error) {
                console.log(`   ❌ Login failed for ${email}: ${error.response?.data?.message || error.message}`);
            }
        }

        if (!token) {
            console.log('   ❌ No existing user found. Creating a new one...');

            // Create a simple user without complex validation
            try {
                const timestamp = Date.now();
                const userResponse = await axios.post(`${baseURL}/api/auth/register`, {
                    fullName: 'Direct Test User',
                    email: `directtest${timestamp}@example.com`,
                    phoneNumber: `9876543${timestamp.toString().slice(-3)}`,
                    password: 'Password123!',
                    role: 'student',
                    guardianName: 'Direct Test Guardian'
                });

                if (userResponse.data.success) {
                    token = userResponse.data.token;
                    userId = userResponse.data.user._id;
                    console.log('   ✅ New user created');
                } else {
                    console.log('   ❌ User creation failed:', userResponse.data.message);
                    return;
                }
            } catch (error) {
                console.log('   ❌ User creation error:', error.response?.data?.message || error.message);
                return;
            }
        }

        // Step 3: Test Redis endpoint
        console.log('\n3️⃣ Testing Redis endpoint...');

        const applicationData = {
            personalDetails: {
                fullName: 'Direct Test Student',
                fathersName: 'Direct Father',
                mothersName: 'Direct Mother',
                dateOfBirth: '2000-01-01',
                gender: 'Male',
                aadharNumber: '123456789012'
            },
            contactDetails: {
                primaryPhone: '9876543210',
                whatsappNumber: '9876543210',
                email: 'directstudent@example.com',
                permanentAddress: {
                    street: 'Direct Street',
                    city: 'Direct City',
                    state: 'Odisha',
                    pincode: '751001',
                    country: 'India'
                }
            },
            courseDetails: {
                selectedCourse: 'B.Tech Computer Science',
                stream: 'Engineering'
            },
            guardianDetails: {
                guardianName: 'Direct Guardian',
                relationship: 'Father',
                guardianPhone: '9876543210',
                guardianEmail: 'guardian@example.com'
            },
            financialDetails: {
                annualIncome: '500000',
                occupation: 'Business'
            },
            termsAccepted: true
        };

        console.log('   📤 Sending request to Redis endpoint...');
        console.log('   📋 Token (first 20 chars):', token.substring(0, 20) + '...');
        console.log('   📋 User ID:', userId);

        try {
            const redisResponse = await axios.post(`${baseURL}/api/redis/application/create`, applicationData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('   ✅ SUCCESS! Redis endpoint worked!');
            console.log('   📊 Status:', redisResponse.status);
            console.log('   📋 Success:', redisResponse.data.success);
            console.log('   📝 Message:', redisResponse.data.message);

            if (redisResponse.data.submissionId) {
                console.log('   📋 Submission ID:', redisResponse.data.submissionId);
            }

            if (redisResponse.data.data) {
                console.log('   📋 Application ID:', redisResponse.data.data._id);
            }

        } catch (error) {
            console.log('   ❌ Redis endpoint failed:');
            console.log('   📊 Status:', error.response?.status);
            console.log('   📝 Message:', error.response?.data?.message || error.message);
            console.log('   📋 Error data:', JSON.stringify(error.response?.data, null, 2));

            if (error.response?.status === 500) {
                console.log('\n   🔍 500 Error Details:');
                console.log('   📋 Error message:', error.response.data.error);
                console.log('   📋 Full error:', error.response.data);
            }
        }

        console.log('\n🎉 Direct test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
testDirectRedis();
