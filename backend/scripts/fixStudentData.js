const mongoose = require('mongoose');
const Student = require('../models/Student');
require('dotenv').config();

const fixStudentData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        // Connected to MongoDB

        // Fixing existing student data

        // Find all students with invalid status
        const studentsWithInvalidStatus = await Student.find({
            status: { $nin: ['active', 'inactive', 'suspended'] }
        });

        // Found students with invalid status

        for (const student of studentsWithInvalidStatus) {
            // Fixing student status
            student.status = 'active';
            await student.save({ validateBeforeSave: false });
            // Fixed student
        }

        // Fix aadharNumber duplicates
        const studentsWithNullAadhar = await Student.find({ aadharNumber: null });
        // Found students with null aadharNumber

        for (let i = 0; i < studentsWithNullAadhar.length; i++) {
            const student = studentsWithNullAadhar[i];
            if (i === 0) {
                // Keep first one as null
                continue;
            }
            student.aadharNumber = `1234567890${i}`;
            await student.save({ validateBeforeSave: false });
            // Fixed aadharNumber for student
        }

        // Student data fixed successfully

    } catch (error) {
        console.error('❌ Error fixing student data:', error);
    } finally {
        await mongoose.disconnect();
        // Disconnected from MongoDB
        process.exit(0);
    }
};

fixStudentData();
