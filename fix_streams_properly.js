const fs = require('fs');

const filesToFix = [
    '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/SuperAdminDashboard.jsx',
    '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/components/StudentTable.jsx',
];

filesToFix.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix: getStreamsForCourse returns raw stream objects {name, price, isPaidOnly}
    // We need to extract just the name strings
    content = content.replace(
        /return selectedCourse\?\.streams \|\| \[\];/g,
        // Extract name from stream objects (they can be either strings or {name, price, isPaidOnly} objects)
        "return (selectedCourse?.streams || []).map(s => typeof s === 'object' ? s.name : s).filter(Boolean);"
    );

    fs.writeFileSync(filePath, content);
    console.log('Fixed getStreamsForCourse:', filePath.split('/').pop());
});

// Also fix StudentManagement.jsx
const smPath = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/admin/StudentManagement.jsx';
let smContent = fs.readFileSync(smPath, 'utf8');
smContent = smContent.replace(
    /return selectedCourse\?\.streams \|\| \[\];/g,
    "return (selectedCourse?.streams || []).map(s => typeof s === 'object' ? s.name : s).filter(Boolean);"
);
fs.writeFileSync(smPath, smContent);
console.log('Fixed getStreamsForCourse: StudentManagement.jsx');

// Also check SinglePageStudentRegistration.jsx
try {
    const spsrPath = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/shared/SinglePageStudentRegistration.jsx';
    let spsrContent = fs.readFileSync(spsrPath, 'utf8');
    // Find stream rendering
    const lines = spsrContent.split('\n');
    const problemLines = [];
    lines.forEach((line, i) => {
        if ((line.includes('{stream}') && (line.includes('option') || line.includes('return'))) ||
            line.includes('selectedCourse?.streams')) {
            problemLines.push(`Line ${i+1}: ${line.trim()}`);
        }
    });
    if (problemLines.length > 0) {
        console.log('⚠️  Problems in SinglePageStudentRegistration.jsx:');
        problemLines.forEach(l => console.log('  ', l));
    }
} catch(e) {}
