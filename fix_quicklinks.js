const fs = require('fs');

const file = 'frontend/src/components/QuickLinks.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\bRi[A-Z][a-zA-Z0-9]+(?:Line|Fill)\b/g;
const matches = content.match(regex);
const uniqueIcons = [...new Set(matches)].sort();

const newImportStr = `import {\n    ${uniqueIcons.join(',\n    ')}\n} from '@remixicon/react'`;

// Find where "@remixicon/react" is and replace the whole import block
const parts = content.split("@remixicon/react'");
if (parts.length > 1) {
    const beforePart = parts[0];
    const lastImportIndex = beforePart.lastIndexOf('import {');
    
    if (lastImportIndex !== -1) {
        const veryStart = beforePart.substring(0, lastImportIndex);
        content = veryStart + newImportStr + parts[1];
    }
}

fs.writeFileSync(file, content);
