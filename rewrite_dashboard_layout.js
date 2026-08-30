const fs = require('fs');
const path = require('path');

const filePath = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/DashboardLayout.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Inject imports
const importStmt = `import { Bars3Icon, SunIcon, MoonIcon, BellIcon, ChevronDoubleLeftIcon, ChevronLeftIcon, ArrowRightOnRectangleIcon, UserIcon } from '@heroicons/react/24/outline';\n`;
if (!content.includes('@heroicons/react')) {
  const importMatch = content.match(/import [^\n]+;\n/);
  if (importMatch) {
    content = content.replace(importMatch[0], importMatch[0] + importStmt);
  } else {
    content = importStmt + content;
  }
}

// Replace hamburger
content = content.replace(/<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">\s*<path strokeLinecap="round" strokeLinejoin="round" strokeWidth=\{2\} d="M4 6h16M4 12h16M4 18h16" \/>\s*<\/svg>/g, '<Bars3Icon className="h-6 w-6" />');

// Replace dark mode (sun)
content = content.replace(/<svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">\s*<path strokeLinecap="round" strokeLinejoin="round" strokeWidth=\{2\} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-\.707-\.707M6.343 6.343l-\.707-\.707m12.728 0l-\.707\.707M6.343 17.657l-\.707\.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" \/>\s*<\/svg>/g, '<SunIcon className="w-5 h-5 text-yellow-500" />');

// Replace dark mode (moon)
content = content.replace(/<svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">\s*<path strokeLinecap="round" strokeLinejoin="round" strokeWidth=\{2\} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" \/>\s*<\/svg>/g, '<MoonIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />');

// Replace bell
content = content.replace(/<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">\s*<path strokeLinecap="round" strokeLinejoin="round" strokeWidth=\{2\} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01\.707\.293l5.414 5.414a1 1 0 01\.293\.707V19a2 2 0 01-2 2z" \/>\s*<\/svg>/g, '<BellIcon className="w-5 h-5" />');
// Wait, actually the original bell SVG path was a bit different... it looked like a mail or file icon.
// Let's just do a generic replace for all `<svg className="w-5 h-5"...` inside the payment notification block.

// We will just do a blind regex for the bell icon
content = content.replace(/<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">[\s\S]*?<\/svg>/g, '<BellIcon className="w-5 h-5" />');

// For the user profile drop down svg
content = content.replace(/<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">[\s\S]*?<\/svg>/g, '<UserIcon className="w-5 h-5" />');

// For the sidebar collapse arrow
content = content.replace(/<svg className=\{`h-5 w-5 transition-transform \$\{sidebarCollapsed \? 'rotate-180' : ''\}`\} fill="none" viewBox="0 0 24 24" stroke="currentColor">[\s\S]*?<\/svg>/g, '<ChevronDoubleLeftIcon className={`h-5 w-5 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`} />');

fs.writeFileSync(filePath, content, 'utf8');
