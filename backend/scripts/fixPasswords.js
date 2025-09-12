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
        // Connected to MongoDB

        // Fixing All User Passwords

        // Fix Super Admin Password
        // Fixing Super Admin Password
        const superAdmin = await Admin.findOne({ email: 'admin@swagatodisha.com' });
        if (superAdmin) {
            superAdmin.password = 'Admin@123456';
            await superAdmin.save();
            // Super Admin password fixed
        } else {
            // Super Admin not found
        }

        // Fix Staff Passwords
        // Fixing Staff Passwords
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
                // Staff password fixed
            } else {
                // Staff not found
            }
        }

        // Fix Agent Passwords
        // Fixing Agent Passwords
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
                // Agent password fixed
            } else {
                // Agent not found
            }
        }

        // Fix Student Passwords
        // Fixing Student Passwords
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
                // Student password fixed
            } else {
                // Student not found
            }
        }

        // All Passwords Fixed Successfully

    } catch (error) {
        console.error('❌ Error fixing passwords:', error);
    } finally {
        await mongoose.disconnect();
        // Disconnected from MongoDB
        process.exit(0);
    }
};

fixPasswords();
