const fs = require('fs');
const file = 'frontend/src/components/Header.jsx';
let content = fs.readFileSync(file, 'utf8');

// Reduce navbar height
content = content.replace(/className="flex justify-between items-center py-5"/g, 'className="flex justify-between items-center py-2.5"');

// Replace nav layout
const oldNav = `<nav
              className="hidden lg:flex items-center gap-7 bg-white dark:bg-[#231A2E] px-7 py-1.5 rounded-pill shadow-nav border border-[#4A1D7A]/5"
              style={{ transform: 'none', willChange: 'auto' }}
            >
              {NAV_ITEMS.map((item, index) =>
                item.href.startsWith("#") ? (
                  <button
                    key={index}
                    onClick={() => handleNavClick(item.href)}
                    className="font-lato font-bold text-sm text-[#1A1A1A] dark:text-[#FAF7F2] hover:text-[#4A1D7A] dark:hover:text-[#9B6FCC] transition-colors"
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={index}
                    to={item.href}
                    className="font-lato font-bold text-sm text-[#1A1A1A] dark:text-[#FAF7F2] hover:text-[#4A1D7A] dark:hover:text-[#9B6FCC] transition-colors"
                  >
                    {item.name}
                  </Link>
                )
              )}
            </nav>`;

const newNav = `<nav className="hidden lg:flex items-center gap-2" style={{ transform: 'none', willChange: 'auto' }}>
              {NAV_ITEMS.map((item, index) =>
                item.href.startsWith("#") ? (
                  <button
                    key={index}
                    onClick={() => handleNavClick(item.href)}
                    className="font-lato font-bold text-sm text-[#1A1A1A] dark:text-[#FAF7F2] hover:text-[#4A1D7A] dark:hover:text-white transition-all bg-white/30 dark:bg-[#231A2E]/40 backdrop-blur-md px-5 py-2 rounded-full border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/70 dark:hover:bg-[#231A2E]/80 shadow-sm"
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={index}
                    to={item.href}
                    className="font-lato font-bold text-sm text-[#1A1A1A] dark:text-[#FAF7F2] hover:text-[#4A1D7A] dark:hover:text-white transition-all bg-white/30 dark:bg-[#231A2E]/40 backdrop-blur-md px-5 py-2 rounded-full border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/70 dark:hover:bg-[#231A2E]/80 shadow-sm"
                  >
                    {item.name}
                  </Link>
                )
              )}
            </nav>`;

content = content.replace(oldNav, newNav);
fs.writeFileSync(file, content);
