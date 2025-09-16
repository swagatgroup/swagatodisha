const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Student = require('../models/Student');
const StudentApplication = require('../models/StudentApplication');

const testStudents = [
    {
        personalInfo: {
            firstName: 'Rajesh',
            lastName: 'Kumar',
            email: 'rajesh.kumar@test.com',
            phone: '9876543210',
            dateOfBirth: '2000-05-15',
            gender: 'male',
            fatherName: 'Suresh Kumar',
            motherName: 'Sunita Kumar',
            guardianName: 'Suresh Kumar',
            guardianPhone: '9876543211',
            address: '123 Main Street, Sector 5',
            city: 'Bhubaneswar',
            state: 'Odisha',
            pincode: '751001'
        },
        academicInfo: {
            course: 'DMLT (Diploma in Medical Laboratory Technology)',
            institution: 'Swagat Group of Institutions - Main Campus',
            preferredStartDate: '2024-07-01',
            previousQualification: '12th Standard',
            previousInstitution: 'Delhi Public School',
            previousYear: '2022',
            previousPercentage: '85.5'
        },
        applicationStatus: 'submitted'
    },
    {
        personalInfo: {
            firstName: 'Priya',
            lastName: 'Sharma',
            email: 'priya.sharma@test.com',
            phone: '9876543212',
            dateOfBirth: '1999-08-22',
            gender: 'female',
            fatherName: 'Amit Sharma',
            motherName: 'Rekha Sharma',
            guardianName: 'Amit Sharma',
            guardianPhone: '9876543213',
            address: '456 Park Avenue, Civil Lines',
            city: 'Cuttack',
            state: 'Odisha',
            pincode: '753001'
        },
        academicInfo: {
            course: 'B.Pharm (Bachelor in Pharmacy)',
            institution: 'Swagat Pharmacy College',
            preferredStartDate: '2024-07-01',
            previousQualification: 'B.Sc Chemistry',
            previousInstitution: 'Utkal University',
            previousYear: '2023',
            previousPercentage: '78.2'
        },
        applicationStatus: 'under_review'
    },
    {
        personalInfo: {
            firstName: 'Amit',
            lastName: 'Patel',
            email: 'amit.patel@test.com',
            phone: '9876543214',
            dateOfBirth: '2001-03-10',
            gender: 'male',
            fatherName: 'Ravi Patel',
            motherName: 'Geeta Patel',
            guardianName: 'Ravi Patel',
            guardianPhone: '9876543215',
            address: '789 College Road, Near Railway Station',
            city: 'Puri',
            state: 'Odisha',
            pincode: '752001'
        },
        academicInfo: {
            course: 'GNM (General Nursing and Midwifery)',
            institution: 'Swagat Nursing College',
            preferredStartDate: '2024-07-01',
            previousQualification: '12th Standard (Science)',
            previousInstitution: 'Kendriya Vidyalaya',
            previousYear: '2023',
            previousPercentage: '82.0'
        },
        applicationStatus: 'approved'
    },
    {
        personalInfo: {
            firstName: 'Sneha',
            lastName: 'Mishra',
            email: 'sneha.mishra@test.com',
            phone: '9876543216',
            dateOfBirth: '2000-11-18',
            gender: 'female',
            fatherName: 'Vikash Mishra',
            motherName: 'Anita Mishra',
            guardianName: 'Vikash Mishra',
            guardianPhone: '9876543217',
            address: '321 MG Road, Market Area',
            city: 'Rourkela',
            state: 'Odisha',
            pincode: '769001'
        },
        academicInfo: {
            course: 'B.Sc Nursing',
            institution: 'Swagat Nursing College',
            preferredStartDate: '2024-07-01',
            previousQualification: '12th Standard (Science)',
            previousInstitution: 'DAV Public School',
            previousYear: '2022',
            previousPercentage: '88.5'
        },
        applicationStatus: 'draft'
    },
    {
        personalInfo: {
            firstName: 'Vikram',
            lastName: 'Singh',
            email: 'vikram.singh@test.com',
            phone: '9876543218',
            dateOfBirth: '1999-12-05',
            gender: 'male',
            fatherName: 'Rajesh Singh',
            motherName: 'Poonam Singh',
            guardianName: 'Rajesh Singh',
            guardianPhone: '9876543219',
            address: '654 Station Road, Near Bus Stand',
            city: 'Berhampur',
            state: 'Odisha',
            pincode: '760001'
        },
        academicInfo: {
            course: 'BPT (Bachelor of Physiotherapy)',
            institution: 'Swagat Physiotherapy College',
            preferredStartDate: '2024-07-01',
            previousQualification: 'B.Sc Biology',
            previousInstitution: 'Berhampur University',
            previousYear: '2023',
            previousPercentage: '76.8'
        },
        applicationStatus: 'rejected'
    }
];

const addTestStudents = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swagat_odisha');
        console.log('Connected to MongoDB');

        // Clear existing test data
        await User.deleteMany({ email: { $regex: /@test\.com$/ } });
        await Student.deleteMany({ email: { $regex: /@test\.com$/ } });
        await StudentApplication.deleteMany({ 'personalInfo.email': { $regex: /@test\.com$/ } });
        console.log('Cleared existing test data');

        // Add test students
        for (const studentData of testStudents) {
            // Create user account
            const hashedPassword = await bcrypt.hash('Test@123', 10);

            const user = new User({
                fullName: `${studentData.personalInfo.firstName} ${studentData.personalInfo.lastName}`,
                guardianName: studentData.personalInfo.guardianName,
                email: studentData.personalInfo.email,
                phoneNumber: studentData.personalInfo.phone,
                password: hashedPassword,
                role: 'student',
                isActive: true,
                isEmailVerified: true
            });

            await user.save();
            console.log(`Created user: ${studentData.personalInfo.email}`);

            // Create student profile
            const student = new Student({
                userId: user._id,
                ...studentData.personalInfo,
                enrollmentDate: new Date(),
                status: 'active'
            });

            await student.save();
            console.log(`Created student profile: ${studentData.personalInfo.firstName} ${studentData.personalInfo.lastName}`);

            // Create student application
            const application = new StudentApplication({
                studentId: student._id,
                personalInfo: studentData.personalInfo,
                academicInfo: studentData.academicInfo,
                status: studentData.applicationStatus,
                submittedAt: studentData.applicationStatus === 'draft' ? null : new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await application.save();
            console.log(`Created application for: ${studentData.personalInfo.firstName} ${studentData.personalInfo.lastName}`);
        }

        console.log('✅ Test students added successfully!');
        console.log('\nTest Student Credentials:');
        console.log('Email: [student-email]@test.com');
        console.log('Password: Test@123');
        console.log('\nTest Students:');
        testStudents.forEach((student, index) => {
            console.log(`${index + 1}. ${student.personalInfo.firstName} ${student.personalInfo.lastName} - ${student.personalInfo.email}`);
        });

    } catch (error) {
        console.error('Error adding test students:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the script
if (require.main === module) {
    addTestStudents();
}

module.exports = addTestStudents;
