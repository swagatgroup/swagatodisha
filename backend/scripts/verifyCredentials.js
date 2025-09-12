const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const User = require('../models/User');
require('dotenv').config();

const verifyCredentials = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        console.log('\n🔍 VERIFYING SUPER ADMIN CREDENTIALS...\n');

        // Check for Super Admin accounts
        const superAdmins = await Admin.find({ role: 'super_admin' }).select('-password');

        if (superAdmins.length === 0) {
            console.log('❌ No Super Admin accounts found in database');
        } else {
            console.log(`✅ Found ${superAdmins.length} Super Admin account(s):`);
            superAdmins.forEach((admin, index) => {
                console.log(`\n${index + 1}. Super Admin Account:`);
                console.log(`   Email: ${admin.email}`);
                console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
                console.log(`   Phone: ${admin.phone}`);
                console.log(`   Role: ${admin.role}`);
                console.log(`   Active: ${admin.isActive}`);
                console.log(`   Email Verified: ${admin.isEmailVerified}`);
                console.log(`   Created: ${admin.createdAt}`);
            });
        }

        console.log('\n🔍 VERIFYING STAFF ACCOUNTS...\n');

        // Check for Staff accounts
        const staffAccounts = await Admin.find({ role: 'staff' }).select('-password');

        if (staffAccounts.length === 0) {
            console.log('❌ No Staff accounts found in database');
        } else {
            console.log(`✅ Found ${staffAccounts.length} Staff account(s):`);
            staffAccounts.forEach((staff, index) => {
                console.log(`\n${index + 1}. Staff Account:`);
                console.log(`   Email: ${staff.email}`);
                console.log(`   Name: ${staff.firstName} ${staff.lastName}`);
                console.log(`   Phone: ${staff.phone}`);
                console.log(`   Department: ${staff.department}`);
                console.log(`   Designation: ${staff.designation}`);
                console.log(`   Employee ID: ${staff.employeeId}`);
            });
        }

        console.log('\n🔍 VERIFYING AGENT ACCOUNTS...\n');

        // Check for Agent accounts
        const agentAccounts = await User.find({ role: 'agent' }).select('-password');

        if (agentAccounts.length === 0) {
            console.log('❌ No Agent accounts found in database');
        } else {
            console.log(`✅ Found ${agentAccounts.length} Agent account(s):`);
            agentAccounts.forEach((agent, index) => {
                console.log(`\n${index + 1}. Agent Account:`);
                console.log(`   Email: ${agent.email}`);
                console.log(`   Name: ${agent.fullName}`);
                console.log(`   Phone: ${agent.phoneNumber}`);
                console.log(`   Active: ${agent.isActive}`);
            });
        }

        console.log('\n🔍 VERIFYING STUDENT ACCOUNTS...\n');

        // Check for Student accounts
        const studentAccounts = await User.find({ role: 'student' }).select('-password');

        if (studentAccounts.length === 0) {
            console.log('❌ No Student accounts found in database');
        } else {
            console.log(`✅ Found ${studentAccounts.length} Student account(s):`);
            studentAccounts.forEach((student, index) => {
                console.log(`\n${index + 1}. Student Account:`);
                console.log(`   Email: ${student.email}`);
                console.log(`   Name: ${student.fullName}`);
                console.log(`   Phone: ${student.phoneNumber}`);
                console.log(`   Active: ${student.isActive}`);
            });
        }

        console.log('\n📋 SUMMARY:');
        console.log(`   Super Admins: ${superAdmins.length}`);
        console.log(`   Staff: ${staffAccounts.length}`);
        console.log(`   Agents: ${agentAccounts.length}`);
        console.log(`   Students: ${studentAccounts.length}`);

    } catch (error) {
        console.error('❌ Error verifying credentials:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
        process.exit(0);
    }
};

verifyCredentials();
