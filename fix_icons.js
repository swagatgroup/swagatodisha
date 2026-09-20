const fs = require('fs');

function replaceFile(file, regex, replacement) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
  } catch(e) {}
}

// GatewayLoader.jsx
replaceFile('frontend/src/components/GatewayLoader.jsx', /<i className="fa-solid fa-school"><\/i>/g, '<RiSchoolLine size={24} className="text-[#4A1D7A]" />');
replaceFile('frontend/src/components/GatewayLoader.jsx', /<i className="fa-solid fa-arrow-right.*?><\/i>/g, '<RiArrowRightLine size={24} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />');
replaceFile('frontend/src/components/GatewayLoader.jsx', /<i className="fa-solid fa-book-open"><\/i>/g, '<RiBookOpenLine size={24} className="text-[#4A1D7A]" />');
replaceFile('frontend/src/components/GatewayLoader.jsx', /import { Link } from 'react-router-dom';/, "import { Link } from 'react-router-dom';\nimport { RiSchoolLine, RiBookOpenLine, RiArrowRightLine } from '@remixicon/react';");

// FloatingContact.jsx
replaceFile('frontend/src/components/FloatingContact.jsx', /<i className="fa-solid fa-phone"><\/i>/g, '<RiPhoneFill />');
replaceFile('frontend/src/components/FloatingContact.jsx', /<i className="fa-solid fa-bullhorn"><\/i>/g, '<RiMegaphoneFill />');
replaceFile('frontend/src/components/FloatingContact.jsx', /<i className="fa-brands fa-whatsapp text-xl"><\/i>/g, '<RiWhatsappFill className="text-xl" />');
replaceFile('frontend/src/components/FloatingContact.jsx', /<i className=\{`fa-solid \$\{isOpen \? 'fa-plus text-2xl' : 'fa-headset text-2xl'\}`\}><\/i>/g, '{isOpen ? <RiAddLine className="text-2xl" /> : <RiCustomerService2Fill className="text-2xl" />}');
replaceFile('frontend/src/components/FloatingContact.jsx', /import React, \{ useState \} from 'react'/, "import React, { useState } from 'react'\nimport { RiPhoneFill, RiMegaphoneFill, RiWhatsappFill, RiAddLine, RiCustomerService2Fill } from '@remixicon/react';");

// SchoolPageTemplate.jsx
replaceFile('frontend/src/components/schools/SchoolPageTemplate.jsx', /<i className="fa-solid fa-school text-white text-4xl"><\/i>/g, '<RiSchoolLine className="text-white w-10 h-10" />');
replaceFile('frontend/src/components/schools/SchoolPageTemplate.jsx', /<i className="fa-solid fa-check text-\[#4A1D7A\] mr-2"><\/i>/g, '<RiCheckLine className="text-[#4A1D7A] w-5 h-5 mr-2" />');
replaceFile('frontend/src/components/schools/SchoolPageTemplate.jsx', /import React from 'react';/, "import React from 'react';\nimport { RiSchoolLine, RiCheckLine } from '@remixicon/react';");

// ApplicationStatusSearch.jsx
replaceFile('frontend/src/components/ApplicationStatusSearch.jsx', /<i className="fa-solid fa-xmark text-3xl"><\/i>/g, '<RiCloseLine className="text-3xl" />');
replaceFile('frontend/src/components/ApplicationStatusSearch.jsx', /<i className="fa-solid fa-search-location text-2xl text-\[#4A1D7A\]"><\/i>/g, '<RiMapPin2Line className="text-2xl text-[#4A1D7A]" />');
replaceFile('frontend/src/components/ApplicationStatusSearch.jsx', /<i className="fa-solid fa-id-card text-gray-400 dark:text-gray-300"><\/i>/g, '<RiBankCardLine className="text-gray-400 dark:text-gray-300" />');
replaceFile('frontend/src/components/ApplicationStatusSearch.jsx', /<i className="fa-solid fa-spinner fa-spin mr-2"><\/i>/g, '<RiLoader4Line className="animate-spin mr-2" />');
replaceFile('frontend/src/components/ApplicationStatusSearch.jsx', /<i className="fa-solid fa-arrow-right mr-2"><\/i>/g, '<RiArrowRightLine className="mr-2" />');
replaceFile('frontend/src/components/ApplicationStatusSearch.jsx', /<i className="fa-solid fa-circle-exclamation text-red-500"><\/i>/g, '<RiErrorWarningLine className="text-red-500" />');
replaceFile('frontend/src/components/ApplicationStatusSearch.jsx', /<i className="fa-solid fa-shield-halved mr-2"><\/i>/g, '<RiShieldKeyholeLine className="mr-2" />');
replaceFile('frontend/src/components/ApplicationStatusSearch.jsx', /import \{ motion, AnimatePresence \} from 'framer-motion';/, "import { motion, AnimatePresence } from 'framer-motion';\nimport { RiCloseLine, RiMapPin2Line, RiBankCardLine, RiLoader4Line, RiArrowRightLine, RiErrorWarningLine, RiShieldKeyholeLine, RiPencilLine, RiSendPlaneLine, RiSearchLine, RiCheckLine, RiGraduationCapLine } from '@remixicon/react';");
replaceFile('frontend/src/components/ApplicationStatusSearch.jsx', /\{ label: 'Draft', icon: 'fa-pen-to-square' \},/, "{ label: 'Draft', icon: RiPencilLine },");
replaceFile('frontend/src/components/ApplicationStatusSearch.jsx', /\{ label: 'Submitted', icon: 'fa-paper-plane' \},/, "{ label: 'Submitted', icon: RiSendPlaneLine },");
replaceFile('frontend/src/components/ApplicationStatusSearch.jsx', /\{ label: 'Under Review', icon: 'fa-magnifying-glass' \},/, "{ label: 'Under Review', icon: RiSearchLine },");
replaceFile('frontend/src/components/ApplicationStatusSearch.jsx', /\{ label: 'Approved', icon: 'fa-check-circle' \},/, "{ label: 'Approved', icon: RiCheckLine },");
replaceFile('frontend/src/components/ApplicationStatusSearch.jsx', /\{ label: 'Complete', icon: 'fa-graduation-cap' \}/, "{ label: 'Complete', icon: RiGraduationCapLine }");
replaceFile('frontend/src/components/ApplicationStatusSearch.jsx', /<i className=\{`fa-solid \$\{step\.icon\}`\}><\/i>/g, '<step.icon size={20} />');

