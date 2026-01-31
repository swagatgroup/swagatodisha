const http = require('http');
const https = require('https');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * Test the actual login API endpoint
 */

async function testLoginAPI() {
    const email = 'admin@swagatodisha.com';
    const password = 'Admin@2024#Secure';
    
    // Get server URL from env or use default
    const baseUrl = process.env.BASE_URL || process.env.API_URL || 'http://localhost:5000';
    const loginUrl = `${baseUrl}/api/admin-auth/login`;
    
    console.log('🧪 Testing Admin Login API');
    console.log('   URL:', loginUrl);
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('');
    
    const postData = JSON.stringify({
        email: email,
        password: password
    });
    
    const url = new URL(loginUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = client.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('📡 Response Status:', res.statusCode, res.statusMessage);
                console.log('📡 Response Headers:', JSON.stringify(res.headers, null, 2));
                console.log('');
                
                try {
                    const jsonData = JSON.parse(data);
                    console.log('📦 Response Body:');
                    console.log(JSON.stringify(jsonData, null, 2));
                    console.log('');
                    
                    if (res.statusCode === 200 || res.statusCode === 201) {
                        console.log('✅ Login SUCCESSFUL!');
                        if (jsonData.data && jsonData.data.token) {
                            console.log('   Token:', jsonData.data.token.substring(0, 50) + '...');
                        }
                    } else {
                        console.log('❌ Login FAILED!');
                        console.log('   Error:', jsonData.message || 'Unknown error');
                        if (jsonData.errors) {
                            console.log('   Validation errors:', jsonData.errors);
                        }
                    }
                } catch (e) {
                    console.log('📦 Response Body (raw):');
                    console.log(data);
                    console.log('');
                    console.log('⚠️  Could not parse JSON response');
                }
                
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Request Error:', error.message);
            console.log('');
            console.log('💡 Possible issues:');
            console.log('   1. Server is not running');
            console.log('   2. Wrong URL/port');
            console.log('   3. Network connectivity issue');
            console.log('');
            console.log('   Try starting the server:');
            console.log('   cd backend && npm start');
            reject(error);
        });
        
        req.write(postData);
        req.end();
    });
}

testLoginAPI().catch(console.error);

