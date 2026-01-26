require('dotenv').config();
const nodemailer = require('nodemailer');

// Clean email password - remove all spaces (Gmail app passwords are displayed with spaces but used without)
let emailPass = process.env.EMAIL_PASS;
if (emailPass) {
    const originalLength = emailPass.length;
    emailPass = emailPass.replace(/\s+/g, ''); // Remove all spaces
    if (originalLength !== emailPass.length) {
        console.log('⚠️ EMAIL_PASS contained spaces - automatically removed.');
        console.log('   Original length:', originalLength, 'Cleaned length:', emailPass.length);
    }
}

console.log('\n📧 Testing SMTP Configuration...\n');
console.log('Email User:', process.env.EMAIL_USER || 'NOT SET');
console.log('Email Pass Length:', emailPass?.length || 0);
console.log('Email Pass Has Spaces:', process.env.EMAIL_PASS?.includes(' ') ? 'YES (will be removed)' : 'NO');
console.log('SMTP Host:', process.env.SMTP_HOST || 'smtp.gmail.com (default)');
console.log('SMTP Port:', process.env.SMTP_PORT || '587 (default)');
console.log('');

if (!process.env.EMAIL_USER || !emailPass) {
    console.error('❌ ERROR: EMAIL_USER or EMAIL_PASS not set in .env file');
    process.exit(1);
}

// Build transporter
const hasCustomSMTP = process.env.SMTP_HOST && process.env.SMTP_PORT;
let transporter;

if (hasCustomSMTP) {
    const portNum = parseInt(process.env.SMTP_PORT, 10) || 587;
    const isSecure = portNum === 465;
    
    transporter = nodemailer.createTransport({
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
        tls: {
            rejectUnauthorized: false,
            ciphers: 'SSLv3'
        }
    });
    console.log('📧 Using custom SMTP:', process.env.SMTP_HOST + ':' + process.env.SMTP_PORT);
} else {
    transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: emailPass
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
        tls: {
            rejectUnauthorized: false,
            ciphers: 'SSLv3'
        }
    });
    console.log('📧 Using Gmail SMTP');
}

// Test connection
console.log('\n🔍 Verifying SMTP connection...\n');

transporter.verify()
    .then(() => {
        console.log('✅ SMTP connection verified successfully!\n');
        
        // Try sending a test email
        const testEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;
        console.log('📤 Sending test email to:', testEmail);
        
        return transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: testEmail,
            subject: 'Test Email - Swagat Odisha SMTP',
            html: `
                <h2>SMTP Test Email</h2>
                <p>This is a test email from Swagat Odisha backend.</p>
                <p>If you received this, SMTP is working correctly!</p>
                <p>Sent at: ${new Date().toISOString()}</p>
            `
        });
    })
    .then((info) => {
        console.log('✅ Test email sent successfully!');
        console.log('   Message ID:', info.messageId);
        console.log('   Response:', info.response);
        console.log('\n🎉 SMTP is working correctly!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ SMTP Test Failed:\n');
        console.error('Error Message:', error.message);
        console.error('Error Code:', error.code);
        console.error('Response Code:', error.responseCode);
        console.error('Command:', error.command);
        console.error('Response:', error.response);
        
        if (error.responseCode === 535) {
            console.error('\n💡 Troubleshooting:');
            console.error('   - This is an authentication error (Invalid credentials)');
            console.error('   - Make sure EMAIL_PASS is a Gmail App Password (16 characters, no spaces)');
            console.error('   - Ensure 2-Step Verification is enabled on your Google account');
            console.error('   - Check that the app password was created for "Mail"');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('\n💡 Troubleshooting:');
            console.error('   - Connection timeout - check your network/firewall');
            console.error('   - Some cloud platforms block SMTP ports');
        } else if (error.message.includes('Invalid login')) {
            console.error('\n💡 Troubleshooting:');
            console.error('   - Use Gmail App Password, not your regular password');
            console.error('   - Make sure there are no spaces in the password');
            console.error('   - Current password length:', emailPass?.length || 0, '(should be 16)');
        }
        
        console.error('');
        process.exit(1);
    });

