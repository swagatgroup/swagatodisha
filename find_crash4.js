const fs = require('fs');

function checkFile(file) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    console.log(`\nChecking ${file.split('/').pop()}...`);
    
    const modalStartIdx = lines.findIndex(l => l.includes('showEditModal && selectedStudent && ('));
    if (modalStartIdx === -1) return;
    
    for (let i = modalStartIdx; i < Math.min(modalStartIdx + 1000, lines.length); i++) {
        const line = lines[i];
        
        // Find any editData access
        const edMatches = line.match(/editData\.[a-zA-Z0-9_\.]+/g);
        if (edMatches) {
            for (const match of edMatches) {
                // Ignore safe access
                if (match.includes('?.')) continue;
                console.log(`Line ${i+1}: ${match}`);
            }
        }
    }
}

checkFile('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/admin/StudentManagement.jsx');
checkFile('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/components/StudentTable.jsx');
