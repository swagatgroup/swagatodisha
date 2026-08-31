const fs = require('fs');
const path = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/HeroCarousel.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace heightClass logic
content = content.replace(
    /const heightClass =[\s\S]*?; \/\/ 70vh for vertical/m,
    `const heightClass = sliderType === 'horizontal' 
        ? 'aspect-[4/3] md:aspect-[21/9]' 
        : 'aspect-[4/3] md:aspect-[16/9]';`
);

// Ensure object-center is present
content = content.replace(
    'className="w-full h-full object-cover"',
    'className="w-full h-full object-cover object-center"'
);

fs.writeFileSync(path, content, 'utf8');
