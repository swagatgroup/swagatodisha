#!/usr/bin/env node

const axios = require('axios');

async function simpleTest() {
    console.log('🧪 Simple Application Test');
    console.log('==========================\n');

    const baseURL = 'http://localhost:5000';

    try {
        // Step 1: Check server health
        console.log('1️⃣ Checking server health...');
        const healthResponse = await axios.get(`${baseURL}/health`);
        console.log('   ✅ Server is running');
        console.log('   📊 Status:', healthResponse.data.status);

        // Step 2: Try to create a user with all required fields
        console.log('\n2️⃣ Creating test user...');
        let token, userId;

        try {
            const userResponse = await axios.post(`${baseURL}/api/auth/register`, {
                fullName: 'Simple Test User',
                email: 'simpletest@example.com',
                phoneNumber: '9876543210',
                password: 'password123',
                role: 'student',
                guardianName: 'Simple Test Guardian'
            });

            if (userResponse.data.success) {
                token = userResponse.data.token;
                userId = userResponse.data.user._id;
                console.log('   ✅ Test user created');
                console.log('   👤 User ID:', userId);
            } else {
                console.log('   ❌ User creation failed:', userResponse.data.message);
                return;
            }
        } catch (error) {
            if (error.response && error.response.data.message.includes('already exists')) {
                console.log('   ⚠️  User already exists, trying to login...');

                const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
                    email: 'simpletest@example.com',
                    password: 'password123'
                });

                if (loginResponse.data.success) {
                    token = loginResponse.data.token;
                    userId = loginResponse.data.user._id;
                    console.log('   ✅ Login successful');
                    console.log('   👤 User ID:', userId);
                } else {
                    console.log('   ❌ Login failed:', loginResponse.data.message);
                    console.log('   📊 Status:', loginResponse.status);
                    console.log('   📋 Data:', loginResponse.data);
                    return;
                }
            } else {
                console.log('   ❌ User creation error:');
                console.log('   📊 Status:', error.response?.status);
                console.log('   📝 Message:', error.response?.data?.message || error.message);
                console.log('   📋 Data:', error.response?.data);
                return;
            }
        }

        // Step 3: Test Redis endpoint
        console.log('\n3️⃣ Testing Redis endpoint...');

        const applicationData = {
            personalDetails: {
                fullName: 'Simple Test Student',
                fathersName: 'Simple Father',
                mothersName: 'Simple Mother',
                dateOfBirth: '2000-01-01',
                gender: 'Male',
                aadharNumber: '123456789012'
            },
            contactDetails: {
                primaryPhone: '9876543210',
                whatsappNumber: '9876543210',
                email: 'simplestudent@example.com',
                permanentAddress: {
                    street: 'Simple Street',
                    city: 'Simple City',
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
                guardianName: 'Simple Guardian',
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

        try {
            console.log('   📤 Sending request to Redis endpoint...');
            const redisResponse = await axios.post(`${baseURL}/api/redis/application/create`, applicationData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('   ✅ Redis endpoint response received!');
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
            console.log('   ❌ Redis endpoint error:');
            console.log('   📊 Status:', error.response?.status);
            console.log('   📝 Message:', error.response?.data?.message || error.message);
            console.log('   📋 Data:', error.response?.data);

            if (error.response?.status === 500) {
                console.log('   💡 500 Internal Server Error - check server logs for details');
            }
        }

        console.log('\n🎉 Simple test completed!');

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
simpleTest();
