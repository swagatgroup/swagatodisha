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
                fullName: 'Test Student',
                guardianName: 'Guardian Student',
                email: 'student@example.com',
                password: 'Password123!',
                phoneNumber: '9876543210',
                role: 'student',
                isActive: true,
                isEmailVerified: true,
                gender: 'male',
                address: {
                    street: 'Test Street',
                    city: 'Test City',
                    state: 'Odisha',
                    pincode: '751001',
                    country: 'India'
                }
            },
            {
                fullName: 'Test Agent',
                guardianName: 'Guardian Agent',
                email: 'agent@example.com',
                password: 'Password123!',
                phoneNumber: '9876543211',
                role: 'agent',
                isActive: true,
                isEmailVerified: true,
                gender: 'male',
                address: {
                    street: 'Test Street',
                    city: 'Test City',
                    state: 'Odisha',
                    pincode: '751001',
                    country: 'India'
                }
            },
            {
                fullName: 'Test Staff',
                guardianName: 'Guardian Staff',
                email: 'staff@example.com',
                password: 'Password123!',
                phoneNumber: '9876543212',
                role: 'staff',
                isActive: true,
                isEmailVerified: true,
                gender: 'female',
                department: 'Administration',
                designation: 'Staff Member',
                address: {
                    street: 'Test Street',
                    city: 'Test City',
                    state: 'Odisha',
                    pincode: '751001',
                    country: 'India'
                }
            },
            {
                fullName: 'Test Admin',
                guardianName: 'Guardian Admin',
                email: 'admin@example.com',
                password: 'Password123!',
                phoneNumber: '9876543213',
                role: 'super_admin',
                isActive: true,
                isEmailVerified: true,
                gender: 'male',
                department: 'Administration',
                designation: 'Super Admin',
                address: {
                    street: 'Test Street',
                    city: 'Test City',
                    state: 'Odisha',
                    pincode: '751001',
                    country: 'India'
                }
            }
        ];

        for (const userData of testUsers) {
            const user = new User(userData);
            await user.save();
            console.log(`✅ Created ${userData.role} user: ${userData.email}`);
        }

        console.log('\n🎉 All test users created successfully!');
        console.log('\n📋 Test Credentials:');
        console.log('Student: student@example.com / Password123!');
        console.log('Agent: agent@example.com / Password123!');
        console.log('Staff: staff@example.com / Password123!');
        console.log('Admin: admin@example.com / Password123!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

createTestUsers();
