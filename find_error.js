// Find which edit flow is triggering ErrorBoundary. The screenshot shows the
// "Something went wrong" page from ErrorBoundary.jsx. Since the error isn't
// shown in console (prod mode), we need to upgrade ErrorBoundary to log better.
// First - check what wraps the student table  

const fs = require('fs');

// Check if StudentManagement is wrapped in ErrorBoundary  
const superAdmin = fs.readFileSync('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/SuperAdminDashboard.jsx', 'utf8');

// Find 'students' case
const idx = superAdmin.indexOf("case 'students':");
console.log("students case context:");
console.log(superAdmin.slice(idx, idx + 300));
