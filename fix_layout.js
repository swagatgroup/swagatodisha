const fs = require('fs');
const path = require('path');

const filePath = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/DashboardLayout.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Import useDarkMode
if (!content.includes('useDarkMode')) {
    content = content.replace(
        "import { useSession } from '../../contexts/SessionContext';",
        "import { useSession } from '../../contexts/SessionContext';\nimport { useDarkMode } from '../../contexts/DarkModeContextSimple';"
    );
}

// Inject variable definitions
if (!content.includes('const { isDarkMode, toggleDarkMode } = useDarkMode();')) {
    content = content.replace(
        "const navigate = useNavigate();",
        "const navigate = useNavigate();\n    const { isDarkMode, toggleDarkMode } = useDarkMode();"
    );
}

fs.writeFileSync(filePath, content, 'utf8');
