const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('frontend/src/components/dashboard/', (filePath) => {
    if (!filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // bg-white without dark mode
    content = content.replace(/className="([^"]*)bg-white(?! dark:bg-)/g, 'className="$1bg-white dark:bg-[#231A2E]');
    
    // bg-gray-50 without dark mode
    content = content.replace(/className="([^"]*)bg-gray-50(?! dark:bg-)/g, 'className="$1bg-gray-50 dark:bg-[#1A1212]');
    
    // text-gray-900 without dark mode
    content = content.replace(/className="([^"]*)text-gray-900(?! dark:text-)/g, 'className="$1text-gray-900 dark:text-gray-100');
    
    // text-gray-800 without dark mode
    content = content.replace(/className="([^"]*)text-gray-800(?! dark:text-)/g, 'className="$1text-gray-800 dark:text-gray-200');

    // text-gray-600 without dark mode
    content = content.replace(/className="([^"]*)text-gray-600(?! dark:text-)/g, 'className="$1text-gray-600 dark:text-gray-300');

    // text-gray-500 without dark mode
    content = content.replace(/className="([^"]*)text-gray-500(?! dark:text-)/g, 'className="$1text-gray-500 dark:text-gray-400');

    // bg-gradient-to-r from-purple-50 to-blue-50 without dark mode
    content = content.replace(/className="([^"]*)from-purple-50 to-blue-50(?! dark:from-)/g, 'className="$1from-purple-50 to-blue-50 dark:from-[#351458] dark:to-[#1D4B5E]');

    // bg-blue-50 without dark mode
    content = content.replace(/className="([^"]*)bg-blue-50(?! dark:bg-)/g, 'className="$1bg-blue-50 dark:bg-[#1D4B5E]/30');

    // text-purple-700 without dark mode
    content = content.replace(/className="([^"]*)text-purple-700(?! dark:text-)/g, 'className="$1text-purple-700 dark:text-purple-300');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
    }
});

