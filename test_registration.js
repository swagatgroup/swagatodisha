const axios = require('axios');

async function testRegistration() {
    console.log('🧪 Testing Registration with Fixed Model...\n');

    try {
        const registrationData = {
            fullName: 'Test User Fixed',
            email: 'testfixed@example.com',
            password: 'TestPass123!',
            phoneNumber: '9876543213',
            guardianName: 'Test Guardian Fixed'
        };

        console.log('Sending registration request...');
        const response = await axios.post('http://localhost:5000/api/auth/register', registrationData);

        console.log('✅ Registration successful!');
        console.log('Response:', response.data);

    } catch (error) {
        console.error('❌ Registration failed:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
    }
}

testRegistration();
