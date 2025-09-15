const { determineStorageStrategy, STORAGE_CONFIG } = require('../utils/hybridStorage');

/**
 * Test the hybrid storage strategy determination
 */
const testStorageStrategy = () => {
    console.log('🧪 Testing Hybrid Storage Strategy');
    console.log('=====================================\n');

    const testFiles = [
        // Small images - should go to MongoDB
        { mimetype: 'image/jpeg', size: 500 * 1024, name: 'small-image.jpg' },
        { mimetype: 'image/png', size: 2 * 1024 * 1024, name: 'medium-image.png' },

        // Large images - should go to R2
        { mimetype: 'image/jpeg', size: 6 * 1024 * 1024, name: 'large-image.jpg' },

        // PDFs - should always go to R2
        { mimetype: 'application/pdf', size: 100 * 1024, name: 'small-pdf.pdf' },
        { mimetype: 'application/pdf', size: 10 * 1024 * 1024, name: 'large-pdf.pdf' },

        // Office documents - should go to R2
        { mimetype: 'application/msword', size: 500 * 1024, name: 'document.doc' },
        { mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 2 * 1024 * 1024, name: 'document.docx' },

        // Text files - should go to MongoDB if small
        { mimetype: 'text/plain', size: 100 * 1024, name: 'readme.txt' },
        { mimetype: 'text/plain', size: 6 * 1024 * 1024, name: 'large-text.txt' },

        // JSON files - should go to MongoDB if small
        { mimetype: 'application/json', size: 50 * 1024, name: 'config.json' },

        // Archives - should go to R2
        { mimetype: 'application/zip', size: 500 * 1024, name: 'archive.zip' },

        // Unknown types - should go to R2
        { mimetype: 'application/octet-stream', size: 100 * 1024, name: 'unknown.bin' },
    ];

    console.log(`Configuration:`);
    console.log(`  MongoDB Max Size: ${(STORAGE_CONFIG.MONGODB_MAX_SIZE / (1024 * 1024)).toFixed(1)}MB`);
    console.log(`  R2 Min Size: ${(STORAGE_CONFIG.R2_MIN_SIZE / (1024 * 1024)).toFixed(1)}MB`);
    console.log(`  R2 Priority Types: ${STORAGE_CONFIG.R2_PRIORITY_TYPES.length} types`);
    console.log(`  MongoDB Types: ${STORAGE_CONFIG.MONGODB_TYPES.length} types\n`);

    testFiles.forEach((file, index) => {
        const strategy = determineStorageStrategy(file);
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);

        console.log(`${index + 1}. ${file.name}`);
        console.log(`   Type: ${file.mimetype}`);
        console.log(`   Size: ${sizeInMB}MB`);
        console.log(`   Strategy: ${strategy.type.toUpperCase()}`);
        console.log(`   Reason: ${strategy.reason}`);
        console.log('');
    });

    // Summary
    const mongodbFiles = testFiles.filter(file =>
        determineStorageStrategy(file).type === 'mongodb'
    ).length;
    const r2Files = testFiles.filter(file =>
        determineStorageStrategy(file).type === 'r2'
    ).length;

    console.log('Summary:');
    console.log(`  MongoDB: ${mongodbFiles} files`);
    console.log(`  R2: ${r2Files} files`);
    console.log(`  Total: ${testFiles.length} files`);
};

/**
 * Test file size thresholds
 */
const testFileSizeThresholds = () => {
    console.log('\n🔍 Testing File Size Thresholds');
    console.log('================================\n');

    const sizes = [
        { size: 100 * 1024, name: '100KB' },
        { size: 500 * 1024, name: '500KB' },
        { size: 1 * 1024 * 1024, name: '1MB' },
        { size: 2 * 1024 * 1024, name: '2MB' },
        { size: 5 * 1024 * 1024, name: '5MB' },
        { size: 10 * 1024 * 1024, name: '10MB' },
    ];

    const testMimeType = 'image/jpeg'; // Should go to MongoDB if small enough

    sizes.forEach(({ size, name }) => {
        const strategy = determineStorageStrategy({ mimetype: testMimeType, size });
        const sizeInMB = (size / (1024 * 1024)).toFixed(2);

        console.log(`${name} (${sizeInMB}MB): ${strategy.type.toUpperCase()} - ${strategy.reason}`);
    });
};

/**
 * Test priority file types
 */
const testPriorityTypes = () => {
    console.log('\n📄 Testing Priority File Types');
    console.log('===============================\n');

    const priorityTypes = STORAGE_CONFIG.R2_PRIORITY_TYPES;
    const smallSize = 100 * 1024; // 100KB - should normally go to MongoDB

    console.log('These file types should ALWAYS go to R2, regardless of size:');
    console.log('');

    priorityTypes.forEach((mimetype, index) => {
        const strategy = determineStorageStrategy({ mimetype, size: smallSize });
        const isCorrect = strategy.type === 'r2' && strategy.reason === 'priority_type';

        console.log(`${index + 1}. ${mimetype}`);
        console.log(`   Size: 100KB (would normally go to MongoDB)`);
        console.log(`   Result: ${strategy.type.toUpperCase()} - ${strategy.reason}`);
        console.log(`   ✅ ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
        console.log('');
    });
};

// Run all tests
if (require.main === module) {
    testStorageStrategy();
    testFileSizeThresholds();
    testPriorityTypes();

    console.log('🎉 All tests completed!');
}

module.exports = {
    testStorageStrategy,
    testFileSizeThresholds,
    testPriorityTypes
};
