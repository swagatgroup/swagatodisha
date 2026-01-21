const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Import User model
const User = require('../models/User');

// Import database connection
const connectDB = require('../config/db');

const createTestAgent = async () => {
    try {
        // Connect to database
        await connectDB();

        // Test Agent Credentials
        const testAgentData = {
            fullName: 'Test Agent',
            email: 'testagent@swagat.com',
            password: 'testagent123', // Will be hashed automatically
            phoneNumber: '9876543210',
            role: 'agent',
            isActive: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            isReferralActive: true
        };

        // Check if agent already exists
        const existingAgent = await User.findOne({ email: testAgentData.email });
        if (existingAgent) {
            console.log('⚠️  Test agent already exists!');
            console.log('\n📋 Existing Agent Details:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`Email: ${existingAgent.email}`);
            console.log(`Password: testagent123 (if you set it before)`);
            console.log(`User ID: ${existingAgent._id}`);
            console.log(`Role: ${existingAgent.role}`);
            console.log(`Referral Code: ${existingAgent.referralCode || 'Not generated'}`);
            console.log(`Status: ${existingAgent.isActive ? 'Active' : 'Inactive'}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            
            // Update password if needed
            existingAgent.password = testAgentData.password;
            await existingAgent.save();
            console.log('✅ Password updated to: testagent123\n');
            
            await mongoose.connection.close();
            return;
        }

        // Create new test agent
        const testAgent = new User(testAgentData);
        await testAgent.save();

        console.log('\n✅ Test Agent Created Successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 Agent Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Email: ${testAgent.email}`);
        console.log(`Password: testagent123`);
        console.log(`User ID: ${testAgent._id}`);
        console.log(`Role: ${testAgent.role}`);
        console.log(`Referral Code: ${testAgent.referralCode || 'Will be generated'}`);
        console.log(`Phone: ${testAgent.phoneNumber}`);
        console.log(`Status: ${testAgent.isActive ? 'Active' : 'Inactive'}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating test agent:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

// Run the script
createTestAgent();

