#!/usr/bin/env node

const mongoose = require('mongoose');

async function testStudentApplication() {
    console.log('🔍 Testing StudentApplication Model');
    console.log('===================================\n');

    try {
        // Connect to MongoDB
        console.log('1️⃣ Connecting to MongoDB...');
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swagat_odisha';
        await mongoose.connect(mongoURI);
        console.log('   ✅ Connected to MongoDB');

        // Import models
        const User = require('./models/User');
        const StudentApplication = require('./models/StudentApplication');

        // Create a test user
        console.log('\n2️⃣ Creating test user...');
        const testUser = new User({
            fullName: 'Test User',
            email: 'testuser@example.com',
            phoneNumber: '9876543210',
            password: 'Password123!',
            role: 'student',
            guardianName: 'Test Guardian'
        });

        const savedUser = await testUser.save();
        console.log('   ✅ User created:', savedUser._id);

        // Test StudentApplication creation
        console.log('\n3️⃣ Testing StudentApplication creation...');

        const applicationData = {
            user: savedUser._id,
            personalDetails: {
                fullName: 'Test Student',
                fathersName: 'Test Father',
                mothersName: 'Test Mother',
                dateOfBirth: new Date('2000-01-01'),
                gender: 'Male',
                aadharNumber: '123456789012'
            },
            contactDetails: {
                primaryPhone: '9876543210',
                whatsappNumber: '9876543210',
                email: 'teststudent@example.com',
                permanentAddress: {
                    street: 'Test Street',
                    city: 'Test City',
                    state: 'Odisha',
                    pincode: '751001',
                    country: 'India'
                }
            },
            courseDetails: {
                selectedCourse: 'B.Tech Computer Science',
                stream: 'Engineering'
            },
            guardianDetails: {
                guardianName: 'Test Guardian',
                relationship: 'Father',
                guardianPhone: '9876543210',
                guardianEmail: 'guardian@example.com'
            },
            financialDetails: {
                annualIncome: '500000',
                occupation: 'Business'
            },
            status: 'SUBMITTED',
            currentStage: 'SUBMITTED',
            termsAccepted: true,
            termsAcceptedAt: new Date()
        };

        console.log('   📤 Creating application...');
        console.log('   📋 Application data keys:', Object.keys(applicationData));

        try {
            const application = new StudentApplication(applicationData);
            console.log('   📋 Application object created');
            console.log('   📋 Application ID before save:', application.applicationId);

            const savedApplication = await application.save();
            console.log('   ✅ Application saved successfully!');
            console.log('   📋 Application ID after save:', savedApplication.applicationId);
            console.log('   📋 Application ID from database:', savedApplication._id);

        } catch (error) {
            console.log('   ❌ Application creation failed:');
            console.log('   📝 Error:', error.message);
            console.log('   📋 Error name:', error.name);

            if (error.name === 'ValidationError') {
                console.log('   📋 Validation errors:');
                Object.values(error.errors).forEach(err => {
                    console.log(`     - ${err.path}: ${err.message}`);
                });
            }
        }

        // Clean up
        console.log('\n4️⃣ Cleaning up...');
        await User.deleteOne({ _id: savedUser._id });
        await StudentApplication.deleteMany({ user: savedUser._id });
        console.log('   ✅ Cleanup completed');

        // Close connection
        await mongoose.connection.close();
        console.log('   ✅ Database connection closed');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
testStudentApplication();
