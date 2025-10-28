/**
 * Fix Document Complete Flag Anomaly
 * 
 * This script fixes applications that have:
 * - progress.documentsComplete: true
 * - But documents array is empty or has no valid documents
 * 
 * This anomaly was caused by the legacy /api/application/create endpoint
 * that set documentsComplete: true without validating documents.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

const fixDocumentCompleteFlag = async () => {
    try {
        const StudentApplication = require('../models/StudentApplication');

        console.log('\n🔍 Searching for applications with document complete flag anomaly...\n');

        // Find applications where documentsComplete is true but documents array is empty or invalid
        const applications = await StudentApplication.find({
            'progress.documentsComplete': true
        });

        console.log(`📊 Found ${applications.length} applications marked as documentsComplete: true`);

        let fixed = 0;
        let alreadyCorrect = 0;
        let errors = 0;

        for (const app of applications) {
            try {
                const documents = app.documents || [];
                const validDocuments = documents.filter(doc => 
                    doc && (doc.filePath || doc.url || doc.downloadUrl) && 
                    doc.filePath?.trim() !== ''
                );

                const hasValidDocuments = validDocuments.length > 0;
                const currentFlag = app.progress?.documentsComplete || false;

                if (!hasValidDocuments && currentFlag) {
                    // Fix: Set documentsComplete to false
                    console.log(`🔧 Fixing ${app.applicationId}:`);
                    console.log(`   - Current: documentsComplete = true, documents = ${documents.length} (${validDocuments.length} valid)`);
                    console.log(`   - Setting: documentsComplete = false`);

                    app.progress.documentsComplete = false;
                    app.reviewStatus = app.reviewStatus || {};
                    app.reviewStatus.documentCounts = {
                        total: 0,
                        approved: 0,
                        rejected: 0,
                        pending: 0
                    };
                    app.reviewStatus.overallDocumentReviewStatus = 'NOT_VERIFIED';
                    
                    await app.save();
                    fixed++;

                    // Log application details
                    console.log(`   ✅ Fixed: ${app.applicationId}`);
                    console.log(`      - Student: ${app.personalDetails?.fullName || 'N/A'}`);
                    console.log(`      - Status: ${app.status}`);
                    console.log(`      - Submitted: ${app.submittedAt?.toISOString() || 'N/A'}`);
                    console.log('');

                } else if (hasValidDocuments && currentFlag) {
                    // Already correct
                    alreadyCorrect++;
                    console.log(`✓ ${app.applicationId} - Already correct (${validDocuments.length} documents)`);
                    
                    // Update document counts if needed
                    const needsCountUpdate = !app.reviewStatus?.documentCounts || 
                                           app.reviewStatus.documentCounts.total !== validDocuments.length;
                    
                    if (needsCountUpdate) {
                        const pending = validDocuments.filter(d => !d.status || d.status === 'PENDING').length;
                        const approved = validDocuments.filter(d => d.status === 'APPROVED').length;
                        const rejected = validDocuments.filter(d => d.status === 'REJECTED').length;

                        app.reviewStatus = app.reviewStatus || {};
                        app.reviewStatus.documentCounts = {
                            total: validDocuments.length,
                            approved,
                            rejected,
                            pending
                        };
                        
                        await app.save();
                        console.log(`   📊 Updated document counts: ${validDocuments.length} total`);
                    }
                }

            } catch (err) {
                console.error(`❌ Error processing ${app.applicationId}:`, err.message);
                errors++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Fixed: ${fixed} applications`);
        console.log(`✓  Already Correct: ${alreadyCorrect} applications`);
        console.log(`❌ Errors: ${errors} applications`);
        console.log(`📝 Total Processed: ${applications.length} applications`);
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('❌ Error in fixDocumentCompleteFlag:', error);
        throw error;
    }
};

const main = async () => {
    try {
        await connectDB();
        await fixDocumentCompleteFlag();
        console.log('✅ Script completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { fixDocumentCompleteFlag };

