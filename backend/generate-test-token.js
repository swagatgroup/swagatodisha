const jwt = require('jsonwebtoken');

// Generate a test JWT token for TestSprite
const generateTestToken = () => {
    // Use a temporary secret for testing
    const secret = 'test_secret_for_testsprite_123';

    const payload = {
        id: 'test_user_id',
        email: 'test@swagatodisha.com',
        role: 'admin'
    };

    const token = jwt.sign(payload, secret, { expiresIn: '24h' });

    console.log('🔑 Test JWT Token for TestSprite:');
    console.log('=====================================');
    console.log(token);
    console.log('=====================================');
    console.log('\n📋 Copy this token and paste it in TestSprite "Credential" field');
    console.log('⚠️  This is a TEST token - use only for testing!');

    return token;
};

generateTestToken();
