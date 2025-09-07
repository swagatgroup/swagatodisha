const axios = require('axios');

const testRegistration = async () => {
    try {
        console.log('🧪 Testing Registration API\n');

        const testData = {
            name: 'Test User',
            email: `test.${Date.now()}@example.com`,
            password: 'password123',
            phone: '9876543210',
            course: 'B.Tech Computer Science',
            guardianName: 'Test Guardian',
            referralCode: ''
        };

        console.log('📤 Sending data:', testData);

        const response = await axios.post('http://localhost:5000/api/auth/register', testData);

        console.log('✅ Registration successful!');
        console.log('📥 Response:', response.data);

    } catch (error) {
        console.error('❌ Registration failed:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
    }
};

testRegistration();
