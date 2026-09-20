const fs = require('fs');

const files = {
    'frontend/src/components/Milestone.jsx': ['RiFlagFill'],
    'frontend/src/components/Admissions.jsx': ['RiCheckDoubleLine', 'RiPhoneLine'],
};

for (const [file, icons] of Object.entries(files)) {
    let content = fs.readFileSync(file, 'utf8');
    const importStatement = `import { ${icons.join(', ')} } from '@remixicon/react';\n`;
    content = importStatement + content;
    fs.writeFileSync(file, content);
}
