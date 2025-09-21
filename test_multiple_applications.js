// Test script to verify multiple applications work for agents and staff
// Run this in the browser console after logging in as an agent or staff

const testMultipleApplications = async () => {
    console.log('🧪 Testing Multiple Applications for Agents/Staff...');

    // Test data for different students
    const testStudents = [
        {
            personalDetails: {
                fullName: 'Test Student 1',
                fathersName: 'Father 1',
                mothersName: 'Mother 1',
                dateOfBirth: '2000-01-01',
                gender: 'Male',
                aadharNumber: '123456789012'
            },
            contactDetails: {
                primaryPhone: '9876543210',
                email: 'student1@test.com',
                permanentAddress: {
                    street: 'Test Street 1',
                    city: 'Test City',
                    state: 'Test State',
                    pincode: '123456'
                }
            },
            courseDetails: {
                courseName: 'Test Course 1',
                courseDuration: '1 Year',
                courseFee: 50000
            }
        },
        {
            personalDetails: {
                fullName: 'Test Student 2',
                fathersName: 'Father 2',
                mothersName: 'Mother 2',
                dateOfBirth: '2001-02-02',
                gender: 'Female',
                aadharNumber: '123456789013'
            },
            contactDetails: {
                primaryPhone: '9876543211',
                email: 'student2@test.com',
                permanentAddress: {
                    street: 'Test Street 2',
                    city: 'Test City',
                    state: 'Test State',
                    pincode: '123456'
                }
            },
            courseDetails: {
                courseName: 'Test Course 2',
                courseDuration: '2 Years',
                courseFee: 75000
            }
        }
    ];

    try {
        // Test 1: Create first student and application
        console.log('📝 Creating first student...');
        const student1Response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullName: testStudents[0].personalDetails.fullName,
                email: testStudents[0].contactDetails.email,
                phoneNumber: testStudents[0].contactDetails.primaryPhone,
                password: 'TestPassword123!',
                role: 'student'
            })
        });

        const student1Data = await student1Response.json();
        console.log('Student 1 created:', student1Data);

        if (!student1Data.success) {
            console.log('❌ Failed to create student 1:', student1Data.message);
            return;
        }

        // Test 2: Create second student and application
        console.log('📝 Creating second student...');
        const student2Response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullName: testStudents[1].personalDetails.fullName,
                email: testStudents[1].contactDetails.email,
                phoneNumber: testStudents[1].contactDetails.primaryPhone,
                password: 'TestPassword123!',
                role: 'student'
            })
        });

        const student2Data = await student2Response.json();
        console.log('Student 2 created:', student2Data);

        if (!student2Data.success) {
            console.log('❌ Failed to create student 2:', student2Data.message);
            return;
        }

        // Test 3: Submit application for student 1 (as agent/staff)
        console.log('📋 Submitting application for student 1...');
        const application1Response = await fetch('/api/application/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                ...testStudents[0],
                termsAccepted: true
            })
        });

        const application1Data = await application1Response.json();
        console.log('Application 1 submitted:', application1Data);

        if (!application1Data.success) {
            console.log('❌ Failed to submit application 1:', application1Data.message);
            return;
        }

        // Test 4: Submit application for student 2 (as agent/staff)
        console.log('📋 Submitting application for student 2...');
        const application2Response = await fetch('/api/application/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                ...testStudents[1],
                termsAccepted: true
            })
        });

        const application2Data = await application2Response.json();
        console.log('Application 2 submitted:', application2Data);

        if (!application2Data.success) {
            console.log('❌ Failed to submit application 2:', application2Data.message);
            return;
        }

        // Test 5: Check submitted applications
        console.log('📊 Checking submitted applications...');
        const applicationsResponse = await fetch('/api/agents/my-submitted-applications', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const applicationsData = await applicationsResponse.json();
        console.log('Submitted applications:', applicationsData);

        if (applicationsData.success && applicationsData.data.applications.length >= 2) {
            console.log('✅ SUCCESS: Multiple applications submitted successfully!');
            console.log(`📈 Total applications: ${applicationsData.data.applications.length}`);
        } else {
            console.log('❌ FAILED: Expected 2 applications, got:', applicationsData.data?.applications?.length || 0);
        }

        // Test 6: Check referral info
        console.log('🔗 Checking referral information...');
        const referralResponse = await fetch('/api/agents/referral-info', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const referralData = await referralResponse.json();
        console.log('Referral info:', referralData);

        if (referralData.success) {
            console.log('✅ SUCCESS: Referral system working!');
            console.log(`🔗 Referral code: ${referralData.data.agent.referralCode}`);
            console.log(`📊 Total referrals: ${referralData.data.stats.totalReferrals}`);
        } else {
            console.log('❌ FAILED: Could not get referral information');
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
};

// Run the test
testMultipleApplications();
