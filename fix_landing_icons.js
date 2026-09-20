const fs = require('fs');

function replaceFile(file, regex, replacement) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
  } catch(e) {}
}

// GatewayLoader.jsx
replaceFile('frontend/src/components/GatewayLoader.jsx', /<i className="fa-solid fa-building-columns"><\/i>/g, '<RiBuildingLine size={24} className="text-[#4A1D7A]" />');
replaceFile('frontend/src/components/GatewayLoader.jsx', /<i className="fa-solid fa-laptop-code"><\/i>/g, '<RiComputerLine size={24} className="text-[#4A1D7A]" />');
replaceFile('frontend/src/components/GatewayLoader.jsx', /import \{ RiSchoolLine, RiBookOpenLine, RiArrowRightLine \} from '@remixicon\/react';/, "import { RiSchoolLine, RiBookOpenLine, RiArrowRightLine, RiBuildingLine, RiComputerLine } from '@remixicon/react';");

// Admissions.jsx
replaceFile('frontend/src/components/Admissions.jsx', /<i className="fa-solid fa-file-alt text-2xl text-\[#387B95\]"><\/i>/g, '<RiFileList3Line className="text-2xl text-[#387B95]" />');
replaceFile('frontend/src/components/Admissions.jsx', /<i className="fa-solid fa-check-circle text-2xl text-\[#4A1D7A\]"><\/i>/g, '<RiCheckDoubleLine className="text-2xl text-[#4A1D7A]" />');
replaceFile('frontend/src/components/Admissions.jsx', /<i className="fa-solid fa-phone text-2xl text-green-600"><\/i>/g, '<RiPhoneLine className="text-2xl text-green-600" />');
replaceFile('frontend/src/components/Admissions.jsx', /import \{ motion \} from 'framer-motion'/, "import { motion } from 'framer-motion'\nimport { RiFileList3Line, RiCheckDoubleLine, RiPhoneLine } from '@remixicon/react';");

// Milestone.jsx
replaceFile('frontend/src/components/Milestone.jsx', /<i className="fa-solid fa-flag text-yellow-300 text-xl"><\/i>/g, '<RiFlagFill className="text-yellow-300 text-xl" />');
replaceFile('frontend/src/components/Milestone.jsx', /import \{ motion \} from 'framer-motion'/, "import { motion } from 'framer-motion'\nimport { RiFlagFill } from '@remixicon/react';");

// Gallery.jsx
replaceFile('frontend/src/components/Gallery.jsx', /<i className="fa-solid fa-spinner fa-spin text-3xl"><\/i>/g, '<RiLoader4Line className="animate-spin text-3xl" />');
replaceFile('frontend/src/components/Gallery.jsx', /<i className="fa-solid fa-images text-white text-3xl"><\/i>/g, '<RiImageFill className="text-white text-3xl" />');
replaceFile('frontend/src/components/Gallery.jsx', /<i className="fa-solid fa-search-plus text-white"><\/i>/g, '<RiZoomInLine className="text-white" />');
replaceFile('frontend/src/components/Gallery.jsx', /<i className="fa-solid fa-image text-gray-400 dark:text-gray-300 text-3xl"><\/i>/g, '<RiImageLine className="text-gray-400 dark:text-gray-300 text-3xl" />');
replaceFile('frontend/src/components/Gallery.jsx', /<i className="fa-solid fa-images text-white text-2xl"><\/i>/g, '<RiImageFill className="text-white text-2xl" />');
replaceFile('frontend/src/components/Gallery.jsx', /<i className="fa-solid fa-school text-white text-2xl"><\/i>/g, '<RiSchoolLine className="text-white text-2xl" />');
replaceFile('frontend/src/components/Gallery.jsx', /<i className="fa-solid fa-calendar text-white text-2xl"><\/i>/g, '<RiCalendarLine className="text-white text-2xl" />');
replaceFile('frontend/src/components/Gallery.jsx', /<i className="fa-solid fa-heart text-white text-2xl"><\/i>/g, '<RiHeartLine className="text-white text-2xl" />');
replaceFile('frontend/src/components/Gallery.jsx', /<i className="fa-solid fa-times text-xl"><\/i>/g, '<RiCloseLine className="text-xl" />');

// Remove FA string objects in Gallery.jsx and replace with actual Remix icons
replaceFile('frontend/src/components/Gallery.jsx', /import React, \{ useState, useEffect \} from 'react'/, "import React, { useState, useEffect } from 'react'\nimport { RiLoader4Line, RiImageFill, RiZoomInLine, RiImageLine, RiSchoolLine, RiCalendarLine, RiHeartLine, RiCloseLine, RiGraduationCapLine, RiTeamLine, RiBuildingLine } from '@remixicon/react';");

let gallery = fs.readFileSync('frontend/src/components/Gallery.jsx', 'utf8');
gallery = gallery.replace(/\{ id: 'all', name: 'All Photos', icon: 'fa-solid fa-images' \}/, "{ id: 'all', name: 'All Photos', icon: RiImageFill }");
gallery = gallery.replace(/\{ id: 'campus', name: 'Campus Life', icon: 'fa-solid fa-school' \}/, "{ id: 'campus', name: 'Campus Life', icon: RiSchoolLine }");
gallery = gallery.replace(/\{ id: 'events', name: 'Events', icon: 'fa-solid fa-calendar' \}/, "{ id: 'events', name: 'Events', icon: RiCalendarLine }");
gallery = gallery.replace(/\{ id: 'students', name: 'Students', icon: 'fa-solid fa-user-graduate' \}/, "{ id: 'students', name: 'Students', icon: RiGraduationCapLine }");
gallery = gallery.replace(/\{ id: 'faculty', name: 'Faculty', icon: 'fa-solid fa-chalkboard-user' \}/, "{ id: 'faculty', name: 'Faculty', icon: RiTeamLine }");
gallery = gallery.replace(/\{ id: 'infrastructure', name: 'Infrastructure', icon: 'fa-solid fa-building' \}/, "{ id: 'infrastructure', name: 'Infrastructure', icon: RiBuildingLine }");
// Replace icon renderer
gallery = gallery.replace(/<i className=\{`\$\{category\.icon\} mr-2`\}><\/i>/g, '<category.icon className="mr-2 inline-block w-4 h-4" />');
fs.writeFileSync('frontend/src/components/Gallery.jsx', gallery);

// Check if any fa- remains in these files
