const fs = require('fs');

function checkFile(file) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    console.log(`\nChecking ${file.split('/').pop()}...`);
    
    const modalStartIdx = lines.findIndex(l => l.includes('showEditModal && selectedStudent && ('));
    if (modalStartIdx === -1) return;
    
    // Find the end of the modal block
    let endIdx = modalStartIdx;
    let braces = 0;
    for (let i = modalStartIdx; i < lines.length; i++) {
        if (lines[i].includes('(')) braces += (lines[i].match(/\(/g)||[]).length;
        if (lines[i].includes(')')) braces -= (lines[i].match(/\)/g)||[]).length;
        if (braces === 0 && i > modalStartIdx) {
            endIdx = i;
            break;
        }
    }
    
    for (let i = modalStartIdx; i <= endIdx; i++) {
        const line = lines[i];
        if (line.includes('.map(') || line.includes('.filter(') || line.includes('.reduce(')) {
            console.log(`Line ${i+1}: ${line.trim()}`);
        }
    }
}

checkFile('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/admin/StudentManagement.jsx');
checkFile('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/components/StudentTable.jsx');
