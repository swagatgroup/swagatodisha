const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');

const clearDatabase = async () => {
    try {
        console.log('🧹 Clearing database...\n');

        // Clear all collections
        await User.deleteMany({});
        await Student.deleteMany({});

        console.log('✅ Database cleared successfully!');
        console.log('Ready for fresh registration tests.');

    } catch (error) {
        console.error('❌ Error clearing database:', error.message);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

// Connect and clear
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swagat_odisha')
    .then(() => clearDatabase())
    .catch(error => {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    });
