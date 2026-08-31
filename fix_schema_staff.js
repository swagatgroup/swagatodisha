const fs = require('fs');
const path = '/home/chanchal/Desktop/Swagat Odisha/backend/models/WebsiteContent.js';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('staffProfiles:')) {
    const replacement = `
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

    // Staff Profiles
    staffProfiles: [{
        name: String,
        designation: String,
        image: String,
        order: Number,
        isActive: {
            type: Boolean,
            default: true
        }
    }],
`;
    content = content.replace(/\s*\/\/\s*Approvals & Recognitions[\s\S]*?approvalsRecognitions:\s*\[[\s\S]*?\}\]\n\s*\}\],/, replacement);
    fs.writeFileSync(path, content, 'utf8');
}
