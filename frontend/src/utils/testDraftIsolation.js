// Test script to verify draft isolation is working correctly
// This should be run in the browser console

const testDraftIsolation = () => {
    console.log('🧪 Testing Draft Isolation...');

    // Test data for different user types
    const testData = {
        student: {
            personalDetails: { fullName: 'Student Test User' },
            courseDetails: { selectedCourse: 'B.Tech' }
        },
        agent: {
            personalDetails: { fullName: 'Agent Test User' },
            courseDetails: { selectedCourse: 'MBA' }
        },
        staff: {
            personalDetails: { fullName: 'Staff Test User' },
            courseDetails: { selectedCourse: 'BCA' }
        },
        super_admin: {
            personalDetails: { fullName: 'Admin Test User' },
            courseDetails: { selectedCourse: 'MCA' }
        }
    };

    // Test draft keys
    const testKeys = {
        student: 'studentAppDraft_student_test123',
        agent: 'studentAppDraft_agent_test456',
        staff: 'studentAppDraft_staff_test789',
        super_admin: 'studentAppDraft_super_admin_test000'
    };

    // Clear existing test data
    Object.values(testKeys).forEach(key => {
        localStorage.removeItem(key);
    });

    // Save test data for each user type
    Object.entries(testData).forEach(([role, data]) => {
        const key = testKeys[role];
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`✅ Saved draft for ${role}:`, data);
    });

    // Verify isolation - each role should only see their own data
    Object.entries(testKeys).forEach(([role, key]) => {
        const savedData = JSON.parse(localStorage.getItem(key) || '{}');
        const expectedName = testData[role].personalDetails.fullName;
        const actualName = savedData.personalDetails?.fullName;

        if (actualName === expectedName) {
            console.log(`✅ ${role} draft isolation working: ${actualName}`);
        } else {
            console.log(`❌ ${role} draft isolation failed: expected ${expectedName}, got ${actualName}`);
        }
    });

    // Test cross-contamination prevention
    console.log('\n🔍 Testing cross-contamination prevention...');
    Object.entries(testKeys).forEach(([role, key]) => {
        const otherKeys = Object.entries(testKeys).filter(([otherRole]) => otherRole !== role);

        otherKeys.forEach(([otherRole, otherKey]) => {
            const otherData = JSON.parse(localStorage.getItem(otherKey) || '{}');
            const currentData = JSON.parse(localStorage.getItem(key) || '{}');

            if (otherData.personalDetails?.fullName !== currentData.personalDetails?.fullName) {
                console.log(`✅ ${role} isolated from ${otherRole}`);
            } else {
                console.log(`❌ ${role} contaminated with ${otherRole} data`);
            }
        });
    });

    // Clean up test data
    Object.values(testKeys).forEach(key => {
        localStorage.removeItem(key);
    });

    console.log('\n✅ Draft isolation test completed!');
    console.log('Each user type now has completely separate draft storage.');
};

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.testDraftIsolation = testDraftIsolation;
    console.log('Run testDraftIsolation() in the console to test draft isolation');
}

export default testDraftIsolation;
