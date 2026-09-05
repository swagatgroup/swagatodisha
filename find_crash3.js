const fs = require('fs');

function checkFile(file) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    console.log(`\nChecking ${file.split('/').pop()}...`);
    
    const modalStartIdx = lines.findIndex(l => l.includes('showEditModal && selectedStudent && ('));
    if (modalStartIdx === -1) {
        console.log("Could not find showEditModal block");
        return;
    }
    
    for (let i = modalStartIdx; i < Math.min(modalStartIdx + 1000, lines.length); i++) {
        const line = lines[i];
        
        // Find selectedStudent accesses
        const ssMatches = line.match(/selectedStudent\.[a-zA-Z0-9_]+/g);
        if (ssMatches) {
            for (const match of ssMatches) {
                // If it's accessing a nested property without optional chaining, log it
                const nestedMatch = line.match(new RegExp(match + '\\.[a-zA-Z0-9_]+', 'g'));
                if (nestedMatch) {
                    for (const nm of nestedMatch) {
                        if (!nm.includes('?.')) {
                            console.log(`Line ${i+1}: Potentially unsafe access: ${nm} -> ${line.trim()}`);
                        }
                    }
                }
            }
        }
    }
}

checkFile('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/admin/StudentManagement.jsx');
checkFile('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/components/StudentTable.jsx');
