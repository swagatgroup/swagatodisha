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

walkDir('frontend/src/', (filePath) => {
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
        }
    } else {
        console.log(`File: ${filePath} is completely missing @remixicon/react import!`);
    }
});
