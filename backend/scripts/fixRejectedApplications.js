const mongoose = require('mongoose');
const StudentApplication = require('../models/StudentApplication');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swagatodisha', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function fixRejectedApplications() {
    try {
        console.log('🔧 Starting to fix applications with rejected documents...');

        // Find all applications that have documents
        const applications = await StudentApplication.find({
            'documents.0': { $exists: true }
        });

        console.log(`📋 Found ${applications.length} applications with documents`);

        let fixedCount = 0;
        let skippedCount = 0;

        for (const application of applications) {
            const documents = application.documents || [];
            const rejectedDocs = documents.filter(doc => doc.status === 'REJECTED').length;
            
            console.log(`📋 Checking application ${application.applicationId}: status=${application.status}, rejectedDocs=${rejectedDocs}, totalDocs=${documents.length}`);
            
            // If any document is rejected and status is not REJECTED, update it
            if (rejectedDocs > 0 && application.status !== 'REJECTED' && application.status !== 'APPROVED' && application.status !== 'COMPLETE') {
                console.log(`🔧 Fixing application ${application.applicationId}: ${rejectedDocs} rejected document(s), status: ${application.status} → REJECTED`);
                
                application.status = 'REJECTED';
                application.currentStage = 'REJECTED';
                
                // Update review info if not already set
                if (!application.reviewInfo) {
                    application.reviewInfo = {};
                }
                if (!application.reviewInfo.rejectionReason) {
                    application.reviewInfo.rejectionReason = `Application rejected due to ${rejectedDocs} rejected document(s)`;
                }
                if (!application.reviewInfo.reviewedAt) {
                    application.reviewInfo.reviewedAt = new Date();
                }
                
                // Update review status
                if (!application.reviewStatus) {
                    application.reviewStatus = {};
                }
                application.reviewStatus.overallApproved = false;
                
                // Add workflow history entry
                if (!application.workflowHistory) {
                    application.workflowHistory = [];
                }
                application.workflowHistory.push({
                    stage: 'REJECTED',
                    status: 'REJECTED',
                    updatedBy: null, // System update
                    action: 'REJECT',
                    remarks: `Application automatically rejected due to ${rejectedDocs} rejected document(s)`,
                    timestamp: new Date()
                });
                
                await application.save();
                fixedCount++;
            } else {
                if (rejectedDocs > 0) {
                    console.log(`⏭️  Skipping application ${application.applicationId}: has ${rejectedDocs} rejected docs but status is ${application.status} (may be APPROVED/COMPLETE)`);
                }
                skippedCount++;
            }
        }

        console.log(`✅ Fixed ${fixedCount} applications`);
        console.log(`⏭️  Skipped ${skippedCount} applications (already correct or no rejected documents)`);
        console.log('🎉 Fix completed!');

    } catch (error) {
        console.error('❌ Error fixing applications:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the fix
fixRejectedApplications();

