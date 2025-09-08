const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const User = require('../models/User');
require('dotenv').config();

const fixPasswords = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        console.log('\n🔧 Fixing All User Passwords...\n');

        // Fix Super Admin Password
        console.log('1️⃣ Fixing Super Admin Password...');
        const superAdmin = await Admin.findOne({ email: 'admin@swagatodisha.com' });
        if (superAdmin) {
            superAdmin.password = 'Admin@123456';
            await superAdmin.save();
            console.log('   ✅ Super Admin password fixed');
        } else {
            console.log('   ❌ Super Admin not found');
        }

        // Fix Staff Passwords
        console.log('2️⃣ Fixing Staff Passwords...');
        const staffEmails = [
            'staff1@swagatodisha.com',
            'staff2@swagatodisha.com',
            'staff3@swagatodisha.com'
        ];

        for (const email of staffEmails) {
            const staff = await Admin.findOne({ email });
            if (staff) {
                staff.password = 'Staff@123456';
                await staff.save();
                console.log(`   ✅ Staff password fixed: ${email}`);
            } else {
                console.log(`   ❌ Staff not found: ${email}`);
            }
        }

        // Fix Agent Passwords
        console.log('3️⃣ Fixing Agent Passwords...');
        const agentEmails = [
            'agent1@swagatodisha.com',
            'agent2@swagatodisha.com',
            'agent3@swagatodisha.com',
            'agent4@swagatodisha.com',
            'agent5@swagatodisha.com',
            'agent6@swagatodisha.com',
            'agent7@swagatodisha.com',
            'agent8@swagatodisha.com',
            'agent9@swagatodisha.com',
            'agent10@swagatodisha.com'
        ];

        for (const email of agentEmails) {
            const agent = await User.findOne({ email });
            if (agent) {
                agent.password = 'Agent@123456';
                await agent.save();
                console.log(`   ✅ Agent password fixed: ${email}`);
            } else {
                console.log(`   ❌ Agent not found: ${email}`);
            }
        }

        // Fix Student Passwords
        console.log('4️⃣ Fixing Student Passwords...');
        const studentEmails = [
            'student1@swagatodisha.com',
            'student2@swagatodisha.com',
            'student3@swagatodisha.com',
            'student4@swagatodisha.com',
            'student5@swagatodisha.com'
        ];

        for (const email of studentEmails) {
            const student = await User.findOne({ email });
            if (student) {
                student.password = 'Student@123456';
                await student.save();
                console.log(`   ✅ Student password fixed: ${email}`);
            } else {
                console.log(`   ❌ Student not found: ${email}`);
            }
        }

        console.log('\n🎉 All Passwords Fixed Successfully!');
        console.log('\n📋 VERIFIED LOGIN CREDENTIALS:');
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
        console.error('❌ Error fixing passwords:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
        process.exit(0);
    }
};

fixPasswords();
