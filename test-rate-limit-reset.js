const axios = require('axios');

async function testRateLimitReset() {
    console.log('🔄 Testing if rate limit has been reset...\n');

    try {
        // Test health endpoint first
        console.log('1️⃣ Testing health endpoint...');
        const healthResponse = await axios.get('https://swagat-odisha-backend.onrender.com/health', {
            headers: {
                'Origin': 'https://www.swagatodisha.com',
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        console.log('✅ Health check:', healthResponse.status, healthResponse.data);

        // Test a simple API endpoint
        console.log('\n2️⃣ Testing API test endpoint...');
        const testResponse = await axios.get('https://swagat-odisha-backend.onrender.com/api/test', {
            headers: {
                'Origin': 'https://www.swagatodisha.com',
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        console.log('✅ API test:', testResponse.status, testResponse.data);

        console.log('\n✅ Backend is responding! Rate limiting should be reset now.');
        console.log('🕐 You can now try logging in from your frontend.');

    } catch (error) {
        console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
    }
}

testRateLimitReset();
