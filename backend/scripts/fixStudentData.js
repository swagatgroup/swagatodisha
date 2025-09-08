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
        console.log('✅ Connected to MongoDB');

        console.log('🔧 Fixing existing student data...');

        // Find all students with invalid status
        const studentsWithInvalidStatus = await Student.find({
            status: { $nin: ['active', 'inactive', 'suspended'] }
        });

        console.log(`Found ${studentsWithInvalidStatus.length} students with invalid status`);

        for (const student of studentsWithInvalidStatus) {
            console.log(`Fixing student ${student._id} with status: ${student.status}`);
            student.status = 'active';
            await student.save({ validateBeforeSave: false });
            console.log(`✅ Fixed student ${student._id}`);
        }

        // Fix aadharNumber duplicates
        const studentsWithNullAadhar = await Student.find({ aadharNumber: null });
        console.log(`Found ${studentsWithNullAadhar.length} students with null aadharNumber`);

        for (let i = 0; i < studentsWithNullAadhar.length; i++) {
            const student = studentsWithNullAadhar[i];
            if (i === 0) {
                // Keep first one as null
                continue;
            }
            student.aadharNumber = `1234567890${i}`;
            await student.save({ validateBeforeSave: false });
            console.log(`✅ Fixed aadharNumber for student ${student._id}`);
        }

        console.log('✅ Student data fixed successfully');

    } catch (error) {
        console.error('❌ Error fixing student data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);
    }
};

fixStudentData();
