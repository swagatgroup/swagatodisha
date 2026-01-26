require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('\n🔍 Comprehensive SMTP Test\n');
console.log('=' .repeat(60));
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('=' .repeat(60));

// Clean email password - remove all spaces
let emailPass = process.env.EMAIL_PASS;
if (emailPass) {
    const originalLength = emailPass.length;
    emailPass = emailPass.replace(/\s+/g, '');
    if (originalLength !== emailPass.length) {
        console.log('⚠️ EMAIL_PASS contained spaces - removed');
        console.log('   Original:', originalLength, 'chars → Cleaned:', emailPass.length, 'chars\n');
    }
}

// Configuration check
console.log('📋 Configuration Check:');
console.log('   EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
console.log('   EMAIL_PASS:', emailPass ? `✅ Set (${emailPass.length} chars)` : '❌ NOT SET');
console.log('   SMTP_HOST:', process.env.SMTP_HOST || 'smtp.gmail.com (default)');
console.log('   SMTP_PORT:', process.env.SMTP_PORT || '587 (default)');
console.log('   CONTACT_EMAIL:', process.env.CONTACT_EMAIL || process.env.EMAIL_USER || 'NOT SET');
console.log('');

// Validate configuration
if (!process.env.EMAIL_USER || !emailPass) {
    console.error('❌ ERROR: EMAIL_USER or EMAIL_PASS not set');
    console.error('   Please set these in your .env file');
    process.exit(1);
}

// Build transporter function (same as in contact.js)
function buildTransporter() {
    const hasCustomSMTP = process.env.SMTP_HOST && process.env.SMTP_PORT;
    
    if (hasCustomSMTP) {
        const portNum = parseInt(process.env.SMTP_PORT, 10) || 587;
        const isSecure = portNum === 465;
        
        console.log('📧 Using Custom SMTP Configuration:');
        console.log('   Host:', process.env.SMTP_HOST);
        console.log('   Port:', portNum, isSecure ? '(SSL)' : '(TLS)');
        console.log('   Secure:', isSecure);
        console.log('');
        
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: portNum,
            secure: isSecure,
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
    } else {
        // Gmail configuration
        const isProduction = process.env.NODE_ENV === 'production';
        const smtpPort = process.env.SMTP_PORT 
            ? parseInt(process.env.SMTP_PORT, 10) 
            : (isProduction ? 465 : 587);
        const isSecure = smtpPort === 465;
        
        console.log('📧 Using Gmail SMTP Configuration:');
        console.log('   Host: smtp.gmail.com');
        console.log('   Port:', smtpPort, isSecure ? '(SSL)' : '(TLS)');
        console.log('   Secure:', isSecure);
        console.log('   Production Mode:', isProduction);
        console.log('');
        
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: smtpPort,
            secure: isSecure,
            requireTLS: !isSecure,
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
    }
}

// Test function
async function testSMTP() {
    const transporter = buildTransporter();
    const testEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;
    
    console.log('🔍 Step 1: Verifying SMTP Connection...\n');
    
    try {
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully!\n');
    } catch (error) {
        console.error('❌ SMTP Verification Failed:\n');
        console.error('   Error:', error.message);
        console.error('   Code:', error.code);
        console.error('   Response Code:', error.responseCode);
        console.error('   Command:', error.command);
        
        if (error.responseCode === 535) {
            console.error('\n💡 Authentication Error:');
            console.error('   - Check EMAIL_PASS is a Gmail App Password (16 chars, no spaces)');
            console.error('   - Ensure 2-Step Verification is enabled');
            console.error('   - Verify the app password was created for "Mail"');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('\n💡 Connection Timeout:');
            console.error('   - Port may be blocked (try port 465 instead)');
            console.error('   - Check firewall/network settings');
            console.error('   - In production, cloud platforms often block SMTP');
        }
        
        process.exit(1);
    }
    
    console.log('📤 Step 2: Sending Test Email...\n');
    console.log('   From:', process.env.EMAIL_USER);
    console.log('   To:', testEmail);
    console.log('');
    
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: testEmail,
            subject: `SMTP Test - ${new Date().toISOString()}`,
            html: `
                <h2>SMTP Test Email</h2>
                <p>This is a test email from Swagat Odisha backend.</p>
                <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
                <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
                <p>If you received this, SMTP is working correctly! ✅</p>
            `,
            text: `SMTP Test Email\n\nThis is a test email from Swagat Odisha backend.\nEnvironment: ${process.env.NODE_ENV || 'development'}\nSent at: ${new Date().toISOString()}\n\nIf you received this, SMTP is working correctly! ✅`
        });
        
        console.log('✅ Test email sent successfully!\n');
        console.log('   Message ID:', info.messageId);
        console.log('   Response:', info.response);
        console.log('\n' + '='.repeat(60));
        console.log('🎉 SMTP Test: SUCCESS');
        console.log('='.repeat(60));
        console.log('\n✅ SMTP is configured correctly and working!\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to send test email:\n');
        console.error('   Error:', error.message);
        console.error('   Code:', error.code);
        console.error('   Response Code:', error.responseCode);
        console.error('   Command:', error.command);
        
        if (error.responseCode === 535) {
            console.error('\n💡 Authentication Error:');
            console.error('   - Invalid credentials');
            console.error('   - Check EMAIL_PASS is correct');
        }
        
        process.exit(1);
    }
}

// Run test
testSMTP().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
});

