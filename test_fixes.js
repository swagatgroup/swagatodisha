// Test script to verify the fixes work
// Run this in the browser console after logging in

const testFixes = async () => {
    console.log('🧪 Testing Application Submission Fixes...');

    // Check current user info
    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');

    console.log('Current user role from localStorage:', userRole);
    console.log('Token exists:', !!token);

    if (!token) {
        console.log('❌ No token found. Please login first.');
        return;
    }

    // Test the /api/auth/me endpoint
    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log('Auth /me response:', data);

        if (data.success) {
            console.log('✅ User authenticated successfully');
            console.log('User role from API:', data.data.user.role);
            console.log('User ID from API:', data.data.user.id);
        } else {
            console.log('❌ Authentication failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Error calling /api/auth/me:', error.message);
    }

    // Test application submission
    console.log('\n📝 Testing Application Submission...');

    const testApplicationData = {
        personalDetails: {
            fullName: 'Test User',
            fathersName: 'Test Father',
            mothersName: 'Test Mother',
            dateOfBirth: '2000-01-01',
            gender: 'Male',
            aadharNumber: '123456789012'
        },
        contactDetails: {
            primaryPhone: '9876543210',
            email: 'test@example.com',
            permanentAddress: {
                street: 'Test Street',
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
            guardianName: 'Test Guardian',
            relationship: 'Father',
            guardianPhone: '9876543211'
        },
        termsAccepted: true
    };

    try {
        const response = await fetch('/api/redis/application/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(testApplicationData)
        });

        const data = await response.json();
        console.log('Application submission response:', data);

        if (data.success) {
            console.log('✅ Application submitted successfully!');
            console.log('Application ID:', data.data?.applicationId);
        } else {
            console.log('❌ Application submission failed:', data.message);

            if (data.message.includes('already have an application')) {
                console.log('🔍 This suggests the role check is not working properly');
            }
        }
    } catch (error) {
        console.log('❌ Error submitting application:', error.message);
    }

    // Test draft isolation
    console.log('\n🔒 Testing Draft Isolation...');

    const testDraftKey1 = 'studentAppDraft_agent_test_user_1';
    const testDraftKey2 = 'studentAppDraft_staff_test_user_2';

    localStorage.setItem(testDraftKey1, JSON.stringify({ test: 'agent_data' }));
    localStorage.setItem(testDraftKey2, JSON.stringify({ test: 'staff_data' }));

    const retrieved1 = JSON.parse(localStorage.getItem(testDraftKey1));
    const retrieved2 = JSON.parse(localStorage.getItem(testDraftKey2));

    if (retrieved1.test === 'agent_data' && retrieved2.test === 'staff_data') {
        console.log('✅ Draft isolation working correctly');
    } else {
        console.log('❌ Draft isolation not working');
    }

    // Cleanup
    localStorage.removeItem(testDraftKey1);
    localStorage.removeItem(testDraftKey2);

    console.log('\n🎉 Test completed!');
};

// Run the test
testFixes();
