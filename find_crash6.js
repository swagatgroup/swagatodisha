const fs = require('fs');
const content = fs.readFileSync('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/components/StudentTable.jsx', 'utf8');

// Use regex to find any {} interpolation in the Edit modal that might crash
const lines = content.split('\n');
const modalStartIdx = lines.findIndex(l => l.includes('showEditModal && selectedStudent && ('));
for (let i = modalStartIdx; i < Math.min(modalStartIdx + 1000, lines.length); i++) {
    const line = lines[i];
    
    // Check for variables that might be undefined and accessed
    // e.g., selectedStudent.personalDetails.fullName without ?.
    if (line.match(/selectedStudent\.[A-Za-z0-9_]+\.[A-Za-z0-9_]+(?!.*\?)/)) {
        if (!line.includes('?.') && !line.includes('selectedStudent.personalDetails')) {
            console.log(`Line ${i+1}: ${line.trim()}`);
        }
    }
}
