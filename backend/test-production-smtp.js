/**
 * Production SMTP Test Script
 * 
 * Tests SMTP connection and email sending in production
 * 
 * Usage:
 *   node test-production-smtp.js
 */

const axios = require('axios');

const PRODUCTION_URL = 'https://swagat-odisha-backend.onrender.com';

console.log('\n🧪 Production SMTP Test\n');
console.log('='.repeat(60));
console.log('Production URL:', PRODUCTION_URL);
console.log('='.repeat(60));
console.log('');

// Test 1: SMTP Connection Test
async function testSMTPConnection() {
    console.log('📧 Test 1: SMTP Connection Test');
    console.log('-'.repeat(60));
    
    try {
        const response = await axios.get(`${PRODUCTION_URL}/api/contact/test-smtp`, {
            timeout: 30000
        });
        
        if (response.data.success) {
            console.log('✅ SMTP Connection: SUCCESS');
            console.log('   Details:', JSON.stringify(response.data.details, null, 2));
            return true;
        } else {
            console.log('❌ SMTP Connection: FAILED');
            console.log('   Error:', response.data.message);
            if (response.data.error) {
                console.log('   Details:', JSON.stringify(response.data.error, null, 2));
            }
            if (response.data.troubleshooting) {
                console.log('   Troubleshooting:', JSON.stringify(response.data.troubleshooting, null, 2));
            }
            return false;
        }
    } catch (error) {
        console.log('❌ SMTP Connection: ERROR');
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Response:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.log('   Network Error: Could not reach server');
            console.log('   URL:', PRODUCTION_URL);
        } else {
            console.log('   Error:', error.message);
        }
        return false;
    }
}

// Test 2: Send Test Email
async function testSendEmail() {
    console.log('\n📤 Test 2: Send Test Email');
    console.log('-'.repeat(60));
    
    try {
        const response = await axios.post(
            `${PRODUCTION_URL}/api/contact/test-email`,
            {},
            {
                timeout: 60000,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (response.data.success) {
            console.log('✅ Test Email: SUCCESS');
            console.log('   Message:', response.data.message);
            console.log('   Provider:', response.data.provider);
            if (response.data.messageId) {
                console.log('   Message ID:', response.data.messageId);
            }
            return true;
        } else {
            console.log('❌ Test Email: FAILED');
            console.log('   Message:', response.data.message);
            if (response.data.error) {
                console.log('   Error:', response.data.error);
            }
            if (response.data.details) {
                console.log('   Details:', JSON.stringify(response.data.details, null, 2));
            }
            return false;
        }
    } catch (error) {
        console.log('❌ Test Email: ERROR');
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Response:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.log('   Network Error: Could not reach server');
        } else {
            console.log('   Error:', error.message);
        }
        return false;
    }
}

// Test 3: Submit Contact Form
async function testContactForm() {
    console.log('\n📝 Test 3: Submit Contact Form');
    console.log('-'.repeat(60));
    
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('name', 'Production Test User');
    formData.append('email', 'swagatgroupinfo@gmail.com');
    formData.append('phone', '9876543210');
    formData.append('subject', 'Production SMTP Test');
    formData.append('message', 'This is a test message from production SMTP test script. If you receive this email, SMTP is working correctly in production!');
    
    try {
        const response = await axios.post(
            `${PRODUCTION_URL}/api/contact/submit`,
            formData,
            {
                timeout: 60000,
                headers: formData.getHeaders()
            }
        );
        
        if (response.data.success) {
            console.log('✅ Contact Form: SUCCESS');
            console.log('   Message:', response.data.message);
            console.log('   Data:', JSON.stringify(response.data.data, null, 2));
            console.log('\n💡 Check your email inbox for:');
            console.log('   1. Admin notification email');
            console.log('   2. User confirmation email');
            console.log('\n⏳ Emails are sent in the background, check server logs for details.');
            return true;
        } else {
            console.log('❌ Contact Form: FAILED');
            console.log('   Message:', response.data.message);
            if (response.data.errors) {
                console.log('   Validation Errors:', JSON.stringify(response.data.errors, null, 2));
            }
            return false;
        }
    } catch (error) {
        console.log('❌ Contact Form: ERROR');
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Response:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.log('   Network Error: Could not reach server');
        } else {
            console.log('   Error:', error.message);
        }
        return false;
    }
}

// Run all tests
async function runTests() {
    const results = {
        connection: false,
        testEmail: false,
        contactForm: false
    };
    
    // Test 1: SMTP Connection
    results.connection = await testSMTPConnection();
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Send Test Email
    results.testEmail = await testSendEmail();
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 3: Submit Contact Form
    results.contactForm = await testContactForm();
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log('SMTP Connection:', results.connection ? '✅ PASS' : '❌ FAIL');
    console.log('Test Email:', results.testEmail ? '✅ PASS' : '❌ FAIL');
    console.log('Contact Form:', results.contactForm ? '✅ PASS' : '❌ FAIL');
    console.log('='.repeat(60));
    
    const allPassed = results.connection && results.testEmail && results.contactForm;
    
    if (allPassed) {
        console.log('\n🎉 All tests passed! SMTP is working in production.');
    } else {
        console.log('\n⚠️  Some tests failed. Check the errors above.');
        console.log('\n💡 Next steps:');
        console.log('   1. Check Render server logs for detailed SMTP errors');
        console.log('   2. Verify environment variables are set correctly');
        console.log('   3. Check that SMTP_PORT=2525 is set');
        console.log('   4. Verify EMAIL_USER and EMAIL_PASS are correct');
    }
    
    console.log('');
}

// Run tests
runTests().catch(error => {
    console.error('\n❌ Test script error:', error.message);
    process.exit(1);
});

