const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function fixUserNames() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Fix admin and staff users
        const users = await User.find({
            email: { $in: ['admin@example.com', 'staff@example.com'] }
        });

        for (const user of users) {
            if (!user.fullName) {
                if (user.role === 'super_admin') {
                    user.fullName = 'Admin User';
                } else if (user.role === 'staff') {
                    user.fullName = 'Staff User';
                }
                await user.save();
                console.log(`✅ Fixed fullName for ${user.email}: ${user.fullName}`);
            } else {
                console.log(`ℹ️  ${user.email} already has fullName: ${user.fullName}`);
            }
        }

        console.log('\n🎉 User names fixed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

fixUserNames();
