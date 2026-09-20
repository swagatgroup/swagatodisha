const fs = require('fs');
const file = 'frontend/src/components/QuickLinks.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace standard fontawesome icons with Remix Icons in the render
content = content.replace(/<i className="fa-solid fa-times"><\/i>/g, '<RiCloseLine size={24} />');
content = content.replace(/<i className="fa-solid fa-graduation-cap text-4xl mb-3"><\/i>/g, '<RiGraduationCapLine className="w-10 h-10 mb-3" />');
content = content.replace(/<i className="fa-solid fa-chevron-down text-white"><\/i>/g, '<RiArrowDownSLine className="text-white" />');
content = content.replace(/<i className="fa-solid fa-chevron-right text-gray-600 dark:text-gray-300 text-xs"><\/i>/g, '<RiArrowRightSLine className="text-gray-600 dark:text-gray-300 w-3 h-3" />');
content = content.replace(/<i className=\{`fa-solid \$\{showAllCareers\.has\(`\$\{key\}-\$\{pathIndex\}`\) \? 'fa-chevron-up' : 'fa-chevron-down'\} mr-2`\}><\/i>/g, '{showAllCareers.has(`${key}-${pathIndex}`) ? <RiArrowUpSLine className="mr-2" /> : <RiArrowDownSLine className="mr-2" />}');
content = content.replace(/<i className="fa-solid fa-phone mr-2"><\/i>/g, '<RiPhoneLine className="mr-2" />');
content = content.replace(/<i className="fa-solid fa-download mr-2"><\/i>/g, '<RiDownloadLine className="mr-2" />');

// Remove FontAwesome string data and replace with standard Remix Icon imports
const imports = `import { 
    RiCloseLine, RiGraduationCapLine, RiArrowDownSLine, RiArrowRightSLine, RiArrowUpSLine, RiPhoneLine, RiDownloadLine,
    RiFlaskLine, RiSettings3Line, RiStethoscopeLine, RiAtomLine, RiLineChartLine, RiBriefcaseLine, RiCoinsLine, RiMegaphoneLine, 
    RiPaletteLine, RiBookLine, RiGroupLine, RiBrushLine, RiToolsLine, RiComputerLine, RiHeartPulseLine, RiHammerLine
} from '@remixicon/react';`;

if (!content.includes('RiCloseLine')) {
    content = content.replace(/import \{ motion, AnimatePresence \} from 'framer-motion'/, `import { motion, AnimatePresence } from 'framer-motion'\n${imports}`);
}

content = content.replace(/icon: "fa-solid fa-flask"/g, 'icon: RiFlaskLine');
content = content.replace(/icon: "fa-solid fa-cogs"/g, 'icon: RiSettings3Line');
content = content.replace(/icon: "fa-solid fa-stethoscope"/g, 'icon: RiStethoscopeLine');
content = content.replace(/icon: "fa-solid fa-atom"/g, 'icon: RiAtomLine');
content = content.replace(/icon: "fa-solid fa-chart-line"/g, 'icon: RiLineChartLine');
content = content.replace(/icon: "fa-solid fa-briefcase"/g, 'icon: RiBriefcaseLine');
content = content.replace(/icon: "fa-solid fa-coins"/g, 'icon: RiCoinsLine');
content = content.replace(/icon: "fa-solid fa-bullhorn"/g, 'icon: RiMegaphoneLine');
content = content.replace(/icon: "fa-solid fa-palette"/g, 'icon: RiPaletteLine');
content = content.replace(/icon: "fa-solid fa-book"/g, 'icon: RiBookLine');
content = content.replace(/icon: "fa-solid fa-users"/g, 'icon: RiGroupLine');
content = content.replace(/icon: "fa-solid fa-paintbrush"/g, 'icon: RiBrushLine');
content = content.replace(/icon: "fa-solid fa-tools"/g, 'icon: RiToolsLine');
content = content.replace(/icon: "fa-solid fa-laptop-code"/g, 'icon: RiComputerLine');
content = content.replace(/icon: "fa-solid fa-heart-pulse"/g, 'icon: RiHeartPulseLine');
content = content.replace(/icon: "fa-solid fa-hammer"/g, 'icon: RiHammerLine');

// And where it renders the category icon:
content = content.replace(/<i className=\{`\$\{category\.icon\} text-2xl text-purple-600 dark:text-purple-400 mb-3`\}><\/i>/g, '<category.icon className="w-8 h-8 text-[#4A1D7A] dark:text-[#9B6FCC] mb-3" />');

fs.writeFileSync(file, content);
