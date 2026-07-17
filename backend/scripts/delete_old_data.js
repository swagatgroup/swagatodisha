const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const StudentApplication = require('../models/StudentApplication');
const User = require('../models/User');

const cleanOldData = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swagat_odisha';
        console.log('Connecting to MongoDB...', mongoURI);
        
        await mongoose.connect(mongoURI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        });
        
        console.log('✅ MongoDB Connected');

        // Target Date: January 1, 2026 UTC
        const cutoffDate = new Date(Date.UTC(2026, 0, 1, 0, 0, 0, 0));
        console.log(`Deleting all StudentApplications and student Users created before: ${cutoffDate.toISOString()}`);

        // Find applications to delete
        const oldApplications = await StudentApplication.find({ createdAt: { $lt: cutoffDate } });
        console.log(`Found ${oldApplications.length} old student applications.`);

        if (oldApplications.length > 0) {
            // Delete the student users associated with these applications
            const userIdsToDelete = oldApplications.map(app => app.user).filter(id => id != null);
            
            if (userIdsToDelete.length > 0) {
                const userDeleteResult = await User.deleteMany({ 
                    _id: { $in: userIdsToDelete },
                    role: 'student' // Extra safety to only delete student accounts
                });
                console.log(`Deleted ${userDeleteResult.deletedCount} associated student user accounts.`);
            }

            // Delete the applications
            const appDeleteResult = await StudentApplication.deleteMany({ createdAt: { $lt: cutoffDate } });
            console.log(`Deleted ${appDeleteResult.deletedCount} old student applications.`);
        } else {
            console.log('No old applications found. Database is already clean.');
        }

        console.log('✅ Cleanup completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
};

cleanOldData();
