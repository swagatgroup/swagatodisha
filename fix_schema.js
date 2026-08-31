const fs = require('fs');
const path = '/home/chanchal/Desktop/Swagat Odisha/backend/models/WebsiteContent.js';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('approvalsRecognitions:')) {
    const replacement = `
    // Payment Settings
    paymentSettings: {
        qrCodeImage: {
            type: String,
            default: ''
        }
    },

    // Approvals & Recognitions
    approvalsRecognitions: [{
        name: String, // University Name
        order: Number,
        isActive: {
            type: Boolean,
            default: true
        },
        approvals: [{
            name: String,
            logo: String,
            pdf: String
        }]
    }],
`;
    content = content.replace(/\s*\/\/\s*Payment Settings[\s\S]*?paymentSettings:\s*\{[\s\S]*?\},/, replacement);
    fs.writeFileSync(path, content, 'utf8');
}
