const fs = require('fs');

function checkFile(file) {
    const content = fs.readFileSync(file, 'utf8');
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
        // Look for typeof X === 'object' ? X._id : X
        if (line.includes("typeof") && line.includes("object")) {
            console.log(`[${file.split('/').pop()}] Line ${startIdx + idx + 1}: ${line.trim()}`);
        }
    });
}

checkFile('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/SuperAdminDashboard.jsx');
checkFile('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/components/StudentTable.jsx');
checkFile('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/admin/StudentManagement.jsx');
