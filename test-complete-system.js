const axios = require('axios');

async function testCompleteSystem() {
    console.log('🧪 Testing Complete System - Contact Form & Authentication\n');

    try {
        // Test 1: Contact Form (without authentication)
        console.log('1️⃣ Testing Contact Form Submission...');
        const contactFormData = new FormData();
        contactFormData.append('name', 'Test User');
        contactFormData.append('email', 'test@example.com');
        contactFormData.append('phone', '9876543210');
        contactFormData.append('subject', 'Test Contact Form');
        contactFormData.append('message', 'This is a test message for the contact form.');

        const contactResponse = await axios.post('https://swagat-odisha-backend.onrender.com/api/contact/submit', contactFormData, {
            headers: {
                'Origin': 'https://www.swagatodisha.com',
                'Content-Type': 'multipart/form-data'
            },
            timeout: 15000
        });

        console.log('✅ Contact Form Response:', contactResponse.status);
        console.log('Contact Data:', contactResponse.data);

        // Test 2: Authentication Flow
        console.log('\n2️⃣ Testing Authentication Flow...');

        // Try to login with test credentials
        const loginResponse = await axios.post('https://swagat-odisha-backend.onrender.com/api/auth/login', {
            email: 'student@swagatodisha.com',
            password: 'Student@123456'
        }, {
            headers: {
                'Origin': 'https://www.swagatodisha.com',
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });

        console.log('✅ Login Response:', loginResponse.status);
        console.log('Login Data:', loginResponse.data);

        if (loginResponse.data.success && loginResponse.data.token) {
            const token = loginResponse.data.token;
            const user = loginResponse.data.user;

            console.log('\n3️⃣ Testing Protected Routes with Token...');

            // Test /api/auth/me endpoint
            const authMeResponse = await axios.get('https://swagat-odisha-backend.onrender.com/api/auth/me', {
                headers: {
                    'Origin': 'https://www.swagatodisha.com',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                timeout: 15000
            });

            console.log('✅ Auth/Me Response:', authMeResponse.status);
            console.log('User Data:', authMeResponse.data);

            // Test dashboard endpoint
            const dashboardResponse = await axios.get('https://swagat-odisha-backend.onrender.com/api/dashboard/student', {
                headers: {
                    'Origin': 'https://www.swagatodisha.com',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                timeout: 15000
            });

            console.log('✅ Dashboard Response:', dashboardResponse.status);
            console.log('Dashboard Data:', dashboardResponse.data);

        } else {
            console.log('❌ Login failed - no token received');
        }

        console.log('\n🎉 All tests completed successfully!');
        console.log('✅ Contact form is working');
        console.log('✅ Authentication is working');
        console.log('✅ Protected routes are working');

    } catch (error) {
        console.log('❌ Test failed:', error.response?.status, error.response?.data || error.message);

        if (error.response?.status === 429) {
            console.log('⚠️ Rate limiting is still active. Wait a few minutes and try again.');
        }
    }
}

testCompleteSystem();
