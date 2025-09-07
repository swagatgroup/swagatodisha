const axios = require('axios');

async function testLoginCredentials() {
    const baseURL = 'http://localhost:5000';

    const testCases = [
        { email: 'admin@example.com', password: 'Password123!', expectedRole: 'super_admin' },
        { email: 'staff@example.com', password: 'Password123!', expectedRole: 'staff' },
        { email: 'admin@example.com', password: 'password123', expectedResult: 'error' },
        { email: 'admin@example.com', password: 'password@123!', expectedResult: 'error' }
    ];

    for (const testCase of testCases) {
        console.log(`\n🧪 Testing: ${testCase.email} / ${testCase.password}`);

        try {
            const response = await axios.post(`${baseURL}/api/auth/login`, {
                email: testCase.email,
                password: testCase.password
            });

            console.log('✅ Login successful');
            console.log('Response:', {
                success: response.data.success,
                message: response.data.message,
                userRole: response.data.user?.role,
                userFullName: response.data.user?.fullName
            });

            if (testCase.expectedRole && response.data.user?.role !== testCase.expectedRole) {
                console.log(`⚠️  Expected role ${testCase.expectedRole}, got ${response.data.user?.role}`);
            }

        } catch (error) {
            console.log('❌ Login failed');
            console.log('Error:', {
                status: error.response?.status,
                message: error.response?.data?.message || error.message
            });

            if (testCase.expectedResult === 'error') {
                console.log('✅ Expected error occurred');
            }
        }
    }
}

testLoginCredentials().catch(console.error);
