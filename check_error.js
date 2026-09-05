// Look for common crash patterns:
// 1. Calling .map() on undefined
// 2. Accessing .length on null
// 3. Any async function being called as onClick without proper error handling
const fs = require('fs');
const content = fs.readFileSync('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/admin/StudentManagement.jsx', 'utf8');

// Find lines where onClick uses async without try/catch visible
const lines = content.split('\n');
const asyncOnClicks = lines.reduce((acc, line, idx) => {
    if (line.includes('onClick') && line.includes('async')) {
        acc.push({ line: idx+1, content: line.trim() });
    }
    return acc;
}, []);

console.log('Async onClick patterns (potential unhandled errors):');
asyncOnClicks.forEach(item => console.log(`Line ${item.line}: ${item.content}`));
