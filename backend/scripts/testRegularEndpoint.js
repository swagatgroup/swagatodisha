#!/usr/bin/env node

const axios = require('axios');

async function testRegularEndpoint() {
    console.log('🔍 Testing Regular Endpoint');
    console.log('===========================\n');

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
            fullName: 'Regular Test User',
            email: `regulartest${timestamp}@example.com`,
            phoneNumber: `9876543${timestamp.toString().slice(-3)}`,
            password: 'Password123!',
            role: 'student',
            guardianName: 'Regular Test Guardian'
        });

        if (userResponse.data.success) {
            const token = userResponse.data.token;
            const userId = userResponse.data.data.user.id;

            console.log('   ✅ User created!');
            console.log('   👤 User ID:', userId);
            console.log('   🔑 Token received');

            // Step 3: Test regular endpoint
            console.log('\n3️⃣ Testing regular endpoint...');

            try {
                const regularResponse = await axios.post(`${baseURL}/api/student-application/create`, {
                    personalDetails: {
                        fullName: 'Regular Test Student',
                        fathersName: 'Regular Test Father',
                        mothersName: 'Regular Test Mother',
                        dateOfBirth: '2000-01-01',
                        gender: 'Male',
                        aadharNumber: '123456789012'
                    },
                    contactDetails: {
                        primaryPhone: '9876543210',
                        whatsappNumber: '9876543210',
                        email: 'regularteststudent@example.com',
                        permanentAddress: {
                            street: 'Regular Test Street',
                            city: 'Regular Test City',
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
                        guardianName: 'Regular Test Guardian',
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

                console.log('   ✅ SUCCESS! Regular endpoint working!');
                console.log('   📊 Status:', regularResponse.status);
                console.log('   📝 Message:', regularResponse.data.message);

                if (regularResponse.data.data) {
                    console.log('   📋 Application ID:', regularResponse.data.data._id);
                }

                console.log('\n🎉 Regular endpoint is working!');
                console.log('   The issue is specifically with the Redis endpoint.');

            } catch (error) {
                console.log('   ❌ Regular endpoint failed:');
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
testRegularEndpoint();
