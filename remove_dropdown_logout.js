const fs = require('fs');
const file = 'frontend/src/components/dashboard/DashboardLayout.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\{\/\* Fresh, simple, no-BS Logout Button \*\/\}\s*<button[\s\S]*?Sign Out\s*<\/button>/;
content = content.replace(regex, '');

fs.writeFileSync(file, content);
