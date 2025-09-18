#!/usr/bin/env node

const mongoose = require('mongoose');

async function testServerConnection() {
    console.log('🔍 Testing Server Connection');
    console.log('============================\n');

    try {
        // Use the same connection logic as the server
        console.log('1️⃣ Connecting to MongoDB using server logic...');
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swagat_odisha';

        console.log('   📋 Connection string:', mongoURI);

        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        };

        const conn = await mongoose.connect(mongoURI, options);
        console.log('   ✅ Connected to MongoDB:', conn.connection.name);

        // Test the models
        console.log('\n2️⃣ Testing models...');
        const User = require('./models/User');
        const StudentApplication = require('./models/StudentApplication');

        // Count existing users
        const userCount = await User.countDocuments();
        console.log('   📊 Existing users:', userCount);

        // Count existing applications
        const appCount = await StudentApplication.countDocuments();
        console.log('   📊 Existing applications:', appCount);

        // Test creating a simple application
        console.log('\n3️⃣ Testing application creation...');

        // Find an existing user
        const existingUser = await User.findOne({ role: 'student' });
        if (existingUser) {
            console.log('   👤 Using existing user:', existingUser.email);

            const applicationData = {
                user: existingUser._id,
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

            try {
                const application = new StudentApplication(applicationData);
                console.log('   📋 Application object created');
                console.log('   📋 Application ID before save:', application.applicationId);

                const savedApplication = await application.save();
                console.log('   ✅ Application saved successfully!');
                console.log('   📋 Application ID after save:', savedApplication.applicationId);
                console.log('   📋 Application ID from database:', savedApplication._id);

                // Clean up
                await StudentApplication.deleteOne({ _id: savedApplication._id });
                console.log('   ✅ Test application cleaned up');

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

        } else {
            console.log('   ❌ No existing users found');
        }

        // Close connection
        await mongoose.connection.close();
        console.log('\n   ✅ Database connection closed');

    } catch (error) {
        console.error('❌ Connection failed:', error.message);

        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 MongoDB is not running locally');
            console.log('   Start MongoDB: mongod');
            console.log('   Or use MongoDB Atlas (cloud)');
        }
    }
}

// Run the test
testServerConnection();
