const fs = require('fs');

const file = 'frontend/src/components/Header.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace Desktop Login button
content = content.replace(
    /className="flex items-center gap-1\.5 px-5 py-2 text-\[#4A1D7A\] dark:text-\[#9B6FCC\] border-2 border-\[#4A1D7A\] dark:border-\[#9B6FCC\] rounded-pill font-bold text-sm hover:bg-\[#4A1D7A\] dark:hover:bg-\[#9B6FCC\] hover:text-white transition-all duration-200"/,
    'className="flex items-center gap-1.5 px-5 py-2 text-[#4A1D7A] dark:text-[#9B6FCC] border-2 border-[#4A1D7A] dark:border-[#9B6FCC] rounded-full font-bold text-sm hover:bg-[#4A1D7A] hover:text-white dark:hover:bg-[#9B6FCC]/10 dark:hover:text-[#9B6FCC] transition-all duration-200"'
);

// Replace Mobile Login button
content = content.replace(
    /className="flex items-center justify-center gap-2 py-3 border-2 border-\[#4A1D7A\] text-\[#4A1D7A\] dark:text-\[#9B6FCC\] dark:border-\[#9B6FCC\] rounded-pill font-bold hover:bg-\[#4A1D7A\] hover:text-white transition"/,
    'className="flex items-center justify-center gap-2 py-3 border-2 border-[#4A1D7A] text-[#4A1D7A] dark:text-[#9B6FCC] dark:border-[#9B6FCC] rounded-full font-bold hover:bg-[#4A1D7A] hover:text-white dark:hover:bg-[#9B6FCC]/10 dark:hover:text-[#9B6FCC] transition"'
);

fs.writeFileSync(file, content);
