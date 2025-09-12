const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Student = require('../models/Student');
require('dotenv').config();

const createAllAccounts = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        // Connected to MongoDB

        // Creating Complete User Management System

        // 1. SUPER ADMIN ACCOUNTS
        // Creating Super Admin Account
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
            // Super Admin already exists, updating password
            superAdmin.password = await bcrypt.hash(superAdminData.password, 12);
            await superAdmin.save();
        } else {
            superAdmin = new Admin(superAdminData);
            await superAdmin.save();
            // Super Admin created
        }

        // 2. STAFF ACCOUNTS (3 members)
        // Creating Staff Accounts
        const staffAccounts = [
            {
                firstName: 'Dr. Amit',
                lastName: 'Singh',
                email: 'staff1@swagatodisha.com',
                password: 'Staff@123456',
                phone: '9876543211',
                role: 'staff',
                department: 'Academic',
                designation: 'Academic Coordinator',
                gender: 'male'
            },
            {
                firstName: 'Ms. Priya',
                lastName: 'Sharma',
                email: 'staff2@swagatodisha.com',
                password: 'Staff@123456',
                phone: '9876543212',
                role: 'staff',
                department: 'Admissions',
                designation: 'Admission Officer',
                gender: 'female'
            },
            {
                firstName: 'Mr. Rajesh',
                lastName: 'Kumar',
                email: 'staff3@swagatodisha.com',
                password: 'Staff@123456',
                phone: '9876543213',
                role: 'staff',
                department: 'Student Affairs',
                designation: 'Student Affairs Coordinator',
                gender: 'male'
            }
        ];

        const createdStaff = [];
        for (const staffData of staffAccounts) {
            let staff = await Admin.findOne({ email: staffData.email });
            if (staff) {
                // Staff already exists, updating password
                staff.password = await bcrypt.hash(staffData.password, 12);
                await staff.save();
            } else {
                staff = new Admin({
                    ...staffData,
                    isActive: true,
                    isEmailVerified: true
                });
                await staff.save();
                // Staff created
            }
            createdStaff.push(staff);
        }

        // 3. AGENT ACCOUNTS (10 agents with referral codes)
        // Creating Agent Accounts
        const agentAccounts = [
            {
                fullName: 'Agent One',
                email: 'agent1@swagatodisha.com',
                password: 'Agent@123456',
                phoneNumber: '9876543221',
                gender: 'male',
                dateOfBirth: new Date('1985-01-15'),
                guardianName: 'Guardian One',
                address: {
                    street: 'Agent Street 1',
                    city: 'Bhubaneswar',
                    state: 'Odisha',
                    pincode: '751001',
                    country: 'India'
                }
            },
            {
                fullName: 'Agent Two',
                email: 'agent2@swagatodisha.com',
                password: 'Agent@123456',
                phoneNumber: '9876543222',
                gender: 'female',
                dateOfBirth: new Date('1988-03-20'),
                guardianName: 'Guardian Two',
                address: {
                    street: 'Agent Street 2',
                    city: 'Cuttack',
                    state: 'Odisha',
                    pincode: '753001',
                    country: 'India'
                }
            },
            {
                fullName: 'Agent Three',
                email: 'agent3@swagatodisha.com',
                password: 'Agent@123456',
                phoneNumber: '9876543223',
                gender: 'male',
                dateOfBirth: new Date('1987-07-10'),
                guardianName: 'Guardian Three',
                address: {
                    street: 'Agent Street 3',
                    city: 'Puri',
                    state: 'Odisha',
                    pincode: '752001',
                    country: 'India'
                }
            },
            {
                fullName: 'Agent Four',
                email: 'agent4@swagatodisha.com',
                password: 'Agent@123456',
                phoneNumber: '9876543224',
                gender: 'female',
                dateOfBirth: new Date('1986-11-25'),
                guardianName: 'Guardian Four',
                address: {
                    street: 'Agent Street 4',
                    city: 'Rourkela',
                    state: 'Odisha',
                    pincode: '769001',
                    country: 'India'
                }
            },
            {
                fullName: 'Agent Five',
                email: 'agent5@swagatodisha.com',
                password: 'Agent@123456',
                phoneNumber: '9876543225',
                gender: 'male',
                dateOfBirth: new Date('1989-05-12'),
                guardianName: 'Guardian Five',
                address: {
                    street: 'Agent Street 5',
                    city: 'Sambalpur',
                    state: 'Odisha',
                    pincode: '768001',
                    country: 'India'
                }
            },
            {
                fullName: 'Agent Six',
                email: 'agent6@swagatodisha.com',
                password: 'Agent@123456',
                phoneNumber: '9876543226',
                gender: 'female',
                dateOfBirth: new Date('1984-09-18'),
                guardianName: 'Guardian Six',
                address: {
                    street: 'Agent Street 6',
                    city: 'Berhampur',
                    state: 'Odisha',
                    pincode: '760001',
                    country: 'India'
                }
            },
            {
                fullName: 'Agent Seven',
                email: 'agent7@swagatodisha.com',
                password: 'Agent@123456',
                phoneNumber: '9876543227',
                gender: 'male',
                dateOfBirth: new Date('1983-12-05'),
                guardianName: 'Guardian Seven',
                address: {
                    street: 'Agent Street 7',
                    city: 'Balasore',
                    state: 'Odisha',
                    pincode: '756001',
                    country: 'India'
                }
            },
            {
                fullName: 'Agent Eight',
                email: 'agent8@swagatodisha.com',
                password: 'Agent@123456',
                phoneNumber: '9876543228',
                gender: 'female',
                dateOfBirth: new Date('1982-08-30'),
                guardianName: 'Guardian Eight',
                address: {
                    street: 'Agent Street 8',
                    city: 'Bhadrak',
                    state: 'Odisha',
                    pincode: '756100',
                    country: 'India'
                }
            },
            {
                fullName: 'Agent Nine',
                email: 'agent9@swagatodisha.com',
                password: 'Agent@123456',
                phoneNumber: '9876543229',
                gender: 'male',
                dateOfBirth: new Date('1981-04-14'),
                guardianName: 'Guardian Nine',
                address: {
                    street: 'Agent Street 9',
                    city: 'Jharsuguda',
                    state: 'Odisha',
                    pincode: '768201',
                    country: 'India'
                }
            },
            {
                fullName: 'Agent Ten',
                email: 'agent10@swagatodisha.com',
                password: 'Agent@123456',
                phoneNumber: '9876543230',
                gender: 'female',
                dateOfBirth: new Date('1980-06-22'),
                guardianName: 'Guardian Ten',
                address: {
                    street: 'Agent Street 10',
                    city: 'Koraput',
                    state: 'Odisha',
                    pincode: '764001',
                    country: 'India'
                }
            }
        ];

        const createdAgents = [];
        for (const agentData of agentAccounts) {
            let agent = await User.findOne({ email: agentData.email });
            if (agent) {
                // Agent already exists, updating password
                agent.password = await bcrypt.hash(agentData.password, 12);
                await agent.save();
            } else {
                agent = new User({
                    ...agentData,
                    role: 'agent',
                    isActive: true,
                    isEmailVerified: true
                });
                await agent.save();
                // Agent created with referral code
            }
            createdAgents.push(agent);
        }

        // 4. SAMPLE STUDENT ACCOUNTS (5 students)
        // Creating Sample Student Accounts
        const studentAccounts = [
            {
                fullName: 'Student One',
                email: 'student1@swagatodisha.com',
                password: 'Student@123456',
                phoneNumber: '9876543301',
                gender: 'male',
                dateOfBirth: new Date('2000-01-15'),
                guardianName: 'Guardian One',
                address: {
                    street: 'Student Street 1',
                    city: 'Bhubaneswar',
                    state: 'Odisha',
                    pincode: '751001',
                    country: 'India'
                }
            },
            {
                fullName: 'Student Two',
                email: 'student2@swagatodisha.com',
                password: 'Student@123456',
                phoneNumber: '9876543302',
                gender: 'female',
                dateOfBirth: new Date('2001-03-20'),
                guardianName: 'Guardian Two',
                address: {
                    street: 'Student Street 2',
                    city: 'Cuttack',
                    state: 'Odisha',
                    pincode: '753001',
                    country: 'India'
                }
            },
            {
                fullName: 'Student Three',
                email: 'student3@swagatodisha.com',
                password: 'Student@123456',
                phoneNumber: '9876543303',
                gender: 'male',
                dateOfBirth: new Date('2002-07-10'),
                guardianName: 'Guardian Three',
                address: {
                    street: 'Student Street 3',
                    city: 'Puri',
                    state: 'Odisha',
                    pincode: '752001',
                    country: 'India'
                }
            },
            {
                fullName: 'Student Four',
                email: 'student4@swagatodisha.com',
                password: 'Student@123456',
                phoneNumber: '9876543304',
                gender: 'female',
                dateOfBirth: new Date('1999-11-25'),
                guardianName: 'Guardian Four',
                address: {
                    street: 'Student Street 4',
                    city: 'Rourkela',
                    state: 'Odisha',
                    pincode: '769001',
                    country: 'India'
                }
            },
            {
                fullName: 'Student Five',
                email: 'student5@swagatodisha.com',
                password: 'Student@123456',
                phoneNumber: '9876543305',
                gender: 'male',
                dateOfBirth: new Date('2003-05-12'),
                guardianName: 'Guardian Five',
                address: {
                    street: 'Student Street 5',
                    city: 'Sambalpur',
                    state: 'Odisha',
                    pincode: '768001',
                    country: 'India'
                }
            }
        ];

        const createdStudents = [];
        for (let index = 0; index < studentAccounts.length; index++) {
            const studentData = studentAccounts[index];
            let studentUser = await User.findOne({ email: studentData.email });
            if (studentUser) {
                // Student already exists, updating password
                studentUser.password = await bcrypt.hash(studentData.password, 12);
                await studentUser.save();
            } else {
                studentUser = new User({
                    ...studentData,
                    role: 'student',
                    isActive: true,
                    isEmailVerified: true
                });
                await studentUser.save();
                // Student User created
            }

            // Create Student Profile
            const studentProfileData = {
                user: studentUser._id,
                studentId: 'STU' + Date.now().toString().slice(-6) + Math.random().toString().slice(-2),
                course: 'B.Tech Computer Science',
                isProfileComplete: true,
                status: 'active',
                createdBy: superAdmin._id,
                aadharNumber: '1234567890' + (Math.floor(Math.random() * 1000) + index * 100).toString().padStart(3, '0'),
                fatherName: studentData.guardianName,
                motherName: 'Mother ' + studentData.fullName,
                currentClass: '12th',
                academicYear: '2024-25',
                gender: studentData.gender,
                dateOfBirth: studentData.dateOfBirth,
                address: studentData.address
            };

            let studentProfile = await Student.findOne({ user: studentUser._id });
            if (studentProfile) {
                // Student Profile already exists
            } else {
                studentProfile = new Student(studentProfileData);
                await studentProfile.save();
                // Student Profile created
            }
            createdStudents.push({ user: studentUser, profile: studentProfile });
        }

        // Complete User Management System Created Successfully

    } catch (error) {
        console.error('❌ Error creating accounts:', error);
    } finally {
        await mongoose.disconnect();
        // Disconnected from MongoDB
        process.exit(0);
    }
};

createAllAccounts();
