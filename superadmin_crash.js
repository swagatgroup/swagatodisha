const fs = require('fs');

const content = fs.readFileSync('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/SuperAdminDashboard.jsx', 'utf8');
const lines = content.split('\n');

const startIdx = lines.findIndex(l => l.includes('showEditModal && selectedStudent && ('));
const endIdx = lines.length; // Just search till end for now

for (let i = startIdx; i < startIdx + 500; i++) {
    const line = lines[i];
    
    // Check for any access without ?.
    // Match any selectedStudent.X or editData.X that is NOT followed by ?.
    const matches = line.match(/(selectedStudent|editData)\.[a-zA-Z0-9_\.]+/g);
    if (matches) {
        matches.forEach(m => {
            if (!m.includes('?.')) {
                // If it's more than one level deep (e.g. editData.personalDetails.dateOfBirth)
                const parts = m.split('.');
                if (parts.length > 2) {
                    console.log(`Line ${i+1}: ${m}`);
                }
            }
        });
    }
}
