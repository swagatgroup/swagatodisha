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

walkDir('frontend/src/components/', (filePath) => {
    if (!filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    const regex = /\bRi[A-Z][a-zA-Z0-9]+(?:Line|Fill)\b/g;
    const matches = content.match(regex);
    if (!matches || matches.length === 0) return;
    
    const uniqueIcons = [...new Set(matches)];
    
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@remixicon\/react['"]/;
    const importMatch = content.match(importRegex);
    
    if (importMatch) {
        const importedIconsStr = importMatch[1];
        const importedIcons = importedIconsStr.split(',').map(s => s.trim());
        
        const missing = uniqueIcons.filter(icon => !importedIcons.includes(icon));
        if (missing.length > 0) {
            console.log(`File: ${filePath} is missing: ${missing.join(', ')}`);
            // Fix it!
            const allIcons = [...new Set([...importedIcons.filter(Boolean), ...uniqueIcons])].sort();
            const newImportStr = `import {\n    ${allIcons.join(',\n    ')}\n} from '@remixicon/react'`;
            
            const parts = content.split("@remixicon/react'");
            if (parts.length > 1) {
                const beforePart = parts[0];
                const lastImportIndex = beforePart.lastIndexOf('import {');
                if (lastImportIndex !== -1) {
                    const veryStart = beforePart.substring(0, lastImportIndex);
                    content = veryStart + newImportStr + parts[1];
                    fs.writeFileSync(filePath, content);
                    console.log(`Fixed ${filePath}`);
                }
            } else {
                const parts2 = content.split('@remixicon/react"');
                if (parts2.length > 1) {
                    const beforePart = parts2[0];
                    const lastImportIndex = beforePart.lastIndexOf('import {');
                    if (lastImportIndex !== -1) {
                        const veryStart = beforePart.substring(0, lastImportIndex);
                        content = veryStart + newImportStr + parts2[1];
                        fs.writeFileSync(filePath, content);
                        console.log(`Fixed ${filePath}`);
                    }
                }
            }
        }
    }
});
