const fs = require('fs');

function checkFile(file) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    console.log(`\nChecking ${file.split('/').pop()}...`);
    
    // Look for showEditModal block
    const modalStartIdx = lines.findIndex(l => l.includes('showEditModal && selectedStudent && ('));
    if (modalStartIdx === -1) {
        console.log("Could not find showEditModal block");
        return;
    }
    
    for (let i = modalStartIdx; i < Math.min(modalStartIdx + 1000, lines.length); i++) {
        const line = lines[i];
        const editDataMatches = line.match(/editData\.[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+/g);
        if (editDataMatches) {
            for (const match of editDataMatches) {
                if (!match.includes('?.')) {
                    console.log(`Line ${i+1}: Potentially unsafe access: ${match} -> ${line.trim()}`);
                }
            }
        }
    }
}

checkFile('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/components/StudentTable.jsx');
