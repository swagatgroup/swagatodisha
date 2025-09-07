const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./models/Admin');

async function createAdminUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing admin users
        await Admin.deleteMany({ email: { $regex: /.*@example\.com/ } });
        console.log('🗑️ Cleared existing admin users');

        // Create admin users
        const adminUsers = [
            {
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
            },
            {
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
            }
        ];

        for (const userData of adminUsers) {
            const admin = new Admin(userData);
            await admin.save();
            console.log(`✅ Created ${userData.role} user: ${userData.email}`);
        }

        console.log('\n🎉 All admin users created successfully!');
        console.log('\n📋 Admin Credentials:');
        console.log('Super Admin: admin@example.com / password@123!');
        console.log('Staff: staff@example.com / password@123!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

createAdminUsers();
