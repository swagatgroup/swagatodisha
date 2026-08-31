const fs = require('fs');
const path = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/QuickLinks.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove the timeout hover logic for the career modal
content = content.replace(
    /const handleCareerHover = \(\) => {[\s\S]*?}, \[\]\)/,
    ''
);

// Remove the onMouseEnter/onMouseLeave handlers that call handleCareerHover and handleCareerLeave
content = content.replace(/if \(link\.category === 'career'\) \{\s*handleCareerHover\(\)\s*\} else /g, '');
content = content.replace(/if \(link\.category === 'career'\) \{\s*handleCareerLeave\(\)\s*\} else /g, '');

// Since we removed the if statements, the onMouseEnter / onMouseLeave now might have a dangling { or look weird, let's do a precise string replacement.

fs.writeFileSync(path, content, 'utf8');
