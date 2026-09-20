const fs = require('fs');
const file = 'frontend/src/components/dashboard/tabs/StudentApplications.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix bg-white missing dark mode
content = content.replace(/className="bg-white rounded-lg/g, 'className="bg-white dark:bg-[#231A2E] rounded-lg');
content = content.replace(/className="bg-white overflow-hidden/g, 'className="bg-white dark:bg-[#231A2E] overflow-hidden');

// Fix gradients missing dark mode
content = content.replace(/from-purple-50 to-blue-50/g, 'from-purple-50 to-blue-50 dark:from-[#351458]/40 dark:to-[#1D4B5E]/40');

// Fix buttons missing dark mode backgrounds
content = content.replace(/bg-\[\#F0E6FA\]/g, 'bg-[#F0E6FA] dark:bg-[#351458]/80');
content = content.replace(/text-\[\#351458\] bg-\[\#F0E6FA\]/g, 'text-[#351458] dark:text-purple-100 bg-[#F0E6FA] dark:bg-[#351458]/80');
content = content.replace(/bg-blue-100/g, 'bg-blue-100 dark:bg-blue-900/40');
content = content.replace(/text-blue-800/g, 'text-blue-800 dark:text-blue-200');

fs.writeFileSync(file, content);
