const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Admin = require('./models/Admin');

async function debugLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'admin@example.com';
        const password = 'Password123!';

        console.log(`\n🔍 Debugging login for: ${email}`);

        // Check User model first
        console.log('1. Checking User model...');
        let user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        let userType = 'user';

        if (user) {
            console.log('✅ User found in User model:', user._id);
            console.log('   Role:', user.role);
            console.log('   Is Active:', user.isActive);
            console.log('   Full Name:', user.fullName);
        } else {
            console.log('❌ User not found in User model');
        }

        // Check Admin model
        if (!user) {
            console.log('2. Checking Admin model...');
            const adminUser = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
            
            if (adminUser) {
                console.log('✅ Admin user found:', adminUser._id);
                console.log('   Role:', adminUser.role);
                console.log('   Is Active:', adminUser.isActive);
                console.log('   Full Name:', adminUser.fullName);
                user = adminUser;
                userType = 'admin';
            } else {
                console.log('❌ Admin user not found');
            }
        }

        if (!user) {
            console.log('❌ No user found in any model');
            return;
        }

        // Test password
        console.log('3. Testing password...');
        try {
            const isPasswordValid = await user.comparePassword(password);
            console.log('   Password valid:', isPasswordValid);
        } catch (error) {
            console.log('   Password comparison error:', error.message);
        }

        // Test JWT generation
        console.log('4. Testing JWT generation...');
        try {
            const jwt = require('jsonwebtoken');
            const token = jwt.sign(
                {
                    id: user._id,
                    email: user.email,
                    role: user.role || 'user',
                    userType: userType
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            console.log('   JWT generated successfully, length:', token.length);
        } catch (error) {
            console.log('   JWT generation error:', error.message);
        }

        console.log('\n🎉 Debug completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

debugLogin();