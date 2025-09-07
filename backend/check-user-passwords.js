const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function checkUserPasswords() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find admin and staff users
        const users = await User.find({
            email: { $in: ['admin@example.com', 'staff@example.com'] }
        }).select('+password');

        console.log(`\n🔍 Found ${users.length} users:`);

        for (const user of users) {
            console.log(`\n👤 User: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Full Name: ${user.fullName}`);
            console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
            console.log(`   Is Active: ${user.isActive}`);

            // Test different passwords
            const testPasswords = [
                'Password123!',
                'password123',
                'password@123!',
                'Password@123!',
                'admin123',
                'staff123'
            ];

            console.log('   Testing passwords:');
            for (const testPassword of testPasswords) {
                try {
                    const isValid = await user.comparePassword(testPassword);
                    console.log(`     ${testPassword}: ${isValid ? '✅ VALID' : '❌ Invalid'}`);
                } catch (error) {
                    console.log(`     ${testPassword}: ❌ Error - ${error.message}`);
                }
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

checkUserPasswords();
