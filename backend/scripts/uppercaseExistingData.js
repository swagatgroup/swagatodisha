// One-time migration: convert existing text fields to UPPERCASE, using the same
// field rules as utils/uppercaseText.js (emails, passwords, URLs, files, IDs,
// enums and code-like fields are left untouched).
//
// Dry run (default, writes nothing):  node scripts/uppercaseExistingData.js
// Apply changes:                      node scripts/uppercaseExistingData.js --apply
//
// Writes go straight to the collections with $set (no save hooks/validation), so
// password hashing and required-field rules on old records are not triggered.

require('dotenv').config();
const mongoose = require('mongoose');
const { toUpper } = require('../utils/uppercaseText');

const MODELS = ['User', 'Admin', 'StudentApplication', 'Student', 'College', 'CollegeCourse', 'Campus'];
const APPLY = process.argv.includes('--apply');

// Walk a stored document and collect { 'dotted.path': UPPERCASED } for every field the plugin covers
function collectChanges(value, schema, prefix, setPrefix, changes) {
    if (!value || typeof value !== 'object') return;
    for (const key of Object.keys(value)) {
        const path = prefix + key;
        const setPath = setPrefix + key;
        const v = value[key];
        const schemaType = schema.path(path);

        if (schemaType && schemaType.schema) {
            if (Array.isArray(v)) {
                v.forEach((item, i) => collectChanges(item, schemaType.schema, '', `${setPath}.${i}.`, changes));
            } else {
                collectChanges(v, schemaType.schema, '', `${setPath}.`, changes);
            }
        } else if (schemaType) {
            if (schemaType.$uppercaseText && typeof v === 'string' && toUpper(v) !== v) {
                changes[setPath] = toUpper(v);
            }
        } else if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof mongoose.Types.ObjectId) && !(v instanceof Date)) {
            collectChanges(v, schema, `${path}.`, `${setPath}.`, changes);
        }
    }
}

async function run() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swagat-odisha');
    console.log(`Connected. Mode: ${APPLY ? 'APPLY (writing changes)' : 'DRY RUN (no writes)'}\n`);

    for (const name of MODELS) {
        const Model = require(`../models/${name}`);
        const cursor = Model.collection.find({});
        let scanned = 0, changed = 0, failed = 0, samplesShown = 0;

        for await (const doc of cursor) {
            scanned++;
            const changes = {};
            collectChanges(doc, Model.schema, '', '', changes);
            if (!Object.keys(changes).length) continue;
            changed++;

            if (samplesShown < 3) {
                samplesShown++;
                console.log(`  [${name}] ${doc._id}`);
                for (const [p, nv] of Object.entries(changes)) {
                    const old = p.split('.').reduce((o, k) => (o == null ? o : o[k]), doc);
                    console.log(`     ${p}: "${old}" -> "${nv}"`);
                }
            }

            if (APPLY) {
                try {
                    await Model.collection.updateOne({ _id: doc._id }, { $set: changes });
                } catch (err) {
                    // e.g. a unique index clash when "Abc" and "ABC" both exist
                    failed++;
                    console.error(`  [${name}] ${doc._id} FAILED: ${err.message}`);
                }
            }
        }

        console.log(`${name}: scanned ${scanned}, ${APPLY ? 'updated' : 'would update'} ${changed - failed}${failed ? `, failed ${failed}` : ''}\n`);
    }

    await mongoose.disconnect();
}

run().catch(async (err) => {
    console.error('Migration failed:', err);
    await mongoose.disconnect();
    process.exit(1);
});
