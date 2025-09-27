const mongoose = require('mongoose');
const documentRequirements = require('../config/documentRequirements');

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

// Test document requirements integration
const testDocumentRequirements = async () => {
    try {
        console.log('🧪 Testing Document Requirements Integration...\n');

        // Test 1: Validate document requirements structure
        console.log('1. Testing document requirements structure...');
        const required = documentRequirements.required;
        const optional = documentRequirements.optional;
        const custom = documentRequirements.custom;

        console.log(`✅ Required documents: ${required.length}`);
        required.forEach(doc => {
            console.log(`   - ${doc.label}: ${doc.allowedFormats.join(', ')} (max ${Math.round(doc.maxSize / (1024 * 1024))}MB)`);
        });

        console.log(`✅ Optional documents: ${optional.length}`);
        optional.forEach(doc => {
            console.log(`   - ${doc.label}: ${doc.allowedFormats.join(', ')} (max ${Math.round(doc.maxSize / (1024 * 1024))}MB)`);
        });

        console.log(`✅ Custom documents: ${custom.enabled ? 'Enabled' : 'Disabled'}`);
        if (custom.enabled) {
            console.log(`   - Max custom documents: ${custom.maxCustomDocuments}`);
            console.log(`   - Allowed formats: ${custom.allowedFormats.join(', ')}`);
        }

        // Test 2: Validate specific requirements
        console.log('\n2. Testing specific document requirements...');

        const passportPhoto = required.find(doc => doc.key === 'passport_photo');
        if (passportPhoto) {
            console.log('✅ Passport photo requirements found');
            console.log(`   - Allowed formats: ${passportPhoto.allowedFormats.join(', ')}`);
            console.log(`   - Max size: ${Math.round(passportPhoto.maxSize / (1024 * 1024))}MB`);
            console.log(`   - Validation: ${passportPhoto.validation ? 'Yes' : 'No'}`);
        } else {
            console.log('❌ Passport photo requirements not found');
        }

        const aadharCard = required.find(doc => doc.key === 'aadhar_card');
        if (aadharCard) {
            console.log('✅ Aadhar card requirements found');
            console.log(`   - Allowed formats: ${aadharCard.allowedFormats.join(', ')}`);
            console.log(`   - Max size: ${Math.round(aadharCard.maxSize / (1024 * 1024))}MB`);
        } else {
            console.log('❌ Aadhar card requirements not found');
        }

        const tenthMarksheet = required.find(doc => doc.key === 'tenth_marksheet_certificate');
        if (tenthMarksheet) {
            console.log('✅ 10th marksheet certificate requirements found');
            console.log(`   - Note: ${tenthMarksheet.validation?.note || 'No special note'}`);
        } else {
            console.log('❌ 10th marksheet certificate requirements not found');
        }

        const casteCert = required.find(doc => doc.key === 'caste_certificate');
        if (casteCert) {
            console.log('✅ Caste certificate requirements found');
            console.log(`   - Max age: ${casteCert.validation?.maxAge || 'Not specified'} years`);
            console.log(`   - Check date: ${casteCert.validation?.checkDate ? 'Yes' : 'No'}`);
        } else {
            console.log('❌ Caste certificate requirements not found');
        }

        const incomeCert = required.find(doc => doc.key === 'income_certificate');
        if (incomeCert) {
            console.log('✅ Income certificate requirements found');
            console.log(`   - Max age: ${incomeCert.validation?.maxAge || 'Not specified'} year(s)`);
            console.log(`   - Check date: ${incomeCert.validation?.checkDate ? 'Yes' : 'No'}`);
        } else {
            console.log('❌ Income certificate requirements not found');
        }

        // Test 3: Validate OBC benefit documents
        console.log('\n3. Testing OBC benefit documents...');

        const pmKisan = optional.find(doc => doc.key === 'pm_kisan_enrollment');
        const cmKisan = optional.find(doc => doc.key === 'cm_kisan_enrollment');

        if (pmKisan && cmKisan) {
            console.log('✅ OBC benefit documents found');
            console.log(`   - PM Kisan: ${pmKisan.label}`);
            console.log(`   - CM Kisan: ${cmKisan.label}`);
            console.log(`   - Category: ${pmKisan.validation?.category || 'Not specified'}`);
        } else {
            console.log('❌ OBC benefit documents not found');
        }

        // Test 4: Validate custom document support
        console.log('\n4. Testing custom document support...');

        if (custom.enabled) {
            console.log('✅ Custom documents enabled');
            console.log(`   - Max custom documents: ${custom.maxCustomDocuments}`);
            console.log(`   - Allowed formats: ${custom.allowedFormats.join(', ')}`);
            console.log(`   - Label required: ${custom.validation?.labelRequired ? 'Yes' : 'No'}`);
            console.log(`   - Max label length: ${custom.validation?.maxLabelLength || 'Not specified'} characters`);
        } else {
            console.log('❌ Custom documents disabled');
        }

        // Test 5: Validate upload order
        console.log('\n5. Testing upload order...');

        const uploadOrder = documentRequirements.uploadOrder;
        console.log(`✅ Upload order defined with ${uploadOrder.length} items`);
        uploadOrder.forEach((docKey, index) => {
            const doc = [...required, ...optional].find(d => d.key === docKey);
            console.log(`   ${index + 1}. ${docKey}: ${doc ? doc.label : 'Not found'}`);
        });

        // Test 6: Validate help text
        console.log('\n6. Testing help text...');

        const helpText = documentRequirements.helpText;
        const helpTextKeys = Object.keys(helpText);
        console.log(`✅ Help text available for ${helpTextKeys.length} document types`);

        // Test 7: Validate validation rules
        console.log('\n7. Testing validation rules...');

        const validationRules = documentRequirements.validationRules;
        console.log('✅ Validation rules available:');
        console.log(`   - checkDocumentAge: ${typeof validationRules.checkDocumentAge === 'function' ? 'Yes' : 'No'}`);
        console.log(`   - validatePassportPhoto: ${typeof validationRules.validatePassportPhoto === 'function' ? 'Yes' : 'No'}`);
        console.log(`   - getDocumentCategory: ${typeof validationRules.getDocumentCategory === 'function' ? 'Yes' : 'No'}`);

        // Summary
        console.log('\n📊 Summary:');
        console.log(`- Required documents: ${required.length}`);
        console.log(`- Optional documents: ${optional.length}`);
        console.log(`- Custom documents: ${custom.enabled ? 'Enabled' : 'Disabled'}`);
        console.log(`- Upload order: ${uploadOrder.length} items`);
        console.log(`- Help text: ${helpTextKeys.length} items`);
        console.log(`- Validation rules: ${Object.keys(validationRules).length} functions`);

        // Check for missing critical documents
        const criticalDocs = ['passport_photo', 'aadhar_card', 'tenth_marksheet_certificate', 'caste_certificate', 'income_certificate'];
        const missingCritical = criticalDocs.filter(docKey => !required.find(doc => doc.key === docKey));

        if (missingCritical.length === 0) {
            console.log('\n🎉 All critical document requirements are properly configured!');
        } else {
            console.log(`\n⚠️  Missing critical documents: ${missingCritical.join(', ')}`);
        }

    } catch (error) {
        console.error('Test error:', error);
    }
};

// Main execution
const main = async () => {
    await connectDB();
    await testDocumentRequirements();
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
};

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testDocumentRequirements };
