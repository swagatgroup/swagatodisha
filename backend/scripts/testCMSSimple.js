const mongoose = require('mongoose');
const colors = require('colors');
require('dotenv').config();

// Import models
const Content = require('../models/Content');
const Admin = require('../models/Admin');

// Test results
const results = {
    passed: 0,
    failed: 0,
    errors: []
};

// Helper function to log results
const logResult = (testName, success, message = '') => {
    if (success) {
        console.log(`✅ ${testName}: ${message}`.green);
        results.passed++;
    } else {
        console.log(`❌ ${testName}: ${message}`.red);
        results.failed++;
        results.errors.push({ test: testName, error: message });
    }
};

// Test 1: Test Content Model Creation
const testContentModel = async () => {
    console.log('\n📝 Testing Content Model...'.cyan);
    console.log('='.repeat(50));

    try {
        const testContent = {
            title: 'Test Content',
            slug: 'test-content',
            type: 'page',
            category: 'general',
            content: '<h1>Test Content</h1><p>This is a test.</p>',
            excerpt: 'Test excerpt',
            metaTitle: 'Test Meta Title',
            metaDescription: 'Test meta description',
            keywords: ['test', 'content'],
            isPublished: true,
            visibility: 'public',
            author: new mongoose.Types.ObjectId(),
            lastModifiedBy: new mongoose.Types.ObjectId()
        };

        const content = new Content(testContent);
        await content.save();

        logResult('Content Model Creation', true, 'Content created successfully');

        // Test content methods
        const publishedContent = await Content.findPublished();
        logResult('Find Published Content', publishedContent.length > 0, 'Published content found');

        const contentByCategory = await Content.findByCategory('general');
        logResult('Find Content by Category', contentByCategory.length > 0, 'Content found by category');

        const searchResults = await Content.search('test');
        logResult('Search Content', searchResults.length > 0, 'Search functionality working');

        // Clean up
        await Content.deleteOne({ _id: content._id });
        logResult('Content Cleanup', true, 'Test content cleaned up');

    } catch (error) {
        logResult('Content Model Creation', false, error.message);
    }
};

// Test 2: Test Content Validation
const testContentValidation = async () => {
    console.log('\n🔍 Testing Content Validation...'.cyan);
    console.log('='.repeat(50));

    try {
        // Test missing required fields
        const invalidContent = new Content({
            title: '', // Empty title should fail
            type: 'invalid_type' // Invalid type should fail
        });

        try {
            await invalidContent.save();
            logResult('Content Validation', false, 'Invalid content was saved');
        } catch (validationError) {
            logResult('Content Validation', true, 'Validation working - invalid content rejected');
        }

        // Test duplicate slug
        const content1 = new Content({
            title: 'Test Content 1',
            slug: 'duplicate-slug',
            type: 'page',
            category: 'general',
            content: 'Test content 1',
            author: new mongoose.Types.ObjectId()
        });

        const content2 = new Content({
            title: 'Test Content 2',
            slug: 'duplicate-slug', // Same slug should fail
            type: 'page',
            category: 'general',
            content: 'Test content 2',
            author: new mongoose.Types.ObjectId()
        });

        await content1.save();
        logResult('First Content Save', true, 'First content saved');

        try {
            await content2.save();
            logResult('Duplicate Slug Validation', false, 'Duplicate slug was accepted');
        } catch (duplicateError) {
            logResult('Duplicate Slug Validation', true, 'Duplicate slug rejected');
        }

        // Clean up
        await Content.deleteMany({ slug: 'duplicate-slug' });
        logResult('Duplicate Content Cleanup', true, 'Duplicate content cleaned up');

    } catch (error) {
        logResult('Content Validation', false, error.message);
    }
};

// Test 3: Test Content Versioning
const testContentVersioning = async () => {
    console.log('\n📚 Testing Content Versioning...'.cyan);
    console.log('='.repeat(50));

    try {
        const content = new Content({
            title: 'Version Test',
            slug: 'version-test',
            type: 'page',
            category: 'general',
            content: 'Version 1',
            author: new mongoose.Types.ObjectId(),
            lastModifiedBy: new mongoose.Types.ObjectId()
        });

        await content.save();
        const initialVersion = content.version;
        logResult('Initial Version', true, `Version ${initialVersion} created`);

        // Update content to trigger version increment
        content.title = 'Version Test Updated';
        content.content = 'Version 2';
        await content.save();

        logResult('Version Increment', content.version > initialVersion, `Version incremented to ${content.version}`);

        // Test change log
        await content.addChangeLog('Test change', content.author);
        logResult('Change Log', content.changeLog.length > 0, 'Change log entry added');

        // Clean up
        await Content.deleteOne({ _id: content._id });
        logResult('Version Test Cleanup', true, 'Version test content cleaned up');

    } catch (error) {
        logResult('Content Versioning', false, error.message);
    }
};

// Test 4: Test Content Publishing
const testContentPublishing = async () => {
    console.log('\n📢 Testing Content Publishing...'.cyan);
    console.log('='.repeat(50));

    try {
        const content = new Content({
            title: 'Publish Test',
            slug: 'publish-test',
            type: 'page',
            category: 'general',
            content: 'Test content for publishing',
            author: new mongoose.Types.ObjectId(),
            lastModifiedBy: new mongoose.Types.ObjectId(),
            isPublished: false,
            visibility: 'draft'
        });

        await content.save();
        logResult('Draft Content', !content.isPublished, 'Draft content created');

        // Publish content
        await content.publish();
        logResult('Publish Content', content.isPublished && content.visibility === 'public', 'Content published successfully');

        // Unpublish content
        await content.unpublish();
        logResult('Unpublish Content', !content.isPublished && content.visibility === 'draft', 'Content unpublished successfully');

        // Clean up
        await Content.deleteOne({ _id: content._id });
        logResult('Publish Test Cleanup', true, 'Publish test content cleaned up');

    } catch (error) {
        logResult('Content Publishing', false, error.message);
    }
};

// Test 5: Test Content Statistics
const testContentStatistics = async () => {
    console.log('\n📊 Testing Content Statistics...'.cyan);
    console.log('='.repeat(50));

    try {
        // Create test content
        const contents = [];
        for (let i = 0; i < 5; i++) {
            const content = new Content({
                title: `Stats Test ${i}`,
                slug: `stats-test-${i}`,
                type: 'page',
                category: 'general',
                content: `Test content ${i}`,
                author: new mongoose.Types.ObjectId(),
                lastModifiedBy: new mongoose.Types.ObjectId(),
                isPublished: i % 2 === 0, // Half published
                visibility: i % 2 === 0 ? 'public' : 'draft',
                views: i * 10
            });
            await content.save();
            contents.push(content);
        }

        // Test statistics
        const stats = await Content.aggregate([
            {
                $group: {
                    _id: null,
                    totalContent: { $sum: 1 },
                    publishedContent: {
                        $sum: { $cond: [{ $eq: ['$isPublished', true] }, 1, 0] }
                    },
                    totalViews: { $sum: '$views' }
                }
            }
        ]);

        logResult('Content Statistics', stats.length > 0, 'Statistics calculated successfully');

        // Clean up
        await Content.deleteMany({ slug: { $regex: /^stats-test-/ } });
        logResult('Stats Test Cleanup', true, 'Stats test content cleaned up');

    } catch (error) {
        logResult('Content Statistics', false, error.message);
    }
};

// Main test function
const runTests = async () => {
    try {
        console.log('🧪 Testing CMS Content Model'.cyan);
        console.log('='.repeat(50));

        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swagatodisha');
        console.log('✅ Connected to database'.green);

        // Run tests
        await testContentModel();
        await testContentValidation();
        await testContentVersioning();
        await testContentPublishing();
        await testContentStatistics();

        // Print summary
        console.log('\n📊 Test Results Summary'.cyan);
        console.log('='.repeat(50));
        console.log(`✅ Passed: ${results.passed}`.green);
        console.log(`❌ Failed: ${results.failed}`.red);
        console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`.blue);

        if (results.errors.length > 0) {
            console.log('\n❌ Failed Tests:'.red);
            console.log('='.repeat(50));
            results.errors.forEach(error => {
                console.log(`• ${error.test}: ${error.error}`.red);
            });
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from database');
    }
};

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests };
