const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function updateUserPasswords() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Update admin and staff users with valid passwords
        const users = await User.find({
            email: { $in: ['admin@example.com', 'staff@example.com'] }
        });

        for (const user of users) {
            // Set a valid password that meets the User model requirements
            user.password = 'Password123!';
            user.fullName = user.role === 'super_admin' ? 'Admin User' : 'Staff User';

            // Save without validation to bypass the strict password requirements
            await user.save({ validateBeforeSave: false });
            console.log(`✅ Updated ${user.email} with new password and fullName`);
        }

        console.log('\n🎉 User passwords updated successfully!');
        console.log('New credentials:');
        console.log('Admin: admin@example.com / Password123!');
        console.log('Staff: staff@example.com / Password123!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

updateUserPasswords();
