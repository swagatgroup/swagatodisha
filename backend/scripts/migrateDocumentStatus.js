const mongoose = require('mongoose');
require('dotenv').config();

// Import the model
const StudentApplication = require('../models/StudentApplication');

const migrateDocumentStatus = async () => {
    try {
        console.log('Starting document status migration...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swagat-odisha');
        console.log('Connected to MongoDB');

        // Find all applications
        const applications = await StudentApplication.find({});
        console.log(`Found ${applications.length} applications to migrate`);

        let migratedCount = 0;
        let documentCount = 0;

        for (const app of applications) {
            let needsUpdate = false;
            const documents = app.documents || [];

            // Fix document statuses
            for (const doc of documents) {
                if (!doc.status) {
                    doc.status = 'PENDING';
                    needsUpdate = true;
                    documentCount++;
                }
            }

            // Initialize reviewStatus if missing
            if (!app.reviewStatus) {
                app.reviewStatus = {};
                needsUpdate = true;
            }

            // Set overallDocumentReviewStatus if missing
            if (!app.reviewStatus.overallDocumentReviewStatus) {
                app.reviewStatus.overallDocumentReviewStatus = 'NOT_VERIFIED';
                needsUpdate = true;
            }

            // Initialize documentCounts if missing
            if (!app.reviewStatus.documentCounts) {
                const totalDocs = documents.length;
                const approvedDocs = documents.filter(d => d.status === 'APPROVED').length;
                const rejectedDocs = documents.filter(d => d.status === 'REJECTED').length;
                const pendingDocs = documents.filter(d => d.status === 'PENDING').length;

                app.reviewStatus.documentCounts = {
                    total: totalDocs,
                    approved: approvedDocs,
                    rejected: rejectedDocs,
                    pending: pendingDocs
                };
                needsUpdate = true;
            }

            if (needsUpdate) {
                await app.save();
                migratedCount++;
                console.log(`Migrated application ${app.applicationId}`);
            }
        }

        console.log(`Migration completed!`);
        console.log(`- Applications migrated: ${migratedCount}`);
        console.log(`- Documents fixed: ${documentCount}`);

    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run migration if called directly
if (require.main === module) {
    migrateDocumentStatus();
}

module.exports = migrateDocumentStatus;
