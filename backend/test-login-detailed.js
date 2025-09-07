const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function testLoginDetailed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find the admin user
        const adminUser = await User.findOne({ email: 'admin@example.com' }).select('+password');
        console.log('Admin user found:', adminUser ? 'YES' : 'NO');

        if (adminUser) {
            console.log('User details:');
            console.log('- Email:', adminUser.email);
            console.log('- Role:', adminUser.role);
            console.log('- Active:', adminUser.isActive);
            console.log('- Password hash present:', adminUser.password ? 'YES' : 'NO');

            // Test password comparison
            const testPassword = 'Password123!';
            const isPasswordValid = await adminUser.comparePassword(testPassword);
            console.log('Password validation result:', isPasswordValid);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

testLoginDetailed();
