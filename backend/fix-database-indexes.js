const mongoose = require('mongoose');
const Student = require('./models/Student');

const fixIndexes = async () => {
    try {
        console.log('🔧 Fixing database indexes...\n');

        // Drop the existing problematic index
        await Student.collection.dropIndex('aadharNumber_1');
        console.log('✅ Dropped aadharNumber_1 index');

        // Create a new sparse index
        await Student.collection.createIndex({ aadharNumber: 1 }, { sparse: true, unique: true });
        console.log('✅ Created sparse unique index for aadharNumber');

        // Also fix studentId index
        try {
            await Student.collection.dropIndex('studentId_1');
            console.log('✅ Dropped studentId_1 index');
        } catch (e) {
            console.log('ℹ️ studentId_1 index not found, continuing...');
        }

        await Student.collection.createIndex({ studentId: 1 }, { sparse: true, unique: true });
        console.log('✅ Created sparse unique index for studentId');

        console.log('\n🎉 Database indexes fixed successfully!');

    } catch (error) {
        console.error('❌ Error fixing indexes:', error.message);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

// Connect and fix indexes
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swagat_odisha')
    .then(() => fixIndexes())
    .catch(error => {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    });
