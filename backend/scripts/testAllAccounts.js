const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Student = require('../models/Student');
require('dotenv').config();

const testAllAccounts = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        console.log('\n🧪 Testing All User Accounts...\n');

        // Test Super Admin Account
        console.log('1️⃣ Testing Super Admin Account...');
        const superAdmin = await Admin.findOne({ email: 'admin@swagatodisha.com' }).select('+password');
        if (superAdmin) {
            const isPasswordValid = await superAdmin.comparePassword('Admin@123456');
            console.log(`   ✅ Super Admin: ${superAdmin.email} | Password Valid: ${isPasswordValid ? 'Yes' : 'No'} | Role: ${superAdmin.role}`);
        } else {
            console.log('   ❌ Super Admin not found');
        }

        // Test Staff Accounts
        console.log('\n2️⃣ Testing Staff Accounts...');
        const staffAccounts = [
            'staff1@swagatodisha.com',
            'staff2@swagatodisha.com',
            'staff3@swagatodisha.com'
        ];

        for (const email of staffAccounts) {
            const staff = await Admin.findOne({ email }).select('+password');
            if (staff) {
                const isPasswordValid = await staff.comparePassword('Staff@123456');
                console.log(`   ✅ Staff: ${staff.email} | Password Valid: ${isPasswordValid ? 'Yes' : 'No'} | Role: ${staff.role} | Department: ${staff.department}`);
            } else {
                console.log(`   ❌ Staff not found: ${email}`);
            }
        }

        // Test Agent Accounts
        console.log('\n3️⃣ Testing Agent Accounts...');
        const agentAccounts = [
            'agent1@swagatodisha.com',
            'agent2@swagatodisha.com',
            'agent3@swagatodisha.com',
            'agent4@swagatodisha.com',
            'agent5@swagatodisha.com'
        ];

        for (const email of agentAccounts) {
            const agent = await User.findOne({ email }).select('+password');
            if (agent) {
                const isPasswordValid = await agent.comparePassword('Agent@123456');
                console.log(`   ✅ Agent: ${agent.email} | Password Valid: ${isPasswordValid ? 'Yes' : 'No'} | Role: ${agent.role} | Referral Code: ${agent.referralCode}`);
            } else {
                console.log(`   ❌ Agent not found: ${email}`);
            }
        }

        // Test Student Accounts
        console.log('\n4️⃣ Testing Student Accounts...');
        const studentAccounts = [
            'student1@swagatodisha.com',
            'student2@swagatodisha.com',
            'student3@swagatodisha.com',
            'student4@swagatodisha.com',
            'student5@swagatodisha.com'
        ];

        for (const email of studentAccounts) {
            const student = await User.findOne({ email }).select('+password');
            if (student) {
                const isPasswordValid = await student.comparePassword('Student@123456');
                console.log(`   ✅ Student: ${student.email} | Password Valid: ${isPasswordValid ? 'Yes' : 'No'} | Role: ${student.role}`);

                // Check student profile
                const studentProfile = await Student.findOne({ user: student._id });
                if (studentProfile) {
                    console.log(`      📋 Student Profile: ${studentProfile.studentId} | Status: ${studentProfile.status} | Course: ${studentProfile.course}`);
                } else {
                    console.log(`      ❌ Student Profile not found for: ${email}`);
                }
            } else {
                console.log(`   ❌ Student not found: ${email}`);
            }
        }

        // Test Login Functionality
        console.log('\n5️⃣ Testing Login Functionality...');

        // Test Super Admin Login
        const superAdminLogin = await Admin.findByEmail('admin@swagatodisha.com');
        if (superAdminLogin) {
            const superAdminPasswordValid = await superAdminLogin.comparePassword('Admin@123456');
            console.log(`   ✅ Super Admin Login: ${superAdminPasswordValid ? 'Success' : 'Failed'}`);
        }

        // Test Staff Login
        const staffLogin = await Admin.findByEmail('staff1@swagatodisha.com');
        if (staffLogin) {
            const staffPasswordValid = await staffLogin.comparePassword('Staff@123456');
            console.log(`   ✅ Staff Login: ${staffPasswordValid ? 'Success' : 'Failed'}`);
        }

        // Test Agent Login
        const agentLogin = await User.findByEmail('agent1@swagatodisha.com');
        if (agentLogin) {
            const agentPasswordValid = await agentLogin.comparePassword('Agent@123456');
            console.log(`   ✅ Agent Login: ${agentPasswordValid ? 'Success' : 'Failed'}`);
        }

        // Test Student Login
        const studentLogin = await User.findByEmail('student1@swagatodisha.com');
        if (studentLogin) {
            const studentPasswordValid = await studentLogin.comparePassword('Student@123456');
            console.log(`   ✅ Student Login: ${studentPasswordValid ? 'Success' : 'Failed'}`);
        }

        // Count Total Accounts
        console.log('\n6️⃣ Account Summary...');
        const totalAdmins = await Admin.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalStudents = await Student.countDocuments();

        console.log(`   📊 Total Admin Accounts: ${totalAdmins}`);
        console.log(`   📊 Total User Accounts: ${totalUsers}`);
        console.log(`   📊 Total Student Profiles: ${totalStudents}`);
        console.log(`   📊 Total System Accounts: ${totalAdmins + totalUsers}`);

        // Test Role Distribution
        console.log('\n7️⃣ Role Distribution...');
        const roleStats = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        console.log('   User Role Distribution:');
        roleStats.forEach(stat => {
            console.log(`      ${stat._id}: ${stat.count} accounts`);
        });

        const adminRoleStats = await Admin.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        console.log('   Admin Role Distribution:');
        adminRoleStats.forEach(stat => {
            console.log(`      ${stat._id}: ${stat.count} accounts`);
        });

        // Test Referral Codes
        console.log('\n8️⃣ Testing Referral Codes...');
        const agentsWithCodes = await User.find({ role: 'agent', referralCode: { $exists: true } });
        console.log(`   📋 Agents with Referral Codes: ${agentsWithCodes.length}`);

        agentsWithCodes.forEach(agent => {
            console.log(`      ${agent.email}: ${agent.referralCode}`);
        });

        // Test Student Status Distribution
        console.log('\n9️⃣ Student Status Distribution...');
        const studentStatusStats = await Student.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        console.log('   Student Status Distribution:');
        studentStatusStats.forEach(stat => {
            console.log(`      ${stat._id}: ${stat.count} students`);
        });

        console.log('\n🎉 All Account Tests Completed Successfully!');
        console.log('\n📋 LOGIN CREDENTIALS SUMMARY:');
        console.log('=====================================');
        console.log('🔐 SUPER ADMIN:');
        console.log('   Email: admin@swagatodisha.com');
        console.log('   Password: Admin@123456');
        console.log('');
        console.log('👥 STAFF ACCOUNTS:');
        console.log('   Email: staff1@swagatodisha.com | Password: Staff@123456');
        console.log('   Email: staff2@swagatodisha.com | Password: Staff@123456');
        console.log('   Email: staff3@swagatodisha.com | Password: Staff@123456');
        console.log('');
        console.log('🤝 AGENT ACCOUNTS:');
        console.log('   Email: agent1@swagatodisha.com | Password: Agent@123456');
        console.log('   Email: agent2@swagatodisha.com | Password: Agent@123456');
        console.log('   Email: agent3@swagatodisha.com | Password: Agent@123456');
        console.log('   Email: agent4@swagatodisha.com | Password: Agent@123456');
        console.log('   Email: agent5@swagatodisha.com | Password: Agent@123456');
        console.log('');
        console.log('🎓 STUDENT ACCOUNTS:');
        console.log('   Email: student1@swagatodisha.com | Password: Student@123456');
        console.log('   Email: student2@swagatodisha.com | Password: Student@123456');
        console.log('   Email: student3@swagatodisha.com | Password: Student@123456');
        console.log('   Email: student4@swagatodisha.com | Password: Student@123456');
        console.log('   Email: student5@swagatodisha.com | Password: Student@123456');
        console.log('=====================================');

    } catch (error) {
        console.error('❌ Error testing accounts:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
        process.exit(0);
    }
};

testAllAccounts();
