const fs = require('fs');
const content = fs.readFileSync('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/SuperAdminDashboard.jsx', 'utf8');

const lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes('showEditModal && selectedStudent && ('));
for (let i = startIdx; i < Math.min(startIdx + 1000, lines.length); i++) {
    const line = lines[i];
    // Finding all values that are not string literals or standard primitives
    if (line.match(/value=\{[^\}]+\}/) && !line.includes('e.target.value')) {
        // Just print the line to see what values are bound to inputs
        // console.log(`Line ${i+1}: ${line.trim()}`);
    }
}
