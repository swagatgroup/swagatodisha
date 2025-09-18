#!/usr/bin/env node

const axios = require('axios');

async function quickFixTest() {
    console.log('🔧 Quick Fix Test');
    console.log('=================\n');

    const baseURL = 'http://localhost:5000';

    try {
        // Step 1: Check server health
        console.log('1️⃣ Checking server health...');
        const healthResponse = await axios.get(`${baseURL}/health`);
        console.log('   ✅ Server is running');

        // Step 2: Test database connection by creating a user
        console.log('\n2️⃣ Testing database connection...');
        const timestamp = Date.now();

        try {
            const userResponse = await axios.post(`${baseURL}/api/auth/register`, {
                fullName: 'Quick Fix User',
                email: `quickfix${timestamp}@example.com`,
                phoneNumber: `9876543${timestamp.toString().slice(-3)}`,
                password: 'Password123!',
                role: 'student',
                guardianName: 'Quick Fix Guardian'
            });

            if (userResponse.data.success) {
                console.log('   ✅ Database connection working!');
                console.log('   👤 User created:', userResponse.data.user.email);

                const token = userResponse.data.token;
                console.log('   🔑 Token received');

                // Step 3: Test Redis endpoint with real token
                console.log('\n3️⃣ Testing Redis endpoint with real token...');

                const applicationData = {
                    personalDetails: {
                        fullName: 'Quick Fix Student',
                        fathersName: 'Quick Fix Father',
                        mothersName: 'Quick Fix Mother',
                        dateOfBirth: '2000-01-01',
                        gender: 'Male',
                        aadharNumber: '123456789012'
                    },
                    contactDetails: {
                        primaryPhone: '9876543210',
                        whatsappNumber: '9876543210',
                        email: 'quickfixstudent@example.com',
                        permanentAddress: {
                            street: 'Quick Fix Street',
                            city: 'Quick Fix City',
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
                        guardianName: 'Quick Fix Guardian',
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
                    const redisResponse = await axios.post(`${baseURL}/api/redis/application/create`, applicationData, {
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
                    console.log('   ❌ Redis endpoint still failing:');
                    console.log('   📊 Status:', error.response?.status);
                    console.log('   📝 Message:', error.response?.data?.message || error.message);

                    if (error.response?.status === 500) {
                        console.log('   💡 Still getting 500 error - check server logs for details');
                    }
                }

            } else {
                console.log('   ❌ User creation failed:', userResponse.data.message);
            }

        } catch (error) {
            console.log('   ❌ Database connection failed:');
            console.log('   📊 Status:', error.response?.status);
            console.log('   📝 Message:', error.response?.data?.message || error.message);

            if (error.message.includes('ECONNREFUSED')) {
                console.log('\n   💡 MONGODB IS NOT RUNNING!');
                console.log('   Please start MongoDB:');
                console.log('   1. Open a new terminal');
                console.log('   2. Run: mongod');
                console.log('   3. Or use MongoDB Atlas (cloud)');
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure the server is running:');
            console.log('   npm run dev');
        }
    }
}

// Run the test
quickFixTest();
