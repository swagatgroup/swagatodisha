const fs = require('fs');

const filesToFix = [
    '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/SuperAdminDashboard.jsx',
    '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/StaffDashboard.jsx',
    '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/components/StudentTable.jsx',
    '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/admin/StudentManagement.jsx',
];

filesToFix.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix 1: filters.courses - these come from distinct() on DB so they're strings. Course objects when coming from college API.
    // The issue is specifically in college API where streams are objects {name, price, isPaidOnly}
    // and courses are objects {_id, courseName, price, isPaidOnly, streams}
    
    // Fix stream rendering: <option key={stream} value={stream}>{stream}</option>
    // stream objects have {name, price, isPaidOnly} - we need stream.name
    content = content.replace(
        /<option\s+key=\{stream\}\s+value=\{stream\}>\{stream\}<\/option>/g,
        '<option key={typeof stream === \'object\' ? stream.name : stream} value={typeof stream === \'object\' ? stream.name : stream}>{typeof stream === \'object\' ? stream.name : stream}</option>'
    );

    // Fix stream option multi-line patterns too
    content = content.replace(
        /<option\s+key=\{stream\}\s+value=\{stream\}>\s*\{stream\}\s*<\/option>/g,
        '<option key={typeof stream === \'object\' ? stream.name : stream} value={typeof stream === \'object\' ? stream.name : stream}>{typeof stream === \'object\' ? stream.name : stream}</option>'
    );

    // Fix course rendering in filter dropdowns: <option key={course} value={course}>{course}</option>
    // filters.courses comes from distinct() so typically strings, but let's guard anyway
    content = content.replace(
        /<option\s+key=\{course\}\s+value=\{course\}>\{course\}<\/option>/g,
        '<option key={typeof course === \'object\' ? (course.courseName || course.name) : course} value={typeof course === \'object\' ? (course.courseName || course.name) : course}>{typeof course === \'object\' ? (course.courseName || course.name) : course}</option>'
    );

    fs.writeFileSync(filePath, content);
    console.log('Fixed:', filePath.split('/').pop());
});
