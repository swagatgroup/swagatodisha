require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

console.log('\n📧 Testing Send Message via SMTP\n');
console.log('='.repeat(60));

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000';
const testData = {
    name: 'Test User',
    email: process.env.EMAIL_USER || 'swagatgroupinfo@gmail.com',
    phone: '9876543210',
    subject: 'SMTP Test Message',
    message: 'This is a test message to verify SMTP is working correctly. If you receive this email, SMTP configuration is successful!'
};

console.log('📋 Test Configuration:');
console.log('   API URL:', API_URL);
console.log('   Name:', testData.name);
console.log('   Email:', testData.email);
console.log('   Phone:', testData.phone);
console.log('   Subject:', testData.subject);
console.log('   Message Length:', testData.message.length, 'characters');
console.log('');

// Check SMTP configuration
console.log('🔍 SMTP Configuration Check:');
console.log('   EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? `✅ Set (${process.env.EMAIL_PASS.replace(/\s+/g, '').length} chars)` : '❌ NOT SET');
console.log('   SMTP_HOST:', process.env.SMTP_HOST || 'smtp.gmail.com (default)');
console.log('   SMTP_PORT:', process.env.SMTP_PORT || '587 (default)');
console.log('   CONTACT_EMAIL:', process.env.CONTACT_EMAIL || process.env.EMAIL_USER || 'NOT SET');
console.log('');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ ERROR: EMAIL_USER or EMAIL_PASS not set in .env file');
    process.exit(1);
}

// Send message via contact form API
async function sendTestMessage() {
    try {
        console.log('📤 Sending test message via contact form API...\n');
        
        const formData = new FormData();
        formData.append('name', testData.name);
        formData.append('email', testData.email);
        formData.append('phone', testData.phone);
        formData.append('subject', testData.subject);
        formData.append('message', testData.message);
        
        const response = await axios.post(`${API_URL}/api/contact/submit`, formData, {
            headers: formData.getHeaders(),
            timeout: 60000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        
        if (response.data.success) {
            console.log('✅ Message submitted successfully!\n');
            console.log('Response:', JSON.stringify(response.data, null, 2));
            console.log('\n' + '='.repeat(60));
            console.log('🎉 Test Complete!');
            console.log('='.repeat(60));
            console.log('\n📧 Check your email inbox for:');
            console.log('   1. Admin notification email (to CONTACT_EMAIL)');
            console.log('   2. User confirmation email (to test email)');
            console.log('\n💡 Note: Emails are sent in the background, so check server logs');
            console.log('   for SMTP connection and sending status.\n');
            
            process.exit(0);
        } else {
            console.error('❌ Message submission failed:');
            console.error('   Response:', response.data);
            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ Error sending message:\n');
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
            
            if (error.response.data?.errors) {
                console.error('\nValidation Errors:');
                error.response.data.errors.forEach(err => {
                    console.error(`   - ${err.param || err.field}: ${err.msg || err.message}`);
                });
            }
        } else if (error.request) {
            console.error('Network Error: Could not reach the server');
            console.error('   URL:', API_URL);
            console.error('   Make sure the backend server is running on', API_URL);
        } else {
            console.error('Error:', error.message);
        }
        
        process.exit(1);
    }
}

// Check if server is running
async function checkServer() {
    try {
        console.log('🔍 Checking if server is running...');
        const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
        console.log('✅ Server is running\n');
        return true;
    } catch (error) {
        console.error('❌ Server is not running or not accessible');
        console.error('   URL:', API_URL);
        console.error('   Make sure to start the backend server first:');
        console.error('   cd backend && npm start\n');
        return false;
    }
}

// Run test
(async () => {
    const serverRunning = await checkServer();
    if (!serverRunning) {
        process.exit(1);
    }
    
    await sendTestMessage();
})();

