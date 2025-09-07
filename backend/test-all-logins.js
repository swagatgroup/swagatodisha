const axios = require('axios');

const testCredentials = [
    { role: 'Student', email: 'student@example.com', password: 'Password123!' },
    { role: 'Agent', email: 'agent@example.com', password: 'Password123!' },
    { role: 'Staff', email: 'staff@example.com', password: 'Password123!' },
    { role: 'Admin', email: 'admin@example.com', password: 'Password123!' }
];

async function testAllLogins() {
    console.log('🧪 Testing all user logins...\n');

    for (const cred of testCredentials) {
        try {
            console.log(`Testing ${cred.role} login...`);

            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email: cred.email,
                password: cred.password
            });

            console.log(`✅ ${cred.role} login successful!`);
            console.log(`   Email: ${cred.email}`);
            console.log(`   Role: ${response.data.user.role}`);
            console.log(`   Full Name: ${response.data.user.fullName}`);
            console.log(`   Token: ${response.data.token.substring(0, 50)}...`);
            console.log('');

        } catch (error) {
            console.log(`❌ ${cred.role} login failed:`);
            console.log(`   Status: ${error.response?.status}`);
            console.log(`   Message: ${error.response?.data?.message}`);
            console.log('');
        }
    }

    console.log('🎉 Login testing completed!');
}

testAllLogins();
