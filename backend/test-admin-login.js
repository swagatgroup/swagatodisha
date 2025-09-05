const axios = require('axios');

async function testAdminLogin() {
    try {
        console.log('Testing admin login...');

        // Test login
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@example.com',
            password: 'password123'
        });

        console.log('✅ Login successful');
        console.log('User role:', loginResponse.data.data.user.role);
        console.log('Token:', loginResponse.data.data.token.substring(0, 50) + '...');

        // Test /me endpoint with token
        const token = loginResponse.data.data.token;
        const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ /me endpoint successful');
        console.log('User data:', JSON.stringify(meResponse.data.data.user, null, 2));

    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }
}

testAdminLogin();
