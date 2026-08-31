const fs = require('fs');
const path = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// Add import
if (!content.includes('import LoginPortal from')) {
    content = content.replace(
        "import Login from './components/auth/Login'",
        "import Login from './components/auth/Login'\nimport LoginPortal from './components/auth/LoginPortal'"
    );
}

// Remove ApplicationStatusSearch from AppContent
content = content.replace(/<ApplicationStatusSearch \/>/g, '');

// Update routes
content = content.replace(
    '<Route path="/login" element={<Login />} />',
    `<Route path="/login-portal" element={<LoginPortal />} />
                            <Route path="/login/student" element={<Login title="Student Login" />} />
                            <Route path="/login/agent" element={<Login title="Agent Login" />} />
                            <Route path="/login/staff" element={<Login title="Staff Login" />} />
                            <Route path="/login" element={<Navigate to="/login-portal" replace />} />`
);

fs.writeFileSync(path, content, 'utf8');
