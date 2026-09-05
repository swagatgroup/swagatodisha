// Actually, the real issue: This is caught by ErrorBoundary which is a CLASS component
// that catches errors thrown DURING RENDER, not in event handlers.
// Async event handlers can't be caught by ErrorBoundary.
// The "Something went wrong" must be thrown DURING RENDER of StudentManagement or its modals.
// 
// Let me check what's in the StudentManagement JSX that could crash during RENDER.
// Specifically - things accessed with .map() or .length without null checks.

const fs = require('fs');
const content = fs.readFileSync('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/admin/StudentManagement.jsx', 'utf8');
const lines = content.split('\n');

// Look for patterns that could crash during render
const dangerousPatterns = [];
lines.forEach((line, idx) => {
    // .map() on a value that could be undefined
    if (line.includes('.map(') && !line.includes('?.map(') && !line.includes('|| []').map) {
        const varMatch = line.match(/(\w+)\.map\(/);
        if (varMatch) {
            dangerousPatterns.push({line: idx+1, pattern: 'unguarded .map()', content: line.trim(), var: varMatch[1]});
        }
    }
});

// Filter for JSX context (not inside function bodies)
console.log(`Found ${dangerousPatterns.length} potential unsafe .map() calls`);
dangerousPatterns.slice(0, 20).forEach(p => console.log(`Line ${p.line}: ${p.content}`));
