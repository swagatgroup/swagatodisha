const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('./models/User');

async function debugLogin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check existing users
        const users = await User.find({});
        console.log(`\n📊 Total users in database: ${users.length}`);

        if (users.length > 0) {
            console.log('\n👥 Existing users:');
            users.forEach((user, index) => {
                console.log(`${index + 1}. Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Active: ${user.isActive}`);
                console.log(`   Created: ${user.createdAt}`);
                console.log('---');
            });
        } else {
            console.log('\n❌ No users found in database');

            // Create a test user
            console.log('\n🔧 Creating test user...');
            const testUser = new User({
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: 'password123',
                phone: '1234567890',
                role: 'student',
                isActive: true,
                isEmailVerified: true
            });

            await testUser.save();
            console.log('✅ Test user created successfully');
            console.log(`   Email: test@example.com`);
            console.log(`   Password: password123`);
            console.log(`   Role: student`);
        }

        // Test login endpoint
        console.log('\n🔍 Testing login endpoint...');
        const bcrypt = require('bcryptjs');
        const jwt = require('jsonwebtoken');

        const testEmail = 'test@example.com';
        const testPassword = 'password123';

        const user = await User.findOne({ email: testEmail });
        if (user) {
            const isPasswordValid = await user.comparePassword(testPassword);
            if (isPasswordValid) {
                const token = jwt.sign(
                    { userId: user._id, email: user.email, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRE }
                );
                console.log('✅ Login test successful');
                console.log(`   Token generated: ${token.substring(0, 50)}...`);
            } else {
                console.log('❌ Password validation failed');
            }
        } else {
            console.log('❌ User not found');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

debugLogin();
