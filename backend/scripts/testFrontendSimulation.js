#!/usr/bin/env node

const axios = require('axios');

async function testFrontendSimulation() {
    console.log('🔍 Simulating Frontend Request');
    console.log('==============================\n');

    const baseURL = 'http://localhost:5000';

    try {
        // Step 1: Check server health
        console.log('1️⃣ Checking server health...');
        const healthResponse = await axios.get(`${baseURL}/health`);
        console.log('   ✅ Server is running');

        // Step 2: Create a user and get a token (simulating frontend login)
        console.log('\n2️⃣ Creating user and getting token (simulating frontend login)...');
        let token, userId;

        const timestamp = Date.now();
        try {
            const userResponse = await axios.post(`${baseURL}/api/auth/register`, {
                fullName: 'Frontend Test User',
                email: `frontendtest${timestamp}@example.com`,
                phoneNumber: `9876543${timestamp.toString().slice(-3)}`,
                password: 'Password123!',
                role: 'student',
                guardianName: 'Frontend Test Guardian'
            });

            if (userResponse.data.success) {
                token = userResponse.data.token;
                userId = userResponse.data.user._id;
                console.log('   ✅ User created and token received');
                console.log('   👤 User ID:', userId);
                console.log('   🔑 Token (first 20 chars):', token.substring(0, 20) + '...');
            } else {
                console.log('   ❌ User creation failed:', userResponse.data.message);
                return;
            }
        } catch (error) {
            console.log('   ❌ User creation error:');
            console.log('   📊 Status:', error.response?.status);
            console.log('   📝 Message:', error.response?.data?.message || error.message);
            console.log('   📋 Data:', error.response?.data);
            return;
        }

        // Step 3: Test Redis endpoint with the token (exactly like frontend would)
        console.log('\n3️⃣ Testing Redis endpoint with token (simulating frontend request)...');

        const applicationData = {
            personalDetails: {
                fullName: 'Frontend Test Student',
                fathersName: 'Frontend Father',
                mothersName: 'Frontend Mother',
                dateOfBirth: '2000-01-01',
                gender: 'Male',
                aadharNumber: '123456789012'
            },
            contactDetails: {
                primaryPhone: '9876543210',
                whatsappNumber: '9876543210',
                email: 'frontendstudent@example.com',
                permanentAddress: {
                    street: 'Frontend Street',
                    city: 'Frontend City',
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
                guardianName: 'Frontend Guardian',
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

        console.log('   📤 Sending request exactly like frontend would...');
        console.log('   📋 Headers:');
        console.log('     Authorization: Bearer ' + token.substring(0, 20) + '...');
        console.log('     Content-Type: application/json');

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

        console.log('\n🎉 Frontend simulation completed!');
        console.log('\n💡 If this test works, the issue is in the frontend authentication.');
        console.log('   If this test fails, the issue is in the backend.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
testFrontendSimulation();
