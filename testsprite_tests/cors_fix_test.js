const axios = require('axios');

console.log('🔧 Testing CORS Fix for Swagat Odisha\n');

// Test CORS with different origins
async function testCORS() {
    const backendUrl = 'http://localhost:5000';

    console.log('1️⃣ Testing CORS with localhost:3000 (Frontend Port)...');

    try {
        const response = await axios.get(`${backendUrl}/health`, {
            headers: {
                'Origin': 'http://localhost:3000'
            },
            timeout: 10000
        });

        if (response.headers['access-control-allow-origin']) {
            console.log(`✅ CORS working for localhost:3000`);
            console.log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin']}`);
        } else {
            console.log('❌ CORS headers not found');
        }

        console.log(`   Response: ${response.status} - ${response.data.message}`);

    } catch (error) {
        if (error.response?.status === 401) {
            console.log('⚠️  Backend responded but with auth error (this is expected for /health)');
        } else {
            console.log(`❌ CORS test failed: ${error.message}`);
        }
    }

    console.log('\n2️⃣ Testing CORS with localhost:5173 (Vite Default)...');

    try {
        const response = await axios.get(`${backendUrl}/health`, {
            headers: {
                'Origin': 'http://localhost:5173'
            },
            timeout: 10000
        });

        if (response.headers['access-control-allow-origin']) {
            console.log(`✅ CORS working for localhost:5173`);
            console.log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin']}`);
        } else {
            console.log('❌ CORS headers not found');
        }

        console.log(`   Response: ${response.status} - ${response.data.message}`);

    } catch (error) {
        if (error.response?.status === 401) {
            console.log('⚠️  Backend responded but with auth error (this is expected for /health)');
        } else {
            console.log(`❌ CORS test failed: ${error.message}`);
        }
    }

    console.log('\n3️⃣ Testing API endpoint with CORS...');

    try {
        const response = await axios.get(`${backendUrl}/api/auth`, {
            headers: {
                'Origin': 'http://localhost:3000'
            },
            timeout: 10000
        });

        console.log(`✅ API endpoint accessible with CORS: ${response.status}`);

    } catch (error) {
        if (error.response?.status === 404) {
            console.log('❌ API endpoint not found (404)');
        } else if (error.response?.status === 401) {
            console.log('⚠️  API endpoint accessible but requires authentication');
        } else {
            console.log(`❌ API endpoint error: ${error.message}`);
        }
    }
}

// Test if backend is running
async function testBackendHealth() {
    console.log('\n4️⃣ Testing Backend Health...');

    try {
        const response = await axios.get('http://localhost:5000/health', {
            timeout: 10000
        });

        if (response.status === 200) {
            console.log('✅ Backend is running and healthy');
            console.log(`   Response: ${response.data.message}`);
            return true;
        } else {
            console.log('❌ Backend health check failed');
            return false;
        }
    } catch (error) {
        console.log(`❌ Backend not accessible: ${error.message}`);
        console.log('\n💡 Make sure your backend is running on localhost:5000');
        return false;
    }
}

// Main function
async function main() {
    try {
        const isBackendRunning = await testBackendHealth();

        if (isBackendRunning) {
            await testCORS();

            console.log('\n🎯 CORS Test Complete!');
            console.log('📋 If CORS is working, you should see CORS headers above.');
            console.log('💡 If you still see CORS errors, restart your backend server.');
        } else {
            console.log('\n❌ Cannot test CORS - backend is not running');
            console.log('💡 Start your backend server first: npm run dev (in backend folder)');
        }

    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
    }
}

// Run tests
main();
