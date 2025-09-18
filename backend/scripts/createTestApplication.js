const mongoose = require('mongoose');
const StudentApplication = require('../models/StudentApplication');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swagat_odisha', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function createTestApplication() {
    try {
        // First, create a test user if it doesn't exist
        let testUser = await User.findOne({ email: 'test@example.com' });

        if (!testUser) {
            testUser = new User({
                fullName: 'Test Student',
                email: 'test@example.com',
                phoneNumber: '9876543210',
                password: 'Test123!',
                role: 'student',
                referralCode: 'tes98s25',
                guardianDetails: {
                    guardianName: 'Test Guardian',
                    guardianPhone: '9876543211'
                }
            });
            await testUser.save();
            console.log('Test user created');
        }

        // Create a test application
        const testApplication = new StudentApplication({
            user: testUser._id,
            applicationId: 'SO2024001',
            status: 'SUBMITTED',
            currentStage: 'UNDER_REVIEW',
            personalDetails: {
                fullName: 'Test Student',
                email: 'test@example.com',
                phoneNumber: '9876543210',
                dateOfBirth: new Date('2000-01-01'),
                gender: 'Male',
                aadharNumber: '123456789012',
                address: 'Test Address, Test City, Test State'
            },
            academicDetails: {
                courseName: 'Bachelor of Technology',
                previousInstitution: 'Test School',
                previousCourse: '12th Standard',
                yearOfPassing: '2020',
                percentage: '85'
            },
            guardianDetails: {
                guardianName: 'Test Guardian',
                guardianPhone: '9876543211',
                guardianEmail: 'guardian@example.com',
                relationship: 'Father',
                guardianAddress: 'Test Guardian Address'
            },
            financialDetails: {
                annualIncome: '500000',
                paymentMethod: 'Online',
                scholarshipApplied: false
            },
            documents: {
                aadharCard: { url: 'https://example.com/aadhar.pdf', fileType: 'pdf' },
                passportPhoto: { url: 'https://example.com/photo.jpg', fileType: 'jpg' },
                tenthMarksheet: { url: 'https://example.com/10th.pdf', fileType: 'pdf' },
                twelfthMarksheet: { url: 'https://example.com/12th.pdf', fileType: 'pdf' },
                migrationCertificate: { url: 'https://example.com/migration.pdf', fileType: 'pdf' },
                characterCertificate: { url: 'https://example.com/character.pdf', fileType: 'pdf' }
            },
            progress: {
                registrationComplete: true,
                documentsComplete: true,
                applicationPdfGenerated: true,
                termsAccepted: true,
                submissionComplete: true
            },
            submittedAt: new Date(),
            termsAccepted: true,
            termsAcceptedAt: new Date(),
            reviewStatus: {
                documentsVerified: false,
                personalDetailsVerified: false,
                academicDetailsVerified: false,
                guardianDetailsVerified: false,
                financialDetailsVerified: false,
                overallApproved: false,
                reviewedBy: null,
                reviewedAt: null,
                comments: []
            }
        });

        await testApplication.save();
        console.log('Test application created successfully:', testApplication.applicationId);

        // Create another test application with different status
        const testApplication2 = new StudentApplication({
            user: testUser._id,
            applicationId: 'SO2024002',
            status: 'APPROVED',
            currentStage: 'APPROVED',
            personalDetails: {
                fullName: 'Approved Student',
                email: 'approved@example.com',
                phoneNumber: '9876543212',
                dateOfBirth: new Date('1999-05-15'),
                gender: 'Female',
                aadharNumber: '123456789013',
                address: 'Approved Address, Approved City, Approved State'
            },
            academicDetails: {
                courseName: 'Master of Technology',
                previousInstitution: 'Approved School',
                previousCourse: 'Bachelor of Technology',
                yearOfPassing: '2022',
                percentage: '90'
            },
            guardianDetails: {
                guardianName: 'Approved Guardian',
                guardianPhone: '9876543213',
                guardianEmail: 'approved.guardian@example.com',
                relationship: 'Mother',
                guardianAddress: 'Approved Guardian Address'
            },
            financialDetails: {
                annualIncome: '800000',
                paymentMethod: 'Bank Transfer',
                scholarshipApplied: true,
                scholarshipDetails: 'Merit Scholarship'
            },
            documents: {
                aadharCard: { url: 'https://example.com/aadhar2.pdf', fileType: 'pdf' },
                passportPhoto: { url: 'https://example.com/photo2.jpg', fileType: 'jpg' },
                tenthMarksheet: { url: 'https://example.com/10th2.pdf', fileType: 'pdf' },
                twelfthMarksheet: { url: 'https://example.com/12th2.pdf', fileType: 'pdf' },
                migrationCertificate: { url: 'https://example.com/migration2.pdf', fileType: 'pdf' },
                characterCertificate: { url: 'https://example.com/character2.pdf', fileType: 'pdf' }
            },
            progress: {
                registrationComplete: true,
                documentsComplete: true,
                applicationPdfGenerated: true,
                termsAccepted: true,
                submissionComplete: true
            },
            submittedAt: new Date(Date.now() - 86400000), // 1 day ago
            termsAccepted: true,
            termsAcceptedAt: new Date(Date.now() - 86400000),
            reviewStatus: {
                documentsVerified: true,
                personalDetailsVerified: true,
                academicDetailsVerified: true,
                guardianDetailsVerified: true,
                financialDetailsVerified: true,
                overallApproved: true,
                reviewedBy: null,
                reviewedAt: new Date(),
                comments: [
                    {
                        type: 'documentsVerified',
                        comment: 'All documents verified successfully',
                        reviewedBy: null,
                        reviewedAt: new Date()
                    }
                ]
            }
        });

        await testApplication2.save();
        console.log('Test application 2 created successfully:', testApplication2.applicationId);

        console.log('All test applications created successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error creating test application:', error);
        process.exit(1);
    }
}

createTestApplication();
