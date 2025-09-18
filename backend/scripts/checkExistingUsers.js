#!/usr/bin/env node

const mongoose = require('mongoose');

async function checkExistingUsers() {
    console.log('🔍 Checking Existing Users');
    console.log('==========================\n');

    try {
        // Connect to MongoDB
        console.log('1️⃣ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swagat_odisha', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('   ✅ Connected to MongoDB');

        // Import User model
        const User = require('./models/User');

        // Find all users
        console.log('\n2️⃣ Finding all users...');
        const users = await User.find({}).select('_id fullName email role createdAt');

        if (users.length === 0) {
            console.log('   ❌ No users found in database');
        } else {
            console.log(`   ✅ Found ${users.length} users:`);
            users.forEach((user, index) => {
                console.log(`   ${index + 1}. ID: ${user._id}`);
                console.log(`      Name: ${user.fullName}`);
                console.log(`      Email: ${user.email}`);
                console.log(`      Role: ${user.role}`);
                console.log(`      Created: ${user.createdAt}`);
                console.log('');
            });
        }

        // Close connection
        await mongoose.connection.close();
        console.log('   ✅ Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the check
checkExistingUsers();
