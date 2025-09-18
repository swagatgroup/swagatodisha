#!/usr/bin/env node

const axios = require('axios');

async function simpleWorkingTest() {
    console.log('🔍 Simple Working Test');
    console.log('======================\n');

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
            fullName: 'Simple User',
            email: `simple${timestamp}@example.com`,
            phoneNumber: `9876543${timestamp.toString().slice(-3)}`,
            password: 'Password123!',
            role: 'student',
            guardianName: 'Simple Guardian'
        });

        if (userResponse.data.success) {
            const token = userResponse.data.token;
            const userId = userResponse.data.data.user.id;

            console.log('   ✅ User created!');
            console.log('   👤 User ID:', userId);
            console.log('   🔑 Token received');

            // Step 3: Test Redis endpoint
            console.log('\n3️⃣ Testing Redis endpoint...');

            try {
                const redisResponse = await axios.post(`${baseURL}/api/redis/application/create`, {
                    personalDetails: {
                        fullName: 'Test Student',
                        fathersName: 'Test Father',
                        mothersName: 'Test Mother',
                        dateOfBirth: '2000-01-01',
                        gender: 'Male',
                        aadharNumber: '123456789012'
                    },
                    contactDetails: {
                        primaryPhone: '9876543210',
                        whatsappNumber: '9876543210',
                        email: 'teststudent@example.com',
                        permanentAddress: {
                            street: 'Test Street',
                            city: 'Test City',
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
                        guardianName: 'Test Guardian',
                        relationship: 'Father',
                        guardianPhone: '9876543210',
                        guardianEmail: 'guardian@example.com'
                    },
                    financialDetails: {
                        annualIncome: '500000',
                        occupation: 'Business'
                    },
                    termsAccepted: true
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('   ✅ SUCCESS! Redis endpoint working!');
                console.log('   📊 Status:', redisResponse.status);
                console.log('   📝 Message:', redisResponse.data.message);

                if (redisResponse.data.submissionId) {
                    console.log('   📋 Submission ID:', redisResponse.data.submissionId);
                }

                console.log('\n🎉 EVERYTHING IS WORKING!');
                console.log('   Your application submission should now work in the frontend.');

            } catch (error) {
                console.log('   ❌ Redis endpoint failed:');
                console.log('   📊 Status:', error.response?.status);
                console.log('   📝 Message:', error.response?.data?.message || error.message);

                if (error.response?.status === 500) {
                    console.log('   💡 500 error - check server logs');
                }
            }

        } else {
            console.log('   ❌ User creation failed:', userResponse.data.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
simpleWorkingTest();
