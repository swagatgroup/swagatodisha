const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Student = require('../models/Student');
require('dotenv').config();

const createTestAccounts = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        console.log('\n🚀 Creating Test Accounts for Production Testing...\n');

        // Test Account 1: Super Admin
        console.log('1️⃣ Creating Super Admin Account...');
        const superAdminData = {
            firstName: 'Super',
            lastName: 'Admin',
            email: 'admin@swagatodisha.com',
            password: 'Admin@123456',
            phone: '9876543210',
            role: 'super_admin',
            department: 'Administration',
            designation: 'Super Administrator',
            isActive: true,
            isEmailVerified: true,
            gender: 'male'
        };

        let superAdmin = await Admin.findOne({ email: superAdminData.email });
        if (superAdmin) {
            console.log('   ℹ️  Super Admin already exists, updating password...');
            superAdmin.password = await bcrypt.hash(superAdminData.password, 12);
            await superAdmin.save();
        } else {
            superAdmin = new Admin(superAdminData);
            await superAdmin.save();
            console.log('   ✅ Super Admin created');
        }

        // Test Account 2: Staff Member
        console.log('2️⃣ Creating Staff Account...');
        const staffData = {
            firstName: 'John',
            lastName: 'Staff',
            email: 'staff@swagatodisha.com',
            password: 'Staff@123456',
            phone: '9876543211',
            role: 'staff',
            department: 'Academic',
            designation: 'Academic Coordinator',
            isActive: true,
            isEmailVerified: true,
            gender: 'male'
        };

        let staff = await Admin.findOne({ email: staffData.email });
        if (staff) {
            console.log('   ℹ️  Staff already exists, updating password...');
            staff.password = await bcrypt.hash(staffData.password, 12);
            await staff.save();
        } else {
            staff = new Admin(staffData);
            await staff.save();
            console.log('   ✅ Staff created');
        }

        // Test Account 3: Student
        console.log('3️⃣ Creating Student Account...');
        const studentUserData = {
            fullName: 'Rahul Kumar',
            email: 'student@swagatodisha.com',
            password: 'Student@123456',
            phoneNumber: '9876543212',
            role: 'student',
            isActive: true,
            isEmailVerified: true,
            gender: 'male',
            dateOfBirth: new Date('2000-01-15'),
            guardianName: 'Raj Kumar'
        };

        let studentUser = await User.findOne({ email: studentUserData.email });
        if (studentUser) {
            console.log('   ℹ️  Student User already exists, updating password...');
            studentUser.password = await bcrypt.hash(studentUserData.password, 12);
            await studentUser.save();
        } else {
            studentUser = new User(studentUserData);
            await studentUser.save();
            console.log('   ✅ Student User created');
        }

        // Create Student Profile
        const studentProfileData = {
            user: studentUser._id,
            studentId: 'STU' + Date.now().toString().slice(-6),
            course: 'B.Tech Computer Science',
            isProfileComplete: true,
            status: 'active',
            createdBy: superAdmin._id // Use super admin as creator
        };

        let studentProfile = await Student.findOne({ user: studentUser._id });
        if (studentProfile) {
            console.log('   ℹ️  Student Profile already exists');
            // Fix any invalid status
            if (!['active', 'inactive', 'suspended'].includes(studentProfile.status)) {
                studentProfile.status = 'active';
                await studentProfile.save();
                console.log('   🔧 Fixed invalid status');
            }
        } else {
            // Check if there's already a student with null aadharNumber
            const existingStudent = await Student.findOne({ aadharNumber: null });
            if (existingStudent) {
                // Update the existing student to have a unique aadharNumber
                existingStudent.aadharNumber = '123456789012';
                await existingStudent.save();
            }

            studentProfile = new Student(studentProfileData);
            await studentProfile.save();
            console.log('   ✅ Student Profile created');
        }

        // Test Account 4: Agent
        console.log('4️⃣ Creating Agent Account...');
        const agentData = {
            fullName: 'Priya Sharma',
            email: 'agent@swagatodisha.com',
            password: 'Agent@123456',
            phoneNumber: '9876543214',
            role: 'agent',
            isActive: true,
            isEmailVerified: true,
            gender: 'female',
            dateOfBirth: new Date('1985-05-20'),
            guardianName: 'Sharma Kumar',
            address: {
                street: '456 Agent Street',
                city: 'Cuttack',
                state: 'Odisha',
                pincode: '753001',
                country: 'India'
            }
        };

        let agent = await User.findOne({ email: agentData.email });
        if (agent) {
            console.log('   ℹ️  Agent already exists, updating password...');
            agent.password = await bcrypt.hash(agentData.password, 12);
            await agent.save();
        } else {
            agent = new User(agentData);
            await agent.save();
            console.log('   ✅ Agent created');
        }

        console.log('\n🎉 Test Accounts Created Successfully!');
        console.log('\n📋 PRODUCTION TEST ACCOUNTS:');
        console.log('=====================================');
        console.log('1️⃣ SUPER ADMIN:');
        console.log('   Email: admin@swagatodisha.com');
        console.log('   Password: Admin@123456');
        console.log('   Role: Super Administrator');
        console.log('   Access: Full system access');
        console.log('');
        console.log('2️⃣ STAFF:');
        console.log('   Email: staff@swagatodisha.com');
        console.log('   Password: Staff@123456');
        console.log('   Role: Academic Staff');
        console.log('   Access: Staff dashboard, student management');
        console.log('');
        console.log('3️⃣ STUDENT:');
        console.log('   Email: student@swagatodisha.com');
        console.log('   Password: Student@123456');
        console.log('   Role: Student');
        console.log('   Access: Student dashboard, documents, admissions');
        console.log('');
        console.log('4️⃣ AGENT:');
        console.log('   Email: agent@swagatodisha.com');
        console.log('   Password: Agent@123456');
        console.log('   Role: Admission Agent');
        console.log('   Access: Agent dashboard, referral management');
        console.log('');
        console.log('🔐 All passwords meet security requirements:');
        console.log('   - Minimum 8 characters');
        console.log('   - Contains uppercase, lowercase, number, and special character');
        console.log('');
        console.log('⚠️  IMPORTANT: Change these passwords in production!');
        console.log('=====================================');

    } catch (error) {
        console.error('❌ Error creating test accounts:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
        process.exit(0);
    }
};

createTestAccounts();
