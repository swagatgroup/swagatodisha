const fs = require('fs');
const file = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/DashboardLayout.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace Swagat_Logo.png with Swagat_Favicon.png
content = content.replace(/src="\/Swagat_Logo\.png"/, 'src="/Swagat_Favicon.png"');
content = content.replace(/className="h-10 w-auto dark:brightness-0 dark:invert"/, 'className="h-10 w-10 object-contain dark:brightness-0 dark:invert"');

fs.writeFileSync(file, content);
console.log("Fixed DashboardLayout.jsx");
