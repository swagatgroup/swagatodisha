const fs = require('fs');
const file = 'frontend/src/components/dashboard/tabs/WebsiteContentManagement.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add import
const importStr = "import ImageCropperModal from '../components/ImageCropperModal';";
if (!content.includes('ImageCropperModal')) {
    content = content.replace(/import \{ \n    RiHome4Line,/g, importStr + "\nimport {\n    RiHome4Line,");
    if (content === fs.readFileSync(file, 'utf8')) {
        // Fallback
        content = content.replace(/import React, \{ useState, useEffect \} from 'react';/, "import React, { useState, useEffect } from 'react';\n" + importStr);
    }
}

// Add state for cropper
const stateStr = `    const [cropperOpen, setCropperOpen] = useState(false);
    const [currentCropIndex, setCurrentCropIndex] = useState(null);
    const [cropImageFile, setCropImageFile] = useState(null);
    
    const handleHeroImageSelect = (e, index) => {
        if (e.target.files && e.target.files.length > 0) {
            setCropImageFile(e.target.files[0]);
            setCurrentCropIndex(index);
            setCropperOpen(true);
        }
        e.target.value = null; // reset input
    };

    const handleCropComplete = async (croppedFile) => {
        try {
            // Determine aspect ratio for upload metadata if needed
            const isMobile = window.innerWidth < 768;
            
            const formData = new FormData();
            formData.append('image', croppedFile);
            formData.append('imageType', 'heroCarousel');
            
            // Assuming there's an api endpoint for this
            const response = await api.post('/admin/upload-website-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.success && response.data.url) {
                handleArrayItemChange('heroCarousel', currentCropIndex, 'image', response.data.url);
                showSuccess('Image uploaded successfully');
            } else {
                throw new Error(response.data.message || 'Upload failed');
            }
        } catch (error) {
            handleApiError(error, 'Failed to upload image');
        }
    };
`;

if (!content.includes('cropperOpen')) {
    content = content.replace(/const \[isSaving, setIsSaving\] = useState\(false\);/, "const [isSaving, setIsSaving] = useState(false);\n" + stateStr);
}

// Replace the Image URL input with a file input + URL input
const inputTarget = `<div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Image URL</label>
                                <input
                                    type="text"
                                    value={slide.image || ''}
                                    onChange={(e) => handleArrayItemChange('heroCarousel', index, 'image', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#387B95]"
                                />
                            </div>`;

const inputReplacement = `<div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Image URL or Upload</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={slide.image || ''}
                                        onChange={(e) => handleArrayItemChange('heroCarousel', index, 'image', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#387B95]"
                                        placeholder="Enter URL or upload ->"
                                    />
                                    <label className="cursor-pointer px-4 py-2 bg-[#4A1D7A] text-white rounded-md hover:bg-[#351458] flex items-center justify-center whitespace-nowrap">
                                        Upload & Crop
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleHeroImageSelect(e, index)}
                                        />
                                    </label>
                                </div>
                            </div>`;

content = content.replace(inputTarget, inputReplacement);

// Add the Cropper Modal to the render
const renderTarget = `return (
        <div className="space-y-6">`;
const renderReplacement = `return (
        <div className="space-y-6">
            <ImageCropperModal
                isOpen={cropperOpen}
                onClose={() => { setCropperOpen(false); setCropImageFile(null); }}
                imageFile={cropImageFile}
                aspect={window.innerWidth < 768 ? 9 / 16 : 1920 / 820}
                onCropComplete={handleCropComplete}
            />`;

if (!content.includes('<ImageCropperModal')) {
    content = content.replace(renderTarget, renderReplacement);
}

fs.writeFileSync(file, content);
