const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Admin = require('../models/Admin');

/**
 * Test script to verify Super Admin login credentials
 */

async function testAdminLogin() {
    try {
        const email = 'admin@swagatodisha.com';
        const password = 'Admin@2024#Secure';

        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('❌ MONGO_URI or MONGODB_URI is not set in backend/.env');
            process.exit(1);
        }

        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        console.log('🔍 Looking for Super Admin account...');
        const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

        if (!admin) {
            console.error('❌ Super Admin not found with email:', email);
            await mongoose.connection.close();
            process.exit(1);
        }

        console.log('✅ Found Super Admin:');
        console.log('   Email:', admin.email);
        console.log('   Name:', admin.firstName, admin.lastName);
        console.log('   Role:', admin.role);
        console.log('   ID:', admin._id.toString());
        console.log('   Active:', admin.isActive);
        console.log('   Locked:', admin.isLocked || false);
        console.log('   Login Attempts:', admin.loginAttempts || 0);
        console.log('');

        console.log('🔐 Testing password...');
        const isPasswordValid = await admin.comparePassword(password);

        if (isPasswordValid) {
            console.log('✅ Password is CORRECT!');
            console.log('');
            console.log('📋 Login Credentials:');
            console.log('   Email   :', email);
            console.log('   Password:', password);
            console.log('');
            console.log('🌐 Login Endpoint:');
            console.log('   POST /api/admin-auth/login');
            console.log('');
            console.log('📝 Example cURL command:');
            console.log(`   curl -X POST http://localhost:5000/api/admin-auth/login \\`);
            console.log(`     -H "Content-Type: application/json" \\`);
            console.log(`     -d '{"email":"${email}","password":"${password}"}'`);
            console.log('');
            console.log('📝 Example JavaScript fetch:');
            console.log(`   fetch('http://localhost:5000/api/admin-auth/login', {`);
            console.log(`     method: 'POST',`);
            console.log(`     headers: { 'Content-Type': 'application/json' },`);
            console.log(`     body: JSON.stringify({`);
            console.log(`       email: '${email}',`);
            console.log(`       password: '${password}'`);
            console.log(`     })`);
            console.log(`   })`);
        } else {
            console.log('❌ Password is INCORRECT!');
            console.log('   The password does not match the stored hash.');
        }

        await mongoose.connection.close();
        console.log('\n🔌 MongoDB connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (process.env.NODE_ENV === 'development') {
            console.error(error);
        }
        try {
            await mongoose.connection.close();
        } catch (e) {
            // ignore
        }
        process.exit(1);
    }
}

testAdminLogin();

