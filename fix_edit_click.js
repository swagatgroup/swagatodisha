const fs = require('fs');
const file = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/admin/StudentManagement.jsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// The async onClick that doesn't have a top-level try/catch wraps lines 2053-2162
// We need to add try/catch around it.
// The structure is:
//   onClick={async () => {
//     setSelectedStudent(student);
//     ...lots of code...
//     setShowEditModal(true);
//   }}

// Find the exact line 2053 (0-indexed: 2052)
const lineIdx = 2052; // 0-based

// The handler starts with onClick={async () => {  on line 2052
// We need to wrap the body in try/catch
// Replace the last part: setShowEditModal(true);\n                                                    }} 
// with try/catch version

// Find "setShowEditModal(true);\n" followed by spaces and "}}"
const oldHandler = `                                                        setEditData(initialEditData);
                                                        setShowEditModal(true);
                                                    }}`;

const newHandler = `                                                        setEditData(initialEditData);
                                                        setShowEditModal(true);
                                                    } catch (editErr) {
                                                        console.error('❌ Error preparing edit data:', editErr);
                                                    }
                                                    }}`;

// Also need to add try { at the beginning of the async handler
const oldStart = `                                                    onClick={async () => {
                                                        setSelectedStudent(student);`;
const newStart = `                                                    onClick={async () => {
                                                        try {
                                                        setSelectedStudent(student);`;

if (content.includes(oldHandler)) {
    content = content.replace(oldHandler, newHandler);
    console.log("✅ Added catch block at end");
} else {
    console.log("❌ Could not find old handler end");
}

if (content.includes(oldStart)) {
    content = content.replace(oldStart, newStart);
    console.log("✅ Added try block at start");
} else {
    console.log("❌ Could not find old handler start");
}

fs.writeFileSync(file, content);
console.log("Done");
