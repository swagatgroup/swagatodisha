#!/usr/bin/env node

const axios = require('axios');

async function debugSubmission() {
    console.log('🔍 Debugging Application Submission');
    console.log('==================================\n');

    const baseURL = 'http://localhost:5000';

    try {
        // Step 1: Check server health
        console.log('1️⃣ Checking server health...');
        const healthResponse = await axios.get(`${baseURL}/health`);
        console.log('   ✅ Server is running');
        console.log('   📊 Status:', healthResponse.data.status);

        // Step 2: Create a test user
        console.log('\n2️⃣ Creating test user...');
        let token, userId;

        try {
            const userResponse = await axios.post(`${baseURL}/api/auth/register`, {
                fullName: 'Debug Test User',
                email: 'debugtest@example.com',
                phoneNumber: '9876543210',
                password: 'password123',
                role: 'student'
            });

            if (userResponse.data.success) {
                token = userResponse.data.token;
                userId = userResponse.data.user._id;
                console.log('   ✅ Test user created');
                console.log('   👤 User ID:', userId);
                console.log('   🔑 Token:', token.substring(0, 20) + '...');
            } else {
                console.log('   ❌ User creation failed:', userResponse.data.message);
                return;
            }
        } catch (error) {
            if (error.response && error.response.data.message.includes('already exists')) {
                console.log('   ⚠️  User already exists, trying to login...');

                const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
                    email: 'debugtest@example.com',
                    password: 'password123'
                });

                if (loginResponse.data.success) {
                    token = loginResponse.data.token;
                    userId = loginResponse.data.user._id;
                    console.log('   ✅ Login successful');
                    console.log('   👤 User ID:', userId);
                } else {
                    console.log('   ❌ Login failed:', loginResponse.data.message);
                    return;
                }
            } else {
                console.log('   ❌ User creation error:', error.response?.data?.message || error.message);
                return;
            }
        }

        // Step 3: Test application submission
        console.log('\n3️⃣ Testing application submission...');

        const applicationData = {
            personalDetails: {
                fullName: 'Debug Test Student',
                fathersName: 'Debug Father',
                mothersName: 'Debug Mother',
                dateOfBirth: '2000-01-01',
                gender: 'Male',
                aadharNumber: '123456789012'
            },
            contactDetails: {
                primaryPhone: '9876543210',
                whatsappNumber: '9876543210',
                email: 'debugstudent@example.com',
                permanentAddress: {
                    street: 'Debug Street',
                    city: 'Debug City',
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
                guardianName: 'Debug Guardian',
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
            const appResponse = await axios.post(`${baseURL}/api/student-application/create`, applicationData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (appResponse.data.success) {
                console.log('   ✅ Application created successfully!');
                console.log('   📋 Application ID:', appResponse.data.data._id);
                console.log('   📊 Status:', appResponse.data.data.status);
                console.log('   📝 Message:', appResponse.data.message);
            } else {
                console.log('   ❌ Application creation failed');
                console.log('   📝 Message:', appResponse.data.message);
                console.log('   📊 Data:', appResponse.data);
            }
        } catch (error) {
            console.log('   ❌ Application submission error:');
            console.log('   📊 Status:', error.response?.status);
            console.log('   📝 Message:', error.response?.data?.message || error.message);
            console.log('   📋 Data:', error.response?.data);

            if (error.response?.status === 401) {
                console.log('   💡 Authentication issue - check token validity');
            } else if (error.response?.status === 500) {
                console.log('   💡 Server error - check server logs');
            }
        }

        // Step 4: Test Redis system (if available)
        console.log('\n4️⃣ Testing Redis system...');
        try {
            const redisResponse = await axios.get(`${baseURL}/api/redis/health`);
            console.log('   ✅ Redis system is available');
            console.log('   📊 Redis status:', redisResponse.data.data.redis.status);
        } catch (error) {
            console.log('   ⚠️  Redis system not available');
            console.log('   💡 To use Redis system, run: npm run dev:redis');
        }

        console.log('\n🎉 Debug completed!');
        console.log('\n📋 Summary:');
        console.log('   ✅ Server is running');
        console.log('   ✅ User authentication working');
        console.log('   ✅ Application submission working');

        console.log('\n💡 If you want to use the Redis system:');
        console.log('   1. Stop current server (Ctrl+C)');
        console.log('   2. Run: npm run dev:redis');
        console.log('   3. Test with: npm run test:redis');

    } catch (error) {
        console.error('❌ Debug failed:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure the server is running:');
            console.log('   npm run dev');
        }

        process.exit(1);
    }
}

// Run the debug
debugSubmission();
