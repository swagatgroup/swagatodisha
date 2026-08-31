const fs = require('fs');
const path = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/tabs/WebsiteContentManagement.jsx';
let content = fs.readFileSync(path, 'utf8');

// Add new tabs
if (!content.includes("{ id: 'staff', name: 'Staff Profiles', icon: '👨‍💼' }")) {
    content = content.replace(
        "{ id: 'approvals', name: 'Approvals & Recognitions', icon: '🏅' }",
        "{ id: 'approvals', name: 'Approvals & Recognitions', icon: '🏅' },\n        { id: 'staff', name: 'Staff Profiles', icon: '👨‍💼' },\n        { id: 'gallery', name: 'Gallery Management', icon: '🖼️' }"
    );
}

// Ensure compressor is imported
if (!content.includes("import { compressImageToWebP }")) {
    content = content.replace(
        "import api from '../../../utils/api';",
        "import api from '../../../utils/api';\nimport { compressImageToWebP } from '../../../utils/imageCompressor';"
    );
}

// Add state for Gallery
if (!content.includes("const [galleryImages, setGalleryImages] = useState([]);")) {
    content = content.replace(
        "const [content, setContent] = useState(null);",
        "const [content, setContent] = useState(null);\n    const [galleryImages, setGalleryImages] = useState([]);\n    const [uploadingGallery, setUploadingGallery] = useState(false);\n    const [uploadingStaff, setUploadingStaff] = useState(false);"
    );
}

// Load Gallery data
if (!content.includes("loadGallery();")) {
    content = content.replace(
        "loadContent();",
        "loadContent();\n        loadGallery();"
    );
    const loadGalleryCode = `
    const loadGallery = async () => {
        try {
            const res = await api.get('/api/gallery/public?limit=100');
            if (res.data && res.data.success) {
                setGalleryImages(res.data.data || []);
            }
        } catch (error) {
            console.error('Error loading gallery:', error);
        }
    };
    `;
    content = content.replace("const saveContent = async", loadGalleryCode + "\n    const saveContent = async");
}

fs.writeFileSync(path, content, 'utf8');
