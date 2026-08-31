const fs = require('fs');
const path = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/auth/Login.jsx';
let content = fs.readFileSync(path, 'utf8');

// Change component definition to accept title prop
if (!content.includes('const Login = ({ title }) => {')) {
    content = content.replace('const Login = () => {', 'const Login = ({ title }) => {');
}

// Change title text
if (!content.includes('{title || \'Welcome Back\'}')) {
    content = content.replace(
        '<h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-baloo">',
        '<h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-baloo">'
    ).replace(
        '>\n                        Welcome Back\n                    </h2>',
        '>\n                        {title || \'Welcome Back\'}\n                    </h2>'
    ).replace(
        />\s*Welcome Back\s*<\/h2>/,
        '>{title || \'Welcome Back\'}</h2>'
    );
}

fs.writeFileSync(path, content, 'utf8');
