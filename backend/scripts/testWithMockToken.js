#!/usr/bin/env node

const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testWithMockToken() {
    console.log('🔍 Testing with Mock Token');
    console.log('==========================\n');

    const baseURL = 'http://localhost:5000';

    try {
        // Step 1: Check server health
        console.log('1️⃣ Checking server health...');
        const healthResponse = await axios.get(`${baseURL}/health`);
        console.log('   ✅ Server is running');

        // Step 2: Create a mock JWT token
        console.log('\n2️⃣ Creating mock JWT token...');
        const mockUserId = '507f1f77bcf86cd799439011'; // Mock ObjectId
        const mockToken = jwt.sign(
            { id: mockUserId, role: 'student' },
            process.env.JWT_SECRET || 'swagat_odisha_jwt_secret_key_2024_development',
            { expiresIn: '7d' }
        );

        console.log('   ✅ Mock token created');
        console.log('   👤 Mock User ID:', mockUserId);
        console.log('   🔑 Token (first 20 chars):', mockToken.substring(0, 20) + '...');

        // Step 3: Test Redis endpoint with mock token
        console.log('\n3️⃣ Testing Redis endpoint with mock token...');

        const applicationData = {
            personalDetails: {
                fullName: 'Mock Test Student',
                fathersName: 'Mock Father',
                mothersName: 'Mock Mother',
                dateOfBirth: '2000-01-01',
                gender: 'Male',
                aadharNumber: '123456789012'
            },
            contactDetails: {
                primaryPhone: '9876543210',
                whatsappNumber: '9876543210',
                email: 'mockstudent@example.com',
                permanentAddress: {
                    street: 'Mock Street',
                    city: 'Mock City',
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
                guardianName: 'Mock Guardian',
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

        console.log('   📤 Sending request with mock token...');

        try {
            const redisResponse = await axios.post(`${baseURL}/api/redis/application/create`, applicationData, {
                headers: {
                    'Authorization': `Bearer ${mockToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('   ✅ SUCCESS! Redis endpoint worked with mock token!');
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

        console.log('\n🎉 Mock token test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
testWithMockToken();
