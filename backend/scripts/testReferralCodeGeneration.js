const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Admin = require('../models/Admin');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swagatodisha', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Test referral code generation for different user types
const testReferralCodeGeneration = async () => {
    try {
        console.log('🧪 Testing referral code generation for all user types...\n');

        // Test data
        const testUsers = [
            {
                fullName: 'Test Student',
                email: 'teststudent@example.com',
                password: 'TestPassword123!',
                phoneNumber: '9876543210',
                role: 'student'
            },
            {
                fullName: 'Test Agent',
                email: 'testagent@example.com',
                password: 'TestPassword123!',
                phoneNumber: '9876543211',
                role: 'agent'
            },
            {
                fullName: 'Test Staff',
                email: 'teststaff@example.com',
                password: 'TestPassword123!',
                phoneNumber: '9876543212',
                role: 'staff'
            },
            {
                fullName: 'Test Super Admin',
                email: 'testsuperadmin@example.com',
                password: 'TestPassword123!',
                phoneNumber: '9876543213',
                role: 'super_admin'
            }
        ];

        const testAdmins = [
            {
                firstName: 'Test',
                lastName: 'Staff',
                email: 'testadminstaff@example.com',
                password: 'TestPassword123!',
                phone: '9876543214',
                role: 'staff'
            },
            {
                firstName: 'Test',
                lastName: 'Super Admin',
                email: 'testadminsuper@example.com',
                password: 'TestPassword123!',
                phone: '9876543215',
                role: 'super_admin'
            }
        ];

        console.log('👥 Testing User model referral code generation:');
        console.log('='.repeat(60));

        for (const userData of testUsers) {
            try {
                // Clean up any existing test user
                await User.deleteOne({ email: userData.email });

                // Create new user
                const user = new User(userData);
                await user.save();

                console.log(`✅ ${userData.role.toUpperCase()}: ${user.email}`);
                console.log(`   Name: ${user.fullName}`);
                console.log(`   Phone: ${user.phoneNumber}`);
                console.log(`   Referral Code: ${user.referralCode}`);
                console.log(`   Referral Active: ${user.isReferralActive}`);
                console.log(`   Generated Format: ${user.referralCode ? user.referralCode.length : 'N/A'} characters`);
                console.log('');

            } catch (error) {
                console.error(`❌ Error creating ${userData.role}:`, error.message);
            }
        }

        console.log('👨‍💼 Testing Admin model referral code generation:');
        console.log('='.repeat(60));

        for (const adminData of testAdmins) {
            try {
                // Clean up any existing test admin
                await Admin.deleteOne({ email: adminData.email });

                // Create new admin
                const admin = new Admin(adminData);
                await admin.save();

                console.log(`✅ ${adminData.role.toUpperCase()}: ${admin.email}`);
                console.log(`   Name: ${admin.fullName}`);
                console.log(`   Phone: ${admin.phone}`);
                console.log(`   Referral Code: ${admin.referralCode}`);
                console.log(`   Referral Active: ${admin.isReferralActive}`);
                console.log(`   Generated Format: ${admin.referralCode ? admin.referralCode.length : 'N/A'} characters`);
                console.log('');

            } catch (error) {
                console.error(`❌ Error creating ${adminData.role}:`, error.message);
            }
        }

        // Test referral code uniqueness
        console.log('🔍 Testing referral code uniqueness...');
        console.log('='.repeat(60));

        const allUsers = await User.find({}, 'referralCode email role');
        const allAdmins = await Admin.find({}, 'referralCode email role');

        const allReferralCodes = [
            ...allUsers.map(u => ({ code: u.referralCode, type: 'User', email: u.email, role: u.role })),
            ...allAdmins.map(a => ({ code: a.referralCode, type: 'Admin', email: a.email, role: a.role }))
        ];

        const uniqueCodes = new Set(allReferralCodes.map(item => item.code));
        const duplicateCodes = allReferralCodes.filter((item, index) =>
            allReferralCodes.findIndex(other => other.code === item.code) !== index
        );

        console.log(`📊 Total accounts: ${allReferralCodes.length}`);
        console.log(`📊 Unique referral codes: ${uniqueCodes.size}`);
        console.log(`📊 Duplicate codes: ${duplicateCodes.length}`);

        if (duplicateCodes.length > 0) {
            console.log('⚠️  Duplicate referral codes found:');
            duplicateCodes.forEach(dup => {
                console.log(`   ${dup.code} - ${dup.type} (${dup.role}) - ${dup.email}`);
            });
        } else {
            console.log('✅ All referral codes are unique!');
        }

        // Test referral code format validation
        console.log('\n🔍 Testing referral code format validation...');
        console.log('='.repeat(60));

        const formatRegex = /^[a-z]{3}\d{2}[aost]\d{2}$/;
        const invalidCodes = allReferralCodes.filter(item =>
            item.code && !formatRegex.test(item.code)
        );

        if (invalidCodes.length > 0) {
            console.log('⚠️  Invalid referral code formats found:');
            invalidCodes.forEach(invalid => {
                console.log(`   ${invalid.code} - ${invalid.type} (${invalid.role}) - ${invalid.email}`);
            });
        } else {
            console.log('✅ All referral codes follow the correct format!');
        }

        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        for (const userData of testUsers) {
            await User.deleteOne({ email: userData.email });
        }
        for (const adminData of testAdmins) {
            await Admin.deleteOne({ email: adminData.email });
        }
        console.log('✅ Test data cleaned up');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
};

// Main function
const main = async () => {
    try {
        await connectDB();
        await testReferralCodeGeneration();
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
};

// Run the test
if (require.main === module) {
    main();
}

module.exports = { testReferralCodeGeneration };
