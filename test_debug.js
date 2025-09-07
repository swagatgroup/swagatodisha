const axios = require('axios');

async function testDebugSystem() {
    console.log('🔍 Testing Debug System...\n');

    try {
        // Test 1: Check if server is responding
        console.log('1️⃣ Testing server connectivity...');
        try {
            const response = await axios.get('http://localhost:5000/api/auth/debug');
            console.log('✅ Debug endpoint response:', response.data);
        } catch (error) {
            console.log('❌ Debug endpoint failed:', error.response?.data || error.message);
        }

        // Test 2: Test registration with debug logging
        console.log('\n2️⃣ Testing registration with debug logging...');
        const registrationData = {
            fullName: 'Test User',
            email: 'test@example.com',
            password: 'TestPass123!',
            phoneNumber: '9876543210',
            guardianName: 'Test Guardian'
        };

        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', registrationData);
            console.log('✅ Registration successful:', response.data);
        } catch (error) {
            console.log('❌ Registration failed:');
            console.log('   Status:', error.response?.status);
            console.log('   Data:', error.response?.data);
            console.log('   Message:', error.message);
        }

        // Test 3: Check server health
        console.log('\n3️⃣ Testing server health...');
        try {
            const response = await axios.get('http://localhost:5000/');
            console.log('✅ Server health check:', response.status);
        } catch (error) {
            console.log('❌ Server health check failed:', error.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testDebugSystem();
