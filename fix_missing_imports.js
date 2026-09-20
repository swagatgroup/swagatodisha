const fs = require('fs');

const files = {
    'frontend/src/components/Milestone.jsx': ['RiFlagFill'],
    'frontend/src/components/Gallery.jsx': ['RiBuildingLine', 'RiCalendarLine', 'RiCloseLine', 'RiGraduationCapLine', 'RiHeartLine', 'RiImageFill', 'RiImageLine', 'RiSchoolLine', 'RiTeamLine', 'RiZoomInLine'],
    'frontend/src/components/Admissions.jsx': ['RiCheckDoubleLine', 'RiPhoneLine'],
    'frontend/src/components/GatewayLoader.jsx': ['RiArrowRightLine', 'RiBookOpenLine', 'RiBuildingLine', 'RiComputerLine', 'RiSchoolLine'],
    'frontend/src/components/schools/SchoolPageTemplate.jsx': ['RiCheckLine', 'RiSchoolLine']
};

for (const [file, icons] of Object.entries(files)) {
    let content = fs.readFileSync(file, 'utf8');
    const importStatement = `import { ${icons.join(', ')} } from '@remixicon/react';\n`;
    
    // Insert after the first import or at the top
    if (content.includes("import React")) {
        content = content.replace(/(import React.*?;\n)/, `$1${importStatement}`);
    } else if (content.includes("import {")) {
        content = content.replace(/(import \{.*?\}.*?;\n)/, `$1${importStatement}`);
    } else {
        content = importStatement + content;
    }
    
    fs.writeFileSync(file, content);
}
