const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Admin = require('../models/Admin');

/**
 * Debug script to investigate login issues
 */

async function debugAdminLogin() {
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

        console.log('🔍 Step 1: Finding admin by email...');
        const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

        if (!admin) {
            console.error('❌ Admin not found with email:', email);
            console.log('\n🔍 Checking all super_admin accounts...');
            const allAdmins = await Admin.find({ role: 'super_admin' }).select('email role');
            if (allAdmins.length > 0) {
                console.log('Found super_admin accounts:');
                allAdmins.forEach(a => console.log(`  - ${a.email} (${a.role})`));
            } else {
                console.log('No super_admin accounts found in database');
            }
            await mongoose.connection.close();
            process.exit(1);
        }

        console.log('✅ Admin found:');
        console.log('   Email:', admin.email);
        console.log('   Name:', admin.firstName, admin.lastName);
        console.log('   Role:', admin.role);
        console.log('   Active:', admin.isActive);
        console.log('   Locked:', admin.isLocked || false);
        console.log('   Login Attempts:', admin.loginAttempts || 0);
        console.log('   Password exists:', !!admin.password);
        console.log('   Password length:', admin.password ? admin.password.length : 0);
        console.log('   Password starts with:', admin.password ? admin.password.substring(0, 10) : 'N/A');
        console.log('');

        console.log('🔍 Step 2: Testing findByEmail static method...');
        const adminByEmail = await Admin.findByEmail(email);
        if (adminByEmail) {
            console.log('✅ findByEmail works - Found admin');
        } else {
            console.log('❌ findByEmail returned null');
        }
        console.log('');

        console.log('🔍 Step 3: Testing password comparison...');
        console.log('   Using password:', password);
        
        // Test direct bcrypt compare
        const directCompare = await bcrypt.compare(password, admin.password);
        console.log('   Direct bcrypt.compare:', directCompare ? '✅ MATCH' : '❌ NO MATCH');
        
        // Test using model method
        const modelCompare = await admin.comparePassword(password);
        console.log('   Model comparePassword:', modelCompare ? '✅ MATCH' : '❌ NO MATCH');
        console.log('');

        if (!directCompare && !modelCompare) {
            console.log('⚠️  Password mismatch detected!');
            console.log('   This could mean:');
            console.log('   1. Password was changed after reset');
            console.log('   2. Password hash is corrupted');
            console.log('   3. Wrong password is being tested');
            console.log('');
            console.log('💡 Let\'s reset the password again...');
            
            admin.password = password;
            admin.passwordChangedAt = new Date();
            await admin.save();
            
            console.log('✅ Password reset. Testing again...');
            const newCompare = await admin.comparePassword(password);
            console.log('   After reset - comparePassword:', newCompare ? '✅ MATCH' : '❌ NO MATCH');
        }

        console.log('\n🔍 Step 4: Checking account status...');
        if (admin.isLocked) {
            console.log('⚠️  Account is LOCKED');
            console.log('   Lock until:', admin.lockUntil);
            console.log('   Login attempts:', admin.loginAttempts);
        } else {
            console.log('✅ Account is NOT locked');
        }

        if (!admin.isActive) {
            console.log('⚠️  Account is INACTIVE');
        } else {
            console.log('✅ Account is ACTIVE');
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

debugAdminLogin();

