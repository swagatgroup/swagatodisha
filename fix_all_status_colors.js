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

const dirs = [
    'frontend/src/components/dashboard/',
    'frontend/src/components/agents/',
    'frontend/src/components/staff/'
];

dirs.forEach(dir => {
    walkDir(dir, (filePath) => {
        if (!filePath.endsWith('.jsx')) return;
        
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        content = content.replace(/bg-yellow-100 text-yellow-800/g, 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200');
        content = content.replace(/bg-green-100 text-green-800/g, 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200');
        content = content.replace(/bg-red-100 text-red-800/g, 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200');
        content = content.replace(/bg-gray-100 text-gray-800/g, 'bg-gray-100 dark:bg-gray-800/60 text-gray-800 dark:text-gray-200');
        content = content.replace(/bg-blue-100 text-blue-800/g, 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200');
        content = content.replace(/bg-purple-100 text-purple-800/g, 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200');
        content = content.replace(/bg-indigo-100 text-indigo-800/g, 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200');

        if (content !== original) {
            fs.writeFileSync(filePath, content);
        }
    });
});
