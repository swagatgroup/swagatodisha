const mongoose = require('mongoose');
const StudentApplication = require('../models/StudentApplication');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swagat-odisha', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Fix application data integrity issues
const fixApplicationDataIntegrity = async () => {
    try {
        console.log('Starting application data integrity fix...');

        // Find all applications
        const applications = await StudentApplication.find({});
        console.log(`Found ${applications.length} applications to process`);

        let fixedCount = 0;
        let errorCount = 0;

        for (const application of applications) {
            try {
                let needsUpdate = false;
                const documents = application.documents || [];
                const totalDocs = documents.length;
                const approvedDocs = documents.filter(doc => doc.status === 'APPROVED').length;
                const rejectedDocs = documents.filter(doc => doc.status === 'REJECTED').length;
                const pendingDocs = documents.filter(doc => !doc.status || doc.status === 'PENDING').length;

                // Fix 1: Applications with APPROVED status but no documents should be SUBMITTED
                if (application.status === 'APPROVED' && totalDocs === 0) {
                    console.log(`Fixing application ${application.applicationId}: APPROVED with no documents -> SUBMITTED`);
                    application.status = 'SUBMITTED';
                    application.currentStage = 'DOCUMENTS';
                    needsUpdate = true;
                }

                // Fix 2: Applications with APPROVED status but not all documents approved
                if (application.status === 'APPROVED' && totalDocs > 0 && approvedDocs !== totalDocs) {
                    console.log(`Fixing application ${application.applicationId}: APPROVED with incomplete document approval -> UNDER_REVIEW`);
                    application.status = 'UNDER_REVIEW';
                    application.currentStage = 'DOCUMENTS';
                    needsUpdate = true;
                }

                // Fix 3: Ensure proper document counts in reviewStatus
                if (!application.reviewStatus) {
                    application.reviewStatus = {};
                }

                const currentCounts = application.reviewStatus.documentCounts || { total: 0, approved: 0, rejected: 0, pending: 0 };
                const correctCounts = {
                    total: totalDocs,
                    approved: approvedDocs,
                    rejected: rejectedDocs,
                    pending: pendingDocs
                };

                if (JSON.stringify(currentCounts) !== JSON.stringify(correctCounts)) {
                    console.log(`Fixing document counts for application ${application.applicationId}`);
                    application.reviewStatus.documentCounts = correctCounts;
                    needsUpdate = true;
                }

                // Fix 4: Set proper overall document review status
                let overallStatus;
                if (totalDocs === 0) {
                    overallStatus = 'NOT_VERIFIED';
                } else if (approvedDocs === totalDocs) {
                    overallStatus = 'ALL_APPROVED';
                } else if (rejectedDocs === totalDocs) {
                    overallStatus = 'ALL_REJECTED';
                } else if (approvedDocs > 0 || rejectedDocs > 0) {
                    overallStatus = 'PARTIALLY_APPROVED';
                } else {
                    overallStatus = 'NOT_VERIFIED';
                }

                if (application.reviewStatus.overallDocumentReviewStatus !== overallStatus) {
                    console.log(`Fixing overall document review status for application ${application.applicationId}: ${overallStatus}`);
                    application.reviewStatus.overallDocumentReviewStatus = overallStatus;
                    needsUpdate = true;
                }

                // Fix 5: Set documentsVerified flag correctly
                const documentsVerified = totalDocs > 0 && approvedDocs === totalDocs;
                if (application.reviewStatus.documentsVerified !== documentsVerified) {
                    console.log(`Fixing documentsVerified flag for application ${application.applicationId}: ${documentsVerified}`);
                    application.reviewStatus.documentsVerified = documentsVerified;
                    needsUpdate = true;
                }

                // Fix 6: Ensure workflow history exists
                if (!application.workflowHistory || application.workflowHistory.length === 0) {
                    console.log(`Adding workflow history for application ${application.applicationId}`);
                    application.workflowHistory = [{
                        stage: application.currentStage,
                        status: application.status,
                        updatedBy: application.user,
                        action: 'SUBMIT',
                        remarks: 'Application submitted',
                        timestamp: application.submittedAt || new Date()
                    }];
                    needsUpdate = true;
                }

                // Fix 7: Ensure lastModified is set
                if (!application.lastModified) {
                    application.lastModified = new Date();
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    await application.save();
                    fixedCount++;
                    console.log(`✅ Fixed application ${application.applicationId}`);
                }

            } catch (error) {
                console.error(`❌ Error fixing application ${application.applicationId}:`, error.message);
                errorCount++;
            }
        }

        console.log(`\nData integrity fix completed:`);
        console.log(`- Total applications processed: ${applications.length}`);
        console.log(`- Applications fixed: ${fixedCount}`);
        console.log(`- Errors encountered: ${errorCount}`);

    } catch (error) {
        console.error('Error during data integrity fix:', error);
    }
};

// Main execution
const main = async () => {
    await connectDB();
    await fixApplicationDataIntegrity();
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
};

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { fixApplicationDataIntegrity };
