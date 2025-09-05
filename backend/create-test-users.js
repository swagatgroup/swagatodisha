const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function createTestUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing test users
        await User.deleteMany({ email: { $regex: /test.*@example\.com/ } });
        console.log('🗑️ Cleared existing test users');

        // Create test users for each role
        const testUsers = [
            {
                firstName: 'Test',
                lastName: 'Student',
                email: 'student@example.com',
                password: 'password123',
                phone: '1234567890',
                role: 'student',
                isActive: true,
                isEmailVerified: true
            },
            {
                firstName: 'Test',
                lastName: 'Agent',
                email: 'agent@example.com',
                password: 'password123',
                phone: '1234567891',
                role: 'agent',
                isActive: true,
                isEmailVerified: true
            },
            {
                firstName: 'Test',
                lastName: 'Staff',
                email: 'staff@example.com',
                password: 'password123',
                phone: '1234567892',
                role: 'staff',
                isActive: true,
                isEmailVerified: true
            },
            {
                firstName: 'Test',
                lastName: 'Admin',
                email: 'admin@example.com',
                password: 'password123',
                phone: '1234567893',
                role: 'super_admin',
                isActive: true,
                isEmailVerified: true
            }
        ];

        for (const userData of testUsers) {
            const user = new User(userData);
            await user.save();
            console.log(`✅ Created ${userData.role} user: ${userData.email}`);
        }

        console.log('\n🎉 All test users created successfully!');
        console.log('\n📋 Test Credentials:');
        console.log('Student: student@example.com / password123');
        console.log('Agent: agent@example.com / password123');
        console.log('Staff: staff@example.com / password123');
        console.log('Admin: admin@example.com / password123');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

createTestUsers();
