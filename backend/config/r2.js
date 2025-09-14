const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = [
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
    'R2_ENDPOINT'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

// Create R2 S3Client
const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

// Test R2 connection on startup
const testR2Connection = async () => {
    try {
        const { HeadBucketCommand } = require('@aws-sdk/client-s3');
        const command = new HeadBucketCommand({ Bucket: process.env.R2_BUCKET_NAME });
        await r2Client.send(command);
        console.log('✅ Cloudflare R2 Connected Successfully');
        return true;
    } catch (error) {
        console.error('❌ Cloudflare R2 connection failed:', error.message);
        return false;
    }
};

// Export both client and test function
module.exports = {
    r2Client,
    testR2Connection
};
