const fs = require('fs');
const file = 'frontend/src/components/dashboard/tabs/StudentApplications.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/bg-yellow-100 text-yellow-800/g, 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200');
content = content.replace(/bg-green-100 text-green-800/g, 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200');
content = content.replace(/bg-red-100 text-red-800/g, 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200');
content = content.replace(/bg-gray-100 text-gray-800/g, 'bg-gray-100 dark:bg-gray-800/60 text-gray-800 dark:text-gray-200');

fs.writeFileSync(file, content);
