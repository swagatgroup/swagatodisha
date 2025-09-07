const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing login with admin credentials...');

        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@example.com',
            password: 'Password123!'
        });

        console.log('✅ Login successful!');
        console.log('Response:', response.data);

    } catch (error) {
        console.log('❌ Login failed:');
        console.log('Status:', error.response?.status);
        console.log('Message:', error.response?.data?.message);
        console.log('Full error:', error.response?.data);
    }
}

testLogin();
