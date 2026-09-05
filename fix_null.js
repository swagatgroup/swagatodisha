const fs = require('fs');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace: typeof X === 'object'  =>  typeof X === 'object' && X !== null
    // But be careful not to break things. Let's do a targeted replace for the specific bug patterns we found.

    // 1. In StudentTable.jsx:
    content = content.replace(/typeof student\.courseDetails\?\.selectedCollege === 'object'/g, "typeof student.courseDetails?.selectedCollege === 'object' && student.courseDetails.selectedCollege !== null");
    content = content.replace(/typeof student\.courseDetails\?\.campus === 'object'/g, "typeof student.courseDetails?.campus === 'object' && student.courseDetails.campus !== null");

    // 2. Helper functions
    content = content.replace(/if \(typeof inst === 'object'\)/g, "if (typeof inst === 'object' && inst !== null)");
    content = content.replace(/if \(typeof college === 'object'\)/g, "if (typeof college === 'object' && college !== null)");
    content = content.replace(/if \(typeof name === 'object'\)/g, "if (typeof name === 'object' && name !== null)");
    content = content.replace(/if \(typeof course === 'object'\)/g, "if (typeof course === 'object' && course !== null)");
    content = content.replace(/if \(typeof stream === 'object'\)/g, "if (typeof stream === 'object' && stream !== null)");
    content = content.replace(/if \(typeof campus === 'object'\)/g, "if (typeof campus === 'object' && campus !== null)");
    content = content.replace(/if \(typeof institution === 'object'\)/g, "if (typeof institution === 'object' && institution !== null)");
    content = content.replace(/if \(typeof phone === 'object'\)/g, "if (typeof phone === 'object' && phone !== null)");

    fs.writeFileSync(filePath, content);
    console.log("Fixed null objects in", filePath.split('/').pop());
}

fixFile('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/SuperAdminDashboard.jsx');
fixFile('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/components/StudentTable.jsx');
fixFile('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/admin/StudentManagement.jsx');
