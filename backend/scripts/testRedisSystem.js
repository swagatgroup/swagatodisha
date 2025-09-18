const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class RedisSystemTester {
    constructor() {
        this.baseURL = process.env.API_URL || 'http://localhost:5000';
        this.testResults = [];
        this.testStudents = [];
        this.testApplications = [];
    }

    async runAllTests() {
        console.log('🧪 Starting Redis System Tests...\n');

        try {
            // Test 1: Health Check
            await this.testHealthCheck();

            // Test 2: Create Test Students
            await this.testCreateDummyStudents();

            // Test 3: Test Redis State Management
            await this.testRedisStateManagement();

            // Test 4: Test Application Submission Workflow
            await this.testApplicationSubmissionWorkflow();

            // Test 5: Test Document Upload Queue
            await this.testDocumentUploadQueue();

            // Test 6: Test Real-time Updates
            await this.testRealTimeUpdates();

            // Test 7: Test Error Handling and Recovery
            await this.testErrorHandling();

            // Test 8: Test Performance Under Load
            await this.testPerformanceUnderLoad();

            // Test 9: Cleanup
            await this.testCleanup();

            // Print Results
            this.printTestResults();

        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
            process.exit(1);
        }
    }

    async testHealthCheck() {
        console.log('1️⃣ Testing Health Check...');

        try {
            const response = await axios.get(`${this.baseURL}/health`);

            if (response.data.status === 'healthy') {
                this.logSuccess('Health check passed');
                console.log('   ✅ Redis:', response.data.services.redis.status);
                console.log('   ✅ Queue:', response.data.services.queue ? 'connected' : 'disconnected');
                console.log('   ✅ Database:', response.data.services.database);
            } else {
                this.logError('Health check failed', response.data);
            }
        } catch (error) {
            this.logError('Health check failed', error.message);
        }
    }

    async testCreateDummyStudents() {
        console.log('\n2️⃣ Testing Dummy Student Creation...');

        try {
            const response = await axios.post(`${this.baseURL}/api/test/create-dummy-student`, {
                count: 5
            });

            if (response.data.success) {
                this.testStudents = response.data.students;
                this.logSuccess(`Created ${this.testStudents.length} dummy students`);
                console.log('   📝 Students created:');
                this.testStudents.forEach((student, index) => {
                    console.log(`      ${index + 1}. ${student.name} (${student.email}) - ${student.referralCode}`);
                });
            } else {
                this.logError('Failed to create dummy students', response.data);
            }
        } catch (error) {
            this.logError('Failed to create dummy students', error.message);
        }
    }

    async testRedisStateManagement() {
        console.log('\n3️⃣ Testing Redis State Management...');

        if (this.testStudents.length === 0) {
            this.logError('No test students available');
            return;
        }

        try {
            const student = this.testStudents[0];

            // Test draft saving
            const draftData = {
                formData: {
                    personalDetails: {
                        fullName: 'Test Student',
                        dateOfBirth: '2000-01-01',
                        gender: 'Male'
                    },
                    contactDetails: {
                        email: 'test@example.com',
                        primaryPhone: '9876543210'
                    },
                    courseDetails: {
                        selectedCourse: 'B.Tech Computer Science'
                    }
                },
                currentStep: 2
            };

            const saveResponse = await axios.post(`${this.baseURL}/api/redis/application/draft`, draftData, {
                headers: {
                    'Authorization': `Bearer ${this.getTestToken(student.id)}`
                }
            });

            if (saveResponse.data.success) {
                this.logSuccess('Draft saved successfully');

                // Test draft loading
                const loadResponse = await axios.get(`${this.baseURL}/api/redis/application/draft/${saveResponse.data.draftId}`, {
                    headers: {
                        'Authorization': `Bearer ${this.getTestToken(student.id)}`
                    }
                });

                if (loadResponse.data.success) {
                    this.logSuccess('Draft loaded successfully');
                    console.log('   📄 Draft data:', JSON.stringify(loadResponse.data.data, null, 2));
                } else {
                    this.logError('Failed to load draft', loadResponse.data);
                }
            } else {
                this.logError('Failed to save draft', saveResponse.data);
            }
        } catch (error) {
            this.logError('Redis state management test failed', error.message);
        }
    }

    async testApplicationSubmissionWorkflow() {
        console.log('\n4️⃣ Testing Application Submission Workflow...');

        if (this.testStudents.length === 0) {
            this.logError('No test students available');
            return;
        }

        try {
            const student = this.testStudents[0];

            const applicationData = {
                personalDetails: {
                    fullName: 'Test Student Workflow',
                    fathersName: 'Test Father',
                    mothersName: 'Test Mother',
                    dateOfBirth: '2000-01-01',
                    gender: 'Male',
                    aadharNumber: `1234567890${Date.now()}`
                },
                contactDetails: {
                    primaryPhone: '9876543210',
                    whatsappNumber: '9876543210',
                    email: 'workflow@example.com',
                    permanentAddress: {
                        street: 'Test Street',
                        city: 'Test City',
                        state: 'Odisha',
                        pincode: '751001',
                        country: 'India'
                    }
                },
                courseDetails: {
                    selectedCourse: 'B.Tech Computer Science',
                    stream: 'Engineering'
                },
                guardianDetails: {
                    guardianName: 'Test Guardian',
                    relationship: 'Father',
                    guardianPhone: '9876543210',
                    guardianEmail: 'guardian@example.com'
                },
                financialDetails: {
                    annualIncome: '500000',
                    occupation: 'Business'
                },
                referralCode: '',
                documents: {}
            };

            // Submit application
            const submitResponse = await axios.post(`${this.baseURL}/api/redis/application/create`, applicationData, {
                headers: {
                    'Authorization': `Bearer ${this.getTestToken(student.id)}`
                }
            });

            if (submitResponse.data.success) {
                this.logSuccess('Application submission started');
                const submissionId = submitResponse.data.submissionId;
                this.testApplications.push({ submissionId, studentId: student.id });

                console.log('   📋 Submission ID:', submissionId);
                console.log('   ⏱️  Status:', submitResponse.data.status);

                // Monitor workflow progress
                await this.monitorWorkflowProgress(submissionId, student.id);
            } else {
                this.logError('Application submission failed', submitResponse.data);
            }
        } catch (error) {
            this.logError('Application submission workflow test failed', error.message);
        }
    }

    async monitorWorkflowProgress(submissionId, userId) {
        console.log('   🔄 Monitoring workflow progress...');

        let attempts = 0;
        const maxAttempts = 30; // 30 seconds timeout

        while (attempts < maxAttempts) {
            try {
                const statusResponse = await axios.get(`${this.baseURL}/api/redis/application/status/${submissionId}`, {
                    headers: {
                        'Authorization': `Bearer ${this.getTestToken(userId)}`
                    }
                });

                if (statusResponse.data.success) {
                    const { status, progress } = statusResponse.data.data;
                    console.log(`   📊 Progress: ${progress}% - Status: ${JSON.stringify(status, null, 2)}`);

                    // Check if workflow is complete
                    if (progress === 100) {
                        this.logSuccess('Workflow completed successfully');
                        break;
                    }
                }

                await this.sleep(1000); // Wait 1 second
                attempts++;
            } catch (error) {
                console.log('   ⚠️  Error checking status:', error.message);
                attempts++;
            }
        }

        if (attempts >= maxAttempts) {
            this.logError('Workflow monitoring timed out');
        }
    }

    async testDocumentUploadQueue() {
        console.log('\n5️⃣ Testing Document Upload Queue...');

        try {
            // Create a test file
            const testFilePath = path.join(__dirname, 'test-document.pdf');
            const testContent = 'This is a test document for Redis queue testing.';
            fs.writeFileSync(testFilePath, testContent);

            // Upload document
            const formData = new FormData();
            formData.append('file', fs.createReadStream(testFilePath));
            formData.append('documentType', 'aadharCard');

            const uploadResponse = await axios.post(`${this.baseURL}/api/redis/document/upload`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${this.getTestToken(this.testStudents[0].id)}`
                }
            });

            if (uploadResponse.data.success) {
                this.logSuccess('Document upload queued successfully');
                console.log('   📄 Job ID:', uploadResponse.data.jobId);
                console.log('   📋 Document Type:', uploadResponse.data.documentType);

                // Monitor document processing
                await this.monitorDocumentProcessing(uploadResponse.data.jobId);
            } else {
                this.logError('Document upload failed', uploadResponse.data);
            }

            // Clean up test file
            fs.unlinkSync(testFilePath);
        } catch (error) {
            this.logError('Document upload queue test failed', error.message);
        }
    }

    async monitorDocumentProcessing(jobId) {
        console.log('   🔄 Monitoring document processing...');

        let attempts = 0;
        const maxAttempts = 20; // 20 seconds timeout

        while (attempts < maxAttempts) {
            try {
                const statusResponse = await axios.get(`${this.baseURL}/api/redis/document/status/${jobId}`, {
                    headers: {
                        'Authorization': `Bearer ${this.getTestToken(this.testStudents[0].id)}`
                    }
                });

                if (statusResponse.data.success) {
                    const status = statusResponse.data.data;
                    console.log(`   📊 Document Status: ${JSON.stringify(status, null, 2)}`);

                    if (status.status === 'completed' || status.status === 'failed') {
                        this.logSuccess('Document processing completed');
                        break;
                    }
                }

                await this.sleep(1000); // Wait 1 second
                attempts++;
            } catch (error) {
                console.log('   ⚠️  Error checking document status:', error.message);
                attempts++;
            }
        }

        if (attempts >= maxAttempts) {
            this.logError('Document processing monitoring timed out');
        }
    }

    async testRealTimeUpdates() {
        console.log('\n6️⃣ Testing Real-time Updates...');

        try {
            // Test Redis stats
            const statsResponse = await axios.get(`${this.baseURL}/api/test/redis-stats`);

            if (statsResponse.data.success) {
                this.logSuccess('Redis stats retrieved successfully');
                console.log('   📊 Queue Stats:', JSON.stringify(statsResponse.data.data.queues, null, 2));
                console.log('   🔗 Redis Health:', statsResponse.data.data.redis.status);
            } else {
                this.logError('Failed to get Redis stats', statsResponse.data);
            }
        } catch (error) {
            this.logError('Real-time updates test failed', error.message);
        }
    }

    async testErrorHandling() {
        console.log('\n7️⃣ Testing Error Handling and Recovery...');

        try {
            // Test invalid submission
            const invalidData = {
                personalDetails: {
                    fullName: '' // Invalid: empty name
                }
            };

            const response = await axios.post(`${this.baseURL}/api/redis/application/create`, invalidData, {
                headers: {
                    'Authorization': `Bearer ${this.getTestToken(this.testStudents[0].id)}`
                }
            });

            if (response.data.success === false) {
                this.logSuccess('Error handling working correctly');
                console.log('   ❌ Expected error:', response.data.message);
            } else {
                this.logError('Error handling not working', 'Should have rejected invalid data');
            }
        } catch (error) {
            if (error.response && error.response.status >= 400) {
                this.logSuccess('Error handling working correctly');
                console.log('   ❌ Expected error:', error.response.data.message);
            } else {
                this.logError('Unexpected error in error handling test', error.message);
            }
        }
    }

    async testPerformanceUnderLoad() {
        console.log('\n8️⃣ Testing Performance Under Load...');

        try {
            const startTime = Date.now();
            const promises = [];

            // Create multiple applications simultaneously
            for (let i = 0; i < 5; i++) {
                const student = this.testStudents[i % this.testStudents.length];
                const promise = this.createTestApplication(student.id);
                promises.push(promise);
            }

            const results = await Promise.allSettled(promises);
            const endTime = Date.now();
            const duration = endTime - startTime;

            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            this.logSuccess(`Performance test completed in ${duration}ms`);
            console.log(`   ✅ Successful: ${successful}`);
            console.log(`   ❌ Failed: ${failed}`);
            console.log(`   ⏱️  Average time per request: ${duration / promises.length}ms`);
        } catch (error) {
            this.logError('Performance test failed', error.message);
        }
    }

    async createTestApplication(userId) {
        const response = await axios.post(`${this.baseURL}/api/test/create-dummy-application`, {
            userId
        });
        return response.data;
    }

    async testCleanup() {
        console.log('\n9️⃣ Testing Cleanup...');

        try {
            const response = await axios.post(`${this.baseURL}/api/test/cleanup`);

            if (response.data.success) {
                this.logSuccess('Test data cleaned up successfully');
                console.log('   🧹 Cleaned up test students and applications');
                console.log('   🧹 Cleaned up Redis test data');
            } else {
                this.logError('Cleanup failed', response.data);
            }
        } catch (error) {
            this.logError('Cleanup test failed', error.message);
        }
    }

    getTestToken(userId) {
        // In a real implementation, you would generate a proper JWT token
        // For testing purposes, we'll use a simple base64 encoded string
        return Buffer.from(`test:${userId}:${Date.now()}`).toString('base64');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    logSuccess(message) {
        console.log(`   ✅ ${message}`);
        this.testResults.push({ test: message, status: 'PASS' });
    }

    logError(message, details = '') {
        console.log(`   ❌ ${message}`);
        if (details) {
            console.log(`      Details: ${details}`);
        }
        this.testResults.push({ test: message, status: 'FAIL', details });
    }

    printTestResults() {
        console.log('\n📊 Test Results Summary:');
        console.log('========================');

        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const total = this.testResults.length;

        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(r => r.status === 'FAIL')
                .forEach(result => {
                    console.log(`   - ${result.test}`);
                    if (result.details) {
                        console.log(`     ${result.details}`);
                    }
                });
        }

        console.log('\n🎉 Redis System Testing Complete!');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new RedisSystemTester();
    tester.runAllTests().catch(console.error);
}

module.exports = RedisSystemTester;
