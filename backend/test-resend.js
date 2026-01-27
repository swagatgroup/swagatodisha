/**
 * Test Resend Integration
 * 
 * Usage: node test-resend.js
 * 
 * This script tests the Resend email integration.
 * Make sure you have set RESEND_API_KEY in your .env file.
 */

require('dotenv').config();
const { sendEmail, testEmail } = require('./utils/resend');

async function testResend() {
    console.log('\n📧 Testing Resend Integration\n');
    console.log('Configuration Check:');
    console.log('  RESEND_API_KEY:', process.env.RESEND_API_KEY ? `✅ Set (${process.env.RESEND_API_KEY.length} chars)` : '❌ NOT SET');
    console.log('  RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev (default)');
    console.log('  CONTACT_EMAIL:', process.env.CONTACT_EMAIL || '❌ NOT SET');
    console.log('');

    if (!process.env.RESEND_API_KEY) {
        console.error('❌ Resend not configured!');
        console.error('   Please set RESEND_API_KEY in your .env file');
        console.error('   Get free API key from: https://resend.com');
        process.exit(1);
    }

    const testEmailAddress = process.env.CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL;
    if (!testEmailAddress) {
        console.error('❌ No test email address found!');
        console.error('   Please set CONTACT_EMAIL or RESEND_FROM_EMAIL in your .env file');
        process.exit(1);
    }

    console.log(`📤 Sending test email to: ${testEmailAddress}\n`);

    try {
        // Test 1: Simple test email
        console.log('Test 1: Sending simple test email...');
        const result1 = await testEmail();
        
        if (result1.success) {
            console.log('✅ Test email sent successfully!');
            console.log('   Message ID:', result1.messageId);
        } else {
            console.error('❌ Test email failed:', result1.error);
            if (result1.details) {
                console.error('   Details:', JSON.stringify(result1.details, null, 2));
            }
        }

        console.log('\n');

        // Test 2: Contact form admin email
        console.log('Test 2: Sending contact form admin email...');
        const result2 = await sendEmail('contactFormAdmin', {
            name: 'Test User',
            email: testEmailAddress,
            phone: '1234567890',
            subject: 'Test Contact Form',
            message: 'This is a test message from the Resend integration test script.'
        });

        if (result2.success) {
            console.log('✅ Contact form admin email sent successfully!');
            console.log('   Message ID:', result2.messageId);
        } else {
            console.error('❌ Contact form admin email failed:', result2.error);
            if (result2.details) {
                console.error('   Details:', JSON.stringify(result2.details, null, 2));
            }
        }

        console.log('\n');

        // Test 3: Contact form user confirmation email
        console.log('Test 3: Sending contact form user confirmation email...');
        const result3 = await sendEmail('contactFormUser', {
            name: 'Test User',
            email: testEmailAddress,
            phone: '1234567890',
            subject: 'Test Contact Form',
            message: 'This is a test message from the Resend integration test script.'
        });

        if (result3.success) {
            console.log('✅ Contact form user confirmation email sent successfully!');
            console.log('   Message ID:', result3.messageId);
        } else {
            console.error('❌ Contact form user confirmation email failed:', result3.error);
            if (result3.details) {
                console.error('   Details:', JSON.stringify(result3.details, null, 2));
            }
        }

        console.log('\n');
        console.log('📧 Resend Test Summary:');
        console.log('  Test 1 (Simple):', result1.success ? '✅ PASSED' : '❌ FAILED');
        console.log('  Test 2 (Admin):', result2.success ? '✅ PASSED' : '❌ FAILED');
        console.log('  Test 3 (User):', result3.success ? '✅ PASSED' : '❌ FAILED');
        console.log('');

        if (result1.success && result2.success && result3.success) {
            console.log('🎉 All tests passed! Resend integration is working correctly.');
            console.log(`   Check your inbox at: ${testEmailAddress}`);
            console.log('   Free tier: 3,000 emails/month - perfect for your needs!');
        } else {
            console.log('⚠️  Some tests failed. Please check the error messages above.');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ Unexpected error during testing:');
        console.error('   Error:', error.message);
        console.error('   Stack:', error.stack);
        process.exit(1);
    }
}

// Run the test
testResend().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

