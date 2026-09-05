const fs = require('fs');

function findUnsafeAccess(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const startIdx = lines.findIndex(l => l.includes('showEditModal && selectedStudent && ('));
    if (startIdx === -1) return;
    
    let braces = 0;
    let endIdx = startIdx;
    for (let i = startIdx; i < lines.length; i++) {
        if (lines[i].includes('(')) braces += (lines[i].match(/\(/g)||[]).length;
        if (lines[i].includes(')')) braces -= (lines[i].match(/\)/g)||[]).length;
        if (braces === 0 && i > startIdx) {
            endIdx = i;
            break;
        }
    }

    const modalLines = lines.slice(startIdx, endIdx);
    modalLines.forEach((line, idx) => {
        // Look for editData properties access like editData.contactDetails.permanentAddress.city
        const matches = line.match(/editData\.[a-zA-Z0-9_\.]+/g);
        if (matches) {
            matches.forEach(m => {
                if (!m.includes('?.') && m.split('.').length > 2) {
                    console.log(`[${filePath.split('/').pop()}] Line ${startIdx + idx + 1}: ${m}`);
                }
            });
        }
    });
}

findUnsafeAccess('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/SuperAdminDashboard.jsx');
