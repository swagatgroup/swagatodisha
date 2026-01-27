/**
 * Quick Fix for Mailgun Setup
 * 
 * This script helps you fix the common Mailgun sandbox issues
 */

require('dotenv').config();

console.log('\n🔧 Mailgun Quick Fix\n');

// Check issues
const issues = [];

if (!process.env.MAILGUN_FROM_EMAIL || !process.env.MAILGUN_FROM_EMAIL.includes('sandbox')) {
    issues.push({
        type: 'FROM_EMAIL',
        message: 'MAILGUN_FROM_EMAIL should match your sandbox domain',
        fix: `Update in .env: MAILGUN_FROM_EMAIL=noreply@${process.env.MAILGUN_DOMAIN || 'your-sandbox-domain.mailgun.org'}`
    });
}

if (process.env.CONTACT_EMAIL && !process.env.CONTACT_EMAIL.includes('@')) {
    issues.push({
        type: 'CONTACT_EMAIL',
        message: 'CONTACT_EMAIL format is invalid',
        fix: 'Set a valid email address in .env'
    });
}

console.log('📋 Issues Found:\n');

if (issues.length === 0) {
    console.log('✅ Configuration looks good!');
    console.log('\n⚠️  The error is because the recipient is not authorized.');
    console.log('\n📝 To Fix:\n');
    console.log('1. Go to: https://app.mailgun.com/app/sending/domains');
    console.log(`2. Click on: ${process.env.MAILGUN_DOMAIN}`);
    console.log('3. Go to "Authorized Recipients" tab');
    console.log('4. Click "Add Recipient"');
    console.log(`5. Add: ${process.env.CONTACT_EMAIL || 'your-email@example.com'}`);
    console.log('6. Check your email and click the verification link');
    console.log('7. Run test again: node test-mailgun.js');
} else {
    issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.type}: ${issue.message}`);
        console.log(`   Fix: ${issue.fix}\n`);
    });
    
    console.log('\n📝 Also, add authorized recipient:');
    console.log('1. Go to: https://app.mailgun.com/app/sending/domains');
    console.log(`2. Click on: ${process.env.MAILGUN_DOMAIN}`);
    console.log('3. Go to "Authorized Recipients" tab');
    console.log('4. Click "Add Recipient"');
    console.log(`5. Add: ${process.env.CONTACT_EMAIL || 'your-email@example.com'}`);
    console.log('6. Verify the email');
}

console.log('\n💡 Tip: You can also test with your personal email first!');
console.log('   Just add your personal email to authorized recipients and update CONTACT_EMAIL in .env\n');

