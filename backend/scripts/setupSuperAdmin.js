const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const setupSuperAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Check if super admin already exists
        const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });
        if (existingSuperAdmin) {
            console.log('✅ Super Admin already exists:');
            console.log(`   Email: ${existingSuperAdmin.email}`);
            console.log(`   Name: ${existingSuperAdmin.firstName} ${existingSuperAdmin.lastName}`);
            console.log(`   Phone: ${existingSuperAdmin.phone}`);
            process.exit(0);
        }

        // Create super admin with proper gender field
        const superAdmin = new Admin({
            firstName: 'Super',
            lastName: 'Admin',
            email: 'admin@swagatodisha.com',
            password: 'Admin@123456',
            phone: '9876543210',
            role: 'super_admin',
            department: 'Administration',
            designation: 'Super Administrator',
            isActive: true,
            isEmailVerified: true,
            gender: 'male' // Adding required gender field
        });

        await superAdmin.save();
        console.log('✅ Super Admin created successfully!');
        console.log('\n🔑 SUPER ADMIN CREDENTIALS:');
        console.log(`   Email: admin@swagatodisha.com`);
        console.log(`   Password: Admin@123456`);
        console.log(`   Role: super_admin`);
        console.log(`   Phone: 9876543210`);

    } catch (error) {
        console.error('❌ Error creating super admin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
        process.exit(0);
    }
};

setupSuperAdmin();
