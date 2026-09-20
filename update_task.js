const fs = require('fs');
const file = '/home/chanchal/.gemini/antigravity/brain/f2b35aa0-0436-44b4-bc5a-fc978f7f8e34/task.md';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/- `\[ \]` Phase 9: Dead Code Cleanup/g, '- `[x]` Phase 9: Dead Code Cleanup');
content = content.replace(/- `\[ \]` Phase 10: Animation Audit & FontAwesome Removal/g, '- `[x]` Phase 10: Animation Audit & FontAwesome Removal');

fs.writeFileSync(file, content);
