const mongoose = require('mongoose');
const User = require('./models/User');
const StudentApplication = require('./models/StudentApplication');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/swagatodisha', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function createTestData() {
    try {
        console.log('Creating test data...');

        // Create test user
        const testUser = new User({
            fullName: 'Mukul Kumar Sahu',
            email: 'mukul@example.com',
            password: 'Test123!@#',
            phoneNumber: '9999999999',
            role: 'student',
            isActive: true
        });

        await testUser.save();
        console.log('Test user created:', testUser.email);

        // Create test application
        const testApplication = new StudentApplication({
            user: testUser._id,
            applicationId: 'SO2024001',
            status: 'SUBMITTED',
            currentStage: 'UNDER_REVIEW',
            personalDetails: {
                fullName: 'Mukul Kumar Sahu',
                email: 'mukul@example.com',
                phoneNumber: '9999999999',
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
                guardianPhone: '9999999998',
                guardianEmail: 'guardian@example.com',
                relationship: 'Father',
                guardianAddress: 'Test Guardian Address'
            },
            financialDetails: {
                annualIncome: '500000',
                paymentMethod: 'Online',
                scholarshipApplied: false
            },
            documents: [
                {
                    documentType: 'aadhar_card',
                    fileName: 'aadhar.pdf',
                    fileUrl: 'https://example.com/aadhar.pdf',
                    fileType: 'pdf',
                    status: 'PENDING'
                },
                {
                    documentType: 'passport_photo',
                    fileName: 'photo.jpg',
                    fileUrl: 'https://example.com/photo.jpg',
                    fileType: 'jpg',
                    status: 'PENDING'
                },
                {
                    documentType: 'tenth_marksheet',
                    fileName: '10th.pdf',
                    fileUrl: 'https://example.com/10th.pdf',
                    fileType: 'pdf',
                    status: 'PENDING'
                }
            ],
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
        console.log('Test application created:', testApplication.applicationId);

        // Create another test application with different status
        const testApplication2 = new StudentApplication({
            user: testUser._id,
            applicationId: 'SO2024002',
            status: 'SUBMITTED',
            currentStage: 'UNDER_REVIEW',
            personalDetails: {
                fullName: 'Another Test Student',
                email: 'another@example.com',
                phoneNumber: '8888888888',
                dateOfBirth: new Date('2001-01-01'),
                gender: 'Female',
                aadharNumber: '987654321098',
                address: 'Another Test Address, Test City, Test State'
            },
            academicDetails: {
                courseName: 'Bachelor of Arts',
                previousInstitution: 'Another Test School',
                previousCourse: '12th Standard',
                yearOfPassing: '2021',
                percentage: '90'
            },
            guardianDetails: {
                guardianName: 'Another Guardian',
                guardianPhone: '8888888887',
                guardianEmail: 'anotherguardian@example.com',
                relationship: 'Mother',
                guardianAddress: 'Another Guardian Address'
            },
            financialDetails: {
                annualIncome: '600000',
                paymentMethod: 'Online',
                scholarshipApplied: true
            },
            documents: [
                {
                    documentType: 'aadhar_card',
                    fileName: 'aadhar2.pdf',
                    fileUrl: 'https://example.com/aadhar2.pdf',
                    fileType: 'pdf',
                    status: 'APPROVED'
                },
                {
                    documentType: 'passport_photo',
                    fileName: 'photo2.jpg',
                    fileUrl: 'https://example.com/photo2.jpg',
                    fileType: 'jpg',
                    status: 'PENDING'
                }
            ],
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

        await testApplication2.save();
        console.log('Second test application created:', testApplication2.applicationId);

        console.log('Test data created successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error creating test data:', error);
        process.exit(1);
    }
}

createTestData();
