// The async onClick at line 2053 in StudentManagement doesn't have a top-level try/catch
// Any thrown error will be an unhandled promise rejection caught by ErrorBoundary
// Let me check - lines 2053-2170 -- what is the try/catch at line 2059?
const fs = require('fs');
const content = fs.readFileSync('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/admin/StudentManagement.jsx', 'utf8');
const lines = content.split('\n');

// Find the async onClick at line 2053 (0-indexed: 2052)
// Then look for its wrapping try/catch
let depth = 0;
let inAsyncOnClick = false;
let tryCatchDepths = [];
for (let i = 2052; i < 2175; i++) {
    const line = lines[i];
    if (line.includes('{')) depth += (line.match(/{/g)||[]).length;
    if (line.includes('}')) depth -= (line.match(/}/g)||[]).length;
    
    if (i === 2052) console.log(`Starting depth: ${depth}`);
    if (line.trim().startsWith('try {')) tryCatchDepths.push({line: i+1, depth});
    if (line.trim().startsWith('} catch')) tryCatchDepths.push({line: i+1, depth, isCatch: true});
    if (i < 2065) console.log(`Line ${i+1} (depth=${depth}): ${line.trim()}`);
}

console.log('try/catch blocks in range:', tryCatchDepths);
