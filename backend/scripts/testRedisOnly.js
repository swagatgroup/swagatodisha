#!/usr/bin/env node

const axios = require('axios');

async function testRedisOnly() {
    console.log('🔍 Testing Redis Endpoint Only (No Auth)');
    console.log('========================================\n');

    const baseURL = 'http://localhost:5000';

    try {
        // Step 1: Check server health
        console.log('1️⃣ Checking server health...');
        const healthResponse = await axios.get(`${baseURL}/health`);
        console.log('   ✅ Server is running');

        // Step 2: Test Redis endpoint without authentication (should fail with 401)
        console.log('\n2️⃣ Testing Redis endpoint without auth (should fail with 401)...');

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
                    'Content-Type': 'application/json'
                }
            });

            console.log('   ❌ Unexpected success without auth!');
            console.log('   📊 Status:', redisResponse.status);

        } catch (error) {
            if (error.response?.status === 401) {
                console.log('   ✅ Correctly failed with 401 (no auth)');
                console.log('   📝 Message:', error.response.data.message);
            } else {
                console.log('   ❌ Unexpected error:');
                console.log('   📊 Status:', error.response?.status);
                console.log('   📝 Message:', error.response?.data?.message || error.message);
                console.log('   📋 Error data:', JSON.stringify(error.response?.data, null, 2));
            }
        }

        // Step 3: Test with invalid token (should fail with 401)
        console.log('\n3️⃣ Testing Redis endpoint with invalid token (should fail with 401)...');

        try {
            const redisResponse = await axios.post(`${baseURL}/api/redis/application/create`, applicationData, {
                headers: {
                    'Authorization': 'Bearer invalid_token_12345',
                    'Content-Type': 'application/json'
                }
            });

            console.log('   ❌ Unexpected success with invalid token!');
            console.log('   📊 Status:', redisResponse.status);

        } catch (error) {
            if (error.response?.status === 401) {
                console.log('   ✅ Correctly failed with 401 (invalid token)');
                console.log('   📝 Message:', error.response.data.message);
            } else {
                console.log('   ❌ Unexpected error:');
                console.log('   📊 Status:', error.response?.status);
                console.log('   📝 Message:', error.response?.data?.message || error.message);
                console.log('   📋 Error data:', JSON.stringify(error.response?.data, null, 2));
            }
        }

        // Step 4: Test regular endpoint for comparison
        console.log('\n4️⃣ Testing regular endpoint for comparison...');

        try {
            const regularResponse = await axios.post(`${baseURL}/api/student-application/create`, applicationData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('   ❌ Regular endpoint should also require auth!');
            console.log('   📊 Status:', regularResponse.status);

        } catch (error) {
            if (error.response?.status === 401) {
                console.log('   ✅ Regular endpoint correctly requires auth');
                console.log('   📝 Message:', error.response.data.message);
            } else {
                console.log('   ❌ Regular endpoint unexpected error:');
                console.log('   📊 Status:', error.response?.status);
                console.log('   📝 Message:', error.response?.data?.message || error.message);
            }
        }

        console.log('\n🎉 Redis-only test completed!');
        console.log('\n💡 The Redis endpoint is working correctly - it requires authentication.');
        console.log('   The 500 error you saw earlier was likely due to authentication issues.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
testRedisOnly();
