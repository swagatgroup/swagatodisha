const fs = require('fs');
const path = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/tabs/WebsiteContentManagement.jsx';
let content = fs.readFileSync(path, 'utf8');

// Add tab
if (!content.includes("{ id: 'approvals', name: 'Approvals & Recognitions', icon: '🏅' }")) {
    content = content.replace(
        "{ id: 'seo', name: 'SEO Settings', icon: '🔍' }",
        "{ id: 'seo', name: 'SEO Settings', icon: '🔍' },\n        { id: 'approvals', name: 'Approvals & Recognitions', icon: '🏅' }"
    );
}

// Add nested array handlers
if (!content.includes('const handleNestedArrayItemChange')) {
    content = content.replace(
        "const removeArrayItem = (path, index) => {",
        `const handleNestedArrayItemChange = (path, parentIndex, childArrayKey, childIndex, field, value) => {
        const newContent = { ...content };
        const keys = path.split('.');
        let current = newContent;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = [];
            current = current[keys[i]];
        }
        if (!current[parentIndex]) current[parentIndex] = {};
        if (!current[parentIndex][childArrayKey]) current[parentIndex][childArrayKey] = [];
        if (!current[parentIndex][childArrayKey][childIndex]) current[parentIndex][childArrayKey][childIndex] = {};
        current[parentIndex][childArrayKey][childIndex][field] = value;
        setContent(newContent);
    };

    const addNestedArrayItem = (path, parentIndex, childArrayKey, newItem) => {
        const newContent = { ...content };
        const keys = path.split('.');
        let current = newContent;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = [];
            current = current[keys[i]];
        }
        if (!current[parentIndex]) current[parentIndex] = {};
        if (!current[parentIndex][childArrayKey]) current[parentIndex][childArrayKey] = [];
        current[parentIndex][childArrayKey].push(newItem);
        setContent(newContent);
    };

    const removeNestedArrayItem = (path, parentIndex, childArrayKey, childIndex) => {
        const newContent = { ...content };
        const keys = path.split('.');
        let current = newContent;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = [];
            current = current[keys[i]];
        }
        if (current[parentIndex] && current[parentIndex][childArrayKey]) {
            current[parentIndex][childArrayKey].splice(childIndex, 1);
            setContent(newContent);
        }
    };

    const removeArrayItem = (path, index) => {`
    );
}

// Add render code
if (!content.includes('const renderApprovalsRecognitions = () =>')) {
    const renderCode = `
    const renderApprovalsRecognitions = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Approvals & Recognitions</h3>
                <button
                    onClick={() => addArrayItem('approvalsRecognitions', { name: '', order: 0, isActive: true, approvals: [] })}
                    className="px-4 py-2 bg-[#387B95] text-white rounded-lg hover:bg-[#1D4B5E]"
                >
                    Add Institution
                </button>
            </div>

            <div className="space-y-6">
                {(content?.approvalsRecognitions || []).map((institution, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900">Institution: {institution.name || 'New Institution'}</h4>
                            <button
                                onClick={() => removeArrayItem('approvalsRecognitions', index)}
                                className="text-red-600 hover:text-red-800"
                            >
                                Remove Institution
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name</label>
                                <input
                                    type="text"
                                    value={institution.name || ''}
                                    onChange={(e) => handleArrayItemChange('approvalsRecognitions', index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#387B95]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                                <input
                                    type="number"
                                    value={institution.order || 0}
                                    onChange={(e) => handleArrayItemChange('approvalsRecognitions', index, 'order', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#387B95]"
                                />
                            </div>
                            <div className="flex items-center mt-6">
                                <input
                                    type="checkbox"
                                    checked={institution.isActive !== false}
                                    onChange={(e) => handleArrayItemChange('approvalsRecognitions', index, 'isActive', e.target.checked)}
                                    className="h-4 w-4 text-[#387B95] border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">Active</label>
                            </div>
                        </div>

                        <div className="mt-6 border-t border-gray-200 pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h5 className="font-medium text-gray-700">Approvals / Documents</h5>
                                <button
                                    onClick={() => addNestedArrayItem('approvalsRecognitions', index, 'approvals', { name: '', logo: '', pdf: '' })}
                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                >
                                    Add Approval
                                </button>
                            </div>

                            <div className="space-y-4">
                                {(institution.approvals || []).map((approval, appIdx) => (
                                    <div key={appIdx} className="bg-white p-4 rounded border border-gray-100 flex gap-4 items-start">
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Approval Name</label>
                                                <input
                                                    type="text"
                                                    value={approval.name || ''}
                                                    onChange={(e) => handleNestedArrayItemChange('approvalsRecognitions', index, 'approvals', appIdx, 'name', e.target.value)}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#387B95]"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Logo URL (Image)</label>
                                                    <input
                                                        type="text"
                                                        value={approval.logo || ''}
                                                        onChange={(e) => handleNestedArrayItemChange('approvalsRecognitions', index, 'approvals', appIdx, 'logo', e.target.value)}
                                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#387B95]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">PDF URL</label>
                                                    <input
                                                        type="text"
                                                        value={approval.pdf || ''}
                                                        onChange={(e) => handleNestedArrayItemChange('approvalsRecognitions', index, 'approvals', appIdx, 'pdf', e.target.value)}
                                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#387B95]"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeNestedArrayItem('approvalsRecognitions', index, 'approvals', appIdx)}
                                            className="text-red-500 hover:text-red-700 p-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
`;
    content = content.replace("const renderTabContent = () => {", renderCode + "\n    const renderTabContent = () => {");
    
    // Add to switch
    content = content.replace(
        "case 'seo':\n                return renderSEOSettings();",
        "case 'seo':\n                return renderSEOSettings();\n            case 'approvals':\n                return renderApprovalsRecognitions();"
    );
}

fs.writeFileSync(path, content, 'utf8');
