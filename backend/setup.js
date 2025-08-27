const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const setupDatabase = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');

        // Connect to MongoDB
        await mongoose.connect(process.env.mongodb + srv://swagatgroup:SGClusterDB%4099%23
            @cluster0.m0ymyqa.mongodb.net /? retryWrites = true & w=majority & appName=Cluster0 || 'mongodb://localhost:27017/swagat_odisha', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ MongoDB connected successfully!');

        // Check if super admin already exists
        const existingSuperAdmin = await User.findOne({ role: 'super_admin' });

        if (existingSuperAdmin) {
            console.log('👑 Super Admin already exists!');
            console.log(`Email: ${existingSuperAdmin.email}`);
            console.log('Setup complete! 🎉');
            process.exit(0);
        }

        // Create super admin user
        console.log('👑 Creating Super Admin user...');

        const superAdminData = {
            firstName: 'Super',
            lastName: 'Admin',
            email: 'admin@swagatodisha.com',
            password: 'admin123456',
            phone: '9999999999',
            role: 'super_admin',
            isEmailVerified: true,
            isPhoneVerified: true,
            isActive: true
        };

        const superAdmin = await User.create(superAdminData);

        console.log('✅ Super Admin created successfully!');
        console.log('📧 Email:', superAdmin.email);
        console.log('🔑 Password: admin123456');
        console.log('⚠️  Please change this password after first login!');
        console.log('');
        console.log('🎉 Database setup complete!');
        console.log('🚀 You can now start the server with: npm run dev');

        process.exit(0);

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
};

// Run setup
setupDatabase();
