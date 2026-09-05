const fs = require('fs');
const file = '/home/chanchal/Desktop/Swagat Odisha/backend/routes/auth.js';
let content = fs.readFileSync(file, 'utf8');

// Need to populate User with assignedStaff, Admin with assignedAgents
// And append them to userData
content = content.replace(
    `user = await User.findById(userId).select('-password');`,
    `user = await User.findById(userId).select('-password').populate('assignedStaff', 'firstName lastName email department');`
);

content = content.replace(
    `user = await Admin.findById(userId).select('-password');`,
    `user = await Admin.findById(userId).select('-password').populate('assignedAgents', 'fullName email phoneNumber referralCode');`
);

content = content.replace(
    `        // Prepare user data
        let userData = {
            id: user._id,
            email: user.email,
            phoneNumber: user.phoneNumber || '',
            role: user.role || 'user',
            referralCode: user.referralCode || undefined
        };`,
    `        // Prepare user data
        let userData = {
            id: user._id,
            email: user.email,
            phoneNumber: user.phoneNumber || '',
            role: user.role || 'user',
            referralCode: user.referralCode || undefined,
            assignedStaff: user.assignedStaff,
            assignedAgents: user.assignedAgents
        };`
);

fs.writeFileSync(file, content);
console.log("Updated auth.js getMe endpoint.");
