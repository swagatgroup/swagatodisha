// Look closely at the crash error again.
// The user said: "I guess it is due to the complete option not being present there, because you can see in the nearby list there are all the options, but the complete option is not there."
// The nearby list the user is talking about could be a status array being mapped over!
// 
// Let's check `SuperAdminDashboard.jsx` for status maps or anything related to 'complete'.

const fs = require('fs');
const content = fs.readFileSync('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/SuperAdminDashboard.jsx', 'utf8');

// Search for status mappings or arrays
const lines = content.split('\n');
lines.forEach((line, idx) => {
    if (line.includes('statusOptions') || line.includes('statuses') || line.includes('statusList') || line.includes('statusColors') || line.includes('map(')) {
        if (line.includes('status') && line.includes('map')) {
            console.log(`Line ${idx+1}: ${line.trim()}`);
        }
    }
});
