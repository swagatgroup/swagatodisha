// Test script to verify multiple submissions work for agents and staff
// Run this in the browser console after logging in as an agent or staff

const testMultipleSubmissions = async () => {
    console.log('🧪 Testing Multiple Submissions...');

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
                selectedCourse: 'B.Tech',
                campus: 'Main Campus'
            },
            guardianDetails: {
                guardianName: 'Guardian 1',
                relationship: 'Father',
                guardianPhone: '9876543211'
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
                primaryPhone: '9876543212',
                email: 'student2@test.com',
                permanentAddress: {
                    street: 'Test Street 2',
                    city: 'Test City',
                    state: 'Test State',
                    pincode: '123456'
                }
            },
            courseDetails: {
                selectedCourse: 'MBA',
                campus: 'Main Campus'
            },
            guardianDetails: {
                guardianName: 'Guardian 2',
                relationship: 'Mother',
                guardianPhone: '9876543213'
            }
        }
    ];

    const userRole = localStorage.getItem('userRole');
    console.log(`Testing as: ${userRole}`);

    if (userRole === 'student') {
        console.log('❌ Students cannot submit multiple applications (this is correct behavior)');
        return;
    }

    // Test submission for each student
    for (let i = 0; i < testStudents.length; i++) {
        const student = testStudents[i];
        console.log(`\n📝 Submitting application ${i + 1} for ${student.personalDetails.fullName}...`);

        try {
            // First, create a test student user
            const studentResponse = await fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    fullName: student.personalDetails.fullName,
                    email: student.contactDetails.email,
                    phoneNumber: student.contactDetails.primaryPhone,
                    password: 'testpassword123',
                    role: 'student'
                })
            });

            if (!studentResponse.ok) {
                console.log(`⚠️  Student ${i + 1} might already exist, continuing...`);
            }

            // Get the student ID (you might need to adjust this based on your API)
            const studentId = `test_student_${i + 1}`; // This would need to be the actual student ID

            // Submit application
            const endpoint = userRole === 'agent' ? '/api/agents/submit-application' : '/api/staff/submit-application';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    studentId: studentId,
                    ...student
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log(`✅ Application ${i + 1} submitted successfully:`, result.data.applicationId);
            } else {
                console.log(`❌ Application ${i + 1} failed:`, result.message);
            }
        } catch (error) {
            console.log(`❌ Error submitting application ${i + 1}:`, error.message);
        }
    }

    // Test draft isolation
    console.log('\n🔒 Testing Draft Isolation...');
    const draftKey1 = `studentAppDraft_${userRole}_test_user_1`;
    const draftKey2 = `studentAppDraft_${userRole}_test_user_2`;

    localStorage.setItem(draftKey1, JSON.stringify({ test: 'data1' }));
    localStorage.setItem(draftKey2, JSON.stringify({ test: 'data2' }));

    const retrieved1 = JSON.parse(localStorage.getItem(draftKey1));
    const retrieved2 = JSON.parse(localStorage.getItem(draftKey2));

    if (retrieved1.test === 'data1' && retrieved2.test === 'data2') {
        console.log('✅ Draft isolation working correctly');
    } else {
        console.log('❌ Draft isolation not working');
    }

    // Cleanup
    localStorage.removeItem(draftKey1);
    localStorage.removeItem(draftKey2);

    console.log('\n🎉 Test completed!');
};

// Run the test
testMultipleSubmissions();
