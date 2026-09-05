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
    
    // Find end of modal block by brace matching or just scan the next few hundred lines
    for (let i = modalStartIdx; i < Math.min(modalStartIdx + 500, lines.length); i++) {
        const line = lines[i];
        
        // Find property accesses that might crash:
        // 1. Reading from nested objects without optional chaining (e.g., obj.field.subfield instead of obj.field?.subfield)
        // 2. .map or .length on things that might be undefined
        
        // Look for editData access
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

checkFile('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/SuperAdminDashboard.jsx');
checkFile('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/admin/StudentManagement.jsx');
