const axios = require('axios');

async function testApiLogin() {
    try {
        console.log('🧪 Testing API Login Endpoint...\n');

        const baseURL = 'http://localhost:5000';

        // Test Super Admin Login
        console.log('1️⃣ Testing Super Admin API Login:');
        try {
            const response = await axios.post(`${baseURL}/api/auth/login`, {
                email: 'admin@swagatodisha.com',
                password: 'Admin@123456'
            });

            console.log('✅ Login successful!');
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.log('❌ Login failed!');
            console.log('Status:', error.response?.status);
            console.log('Error:', error.response?.data);
        }

        // Test Staff Login
        console.log('\n2️⃣ Testing Staff API Login:');
        try {
            const response = await axios.post(`${baseURL}/api/auth/login`, {
                email: 'staff1@swagatodisha.com',
                password: 'Staff@123456'
            });

            console.log('✅ Login successful!');
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.log('❌ Login failed!');
            console.log('Status:', error.response?.status);
            console.log('Error:', error.response?.data);
        }

        // Test Agent Login
        console.log('\n3️⃣ Testing Agent API Login:');
        try {
            const response = await axios.post(`${baseURL}/api/auth/login`, {
                email: 'agent1@swagatodisha.com',
                password: 'Agent@123456'
            });

            console.log('✅ Login successful!');
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.log('❌ Login failed!');
            console.log('Status:', error.response?.status);
            console.log('Error:', error.response?.data);
        }

        // Test Student Login
        console.log('\n4️⃣ Testing Student API Login:');
        try {
            const response = await axios.post(`${baseURL}/api/auth/login`, {
                email: 'student1@swagatodisha.com',
                password: 'Student@123456'
            });

            console.log('✅ Login successful!');
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.log('❌ Login failed!');
            console.log('Status:', error.response?.status);
            console.log('Error:', error.response?.data);
        }

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

testApiLogin();
