const mongoose = require('mongoose');
require('dotenv').config();

const DocumentType = require('../models/DocumentType');

const TYPES = [
    {
        code: 'PASSPORT_PHOTO',
        name: 'Passport Size Photo',
        category: 'MANDATORY',
        required: true,
        maxSizeMb: 2,
        allowedFormats: ['jpg', 'jpeg', 'png'],
        metadata: { specifications: 'Recent passport-size photo with white background' }
    },
    {
        code: 'AADHAR',
        name: 'Aadhar Card',
        category: 'MANDATORY',
        required: true,
        maxSizeMb: 5,
        allowedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
        validationRules: { verification: 'OCR_ENABLED' }
    },
    {
        code: 'EDUCATION_10TH',
        name: "10th Marksheet/Certificate",
        category: 'MANDATORY',
        required: true,
        maxSizeMb: 10,
        allowedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
        options: {
            type: 'FLEXIBLE',
            options: { COMBINED: '10th Marksheet cum Certificate', SEPARATE: '10th Marksheet + 10th Certificate (Optional)' }
        }
    },
    {
        code: 'CASTE_CERTIFICATE',
        name: 'Caste Certificate',
        category: 'MANDATORY',
        required: true,
        maxSizeMb: 5,
        allowedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
        validityPeriod: '5_YEARS',
        validationRules: { CHECK_ISSUE_DATE: true }
    },
    {
        code: 'INCOME_CERTIFICATE',
        name: 'Income Certificate',
        category: 'MANDATORY',
        required: true,
        maxSizeMb: 5,
        allowedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
        validityPeriod: '1_YEAR',
        validationRules: { CHECK_ISSUE_DATE: true }
    },
    {
        code: 'OBC_FREE_EDUCATION',
        name: 'PM Kisan/CM Kisan Enrollment Proof',
        category: 'CONDITIONAL',
        required: false,
        maxSizeMb: 5,
        allowedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
        validationRules: { apiValidation: 'VERIFY_PM_CM_KISAN_STATUS' },
        metadata: { requiredFor: 'OBC_FREE_EDUCATION', condition: 'IF_ENROLLED_PM_CM_KISAN' }
    },
    {
        code: 'RESIDENT_CERTIFICATE',
        name: 'Resident Certificate',
        category: 'OPTIONAL',
        required: false,
        maxSizeMb: 5,
        allowedFormats: ['pdf', 'jpg', 'jpeg', 'png']
    }
];

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        for (const t of TYPES) {
            await DocumentType.updateOne({ code: t.code }, { $set: t }, { upsert: true });
            console.log('Upserted type:', t.code);
        }
        console.log('Document types seeded.');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();


