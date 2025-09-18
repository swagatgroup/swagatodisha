#!/usr/bin/env node

const axios = require('axios');

async function debug500Error() {
    console.log('🔍 Debugging 500 Error');
    console.log('=====================\n');

    const baseURL = 'http://localhost:5000';

    try {
        // Step 1: Check server health
        console.log('1️⃣ Checking server health...');
        const healthResponse = await axios.get(`${baseURL}/health`);
        console.log('   ✅ Server is running');

        // Step 2: Create a fresh user with unique email
        console.log('\n2️⃣ Creating fresh test user...');
        const timestamp = Date.now();
        const email = `debug${timestamp}@example.com`;

        let token, userId;

        try {
            const userResponse = await axios.post(`${baseURL}/api/auth/register`, {
                fullName: 'Debug Test User',
                email: email,
                phoneNumber: `9876543${timestamp.toString().slice(-3)}`,
                password: 'Password123!',
                role: 'student',
                guardianName: 'Debug Test Guardian'
            });

            if (userResponse.data.success) {
                token = userResponse.data.token;
                userId = userResponse.data.user._id;
                console.log('   ✅ Fresh user created');
                console.log('   👤 User ID:', userId);
                console.log('   📧 Email:', email);
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

        // Step 3: Test Redis endpoint with detailed logging
        console.log('\n3️⃣ Testing Redis endpoint with detailed logging...');

        const applicationData = {
            personalDetails: {
                fullName: 'Debug Test Student',
                fathersName: 'Debug Father',
                mothersName: 'Debug Mother',
                dateOfBirth: '2000-01-01',
                gender: 'Male',
                aadharNumber: `1234567890${timestamp.toString().slice(-2)}`
            },
            contactDetails: {
                primaryPhone: '9876543210',
                whatsappNumber: '9876543210',
                email: `debugstudent${timestamp}@example.com`,
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

        console.log('   📤 Request data:');
        console.log('   📋 Token (first 20 chars):', token.substring(0, 20) + '...');
        console.log('   📋 User ID:', userId);
        console.log('   📋 Application data keys:', Object.keys(applicationData));

        try {
            const redisResponse = await axios.post(`${baseURL}/api/redis/application/create`, applicationData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('   ✅ SUCCESS! Redis endpoint worked!');
            console.log('   📊 Status:', redisResponse.status);
            console.log('   📋 Response:', JSON.stringify(redisResponse.data, null, 2));

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

        // Step 4: Test regular endpoint for comparison
        console.log('\n4️⃣ Testing regular endpoint for comparison...');
        try {
            const regularResponse = await axios.post(`${baseURL}/api/student-application/create`, applicationData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('   ✅ Regular endpoint worked!');
            console.log('   📊 Status:', regularResponse.status);
            console.log('   📋 Success:', regularResponse.data.success);

        } catch (error) {
            if (error.response?.status === 400 && error.response.data.message.includes('already have an application')) {
                console.log('   ✅ Regular endpoint working (duplicate prevented)');
            } else {
                console.log('   ❌ Regular endpoint error:');
                console.log('   📊 Status:', error.response?.status);
                console.log('   📝 Message:', error.response?.data?.message || error.message);
            }
        }

        console.log('\n🎉 Debug completed!');

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
        process.exit(1);
    }
}

// Run the debug
debug500Error();
