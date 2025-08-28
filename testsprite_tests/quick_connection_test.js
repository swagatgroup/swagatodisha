const axios = require('axios');
const fs = require('fs');
const path = require('path');

console.log('🔍 Quick Connection Test for Swagat Odisha Fullstack\n');

// Test 1: Backend Health Check
async function testBackendHealth() {
    console.log('1️⃣ Testing Backend Health...');
    try {
        const response = await axios.get('https://swagat-odisha-backend.onrender.com/health', {
            timeout: 10000
        });
        
        if (response.status === 200 && response.data.status === 'OK') {
            console.log('✅ Backend is healthy and responding');
            console.log(`   Response: ${JSON.stringify(response.data)}`);
            return true;
        } else {
            console.log('❌ Backend health check failed');
            return false;
        }
    } catch (error) {
        console.log(`❌ Backend health check error: ${error.message}`);
        return false;
    }
}

// Test 2: Frontend Configuration
function testFrontendConfig() {
    console.log('\n2️⃣ Testing Frontend Configuration...');
    
    try {
        const envFile = path.join(__dirname, '../frontend/src/config/environment.js');
        if (fs.existsSync(envFile)) {
            const content = fs.readFileSync(envFile, 'utf8');
            
            if (content.includes('https://swagat-odisha-backend.onrender.com')) {
                console.log('✅ Production backend URL configured correctly');
            } else {
                console.log('❌ Production backend URL not found');
            }
            
            if (content.includes('axios')) {
                console.log('✅ Axios import found in environment config');
            } else {
                console.log('❌ Axios import not found');
            }
        } else {
            console.log('❌ Environment config file not found');
        }
    } catch (error) {
        console.log(`❌ Frontend config test error: ${error.message}`);
    }
}

// Test 3: Package Dependencies
function testDependencies() {
    console.log('\n3️⃣ Testing Package Dependencies...');
    
    try {
        // Frontend dependencies
        const frontendPkg = path.join(__dirname, '../frontend/package.json');
        if (fs.existsSync(frontendPkg)) {
            const pkg = JSON.parse(fs.readFileSync(frontendPkg, 'utf8'));
            
            if (pkg.dependencies.axios) {
                console.log(`✅ Frontend Axios: ${pkg.dependencies.axios}`);
            } else {
                console.log('❌ Frontend Axios not found');
            }
        }
        
        // Backend dependencies
        const backendPkg = path.join(__dirname, '../backend/package.json');
        if (fs.existsSync(backendPkg)) {
            const pkg = JSON.parse(fs.readFileSync(backendPkg, 'utf8'));
            
            if (pkg.dependencies.mongodb && pkg.dependencies.mongoose) {
                console.log(`✅ Backend MongoDB: ${pkg.dependencies.mongodb}, Mongoose: ${pkg.dependencies.mongoose}`);
            } else {
                console.log('❌ Backend MongoDB dependencies not found');
            }
            
            if (pkg.dependencies.cloudinary) {
                console.log(`✅ Backend Cloudinary: ${pkg.dependencies.cloudinary}`);
            } else {
                console.log('❌ Backend Cloudinary not found');
            }
            
            if (pkg.dependencies.axios) {
                console.log(`✅ Backend Axios: ${pkg.dependencies.axios}`);
            } else {
                console.log('❌ Backend Axios not found');
            }
        }
    } catch (error) {
        console.log(`❌ Dependencies test error: ${error.message}`);
    }
}

// Test 4: API Endpoints
async function testAPIEndpoints() {
    console.log('\n4️⃣ Testing API Endpoints...');
    
    try {
        const response = await axios.get('https://swagat-odisha-backend.onrender.com/api/auth', {
            timeout: 10000
        });
        console.log(`✅ Auth endpoint accessible: ${response.status}`);
    } catch (error) {
        if (error.response?.status === 404) {
            console.log('❌ Auth endpoint not found (404)');
        } else {
            console.log(`❌ Auth endpoint error: ${error.message}`);
        }
    }
    
    try {
        const response = await axios.get('https://swagat-odisha-backend.onrender.com/api/students', {
            timeout: 10000
        });
        console.log(`✅ Students endpoint accessible: ${response.status}`);
    } catch (error) {
        if (error.response?.status === 404) {
            console.log('❌ Students endpoint not found (404)');
        } else {
            console.log(`❌ Students endpoint error: ${error.message}`);
        }
    }
}

// Test 5: Health Check Configuration
function testHealthCheckConfig() {
    console.log('\n5️⃣ Testing Health Check Configuration...');
    
    try {
        const serverFile = path.join(__dirname, '../backend/server.js');
        if (fs.existsSync(serverFile)) {
            const content = fs.readFileSync(serverFile, 'utf8');
            
            if (content.includes('/health')) {
                console.log('✅ Health endpoint route configured as /health');
            } else {
                console.log('❌ Health endpoint route not found');
            }
            
            if (content.includes('api/health')) {
                console.log('⚠️  Found api/health - should be just /health for Render');
            } else {
                console.log('✅ Health endpoint correctly configured for Render');
            }
        } else {
            console.log('❌ Server.js file not found');
        }
    } catch (error) {
        console.log(`❌ Health check config test error: ${error.message}`);
    }
}

// Test 6: Frontend API Utility
function testFrontendAPI() {
    console.log('\n6️⃣ Testing Frontend API Utility...');
    
    try {
        const apiFile = path.join(__dirname, '../frontend/src/utils/api.js');
        if (fs.existsSync(apiFile)) {
            const content = fs.readFileSync(apiFile, 'utf8');
            
            if (content.includes('axios.create')) {
                console.log('✅ Axios instance properly configured');
            } else {
                console.log('❌ Axios instance not found');
            }
            
            if (content.includes('interceptors.request')) {
                console.log('✅ Request interceptors configured');
            } else {
                console.log('❌ Request interceptors not found');
            }
            
            if (content.includes('interceptors.response')) {
                console.log('✅ Response interceptors configured');
            } else {
                console.log('❌ Response interceptors not found');
            }
        } else {
            console.log('❌ API utility file not found');
        }
    } catch (error) {
        console.log(`❌ Frontend API test error: ${error.message}`);
    }
}

// Run all tests
async function runQuickTests() {
    try {
        await testBackendHealth();
        testFrontendConfig();
        testDependencies();
        await testAPIEndpoints();
        testHealthCheckConfig();
        testFrontendAPI();
        
        console.log('\n🎯 Quick Connection Test Complete!');
        console.log('📋 Review the results above to identify any issues.');
        
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
    }
}

// Run tests
runQuickTests();
