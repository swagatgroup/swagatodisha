const fs = require('fs');
const path = require('path');

const filePath = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/StaffDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// The banner
content = content.replace(/from-green-600 to-blue-600/g, 'from-[#7B3FA0] to-[#5C2D80]');
content = content.replace(/text-green-100/g, 'text-purple-100');

// Input focus rings
content = content.replace(/ring-green-500/g, 'ring-[#7B3FA0]');

// Spinner
content = content.replace(/border-green-600/g, 'border-[#7B3FA0]');

// Buttons & Actions (but be careful not to overwrite the "approve" button semantic color)
// I will just change the banner and rings and general UI.

fs.writeFileSync(filePath, content, 'utf8');
