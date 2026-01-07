const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/auth');
const College = require('../models/College');

// @desc    Fix college code index and clean null codes
// @route   POST /api/admin/fix/fix-college-index
// @access  Private (Super Admin only)
router.post('/fix-college-index', protect, authorize('super_admin'), async (req, res) => {
    try {
        console.log('🔧 Admin triggered college index fix...');
        
        const collection = College.collection;
        const results = {
            indexFixed: false,
            collegesFixed: 0,
            errors: []
        };

        // Step 1: Fix the database index
        console.log('📋 Step 1: Fixing database index...');
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
                    results.errors.push(`Error dropping index: ${dropError.message}`);
                }

                await collection.createIndex({ code: 1 }, { unique: true, sparse: true, name: 'code_1' });
                console.log('✅ Created new sparse unique index on code field');
                results.indexFixed = true;
            } else {
                console.log('✅ Index is already correctly configured (unique and sparse)');
                results.indexFixed = true;
            }
        } else {
            console.log('📝 No existing code index found. Creating new sparse unique index...');
            await collection.createIndex({ code: 1 }, { unique: true, sparse: true, name: 'code_1' });
            console.log('✅ Created new sparse unique index on code field');
            results.indexFixed = true;
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

        if (collegesWithNullCode.length > 0) {
            // Remove code field from all records with null/empty codes
            console.log('🔧 Removing code field from affected colleges...');
            let fixedCount = 0;

            for (const college of collegesWithNullCode) {
                try {
                    await College.updateOne(
                        { _id: college._id },
                        { $unset: { code: '' } }
                    );
                    fixedCount++;
                    console.log(`✅ Fixed college: ${college.name} (${college._id})`);
                } catch (error) {
                    results.errors.push(`Error fixing college ${college._id}: ${error.message}`);
                    console.error(`❌ Error fixing college ${college._id}:`, error.message);
                }
            }

            results.collegesFixed = fixedCount;
            console.log(`\n✅ Fixed ${fixedCount} out of ${collegesWithNullCode.length} colleges`);
        }

        // Step 3: Verify the index
        const finalIndexes = await collection.indexes();
        const finalCodeIndex = finalIndexes.find(idx => idx.name === 'code_1' || (idx.key && idx.key.code === 1));
        const indexStatus = finalCodeIndex ? {
            name: finalCodeIndex.name,
            unique: finalCodeIndex.unique,
            sparse: finalCodeIndex.sparse
        } : null;

        res.status(200).json({
            success: true,
            message: 'College index fixed and null codes cleaned successfully',
            results: {
                ...results,
                indexStatus
            }
        });
    } catch (error) {
        console.error('❌ Error fixing college index:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fix college index',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;

