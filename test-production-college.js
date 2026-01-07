const https = require('https');

const API_BASE = 'https://swagat-odisha-backend.onrender.com';

// Test 1: Check API health
console.log('🔍 Testing API Health...');
https.get(`${API_BASE}/health`, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('✅ Health Check:', JSON.parse(data));
        testPublicColleges();
    });
}).on('error', (err) => {
    console.error('❌ Health Check Error:', err.message);
});

// Test 2: Check public colleges endpoint
function testPublicColleges() {
    console.log('\n🔍 Testing Public Colleges Endpoint...');
    https.get(`${API_BASE}/api/colleges/public`, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            const result = JSON.parse(data);
            console.log('✅ Public Colleges:', result.success ? `Found ${result.count} colleges` : 'Failed');
            if (result.data && result.data.length > 0) {
                console.log(`   Sample: ${result.data[0].name}`);
            }
            console.log('\n📝 Note: To test creating a college, you need:');
            console.log('   1. Admin authentication token');
            console.log('   2. POST to /api/colleges endpoint');
            console.log('   3. Test with code field empty (should work now)');
            console.log('   4. Test with code field provided (should work)');
        });
    }).on('error', (err) => {
        console.error('❌ Public Colleges Error:', err.message);
    });
}

