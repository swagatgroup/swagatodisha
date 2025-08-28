const axios = require('axios');

console.log('🔧 Backend Troubleshooting Script\n');

// Test with different timeouts and methods
async function troubleshootBackend() {
    const backendUrl = 'https://swagat-odisha-backend.onrender.com';
    
    console.log('1️⃣ Testing with different timeouts...');
    
    // Test 1: Very short timeout
    try {
        console.log('   Testing with 5 second timeout...');
        const response = await axios.get(`${backendUrl}/health`, { timeout: 5000 });
        console.log(`   ✅ Success with 5s timeout: ${response.status}`);
        return true;
    } catch (error) {
        console.log(`   ❌ Failed with 5s timeout: ${error.message}`);
    }
    
    // Test 2: Medium timeout
    try {
        console.log('   Testing with 15 second timeout...');
        const response = await axios.get(`${backendUrl}/health`, { timeout: 15000 });
        console.log(`   ✅ Success with 15s timeout: ${response.status}`);
        return true;
    } catch (error) {
        console.log(`   ❌ Failed with 15s timeout: ${error.message}`);
    }
    
    // Test 3: Long timeout
    try {
        console.log('   Testing with 30 second timeout...');
        const response = await axios.get(`${backendUrl}/health`, { timeout: 30000 });
        console.log(`   ✅ Success with 30s timeout: ${response.status}`);
        return true;
    } catch (error) {
        console.log(`   ❌ Failed with 30s timeout: ${error.message}`);
    }
    
    // Test 4: Try different endpoint
    try {
        console.log('   Testing root endpoint...');
        const response = await axios.get(backendUrl, { timeout: 10000 });
        console.log(`   ✅ Root endpoint accessible: ${response.status}`);
        return true;
    } catch (error) {
        console.log(`   ❌ Root endpoint failed: ${error.message}`);
    }
    
    return false;
}

// Check if it's a DNS or network issue
async function checkNetworkConnectivity() {
    console.log('\n2️⃣ Checking network connectivity...');
    
    try {
        // Test if we can reach the domain
        const dns = require('dns');
        const { promisify } = require('util');
        const resolve4 = promisify(dns.resolve4);
        
        try {
            const addresses = await resolve4('swagat-odisha-backend.onrender.com');
            console.log(`   ✅ DNS resolution successful: ${addresses.join(', ')}`);
        } catch (error) {
            console.log(`   ❌ DNS resolution failed: ${error.message}`);
        }
        
        // Test if port 443 (HTTPS) is reachable
        const net = require('net');
        const testPort = (host, port) => {
            return new Promise((resolve) => {
                const socket = new net.Socket();
                socket.setTimeout(5000);
                
                socket.on('connect', () => {
                    socket.destroy();
                    resolve(true);
                });
                
                socket.on('timeout', () => {
                    socket.destroy();
                    resolve(false);
                });
                
                socket.on('error', () => {
                    socket.destroy();
                    resolve(false);
                });
                
                socket.connect(port, host);
            });
        };
        
        const isPortOpen = await testPort('swagat-odisha-backend.onrender.com', 443);
        if (isPortOpen) {
            console.log('   ✅ Port 443 (HTTPS) is reachable');
        } else {
            console.log('   ❌ Port 443 (HTTPS) is not reachable');
        }
        
    } catch (error) {
        console.log(`   ❌ Network check failed: ${error.message}`);
    }
}

// Provide recommendations
function provideRecommendations() {
    console.log('\n3️⃣ Troubleshooting Recommendations:\n');
    
    console.log('🔍 If backend is timing out:');
    console.log('   1. Check Render dashboard - is your service running?');
    console.log('   2. Check Render logs for startup errors');
    console.log('   3. Verify environment variables are set correctly');
    console.log('   4. Check if MongoDB connection string is valid');
    console.log('   5. Ensure JWT_SECRET is set');
    console.log('   6. Check if service is in "sleep" mode (Render free tier)');
    
    console.log('\n🔧 If service is down:');
    console.log('   1. Restart the service on Render');
    console.log('   2. Check if you have enough build minutes');
    console.log('   3. Verify your package.json start script');
    console.log('   4. Check if all dependencies are installed');
    
    console.log('\n🌐 If it\'s a network issue:');
    console.log('   1. Check your internet connection');
    console.log('   2. Try from a different network');
    console.log('   3. Check if Render is experiencing issues');
    console.log('   4. Verify the service URL is correct');
    
    console.log('\n⚡ Performance improvements:');
    console.log('   1. Increase timeout in frontend to 30 seconds');
    console.log('   2. Add retry logic for failed requests');
    console.log('   3. Implement connection pooling for MongoDB');
    console.log('   4. Use compression middleware (already configured)');
}

// Main function
async function main() {
    try {
        const isBackendWorking = await troubleshootBackend();
        
        if (!isBackendWorking) {
            await checkNetworkConnectivity();
        }
        
        provideRecommendations();
        
        console.log('\n🎯 Troubleshooting complete!');
        if (isBackendWorking) {
            console.log('✅ Backend is accessible - your configuration is working!');
        } else {
            console.log('❌ Backend is not accessible - follow the recommendations above.');
        }
        
    } catch (error) {
        console.error('❌ Troubleshooting failed:', error.message);
    }
}

// Run troubleshooting
main();
