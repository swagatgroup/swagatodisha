const mongoose = require('mongoose');
const StudentApplication = require('../models/StudentApplication');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swagat-odisha', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function fixDocumentReviewStatus() {
    try {
        console.log('Starting document review status fix...');

        // Find all applications that have documents
        const applications = await StudentApplication.find({
            'documents.0': { $exists: true }
        });

        console.log(`Found ${applications.length} applications with documents`);

        for (const application of applications) {
            const documents = application.documents || [];
            const hasAny = documents.length > 0;

            const counts = documents.reduce((acc, d) => {
                acc.total += 1;
                if (d.status === 'APPROVED') acc.approved += 1;
                else if (d.status === 'REJECTED') acc.rejected += 1;
                else acc.pending += 1;
                return acc;
            }, { approved: 0, rejected: 0, pending: 0, total: 0 });

            const allApproved = hasAny && counts.approved === counts.total;
            const allRejected = hasAny && counts.rejected === counts.total;
            const anyReviewed = counts.approved + counts.rejected > 0;

            // Determine overall status
            let overallStatus;
            if (!hasAny || counts.pending === counts.total) {
                overallStatus = 'NOT_VERIFIED';
            } else if (allApproved) {
                overallStatus = 'ALL_APPROVED';
            } else if (allRejected) {
                overallStatus = 'ALL_REJECTED';
            } else if (anyReviewed) {
                overallStatus = 'PARTIALLY_APPROVED';
            } else {
                overallStatus = 'NOT_VERIFIED';
            }

            // Update the application
            application.reviewStatus = application.reviewStatus || {};
            application.reviewStatus.documentCounts = counts;
            application.reviewStatus.overallDocumentReviewStatus = overallStatus;
            application.reviewStatus.documentsVerified = allApproved;

            await application.save();

            console.log(`Updated ${application.applicationId}: ${counts.approved} approved, ${counts.rejected} rejected, ${counts.pending} pending -> ${overallStatus}`);
        }

        console.log('Document review status fix completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing document review status:', error);
        process.exit(1);
    }
}

fixDocumentReviewStatus();
