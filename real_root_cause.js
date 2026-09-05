// KEY INSIGHT: The ErrorBoundary wraps StudentManagement.
// When edit button is clicked, the entire StudentManagement re-renders.
// The crash happens DURING THE RENDER, not in the event handler.
// 
// Let me look at whether studentTableFilter passed as initialFilter could cause issues
// when studentTableFilter is set to something like 'COMPLETE' which might not be 
// a valid value expected by the component.
//
// Actually - let me check the filter/statusFilter usage in the JSX
// Let me focus on what initialFilter does

const fs = require('fs');
const content = fs.readFileSync('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/admin/StudentManagement.jsx', 'utf8');

// Check initialFilter usage
const idx = content.indexOf('initialFilter');
console.log("initialFilter usage:");
// Get 5 occurrences
let pos = 0;
for (let i = 0; i < 5; i++) {
    pos = content.indexOf('initialFilter', pos);
    if (pos === -1) break;
    const line = content.slice(content.lastIndexOf('\n', pos)+1, content.indexOf('\n', pos));
    const lineNum = content.slice(0, pos).split('\n').length;
    console.log(`Line ${lineNum}: ${line.trim()}`);
    pos += 1;
}
