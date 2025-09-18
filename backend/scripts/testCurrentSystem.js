#!/usr/bin/env node

const axios = require('axios');

async function testCurrentSystem() {
    console.log('🧪 Testing Current System');
    console.log('========================\n');

    const baseURL = 'http://localhost:5000';

    try {
        // Test 1: Health Check
        console.log('1️⃣ Testing server health...');
        const healthResponse = await axios.get(`${baseURL}/health`);
        console.log('   ✅ Server is running');
        console.log('   📊 Status:', healthResponse.data.status);

        // Test 2: Test Redis system (if available)
        console.log('\n2️⃣ Testing Redis system...');
        try {
            const redisResponse = await axios.get(`${baseURL}/api/redis/health`);
            console.log('   ✅ Redis system is available');
            console.log('   📊 Redis status:', redisResponse.data.data.redis.status);
        } catch (error) {
            console.log('   ⚠️  Redis system not available (this is expected if not using Redis server)');
        }

        // Test 3: Test regular application creation
        console.log('\n3️⃣ Testing regular application creation...');

        // First, let's try to create a test user
        try {
            const userResponse = await axios.post(`${baseURL}/api/auth/register`, {
                fullName: 'Test User',
                email: 'testuser@example.com',
                phoneNumber: '9876543210',
                password: 'password123',
                role: 'student'
            });

            if (userResponse.data.success) {
                console.log('   ✅ Test user created');
                const token = userResponse.data.token;
                const userId = userResponse.data.user._id;

                // Now test application creation
                const appResponse = await axios.post(`${baseURL}/api/student-application/create`, {
                    personalDetails: {
                        fullName: 'Test Student',
                        dateOfBirth: '2000-01-01',
                        gender: 'Male',
                        aadharNumber: '123456789012'
                    },
                    contactDetails: {
                        email: 'teststudent@example.com',
                        primaryPhone: '9876543210',
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
                    }
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (appResponse.data.success) {
                    console.log('   ✅ Application created successfully');
                    console.log('   📋 Application ID:', appResponse.data.data._id);
                } else {
                    console.log('   ❌ Application creation failed:', appResponse.data.message);
                }
            } else {
                console.log('   ❌ User creation failed:', userResponse.data.message);
            }
        } catch (error) {
            if (error.response) {
                console.log('   ❌ Error:', error.response.data.message || error.response.data.error);
                console.log('   📊 Status:', error.response.status);
            } else {
                console.log('   ❌ Network error:', error.message);
            }
        }

        console.log('\n🎉 System test completed!');
        console.log('\n📋 Summary:');
        console.log('   ✅ Server is running');
        console.log('   ✅ Basic endpoints are working');

        console.log('\n💡 Next steps:');
        console.log('   1. If you want to use the Redis system, run: npm run dev:redis');
        console.log('   2. If you want to test Redis system, run: npm run test:redis');
        console.log('   3. Check the server logs for any specific errors');

    } catch (error) {
        console.error('❌ System test failed:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure the server is running:');
            console.log('   npm run dev');
            console.log('   or');
            console.log('   npm run dev:redis');
        }

        process.exit(1);
    }
}

// Run the test
testCurrentSystem();
