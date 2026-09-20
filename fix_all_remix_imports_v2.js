const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find all Ri*Line or Ri*Fill, including numbers like RiCustomerService2Line
    const regex = /\bRi[A-Z][a-zA-Z0-9]+(?:Line|Fill)\b/g;
    const matches = content.match(regex);
    
    if (!matches || matches.length === 0) return;
    
    const uniqueIcons = [...new Set(matches)].sort();
    
    // Check if it already has an import from @remixicon/react
    const hasImport = content.includes("'@remixicon/react'") || content.includes('"@remixicon/react"');
    
    const newImportStr = `import {\n    ${uniqueIcons.join(',\n    ')}\n} from '@remixicon/react';`;
    
    if (hasImport) {
        content = content.replace(/import\s+\{[\s\S]*?\}\s+from\s+['"]@remixicon\/react['"];?/, newImportStr);
    } else {
        if (content.includes("import React")) {
            content = content.replace(/(import React.*?;\n)/, `$1${newImportStr}\n`);
        } else if (content.match(/import\s+\{/)) {
            content = content.replace(/(import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];?\n)/, `$1${newImportStr}\n`);
        } else {
            content = `${newImportStr}\n` + content;
        }
    }
    
    fs.writeFileSync(filePath, content);
}

walkDir('frontend/src/', processFile);
console.log('All files processed v2.');
