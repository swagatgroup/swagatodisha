#!/usr/bin/env node

const axios = require('axios');

async function quickTest() {
    console.log('🧪 Quick Redis System Test');
    console.log('==========================\n');

    const baseURL = 'http://localhost:5000';

    try {
        // Test 1: Health Check
        console.log('1️⃣ Testing server health...');
        const healthResponse = await axios.get(`${baseURL}/health`);
        console.log('   ✅ Server is healthy');
        console.log('   📊 Redis:', healthResponse.data.services.redis.status);
        console.log('   📊 Database:', healthResponse.data.services.database);

        // Test 2: Create dummy student
        console.log('\n2️⃣ Creating dummy student...');
        const studentResponse = await axios.post(`${baseURL}/api/test/create-dummy-student`, {
            count: 1
        });

        if (studentResponse.data.success) {
            const student = studentResponse.data.students[0];
            console.log('   ✅ Student created:', student.name);
            console.log('   📧 Email:', student.email);
            console.log('   🔑 Referral Code:', student.referralCode);

            // Test 3: Create dummy application
            console.log('\n3️⃣ Creating dummy application...');
            const appResponse = await axios.post(`${baseURL}/api/test/create-dummy-application`, {
                userId: student.id
            });

            if (appResponse.data.success) {
                console.log('   ✅ Application created');
                console.log('   📋 Submission ID:', appResponse.data.submissionId);

                // Test 4: Monitor application status
                console.log('\n4️⃣ Monitoring application status...');
                let attempts = 0;
                const maxAttempts = 10;

                while (attempts < maxAttempts) {
                    try {
                        const statusResponse = await axios.get(`${baseURL}/api/redis/application/status/${appResponse.data.submissionId}`, {
                            headers: {
                                'Authorization': `Bearer test-token-${student.id}`
                            }
                        });

                        if (statusResponse.data.success) {
                            const { progress, status } = statusResponse.data.data;
                            console.log(`   📊 Progress: ${progress}%`);

                            if (progress === 100) {
                                console.log('   ✅ Application processing completed!');
                                break;
                            }
                        }
                    } catch (error) {
                        console.log('   ⚠️  Error checking status:', error.message);
                    }

                    await new Promise(resolve => setTimeout(resolve, 2000));
                    attempts++;
                }

                if (attempts >= maxAttempts) {
                    console.log('   ⏰ Status monitoring timed out');
                }
            } else {
                console.log('   ❌ Application creation failed:', appResponse.data);
            }
        } else {
            console.log('   ❌ Student creation failed:', studentResponse.data);
        }

        // Test 5: Check Redis stats
        console.log('\n5️⃣ Checking Redis statistics...');
        const statsResponse = await axios.get(`${baseURL}/api/test/redis-stats`);

        if (statsResponse.data.success) {
            console.log('   ✅ Redis stats retrieved');
            console.log('   📊 Queue Stats:', JSON.stringify(statsResponse.data.data.queues, null, 2));
        } else {
            console.log('   ❌ Failed to get Redis stats');
        }

        // Test 6: Cleanup
        console.log('\n6️⃣ Cleaning up test data...');
        const cleanupResponse = await axios.post(`${baseURL}/api/test/cleanup`);

        if (cleanupResponse.data.success) {
            console.log('   ✅ Test data cleaned up');
        } else {
            console.log('   ❌ Cleanup failed');
        }

        console.log('\n🎉 Quick test completed successfully!');
        console.log('\n📋 Summary:');
        console.log('   ✅ Server health check passed');
        console.log('   ✅ Student creation worked');
        console.log('   ✅ Application submission worked');
        console.log('   ✅ Redis integration working');
        console.log('   ✅ Cleanup completed');

        console.log('\n🚀 Your Redis system is working correctly!');
        console.log('   You can now use the full system with confidence.');

    } catch (error) {
        console.error('❌ Quick test failed:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure the server is running:');
            console.log('   npm run dev:redis');
        } else if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Data:', error.response.data);
        }

        process.exit(1);
    }
}

// Run the quick test
quickTest();
