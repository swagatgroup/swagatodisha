const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

const connectDB = require('../config/db');

const resetStudentPasswords = async () => {
    try {
        await connectDB();

        // Find all students
        const students = await User.find({ role: 'student' });
        console.log(`Found ${students.length} students. Updating passwords...`);

        let successCount = 0;
        let failCount = 0;

        for (const student of students) {
            try {
                student.password = 'Swagat@1926';
                await student.save();
                successCount++;
            } catch (err) {
                console.error(`Failed to update password for student ${student.email}:`, err.message);
                failCount++;
            }
        }

        console.log(`Password reset complete. Success: ${successCount}, Failed: ${failCount}`);
        process.exit(0);
    } catch (error) {
        console.error('Error during password reset:', error);
        process.exit(1);
    }
};

resetStudentPasswords();
