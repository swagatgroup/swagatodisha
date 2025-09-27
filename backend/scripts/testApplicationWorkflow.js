const mongoose = require('mongoose');
const StudentApplication = require('../models/StudentApplication');
const User = require('../models/User');

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

// Test application workflow integrity
const testApplicationWorkflow = async () => {
    try {
        console.log('🧪 Testing Application Workflow Integrity...\n');

        // Test 1: Check for applications with inconsistent status/stage combinations
        console.log('1. Checking status/stage consistency...');
        const inconsistentStatus = await StudentApplication.find({
            $or: [
                { status: 'APPROVED', currentStage: { $ne: 'APPROVED' } },
                { status: 'SUBMITTED', currentStage: 'APPROVED' },
                { status: 'REJECTED', currentStage: 'APPROVED' }
            ]
        });

        if (inconsistentStatus.length > 0) {
            console.log(`❌ Found ${inconsistentStatus.length} applications with inconsistent status/stage`);
            inconsistentStatus.forEach(app => {
                console.log(`   - ${app.applicationId}: status=${app.status}, stage=${app.currentStage}`);
            });
        } else {
            console.log('✅ All applications have consistent status/stage combinations');
        }

        // Test 2: Check for approved applications without documents
        console.log('\n2. Checking approved applications without documents...');
        const approvedWithoutDocs = await StudentApplication.find({
            status: 'APPROVED',
            $or: [
                { documents: { $exists: false } },
                { documents: { $size: 0 } }
            ]
        });

        if (approvedWithoutDocs.length > 0) {
            console.log(`❌ Found ${approvedWithoutDocs.length} approved applications without documents`);
            approvedWithoutDocs.forEach(app => {
                console.log(`   - ${app.applicationId}: ${app.personalDetails?.fullName || 'Unknown'}`);
            });
        } else {
            console.log('✅ All approved applications have documents');
        }

        // Test 3: Check for applications with incomplete document review status
        console.log('\n3. Checking document review status completeness...');
        const incompleteReview = await StudentApplication.find({
            $or: [
                { 'reviewStatus.documentCounts': { $exists: false } },
                { 'reviewStatus.overallDocumentReviewStatus': { $exists: false } },
                { 'reviewStatus.documentsVerified': { $exists: false } }
            ]
        });

        if (incompleteReview.length > 0) {
            console.log(`❌ Found ${incompleteReview.length} applications with incomplete review status`);
        } else {
            console.log('✅ All applications have complete review status');
        }

        // Test 4: Check for applications without workflow history
        console.log('\n4. Checking workflow history completeness...');
        const noHistory = await StudentApplication.find({
            $or: [
                { workflowHistory: { $exists: false } },
                { workflowHistory: { $size: 0 } }
            ]
        });

        if (noHistory.length > 0) {
            console.log(`❌ Found ${noHistory.length} applications without workflow history`);
        } else {
            console.log('✅ All applications have workflow history');
        }

        // Test 5: Check document status consistency
        console.log('\n5. Checking document status consistency...');
        const applicationsWithDocs = await StudentApplication.find({
            documents: { $exists: true, $not: { $size: 0 } }
        });

        let docStatusIssues = 0;
        for (const app of applicationsWithDocs) {
            const docs = app.documents || [];
            const totalDocs = docs.length;
            const approvedDocs = docs.filter(doc => doc.status === 'APPROVED').length;
            const rejectedDocs = docs.filter(doc => doc.status === 'REJECTED').length;
            const pendingDocs = docs.filter(doc => !doc.status || doc.status === 'PENDING').length;

            // Check if counts match
            if (approvedDocs + rejectedDocs + pendingDocs !== totalDocs) {
                console.log(`❌ Document count mismatch in ${app.applicationId}`);
                docStatusIssues++;
            }

            // Check if review status matches document status
            const reviewCounts = app.reviewStatus?.documentCounts || {};
            if (reviewCounts.total !== totalDocs ||
                reviewCounts.approved !== approvedDocs ||
                reviewCounts.rejected !== rejectedDocs ||
                reviewCounts.pending !== pendingDocs) {
                console.log(`❌ Review status mismatch in ${app.applicationId}`);
                docStatusIssues++;
            }
        }

        if (docStatusIssues === 0) {
            console.log('✅ All document statuses are consistent');
        } else {
            console.log(`❌ Found ${docStatusIssues} document status inconsistencies`);
        }

        // Test 6: Check for missing reviewInfo in approved/rejected applications
        console.log('\n6. Checking review info completeness...');
        const missingReviewInfo = await StudentApplication.find({
            $or: [
                { status: 'APPROVED', reviewInfo: { $exists: false } },
                { status: 'REJECTED', reviewInfo: { $exists: false } }
            ]
        });

        if (missingReviewInfo.length > 0) {
            console.log(`❌ Found ${missingReviewInfo.length} approved/rejected applications without review info`);
        } else {
            console.log('✅ All approved/rejected applications have review info');
        }

        // Summary
        console.log('\n📊 Summary:');
        console.log(`- Total applications: ${await StudentApplication.countDocuments()}`);
        console.log(`- Applications with documents: ${applicationsWithDocs.length}`);
        console.log(`- Status inconsistencies: ${inconsistentStatus.length}`);
        console.log(`- Approved without docs: ${approvedWithoutDocs.length}`);
        console.log(`- Incomplete review status: ${incompleteReview.length}`);
        console.log(`- No workflow history: ${noHistory.length}`);
        console.log(`- Document status issues: ${docStatusIssues}`);
        console.log(`- Missing review info: ${missingReviewInfo.length}`);

        const totalIssues = inconsistentStatus.length + approvedWithoutDocs.length +
            incompleteReview.length + noHistory.length +
            docStatusIssues + missingReviewInfo.length;

        if (totalIssues === 0) {
            console.log('\n🎉 All tests passed! Application workflow is working correctly.');
        } else {
            console.log(`\n⚠️  Found ${totalIssues} issues that need attention.`);
            console.log('Run the data integrity fix script to resolve these issues.');
        }

    } catch (error) {
        console.error('Test error:', error);
    }
};

// Main execution
const main = async () => {
    await connectDB();
    await testApplicationWorkflow();
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
};

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testApplicationWorkflow };
