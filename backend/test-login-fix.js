const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./models/Admin');
const User = require('./models/User');

async function testLoginFix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin users exist
        console.log('\n🔍 Checking existing admin users...');
        const adminUsers = await Admin.find({ email: { $regex: /.*@example\.com/ } });
        console.log('Found admin users:', adminUsers.length);
        adminUsers.forEach(user => {
            console.log(`- ${user.email} (${user.role})`);
        });

        // Check if regular users exist
        console.log('\n🔍 Checking existing regular users...');
        const regularUsers = await User.find({ email: { $regex: /.*@example\.com/ } });
        console.log('Found regular users:', regularUsers.length);
        regularUsers.forEach(user => {
            console.log(`- ${user.email} (${user.role})`);
        });

        // Create admin users if they don't exist
        if (adminUsers.length === 0) {
            console.log('\n📝 Creating admin users...');
            const adminData = {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                password: 'password@123!',
                phone: '9876543213',
                role: 'super_admin',
                isActive: true,
                isEmailVerified: true,
                department: 'Administration',
                designation: 'Super Admin'
            };

            const staffData = {
                firstName: 'Staff',
                lastName: 'User',
                email: 'staff@example.com',
                password: 'password@123!',
                phone: '9876543212',
                role: 'staff',
                isActive: true,
                isEmailVerified: true,
                department: 'Administration',
                designation: 'Staff Member'
            };

            const admin = new Admin(adminData);
            await admin.save();
            console.log('✅ Created admin user:', admin.email);

            const staff = new Admin(staffData);
            await staff.save();
            console.log('✅ Created staff user:', staff.email);
        }

        console.log('\n🎉 Test completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

testLoginFix();
