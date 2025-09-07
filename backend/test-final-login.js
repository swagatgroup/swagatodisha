const axios = require('axios');

async function testFinalLogin() {
    const baseURL = 'http://localhost:5000';

    const testCases = [
        { email: 'admin@example.com', password: 'Password123!', expectedRole: 'super_admin' },
        { email: 'staff@example.com', password: 'Password123!', expectedRole: 'staff' }
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
                userFullName: response.data.user?.fullName,
                tokenLength: response.data.token?.length
            });

            if (testCase.expectedRole && response.data.user?.role !== testCase.expectedRole) {
                console.log(`⚠️  Expected role ${testCase.expectedRole}, got ${response.data.user?.role}`);
            }

            // Test the /me endpoint
            try {
                const meResponse = await axios.get(`${baseURL}/api/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${response.data.token}`
                    }
                });
                console.log('✅ /me endpoint successful:', meResponse.data.data.user);
            } catch (meError) {
                console.log('❌ /me endpoint failed:', meError.response?.data?.message || meError.message);
            }

        } catch (error) {
            console.log('❌ Login failed');
            console.log('Error:', {
                status: error.response?.status,
                message: error.response?.data?.message || error.message
            });
        }
    }
}

testFinalLogin().catch(console.error);
