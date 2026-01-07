const mongoose = require('mongoose');
require('dotenv').config();

// Import the College model
const College = require('../models/College');

const fixCollegeNullCodesAndIndex = async () => {
    try {
        console.log('🔧 Starting College null code cleanup and index fix...');

        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swagat_odisha';
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        const collection = College.collection;

        // Step 1: Fix the database index
        console.log('\n📋 Step 1: Fixing database index...');
        const existingIndexes = await collection.indexes();
        const codeIndex = existingIndexes.find(idx => idx.name === 'code_1' || (idx.key && idx.key.code === 1));
        
        if (codeIndex) {
            console.log('🔍 Found existing code index:', {
                name: codeIndex.name,
                unique: codeIndex.unique,
                sparse: codeIndex.sparse
            });

            if (!codeIndex.sparse || !codeIndex.unique) {
                console.log('⚠️ Index is not sparse/unique. Dropping and recreating...');
                try {
                    await collection.dropIndex(codeIndex.name);
                    console.log(`✅ Dropped index: ${codeIndex.name}`);
                } catch (dropError) {
                    console.log(`⚠️ Error dropping index: ${dropError.message}`);
                }

                await collection.createIndex({ code: 1 }, { unique: true, sparse: true, name: 'code_1' });
                console.log('✅ Created new sparse unique index on code field');
            } else {
                console.log('✅ Index is already correctly configured (unique and sparse)');
            }
        } else {
            console.log('📝 No existing code index found. Creating new sparse unique index...');
            await collection.createIndex({ code: 1 }, { unique: true, sparse: true, name: 'code_1' });
            console.log('✅ Created new sparse unique index on code field');
        }

        // Step 2: Find and fix all colleges with null/empty codes
        console.log('\n📋 Step 2: Finding colleges with null/empty codes...');
        const collegesWithNullCode = await College.find({
            $or: [
                { code: null },
                { code: undefined },
                { code: '' },
                { code: 'null' },
                { code: { $exists: false } }
            ]
        });

        console.log(`📋 Found ${collegesWithNullCode.length} colleges with null/empty codes`);

        if (collegesWithNullCode.length === 0) {
            console.log('✅ No colleges with null codes found. Nothing to fix.');
        } else {
            // Remove code field from all records with null/empty codes
            console.log('🔧 Removing code field from affected colleges...');
            let fixedCount = 0;
            let errorCount = 0;

            for (const college of collegesWithNullCode) {
                try {
                    await College.updateOne(
                        { _id: college._id },
                        { $unset: { code: '' } }
                    );
                    fixedCount++;
                    console.log(`✅ Fixed college: ${college.name} (${college._id})`);
                } catch (error) {
                    errorCount++;
                    console.error(`❌ Error fixing college ${college._id}:`, error.message);
                }
            }

            console.log(`\n✅ Fixed ${fixedCount} out of ${collegesWithNullCode.length} colleges`);
            if (errorCount > 0) {
                console.log(`⚠️ ${errorCount} colleges had errors`);
            }
        }

        // Step 3: Verify the index
        console.log('\n📋 Step 3: Verifying index...');
        const finalIndexes = await collection.indexes();
        const finalCodeIndex = finalIndexes.find(idx => idx.name === 'code_1' || (idx.key && idx.key.code === 1));
        if (finalCodeIndex) {
            console.log('✅ Verified index:', {
                name: finalCodeIndex.name,
                unique: finalCodeIndex.unique,
                sparse: finalCodeIndex.sparse
            });
        }

        // Step 4: Count remaining null codes
        const remainingNullCodes = await College.countDocuments({
            $or: [
                { code: null },
                { code: undefined },
                { code: '' },
                { code: 'null' }
            ]
        });

        if (remainingNullCodes === 0) {
            console.log('\n✅ All null codes have been removed successfully!');
        } else {
            console.log(`\n⚠️ Warning: ${remainingNullCodes} colleges still have null/empty codes. You may need to run this script again.`);
        }

        console.log('\n✅ College null code cleanup and index fix completed successfully');
        
    } catch (error) {
        console.error('❌ Error fixing College null codes and index:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('📴 MongoDB connection closed');
    }
};

// Run the fix
if (require.main === module) {
    fixCollegeNullCodesAndIndex()
        .then(() => {
            console.log('\n🎉 Cleanup and index fix completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Cleanup and index fix failed:', error);
            process.exit(1);
        });
}

module.exports = fixCollegeNullCodesAndIndex;

