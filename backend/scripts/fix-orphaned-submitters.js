/**
 * Migration script: Fix orphaned submittedBy references
 *
 * Background:
 *   Two agent accounts (BHUPENDRA MEHER and NARENDRA NAG) were deleted and re-created
 *   with new MongoDB _ids. Their old _ids still existed in `studentapplications.submittedBy`
 *   and `studentapplications.referralInfo.referredBy`, causing those records to show as
 *   "Unknown" in the dashboard's All Submitters dropdown.
 *
 * Fix:
 *   - Old BHUPENDRA MEHER (bhu14a26)  6a590a0bf429cd8b3e4a3dfb → 6a9c387785e92af27b1c4d5d
 *   - Old NARENDRA NAG   (nar99a2635) 6a61eab45081912b82e2d435 → 6a9c387885e92af27b1c4d62
 *
 * Run: node backend/scripts/fix-orphaned-submitters.js
 * Status: ALREADY APPLIED (2026-09-27) — 108 + 25 records updated.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const MIGRATIONS = [
    {
        label: 'BHUPENDRA MEHER',
        oldId: '6a590a0bf429cd8b3e4a3dfb',
        newId: '6a9c387785e92af27b1c4d5d',
    },
    {
        label: 'NARENDRA NAG',
        oldId: '6a61eab45081912b82e2d435',
        newId: '6a9c387885e92af27b1c4d62',
    },
];

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const apps = mongoose.connection.db.collection('studentapplications');

    for (const { label, oldId, newId } of MIGRATIONS) {
        const oldObjId = new mongoose.Types.ObjectId(oldId);
        const newObjId = new mongoose.Types.ObjectId(newId);

        const r1 = await apps.updateMany(
            { submittedBy: oldObjId },
            { $set: { submittedBy: newObjId } }
        );
        const r2 = await apps.updateMany(
            { 'referralInfo.referredBy': oldObjId },
            { $set: { 'referralInfo.referredBy': newObjId } }
        );

        console.log(`${label}: updated ${r1.modifiedCount} submittedBy + ${r2.modifiedCount} referralInfo.referredBy`);
    }

    await mongoose.disconnect();
    console.log('Done.');
}

run().catch((e) => { console.error(e); process.exit(1); });
