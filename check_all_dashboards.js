const fs = require('fs');

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Look for rendering of course/stream values directly
        if ((line.includes('{course}') || line.includes('{stream}') || line.includes('{campus}') || line.includes('{student.')) && line.includes('<option')) {
            console.log(`[${filePath.split('/').pop()}] Line ${i+1}: ${line.trim()}`);
        }
    }
}

[
    '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/SuperAdminDashboard.jsx',
    '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/StaffDashboard.jsx',
    '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/AgentDashboard.jsx',
    '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/components/StudentTable.jsx',
    '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/admin/StudentManagement.jsx',
].forEach(checkFile);
