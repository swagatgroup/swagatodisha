const axios = require('axios');

async function testLoginFlow() {
    console.log('🔍 Testing Complete Login Flow...\n');

    try {
        // Step 1: Test login endpoint
        console.log('1️⃣ Testing login endpoint...');
        const loginResponse = await axios.post('https://swagat-odisha-backend.onrender.com/api/auth/login', {
            email: 'student@swagatodisha.com', // Use test student credentials
            password: 'Student@123456'
        }, {
            headers: {
                'Origin': 'https://www.swagatodisha.com',
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('✅ Login response:', loginResponse.status);
        console.log('Login data:', loginResponse.data);

        if (loginResponse.data.success && loginResponse.data.token) {
            const token = loginResponse.data.token;
            const user = loginResponse.data.user;

            console.log('\n2️⃣ Testing /api/auth/me with token...');

            // Step 2: Test auth/me endpoint with token
            const authMeResponse = await axios.get('https://swagat-odisha-backend.onrender.com/api/auth/me', {
                headers: {
                    'Origin': 'https://www.swagatodisha.com',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                timeout: 10000
            });

            console.log('✅ Auth/me response:', authMeResponse.status);
            console.log('User data:', authMeResponse.data);

            // Step 3: Test dashboard endpoints
            console.log('\n3️⃣ Testing dashboard endpoints...');

            const dashboardEndpoints = [
                '/api/dashboard/student',
                '/api/dashboard/agent',
                '/api/dashboard/staff',
                '/api/dashboard/admin'
            ];

            for (const endpoint of dashboardEndpoints) {
                try {
                    const dashboardResponse = await axios.get(`https://swagat-odisha-backend.onrender.com${endpoint}`, {
                        headers: {
                            'Origin': 'https://www.swagatodisha.com',
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        timeout: 10000
                    });
                    console.log(`✅ ${endpoint}: ${dashboardResponse.status}`);
                } catch (error) {
                    console.log(`❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
                }
            }

        } else {
            console.log('❌ Login failed - no token received');
        }

    } catch (error) {
        console.log('❌ Login error:', error.response?.status, error.response?.data || error.message);

        // If login fails, let's test with a different approach
        console.log('\n🔄 Testing with different credentials...');

        // Try with admin credentials if they exist
        try {
            const adminLoginResponse = await axios.post('https://swagat-odisha-backend.onrender.com/api/auth/login', {
                email: 'admin@swagatodisha.com',
                password: 'Admin@123456'
            }, {
                headers: {
                    'Origin': 'https://www.swagatodisha.com',
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            console.log('✅ Admin login response:', adminLoginResponse.status);
            console.log('Admin login data:', adminLoginResponse.data);
        } catch (adminError) {
            console.log('❌ Admin login also failed:', adminError.response?.status, adminError.response?.data || adminError.message);
        }
    }
}

testLoginFlow();
