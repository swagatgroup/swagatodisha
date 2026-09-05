// The async onClick has no top-level try/catch. If api.get('/api/colleges/public') throws,
// it crashes the React tree. Let me find the end of this onClick callback
const fs = require('fs');
const content = fs.readFileSync('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/admin/StudentManagement.jsx', 'utf8');
const lines = content.split('\n');

// The async onClick at line 2053 opens with {
// We need to find where it closes
// Count brace depth starting from line 2053
let braceCount = 0;
let arrowFuncStart = 2052; // 0-indexed
let arrowFuncEnd = -1;

// The arrow function is: async () => { ... }
// starts after the opening brace on line 2053 
for (let i = arrowFuncStart; i < lines.length; i++) {
    const line = lines[i];
    for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') {
            braceCount--;
            if (braceCount === 0 && i > arrowFuncStart) {
                arrowFuncEnd = i;
                break;
            }
        }
    }
    if (arrowFuncEnd !== -1) break;
}

console.log(`Arrow function starts at line ${arrowFuncStart + 1}, ends at line ${arrowFuncEnd + 1}`);
console.log('Last 5 lines of async function:');
for (let i = arrowFuncEnd - 4; i <= arrowFuncEnd + 2; i++) {
    console.log(`Line ${i+1}: ${lines[i]}`);
}
