const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Admin = require('../models/Admin');

/**
 * Script to reset the Super Admin password.
 *
 * Usage:
 *   node backend/scripts/resetSuperAdminPassword.js <NEW_PASSWORD> [SUPER_ADMIN_EMAIL]
 *
 * Examples:
 *   node backend/scripts/resetSuperAdminPassword.js "MyNewStrongP@ssw0rd"
 *   node backend/scripts/resetSuperAdminPassword.js "MyNewStrongP@ssw0rd" "admin@swagatodisha.com"
 */

async function resetSuperAdminPassword() {
    try {
        const args = process.argv.slice(2);

        if (args.length < 1) {
            console.error('❌ Please provide the new password as the first argument.');
            console.error('   Usage: node backend/scripts/resetSuperAdminPassword.js <NEW_PASSWORD> [SUPER_ADMIN_EMAIL]');
            process.exit(1);
        }

        const newPassword = args[0];
        const emailFilter = args[1]; // optional

        if (!newPassword || newPassword.length < 6) {
            console.error('❌ New password must be at least 6 characters long.');
            process.exit(1);
        }

        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('❌ MONGO_URI or MONGODB_URI is not set in backend/.env');
            process.exit(1);
        }

        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const query = { role: 'super_admin' };
        if (emailFilter) {
            query.email = emailFilter.toLowerCase();
        }

        console.log('🔍 Looking for Super Admin account...', query);
        const superAdmin = await Admin.findOne(query).select('+password');

        if (!superAdmin) {
            console.error('❌ Super Admin not found with the given criteria.');
            console.error('   Tried query:', query);
            await mongoose.connection.close();
            process.exit(1);
        }

        console.log(`✅ Found Super Admin: ${superAdmin.email} (ID: ${superAdmin._id})`);

        // Set password directly - the pre-save hook will hash it automatically
        superAdmin.password = newPassword;
        superAdmin.passwordChangedAt = new Date();

        await superAdmin.save();

        console.log('✅ Super Admin password has been reset successfully.');
        console.log('   Email :', superAdmin.email);
        console.log('   UserID:', superAdmin._id.toString());
        console.log('   NOTE  : Store the new password securely and change it after first login if needed.');

        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error while resetting Super Admin password:', error.message);
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

resetSuperAdminPassword();


