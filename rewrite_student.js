const fs = require('fs');
const path = require('path');

const filePath = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/StudentDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace rainbow colors with purple aesthetic
content = content.replace(/bg-blue-100/g, 'bg-[#EDE0F7] dark:bg-[#7B3FA0]/20');
content = content.replace(/text-blue-600/g, 'text-[#7B3FA0] dark:text-[#A855D0]');
content = content.replace(/bg-yellow-100/g, 'bg-[#EDE0F7] dark:bg-[#7B3FA0]/20');
content = content.replace(/text-yellow-600/g, 'text-[#7B3FA0] dark:text-[#A855D0]');
content = content.replace(/bg-teal-100/g, 'bg-[#EDE0F7] dark:bg-[#7B3FA0]/20');
content = content.replace(/text-teal-600/g, 'text-[#7B3FA0] dark:text-[#A855D0]');
content = content.replace(/border-indigo-200/g, 'border-[#7B3FA0]/30');
content = content.replace(/border-indigo-700\/50/g, 'border-white/10');
content = content.replace(/text-indigo-800/g, 'text-[#5C2D80]');
content = content.replace(/text-indigo-300/g, 'text-[#A855D0]');
content = content.replace(/text-teal-800/g, 'text-[#5C2D80]');
content = content.replace(/text-yellow-800/g, 'text-[#5C2D80]');

fs.writeFileSync(filePath, content, 'utf8');
