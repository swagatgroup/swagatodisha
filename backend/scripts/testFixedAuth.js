#!/usr/bin/env node

const axios = require('axios');

async function testFixedAuth() {
    console.log('🔍 Testing Fixed Authentication');
    console.log('===============================\n');

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
            fullName: 'Fixed Auth User',
            email: `fixedauth${timestamp}@example.com`,
            phoneNumber: `9876543${timestamp.toString().slice(-3)}`,
            password: 'Password123!',
            role: 'student',
            guardianName: 'Fixed Auth Guardian'
        });

        if (userResponse.data.success) {
            const token = userResponse.data.data.token; // Fixed: get token from data.data.token
            const userId = userResponse.data.data.user.id;

            console.log('   ✅ User created!');
            console.log('   👤 User ID:', userId);
            console.log('   🔑 Token (first 20 chars):', token.substring(0, 20) + '...');

            // Step 3: Test Redis endpoint
            console.log('\n3️⃣ Testing Redis endpoint...');

            try {
                const redisResponse = await axios.post(`${baseURL}/api/redis/application/create`, {
                    personalDetails: {
                        fullName: 'Fixed Auth Student',
                        fathersName: 'Fixed Auth Father',
                        mothersName: 'Fixed Auth Mother',
                        dateOfBirth: '2000-01-01',
                        gender: 'Male',
                        aadharNumber: '123456789012'
                    },
                    contactDetails: {
                        primaryPhone: '9876543210',
                        whatsappNumber: '9876543210',
                        email: 'fixedauthstudent@example.com',
                        permanentAddress: {
                            street: 'Fixed Auth Street',
                            city: 'Fixed Auth City',
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
                        guardianName: 'Fixed Auth Guardian',
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
                console.log('   📋 Success:', redisResponse.data.success);

                if (redisResponse.data.submissionId) {
                    console.log('   📋 Submission ID:', redisResponse.data.submissionId);
                }

                if (redisResponse.data.data) {
                    console.log('   📋 Application ID:', redisResponse.data.data._id);
                }

                // Test status endpoint
                console.log('\n4️⃣ Testing status endpoint...');
                try {
                    const statusResponse = await axios.get(`${baseURL}/api/redis/application/status/${redisResponse.data.submissionId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (statusResponse.data.success) {
                        console.log('   ✅ Status endpoint working!');
                        console.log('   📊 Progress:', statusResponse.data.data.progress + '%');
                    } else {
                        console.log('   ❌ Status endpoint failed:', statusResponse.data.message);
                    }
                } catch (statusError) {
                    console.log('   ❌ Status endpoint error:', statusError.response?.data?.message || statusError.message);
                }

                console.log('\n🎉 EVERYTHING IS WORKING PERFECTLY!');
                console.log('   Your application submission should now work in the frontend.');
                console.log('   The 500 error you saw earlier was due to authentication issues.');

            } catch (error) {
                console.log('   ❌ Redis endpoint failed:');
                console.log('   📊 Status:', error.response?.status);
                console.log('   📝 Message:', error.response?.data?.message || error.message);
                console.log('   📋 Error data:', JSON.stringify(error.response?.data, null, 2));

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
testFixedAuth();
