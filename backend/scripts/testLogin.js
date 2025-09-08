const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('\n🧪 Testing Login Flow...');

        // Test Super Admin Login
        console.log('\n1️⃣ Testing Super Admin Login:');
        const email = 'admin@swagatodisha.com';
        const password = 'Admin@123456';

        console.log('Looking for admin with email:', email);
        let user = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
        let userType = 'admin';

        if (user) {
            console.log('✅ Admin user found:', user._id);
            console.log('User role:', user.role);
            console.log('User isActive:', user.isActive);
            console.log('User isLocked:', user.isLocked);

            // Check if user is active
            if (!user.isActive) {
                console.log('❌ Account is disabled');
                return;
            }

            // Check if account is locked
            if (user.isLocked) {
                console.log('❌ Account is locked');
                return;
            }

            // Check password
            console.log('Checking password...');
            const isPasswordValid = await user.comparePassword(password);
            console.log('Password valid:', isPasswordValid);

            if (isPasswordValid) {
                console.log('✅ Login successful!');
            } else {
                console.log('❌ Invalid password');
            }
        } else {
            console.log('❌ Admin user not found');
        }

        // Test Staff Login
        console.log('\n2️⃣ Testing Staff Login:');
        const staffEmail = 'staff1@swagatodisha.com';
        const staffPassword = 'Staff@123456';

        const staff = await Admin.findOne({ email: staffEmail.toLowerCase() }).select('+password');
        if (staff) {
            console.log('✅ Staff user found:', staff._id);
            const staffPasswordValid = await staff.comparePassword(staffPassword);
            console.log('Staff password valid:', staffPasswordValid);
        } else {
            console.log('❌ Staff user not found');
        }

        // Test Agent Login
        console.log('\n3️⃣ Testing Agent Login:');
        const agentEmail = 'agent1@swagatodisha.com';
        const agentPassword = 'Agent@123456';

        const agent = await User.findOne({ email: agentEmail.toLowerCase() }).select('+password');
        if (agent) {
            console.log('✅ Agent user found:', agent._id);
            const agentPasswordValid = await agent.comparePassword(agentPassword);
            console.log('Agent password valid:', agentPasswordValid);
        } else {
            console.log('❌ Agent user not found');
        }

        // Test Student Login
        console.log('\n4️⃣ Testing Student Login:');
        const studentEmail = 'student1@swagatodisha.com';
        const studentPassword = 'Student@123456';

        const student = await User.findOne({ email: studentEmail.toLowerCase() }).select('+password');
        if (student) {
            console.log('✅ Student user found:', student._id);
            const studentPasswordValid = await student.comparePassword(studentPassword);
            console.log('Student password valid:', studentPasswordValid);
        } else {
            console.log('❌ Student user not found');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

testLogin();
