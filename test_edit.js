const fs = require('fs');

const content = fs.readFileSync('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/SuperAdminDashboard.jsx', 'utf8');

// Find showEditModal rendering
const startIdx = content.indexOf('showEditModal && selectedStudent');
if (startIdx === -1) { console.log('Not found'); process.exit(1); }

// Find end of modal
let endIdx = startIdx;
let braces = 0;
for (let i = startIdx; i < content.length; i++) {
    if (content[i] === '(') braces++;
    if (content[i] === ')') {
        braces--;
        if (braces === 0) {
            endIdx = i;
            break;
        }
    }
}

const modalContent = content.slice(startIdx, endIdx);

// Let's find any object access that is NOT editData or selectedStudent, 
// or any unguarded .map() or anything that could throw a TypeError during render.

console.log("Modal length:", modalContent.length);

const lines = modalContent.split('\n');
lines.forEach((line, idx) => {
    // Things that throw during render:
    // 1. undefined.someProperty
    // 2. undefined.map()
    // 3. Object as a React child
    
    // Check for map
    if (line.includes('.map(') && !line.includes('?.map(')) {
        console.log(`Line ${idx}: ${line.trim()}`);
    }
});
