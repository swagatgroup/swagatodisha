// Since ErrorBoundary catches render errors, let's think more carefully.
// When the edit button is clicked in StudentManagement:
// 1. setSelectedStudent(student) -- sets state
// 2. setEditData({...}) -- sets state
// 3. setShowEditModal(true) -- triggers re-render
// 
// The RE-RENDER of StudentManagement will now include the modal JSX.
// Any crash in the modal JSX = ErrorBoundary catches it.
// 
// Key suspect: selectedStudent is set, then during re-render,
// something in the modal accesses selectedStudent.someField that is undefined.
//
// Let's check: what does the edit modal render that could crash?
// Line 2931: {showEditModal && selectedStudent && (

const fs = require('fs');
const content = fs.readFileSync('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/admin/StudentManagement.jsx', 'utf8');
const lines = content.split('\n');

// Find from line 2931 what accesses could crash
for (let i = 2930; i < 3020; i++) {
    const line = lines[i];
    // Look for property access that ISN'T guarded with ?.  
    if ((line.includes('selectedStudent.') && !line.includes('selectedStudent?.')) ||
        (line.includes('editData.') && !line.includes('editData?.') && line.includes('.length'))) {
        console.log(`Line ${i+1}: ${line.trim()}`);
    }
}
