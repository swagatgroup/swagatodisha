// The main.jsx ErrorBoundary has plain text styling but the screenshot shows:
// "Something went wrong" in RED and "Please refresh the page..." in RED
// This is the EXACT rendering from main.jsx ErrorBoundary (inline styles, color: '#e74c3c').
// 
// This means the crash is happening OUTSIDE all the component-level ErrorBoundaries.
// The DashboardLayout itself is NOT wrapped in ErrorBoundary!
// 
// So when the edit button is clicked and something crashes in:
//   - DashboardLayout (rendering the mobile sidebar we just added!)
//   - OR in the main dashboard tab table (inside 'dashboard' case in renderSidebarContent)
//
// WAIT. We just modified DashboardLayout with our mobile sidebar fix!
// The new mobile sidebar code accesses sidebarItems.map(...) 
// What if sidebarItems is undefined in some context?
//
// Let me check the new DashboardLayout code we added for the mobile sidebar.

const fs = require('fs');
const content = fs.readFileSync('/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/DashboardLayout.jsx', 'utf8');

// Find our new AnimatePresence mobile panel
const idx = content.indexOf('mobile-panel');
if (idx !== -1) {
    const start = content.lastIndexOf('\n', idx - 200) + 1;
    const end = content.indexOf('</AnimatePresence>', idx) + 20;
    console.log("New mobile panel code:");
    console.log(content.slice(start, end));
} else {
    console.log("Mobile panel not found");
}
