const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const createSuperAdmin = async () => {
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
            console.log('❌ Super Admin already exists');
            console.log('Email:', existingSuperAdmin.email);
            process.exit(0);
        }

        // Create super admin
        const superAdmin = new Admin({
            firstName: 'Super',
            lastName: 'Admin',
            email: 'superadmin@swagatodisha.com',
            password: 'admin123456', // Change this in production
            phone: '9876543210',
            role: 'super_admin',
            department: 'Administration',
            designation: 'Super Administrator',
            isActive: true,
            isEmailVerified: true
        });

        await superAdmin.save();

        console.log('✅ Super Admin created successfully');
        console.log('Email:', superAdmin.email);
        console.log('Password: admin123456');
        console.log('⚠️  Please change the password after first login');

    } catch (error) {
        console.error('❌ Error creating super admin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);
    }
};

createSuperAdmin();
