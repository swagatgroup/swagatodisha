require('dotenv').config();
const axios = require('axios');

// Production backend URL
const PRODUCTION_URL = process.env.BACKEND_URL || process.env.BASE_URL || 'https://swagat-odisha-backend.onrender.com';

console.log('\n📧 Testing Production SMTP Configuration...\n');
console.log('Production Backend URL:', PRODUCTION_URL);
console.log('');

// Test the SMTP endpoint
async function testProductionSMTP() {
    try {
        console.log('🔍 Testing SMTP connection endpoint...\n');
        
        const response = await axios.get(`${PRODUCTION_URL}/api/contact/test-smtp`, {
            timeout: 30000
        });
        
        if (response.data.success) {
            console.log('✅ Production SMTP Test: SUCCESS\n');
            console.log('Details:', JSON.stringify(response.data.details, null, 2));
            console.log('\n🎉 SMTP is working correctly in production!\n');
            return true;
        } else {
            console.error('❌ Production SMTP Test: FAILED\n');
            console.error('Message:', response.data.message);
            if (response.data.error) {
                console.error('Error:', JSON.stringify(response.data.error, null, 2));
            }
            if (response.data.troubleshooting) {
                console.error('\n💡 Troubleshooting:');
                Object.entries(response.data.troubleshooting).forEach(([key, value]) => {
                    console.error(`   ${key}: ${value}`);
                });
            }
            return false;
        }
    } catch (error) {
        console.error('❌ Production SMTP Test: ERROR\n');
        
        if (error.response) {
            // Server responded with error
            console.error('Status:', error.response.status);
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
            
            if (error.response.data?.error) {
                const err = error.response.data.error;
                console.error('\nError Details:');
                console.error('  Message:', err.message);
                console.error('  Code:', err.code);
                console.error('  Response Code:', err.responseCode);
                
                if (err.responseCode === 535) {
                    console.error('\n💡 This is an authentication error:');
                    console.error('   - Check EMAIL_PASS in production environment variables');
                    console.error('   - Make sure it\'s a Gmail App Password (16 chars, no spaces)');
                    console.error('   - Ensure 2-Step Verification is enabled');
                }
            }
        } else if (error.request) {
            // Request made but no response
            console.error('Network Error: Could not reach the server');
            console.error('URL:', PRODUCTION_URL);
            console.error('\n💡 Check if:');
            console.error('   - The backend server is running');
            console.error('   - The URL is correct');
            console.error('   - There are no network/firewall issues');
        } else {
            console.error('Error:', error.message);
        }
        
        return false;
    }
}

// Run the test
testProductionSMTP()
    .then((success) => {
        if (success) {
            console.log('✅ All tests passed!');
            process.exit(0);
        } else {
            console.error('\n❌ Test failed. Please check the errors above.');
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error('Unexpected error:', error);
        process.exit(1);
    });

