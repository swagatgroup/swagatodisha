#!/usr/bin/env node

const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

async function debugAuthIssue() {
    console.log('🔍 Debugging Authentication Issue');
    console.log('=================================\n');

    const baseURL = 'http://localhost:5000';

    try {
        // Step 1: Check server health
        console.log('1️⃣ Checking server health...');
        const healthResponse = await axios.get(`${baseURL}/health`);
        console.log('   ✅ Server is running');

        // Step 2: Create a user
        console.log('\n2️⃣ Creating user...');
        const timestamp = Date.now();

        const userResponse = await axios.post(`${baseURL}/api/auth/register`, {
            fullName: 'Auth Debug User',
            email: `authdebug${timestamp}@example.com`,
            phoneNumber: `9876543${timestamp.toString().slice(-3)}`,
            password: 'Password123!',
            role: 'student',
            guardianName: 'Auth Debug Guardian'
        });

        if (userResponse.data.success) {
            const token = userResponse.data.token;
            const userId = userResponse.data.data.user.id;

            console.log('   ✅ User created!');
            console.log('   👤 User ID:', userId);
            console.log('   🔑 Token received');

            // Step 3: Decode the token
            console.log('\n3️⃣ Decoding token...');
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'swagat_odisha_jwt_secret_key_2024_development');
                console.log('   ✅ Token decoded successfully!');
                console.log('   👤 Decoded ID:', decoded.id);
                console.log('   🔑 Decoded role:', decoded.role);
            } catch (jwtError) {
                console.log('   ❌ Token decode failed:', jwtError.message);
                return;
            }

            // Step 4: Connect to database and check if user exists
            console.log('\n4️⃣ Checking if user exists in database...');
            try {
                const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swagat_odisha';
                await mongoose.connect(mongoURI);
                console.log('   ✅ Connected to MongoDB');

                const User = require('./models/User');
                const user = await User.findById(userId).select('-password');

                if (user) {
                    console.log('   ✅ User found in database!');
                    console.log('   👤 User ID:', user._id);
                    console.log('   📧 Email:', user.email);
                    console.log('   👤 Name:', user.fullName);
                    console.log('   🔑 Role:', user.role);
                    console.log('   ✅ Is Active:', user.isActive);
                    console.log('   🔒 Is Locked:', user.isLocked);
                } else {
                    console.log('   ❌ User NOT found in database!');
                    console.log('   💡 This explains the 401 error - user created but not found during auth');
                }

                await mongoose.connection.close();
                console.log('   ✅ Database connection closed');

            } catch (dbError) {
                console.log('   ❌ Database connection failed:', dbError.message);
            }

            // Step 5: Test authentication manually
            console.log('\n5️⃣ Testing authentication manually...');
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'swagat_odisha_jwt_secret_key_2024_development');
                const userId = decoded.id;

                // Simulate the auth middleware logic
                const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swagat_odisha';
                await mongoose.connect(mongoURI);

                const User = require('./models/User');
                const user = await User.findById(userId).select('-password');

                if (user) {
                    console.log('   ✅ Authentication would succeed!');
                    console.log('   👤 User found:', user.fullName);
                } else {
                    console.log('   ❌ Authentication would fail - user not found');
                }

                await mongoose.connection.close();

            } catch (authError) {
                console.log('   ❌ Manual auth test failed:', authError.message);
            }

        } else {
            console.log('   ❌ User creation failed:', userResponse.data.message);
        }

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

// Run the debug
debugAuthIssue();
