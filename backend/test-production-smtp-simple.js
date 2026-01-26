/**
 * Simple Production SMTP Test Script
 * 
 * This script tests SMTP connection in production environment.
 * Set NODE_ENV=production before running.
 * 
 * Usage:
 *   NODE_ENV=production node test-production-smtp-simple.js
 */

require('dotenv').config();

// Force production mode for testing
process.env.NODE_ENV = 'production';

const nodemailer = require('nodemailer');

console.log('\n🔍 Production SMTP Test\n');
console.log('='.repeat(60));
console.log('Environment:', process.env.NODE_ENV);
console.log('='.repeat(60));

// Clean email password
let emailPass = process.env.EMAIL_PASS?.replace(/\s+/g, '') || '';

console.log('\n📋 Configuration:');
console.log('   EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
console.log('   EMAIL_PASS:', emailPass ? `✅ Set (${emailPass.length} chars)` : '❌ NOT SET');
console.log('   SMTP_PORT:', process.env.SMTP_PORT || '2525 (default for production)');
console.log('   CONTACT_EMAIL:', process.env.CONTACT_EMAIL || process.env.EMAIL_USER || 'NOT SET');
console.log('');

if (!process.env.EMAIL_USER || !emailPass) {
    console.error('❌ ERROR: EMAIL_USER or EMAIL_PASS not set');
    process.exit(1);
}

// Build transporter (same logic as production)
const isProduction = process.env.NODE_ENV === 'production';
const smtpPort = process.env.SMTP_PORT 
    ? parseInt(process.env.SMTP_PORT, 10) 
    : (isProduction ? 2525 : 587);
const isSecure = smtpPort === 465;

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: smtpPort,
    secure: isSecure,
    requireTLS: !isSecure && (smtpPort === 587 || smtpPort === 2525),
    auth: {
        user: process.env.EMAIL_USER,
        pass: emailPass
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    pool: false,
    tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
    }
});

const portType = smtpPort === 2525 ? 'Alternative TLS' : 
                smtpPort === 465 ? 'SSL' : 'TLS';

console.log('📧 SMTP Configuration:');
console.log('   Host: smtp.gmail.com');
console.log('   Port:', smtpPort, `(${portType})`);
console.log('   Secure:', isSecure);
console.log('   Production Mode:', isProduction);
console.log('');

// Test connection
async function test() {
    try {
        console.log('🔍 Verifying SMTP connection...\n');
        await transporter.verify();
        console.log('✅ SMTP connection verified!\n');
        
        const testEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;
        console.log('📤 Sending test email to:', testEmail);
        
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: testEmail,
            subject: `Production SMTP Test - ${new Date().toISOString()}`,
            html: `
                <h2>Production SMTP Test</h2>
                <p>This is a test email from production environment.</p>
                <p><strong>Port Used:</strong> ${smtpPort} (${portType})</p>
                <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
                <p>If you received this, SMTP is working in production! ✅</p>
            `
        });
        
        console.log('✅ Test email sent successfully!');
        console.log('   Message ID:', info.messageId);
        console.log('   Response:', info.response);
        console.log('\n' + '='.repeat(60));
        console.log('🎉 Production SMTP Test: SUCCESS');
        console.log('='.repeat(60));
        console.log('\n✅ SMTP is configured correctly for production!\n');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Production SMTP Test Failed:\n');
        console.error('Error:', error.message);
        console.error('Code:', error.code);
        console.error('Response Code:', error.responseCode);
        
        if (error.code === 'ETIMEDOUT') {
            console.error('\n💡 Connection Timeout:');
            console.error('   - Port may be blocked on cloud platform');
            console.error('   - Try different port: SMTP_PORT=465 or SMTP_PORT=587');
            console.error('   - Or use SendGrid instead');
        } else if (error.responseCode === 535) {
            console.error('\n💡 Authentication Error:');
            console.error('   - Check EMAIL_PASS is correct (16 chars, no spaces)');
            console.error('   - Verify it\'s a Gmail App Password');
        }
        
        process.exit(1);
    }
}

test();

