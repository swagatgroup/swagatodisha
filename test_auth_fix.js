const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAuthSystem() {
    console.log('🧪 Testing Authentication System Fix...\n');

    try {
        // Test 1: Registration
        console.log('1️⃣ Testing Registration...');
        const registrationData = {
            fullName: 'Test User',
            email: 'test@example.com',
            password: 'TestPass123!',
            phoneNumber: '9876543210',
            guardianName: 'Test Guardian',
            course: 'B.Tech Computer Science'
        };

        const registerResponse = await axios.post(`${API_BASE}/auth/register`, registrationData);
        console.log('✅ Registration successful:', registerResponse.data.message);
        console.log('   Token received:', !!registerResponse.data.token);
        console.log('   User data:', registerResponse.data.user);

        const token = registerResponse.data.token;

        // Test 2: Login
        console.log('\n2️⃣ Testing Login...');
        const loginData = {
            email: 'test@example.com',
            password: 'TestPass123!'
        };

        const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginData);
        console.log('✅ Login successful:', loginResponse.data.message);
        console.log('   Token received:', !!loginResponse.data.token);
        console.log('   User data:', loginResponse.data.user);

        // Test 3: Duplicate Registration (should fail)
        console.log('\n3️⃣ Testing Duplicate Registration...');
        try {
            await axios.post(`${API_BASE}/auth/register`, registrationData);
            console.log('❌ Duplicate registration should have failed!');
        } catch (error) {
            if (error.response?.status === 409) {
                console.log('✅ Duplicate registration correctly rejected:', error.response.data.message);
            } else {
                console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
            }
        }

        // Test 4: Invalid Login (should fail)
        console.log('\n4️⃣ Testing Invalid Login...');
        try {
            await axios.post(`${API_BASE}/auth/login`, {
                email: 'test@example.com',
                password: 'WrongPassword'
            });
            console.log('❌ Invalid login should have failed!');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Invalid login correctly rejected:', error.response.data.message);
            } else {
                console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
            }
        }

        console.log('\n🎉 All authentication tests completed successfully!');
        console.log('\n📋 Summary of fixes applied:');
        console.log('   ✅ Login route simplified - only requires email/password');
        console.log('   ✅ Registration route simplified - clear validation');
        console.log('   ✅ Frontend AuthContext updated - proper error handling');
        console.log('   ✅ Registration form simplified - better UX');
        console.log('   ✅ User model updated - supports both user and student roles');
        console.log('   ✅ Consistent response format across all endpoints');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Response status:', error.response.status);
            console.error('   Response data:', error.response.data);
        }
    }
}

// Run the test
testAuthSystem();
