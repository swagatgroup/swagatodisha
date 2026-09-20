const fs = require('fs');
const file = 'frontend/src/components/dashboard/DashboardLayout.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the handleLogout function
const oldLogout = `    const handleLogout = (e) => {
        if (e) e.preventDefault();
        console.log('💥 [SIDEBAR LOGOUT] Clicked!');
        try {
            setExplicitLogout(true);
            clearAuthState();
            window.location.replace('/login-portal');
        } catch (err) {
            console.error('Logout error:', err);
            window.location.href = '/login-portal';
        }
    };`;

const newLogout = `    const handleLogout = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        console.log('💥 [SIDEBAR LOGOUT] Clicked!');
        logout();
        navigate('/login-portal');
    };`;

content = content.replace(oldLogout, newLogout);

// Add onMouseDown to the button
content = content.replace(/onClick=\{handleLogout\}/g, 'onClick={handleLogout} onMouseDown={handleLogout}');

fs.writeFileSync(file, content);
