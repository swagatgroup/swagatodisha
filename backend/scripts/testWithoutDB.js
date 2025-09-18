#!/usr/bin/env node

const axios = require('axios');

async function testWithoutDB() {
    console.log('🔍 Testing Without Database');
    console.log('===========================\n');

    const baseURL = 'http://localhost:5000';

    try {
        // Step 1: Check server health
        console.log('1️⃣ Checking server health...');
        const healthResponse = await axios.get(`${baseURL}/health`);
        console.log('   ✅ Server is running');

        // Step 2: Test Redis endpoint with mock data (should fail with 500 due to DB)
        console.log('\n2️⃣ Testing Redis endpoint (expecting 500 due to no DB)...');

        const applicationData = {
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
        };

        try {
            const redisResponse = await axios.post(`${baseURL}/api/redis/application/create`, applicationData, {
                headers: {
                    'Authorization': 'Bearer mock_token_12345',
                    'Content-Type': 'application/json'
                }
            });

            console.log('   ❌ Unexpected success!');
            console.log('   📊 Status:', redisResponse.status);

        } catch (error) {
            if (error.response?.status === 500) {
                console.log('   ✅ Got expected 500 error (no database)');
                console.log('   📝 Message:', error.response.data.message);
                console.log('   📋 Error:', error.response.data.error);
            } else if (error.response?.status === 401) {
                console.log('   ✅ Got expected 401 error (invalid token)');
                console.log('   📝 Message:', error.response.data.message);
            } else {
                console.log('   ❌ Unexpected error:');
                console.log('   📊 Status:', error.response?.status);
                console.log('   📝 Message:', error.response?.data?.message || error.message);
            }
        }

        console.log('\n🎉 Test completed!');
        console.log('\n💡 The 500 error is because MongoDB is not running.');
        console.log('   Start MongoDB to fix this issue.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
testWithoutDB();
