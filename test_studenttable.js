const fs = require('fs');
const content = fs.readFileSync('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/components/StudentTable.jsx', 'utf8');

const lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes('showEditModal && selectedStudent && ('));
for (let i = startIdx; i < Math.min(startIdx + 1000, lines.length); i++) {
    const line = lines[i];
    if (line.includes('{') && line.includes('}')) {
        // Find expressions inside {}
        const matches = line.match(/\{([^\{\}]*)\}/g);
        if (matches) {
            matches.forEach(m => {
                if (m.includes('selectedStudent') && !m.includes('?.') && !m.includes('editData')) {
                    // Check if it has && or || or ?
                    if (!m.match(/&&|\|\||\?/)) {
                        console.log(`Line ${i+1}: ${m}`);
                    }
                }
            });
        }
    }
}
