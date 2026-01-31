const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * Test login on production site
 */

async function testProductionLogin() {
    const email = 'admin@swagatodisha.com';
    const password = 'Admin@2024#Secure';
    
    // Production backend URL
    const productionBackend = 'https://swagat-odisha-backend.onrender.com';
    const loginUrl = `${productionBackend}/api/auth/login`;
    
    console.log('🧪 Testing Production Login');
    console.log('   Frontend URL: https://www.swagatodisha.com/login');
    console.log('   Backend URL:', productionBackend);
    console.log('   Login Endpoint:', loginUrl);
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('');
    
    try {
        console.log('📡 Sending login request...');
        const response = await axios.post(loginUrl, {
            email: email,
            password: password
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        
        console.log('✅ Login SUCCESSFUL!');
        console.log('   Status:', response.status);
        console.log('   Response:', JSON.stringify(response.data, null, 2));
        
        if (response.data.token) {
            console.log('');
            console.log('🔑 Token received:', response.data.token.substring(0, 50) + '...');
        }
        
        if (response.data.user) {
            console.log('');
            console.log('👤 User Info:');
            console.log('   Role:', response.data.user.role);
            console.log('   Email:', response.data.user.email);
            console.log('   Name:', response.data.user.fullName || response.data.user.firstName + ' ' + response.data.user.lastName);
        }
        
    } catch (error) {
        console.log('❌ Login FAILED!');
        console.log('   Status:', error.response?.status || 'No response');
        console.log('   Error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.log('');
            console.log('💡 Possible issues:');
            console.log('   1. Password is incorrect');
            console.log('   2. Account is locked');
            console.log('   3. Account is inactive');
            console.log('   4. Email not found');
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            console.log('');
            console.log('💡 Connection issue:');
            console.log('   1. Backend server might be down');
            console.log('   2. Network connectivity issue');
            console.log('   3. Backend URL might be incorrect');
        }
    }
}

testProductionLogin();

