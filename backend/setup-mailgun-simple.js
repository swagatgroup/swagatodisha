/**
 * Simple Mailgun Setup Helper
 * 
 * This script helps you set up Mailgun quickly using sandbox domain
 * No domain verification needed - just add authorized recipients!
 * 
 * Usage: node setup-mailgun-simple.js
 */

require('dotenv').config();

console.log('\n📧 Mailgun Simple Setup Helper\n');
console.log('This will help you set up Mailgun using sandbox domain (no DNS needed!)\n');

// Check current configuration
console.log('Current Configuration:');
console.log('  MAILGUN_API_KEY:', process.env.MAILGUN_API_KEY ? `✅ Set (${process.env.MAILGUN_API_KEY.length} chars)` : '❌ NOT SET');
console.log('  MAILGUN_DOMAIN:', process.env.MAILGUN_DOMAIN || '❌ NOT SET');
console.log('  MAILGUN_FROM_EMAIL:', process.env.MAILGUN_FROM_EMAIL || '❌ NOT SET');
console.log('  CONTACT_EMAIL:', process.env.CONTACT_EMAIL || '❌ NOT SET');
console.log('');

// Instructions
if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    console.log('📋 Setup Steps:\n');
    console.log('1. Sign up at https://www.mailgun.com (free account)');
    console.log('2. Get your sandbox domain from Mailgun dashboard');
    console.log('   → Go to: Sending → Domains');
    console.log('   → Copy your sandbox domain (e.g., sandbox1234567890.mailgun.org)');
    console.log('');
    console.log('3. Get your API key');
    console.log('   → Go to: Sending → API Keys');
    console.log('   → Copy your Private API Key (starts with "key-")');
    console.log('');
    console.log('4. Add to your .env file:');
    console.log('   MAILGUN_API_KEY=key-your-api-key-here');
    console.log('   MAILGUN_DOMAIN=sandbox1234567890.mailgun.org');
    console.log('   MAILGUN_FROM_EMAIL=noreply@sandbox1234567890.mailgun.org');
    console.log('   CONTACT_EMAIL=contact@swagatodisha.com');
    console.log('');
    console.log('5. Add authorized recipients in Mailgun dashboard:');
    console.log('   → Go to: Sending → Authorized Recipients');
    console.log('   → Click "Add Recipient"');
    console.log('   → Add: contact@swagatodisha.com (and any other emails)');
    console.log('   → Verify each email by clicking the link in your inbox');
    console.log('');
    console.log('6. Run this script again to verify setup');
    console.log('');
    process.exit(0);
}

// Check if sandbox domain
const isSandbox = process.env.MAILGUN_DOMAIN && process.env.MAILGUN_DOMAIN.includes('sandbox');
if (isSandbox) {
    console.log('✅ Using Sandbox Domain (No DNS verification needed!)');
    console.log('');
    console.log('⚠️  Important: Sandbox domains can only send to authorized recipients.');
    console.log('   Make sure you have added recipients in Mailgun dashboard:');
    console.log('   → https://app.mailgun.com/app/sending/domains');
    console.log('   → Click on your domain → Authorized Recipients');
    console.log('   → Add: ' + (process.env.CONTACT_EMAIL || 'your-email@example.com'));
    console.log('');
}

console.log('✅ Configuration looks good!');
console.log('');
console.log('Next steps:');
console.log('1. Make sure CONTACT_EMAIL is added to authorized recipients in Mailgun');
console.log('2. Run: node test-mailgun.js');
console.log('');

