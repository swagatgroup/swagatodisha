const fs = require('fs');

const filePath = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/DashboardLayout.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix session variables
content = content.replace(/currentSession/g, 'selectedSession');
content = content.replace(/setCurrentSession/g, 'setSelectedSession');

// Fix profile variables
content = content.replace(/profileDropdownRef/g, 'userMenuRef');
content = content.replace(/setProfileOpen\(!profileOpen\)/g, 'toggleUserMenu()');
content = content.replace(/profileOpen/g, 'userMenuOpen');

fs.writeFileSync(filePath, content, 'utf8');
