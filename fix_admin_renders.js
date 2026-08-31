const fs = require('fs');
const path = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/tabs/WebsiteContentManagement.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('const renderStaffProfiles = () =>')) {
    const renderCode = `
    const handleStaffImageUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploadingStaff(true);
            const compressedFile = await compressImageToWebP(file);
            const formData = new FormData();
            formData.append('file', compressedFile);
            const uploadRes = await api.post('/api/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (uploadRes.data.success) {
                handleArrayItemChange('staffProfiles', index, 'image', uploadRes.data.data.url || uploadRes.data.url);
                alert('Staff image uploaded and compressed successfully!');
            }
        } catch (error) {
            console.error('Error uploading staff image:', error);
            alert('Failed to upload image.');
        } finally {
            setUploadingStaff(false);
        }
    };

    const renderStaffProfiles = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Staff Profiles (About Us)</h3>
                <button
                    onClick={() => addArrayItem('staffProfiles', { name: '', designation: '', image: '', order: 0, isActive: true })}
                    className="px-4 py-2 bg-[#387B95] text-white rounded-lg hover:bg-[#1D4B5E]"
                >
                    Add Staff Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(content?.staffProfiles || []).map((staff, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm relative">
                        <button
                            onClick={() => removeArrayItem('staffProfiles', index)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white rounded-full p-1 shadow"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>

                        <div className="mb-4 mt-2">
                            {staff.image ? (
                                <img src={staff.image} alt="Staff" className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-[#387B95]" />
                            ) : (
                                <div className="w-24 h-24 rounded-full mx-auto bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-400">
                                    <span className="text-gray-400 text-xs text-center px-2">No Image</span>
                                </div>
                            )}
                            <div className="mt-3 text-center">
                                <label className="cursor-pointer bg-white text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 transition">
                                    {uploadingStaff ? 'Compressing & Uploading...' : 'Upload Image'}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleStaffImageUpload(e, index)} disabled={uploadingStaff} />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={staff.name || ''}
                                    onChange={(e) => handleArrayItemChange('staffProfiles', index, 'name', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#387B95]"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Designation</label>
                                <input
                                    type="text"
                                    value={staff.designation || ''}
                                    onChange={(e) => handleArrayItemChange('staffProfiles', index, 'designation', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#387B95]"
                                    placeholder="e.g. Staff, Agent"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Order</label>
                                    <input
                                        type="number"
                                        value={staff.order || 0}
                                        onChange={(e) => handleArrayItemChange('staffProfiles', index, 'order', parseInt(e.target.value))}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#387B95]"
                                    />
                                </div>
                                <div className="flex items-end pb-1">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={staff.isActive !== false}
                                            onChange={(e) => handleArrayItemChange('staffProfiles', index, 'isActive', e.target.checked)}
                                            className="h-4 w-4 text-[#387B95] border-gray-300 rounded mr-2"
                                        />
                                        <span className="text-xs text-gray-700">Active</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const handleGalleryUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploadingGallery(true);
            const compressedFile = await compressImageToWebP(file);
            const formData = new FormData();
            formData.append('file', compressedFile);
            
            // Upload to files
            const uploadRes = await api.post('/api/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (uploadRes.data.success) {
                const imgUrl = uploadRes.data.data.url || uploadRes.data.url;
                // Create Gallery Record
                await api.post('/api/gallery', {
                    title: file.name,
                    imageUrl: imgUrl,
                    category: 'General', // Default, they can't change it based on requirements yet
                    isActive: true
                });
                alert('Gallery image uploaded and compressed successfully!');
                loadGallery(); // Reload
            }
        } catch (error) {
            console.error('Error uploading gallery image:', error);
            alert('Failed to upload image.');
        } finally {
            setUploadingGallery(false);
        }
    };

    const deleteGalleryItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;
        try {
            await api.delete(\`/api/gallery/\${id}\`);
            loadGallery();
        } catch (error) {
            console.error('Error deleting gallery image:', error);
            alert('Failed to delete image.');
        }
    };

    const renderGalleryManagement = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Gallery Management</h3>
                    <p className="text-sm text-gray-500">Images are automatically compressed to WebP format under 100KB.</p>
                </div>
                <label className="px-4 py-2 bg-[#387B95] text-white rounded-lg hover:bg-[#1D4B5E] cursor-pointer transition">
                    {uploadingGallery ? 'Uploading & Compressing...' : 'Upload New Image'}
                    <input type="file" className="hidden" accept="image/*" onChange={handleGalleryUpload} disabled={uploadingGallery} />
                </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {galleryImages.map((img) => (
                    <div key={img._id} className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-square bg-gray-100">
                        <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <button onClick={() => deleteGalleryItem(img._id)} className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    </div>
                ))}
                {galleryImages.length === 0 && !uploadingGallery && (
                    <div className="col-span-full py-12 text-center text-gray-500">No images found in the gallery.</div>
                )}
            </div>
        </div>
    );
`;
    content = content.replace("const renderTabContent = () => {", renderCode + "\n    const renderTabContent = () => {");
    
    // Add to switch
    content = content.replace(
        "case 'approvals':\n                return renderApprovalsRecognitions();",
        "case 'approvals':\n                return renderApprovalsRecognitions();\n            case 'staff':\n                return renderStaffProfiles();\n            case 'gallery':\n                return renderGalleryManagement();"
    );
}

fs.writeFileSync(path, content, 'utf8');
