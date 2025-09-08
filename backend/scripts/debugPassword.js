const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function debugPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const admin = await Admin.findOne({ email: 'admin@swagatodisha.com' }).select('+password');
        console.log('\n🔍 Admin Account Debug:');
        console.log('Admin found:', !!admin);
        console.log('Email:', admin.email);
        console.log('Password field exists:', !!admin.password);
        console.log('Password length:', admin.password ? admin.password.length : 'N/A');
        console.log('Password starts with $2b$:', admin.password ? admin.password.startsWith('$2b$') : 'N/A');
        console.log('Raw password hash:', admin.password);

        console.log('\n🔍 Testing Password Comparison:');
        const testPassword = 'Admin@123456';
        console.log('Testing password:', testPassword);

        // Test with bcrypt directly
        const directCompare = await bcrypt.compare(testPassword, admin.password);
        console.log('Direct bcrypt.compare result:', directCompare);

        // Test with model method
        const modelCompare = await admin.comparePassword(testPassword);
        console.log('Model comparePassword result:', modelCompare);

        console.log('\n🔍 Testing Password Creation:');
        const newHash = await bcrypt.hash(testPassword, 12);
        console.log('New hash length:', newHash.length);
        console.log('New hash starts with $2b$:', newHash.startsWith('$2b$'));

        const newHashCompare = await bcrypt.compare(testPassword, newHash);
        console.log('New hash comparison result:', newHashCompare);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

debugPassword();
