const mongoose = require('mongoose');

const dropIndex = async () => {
    try {
        console.log('🗑️ Dropping problematic aadharNumber index...\n');

        // Connect to MongoDB
        await mongoose.connect('mongodb+srv://swagatgroup:SGClusterDB%4099%23@cluster0.m0ymyqa.mongodb.net/swagat_odisha?retryWrites=true&w=majority&appName=Cluster0');
        console.log('✅ Connected to MongoDB');

        // Get the students collection
        const studentsCollection = mongoose.connection.db.collection('students');

        // List all indexes
        const indexes = await studentsCollection.indexes();
        console.log('📋 Current indexes:', indexes.map(idx => idx.name));

        // Drop the problematic index
        try {
            await studentsCollection.dropIndex('aadharNumber_1');
            console.log('✅ Dropped aadharNumber_1 index');
        } catch (e) {
            console.log('ℹ️ aadharNumber_1 index not found or already dropped');
        }

        // Drop studentId index too
        try {
            await studentsCollection.dropIndex('studentId_1');
            console.log('✅ Dropped studentId_1 index');
        } catch (e) {
            console.log('ℹ️ studentId_1 index not found or already dropped');
        }

        // Create new sparse indexes
        await studentsCollection.createIndex({ aadharNumber: 1 }, { sparse: true, unique: true });
        console.log('✅ Created sparse unique index for aadharNumber');

        await studentsCollection.createIndex({ studentId: 1 }, { sparse: true, unique: true });
        console.log('✅ Created sparse unique index for studentId');

        console.log('\n🎉 Index fixes completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

dropIndex();
