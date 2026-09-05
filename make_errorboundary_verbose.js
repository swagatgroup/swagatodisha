const fs = require('fs');
const file = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/common/ErrorBoundary.jsx';
let content = fs.readFileSync(file, 'utf8');

// Make the error visible in the UI in ALL environments, not just dev
content = content.replace(
    `{(import.meta.env.DEV || import.meta.env.MODE === 'development') && this.state.error && (`,
    `{this.state.error && (`
);

fs.writeFileSync(file, content);
console.log("Updated ErrorBoundary to always show error details");
