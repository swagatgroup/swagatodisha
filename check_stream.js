const fs = require('fs');

const content = fs.readFileSync('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/SuperAdminDashboard.jsx', 'utf8');
const lines = content.split('\n');

// React error #31 = "Objects are not valid as a React child"
// The object has keys: name, price, isPaidOnly
// This means somewhere we're rendering a stream/course object directly

// Search for pattern like {stream} or {course} being rendered directly
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('{stream}') || line.includes('{course}') || line.includes('{campus}')) {
        console.log(`Line ${i+1}: ${line.trim()}`);
    }
}
