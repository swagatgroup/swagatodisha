// The edit button in StudentManagement table at line 2053 is for the "students" tab.
// Let me look at where the edit button is that the user is clicking.
// From the screenshot we see: swagatodisha.com/dashboard/admin - this is the SuperAdmin dashboard.
// The user is clicking the edit button in some student table.
//
// There are TWO places with edit buttons in SuperAdminDashboard:
// 1. The inline student table IN the dashboard tab (rendered by the 'dashboard' case)
//    - This edit button sets showEditModal and uses modal in SuperAdminDashboard itself
//    - BUT this modal is guarded by activeSidebarItem === 'dashboard'
//
// 2. The StudentManagement component (rendered by 'students' case) wrapped in ErrorBoundary
//
// When the user is on the 'students' tab and clicks edit:
//    - StudentManagement.setShowEditModal(true) is called
//    - StudentManagement re-renders with the modal
//    - Something in that modal crashes
//
// When the user is on the 'dashboard' tab and clicks edit:
//    - SuperAdminDashboard.setShowEditModal(true) is called  
//    - The modal only renders if activeSidebarItem === 'dashboard'
//
// The ErrorBoundary AROUND StudentManagement (not in SuperAdminDashboard's root) would only
// show the error for the 'students' tab. But the screenshot shows the ENTIRE page replaced.
//
// This means: there's a top-level ErrorBoundary that catches this.
// The main.jsx ErrorBoundary is not component-level, it wraps the WHOLE APP.
// So ANY crash anywhere shows this page.

const fs = require('fs');
const mainJsx = fs.readFileSync('/home/chanchal/Desktop/Swagat Odisha/frontend/src/main.jsx', 'utf8');
console.log("main.jsx content:");
console.log(mainJsx);
