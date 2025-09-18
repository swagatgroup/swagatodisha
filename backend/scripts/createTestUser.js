#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createTestUser() {
    console.log('🔍 Creating Test User');
    console.log('====================\n');

    try {
        // Connect to MongoDB
        console.log('1️⃣ Connecting to MongoDB...');
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swagat_odisha';

        try {
            await mongoose.connect(mongoURI);
            console.log('   ✅ Connected to MongoDB');
        } catch (error) {
            console.log('   ❌ MongoDB connection failed:', error.message);
            console.log('   💡 Make sure MongoDB is running:');
            console.log('   - Start MongoDB: mongod');
            console.log('   - Or use MongoDB Atlas (cloud)');
            return;
        }

        // Import User model
        const User = require('./models/User');

        // Create a test user
        console.log('\n2️⃣ Creating test user...');
        const testUser = new User({
            fullName: 'Test User',
            email: 'test@example.com',
            phoneNumber: '9876543210',
            password: 'Password123!',
            role: 'student',
            guardianName: 'Test Guardian'
        });

        try {
            const savedUser = await testUser.save();
            console.log('   ✅ Test user created successfully');
            console.log('   👤 User ID:', savedUser._id);
            console.log('   📧 Email:', savedUser.email);
            console.log('   👤 Name:', savedUser.fullName);
            console.log('   🔑 Role:', savedUser.role);

            // Generate JWT token
            console.log('\n3️⃣ Generating JWT token...');
            const jwt = require('jsonwebtoken');
            const token = jwt.sign(
                { id: savedUser._id, role: savedUser.role },
                process.env.JWT_SECRET || 'swagat_odisha_jwt_secret_key_2024_development',
                { expiresIn: '7d' }
            );

            console.log('   ✅ JWT token generated');
            console.log('   🔑 Token (first 20 chars):', token.substring(0, 20) + '...');

            // Test the token
            console.log('\n4️⃣ Testing JWT token...');
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'swagat_odisha_jwt_secret_key_2024_development');
                console.log('   ✅ JWT token is valid');
                console.log('   👤 Decoded user ID:', decoded.id);
                console.log('   🔑 Decoded role:', decoded.role);
            } catch (jwtError) {
                console.log('   ❌ JWT token verification failed:', jwtError.message);
            }

        } catch (error) {
            console.log('   ❌ User creation failed:', error.message);
            if (error.name === 'ValidationError') {
                console.log('   📋 Validation errors:');
                Object.values(error.errors).forEach(err => {
                    console.log(`     - ${err.path}: ${err.message}`);
                });
            }
        }

        // Close connection
        await mongoose.connection.close();
        console.log('\n   ✅ Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the test
createTestUser();
