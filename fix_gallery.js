const fs = require('fs');
const path = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/Gallery.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace static gallery images with dynamic
content = content.replace(
    "const [selectedImage, setSelectedImage] = useState(null)",
    "const [selectedImage, setSelectedImage] = useState(null)\n    const [galleryImages, setGalleryImages] = useState([]);\n    const [loading, setLoading] = useState(true);\n\n    useEffect(() => {\n        const fetchGallery = async () => {\n            try {\n                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';\n                const res = await fetch(`${API_URL}/api/gallery/public?limit=100`);\n                const json = await res.json();\n                if (json.success) {\n                    // Map backend schema to frontend schema\n                    const mapped = json.data.map(img => ({\n                        id: img._id,\n                        src: img.imageUrl,\n                        alt: img.title || 'Gallery Image',\n                        category: img.category ? img.category.toLowerCase() : 'campus',\n                        title: img.title || ''\n                    }));\n                    setGalleryImages(mapped);\n                }\n            } catch (err) {\n                console.error('Error fetching gallery:', err);\n            } finally {\n                setLoading(false);\n            }\n        };\n        fetchGallery();\n    }, []);"
);

// Remove the hardcoded array
content = content.replace(/const galleryImages = \[\s*\/\/ Campus Life[\s\S]*?\]/m, '');

// Ensure useEffect is imported
if (!content.includes('useEffect')) {
    content = content.replace(
        "import {useState} from 'react';",
        "import {useState, useEffect} from 'react';"
    );
}

fs.writeFileSync(path, content, 'utf8');
