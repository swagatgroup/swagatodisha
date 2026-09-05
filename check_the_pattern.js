// The key insight: The error was already happening BEFORE our changes.
// The user says "you have tried to fix it multiple times and it persists."
// 
// Let me look at what the main.jsx shows - it says the WHOLE PAGE becomes 
// "Something went wrong" not just a component.
//
// The ERROR in main.jsx is: "Something went wrong" with simple inline style and a "Refresh Page" button.
// Looking at the screenshot - that's EXACTLY what we see!
// 
// So the crash is at the TOP LEVEL React Error Boundary in main.jsx.
// This means the error is thrown somewhere that propagates all the way up.
//
// Now - the key question is: WHAT renders that can crash when edit is clicked?
//
// Let me think about what state changes happen when edit is clicked:
// In SuperAdminDashboard (dashboard tab):
//   1. setSelectedStudent(student) -> triggers re-render
//   2. A large setEditData({...}) async call -> triggers re-render
//   3. setShowEditModal(true) -> triggers re-render
//
// In StudentManagement (students tab):
//   1. Same pattern
//
// Something in THOSE RE-RENDERS crashes.
// 
// Let me specifically check the async edit handler in SuperAdminDashboard.
// The async handler does: await api.get('/api/colleges/public') which could throw.
// If it throws, it's an unhandled promise rejection.
// BUT - unhandled promise rejections don't get caught by React Error Boundary!
//
// WAIT - what about this: The setSelectedStudent() is called BEFORE the async code.
// Then the async code runs. During the re-render triggered by setSelectedStudent(),
// the modal JSX starts rendering.
// 
// In SuperAdminDashboard, the modal has: {activeSidebarItem === 'dashboard' && showEditModal && selectedStudent && (
// showEditModal is still false at first render after setSelectedStudent.
// 
// So selectedStudent becomes set, but showEditModal is still false.
// Then async stuff happens, and setShowEditModal(true) is called.
// Then the modal renders.
//
// Let me check - is there any render code that runs with selectedStudent set but modal closed?

const fs = require('fs');
const content = fs.readFileSync('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/SuperAdminDashboard.jsx', 'utf8');

// Look for selectedStudent usage OUTSIDE of modal conditions
const lines = content.split('\n');
let inModal = false;
lines.forEach((line, idx) => {
    if (line.includes('selectedStudent') && !line.includes('setSelectedStudent') && 
        !line.includes('showDetailsModal') && !line.includes('showEditModal') &&
        !line.includes('//') && !line.includes('setState') && !line.includes('const ') &&
        !line.includes('onClick') && !line.includes('await') && !line.includes('if (')) {
        console.log(`Line ${idx+1}: ${line.trim()}`);
    }
});
