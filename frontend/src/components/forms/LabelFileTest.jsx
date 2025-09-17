import { useState } from 'react';

const LabelFileTest = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [debugInfo, setDebugInfo] = useState('');

    const handleFileChange = (e) => {
        console.log('File changed:', e.target.files);
        setDebugInfo('File input triggered via label');

        if (e.target.files && e.target.files[0]) {
            console.log('File selected:', e.target.files[0].name);
            setSelectedFile(e.target.files[0]);
            setDebugInfo(`File selected: ${e.target.files[0].name}`);
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Label File Input Test</h3>

            <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <label htmlFor="file-input" className="cursor-pointer">
                        <div className="flex flex-col items-center">
                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Click here to select file
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                JPG, PNG, PDF up to 5MB
                            </p>
                        </div>
                    </label>

                    <input
                        id="file-input"
                        type="file"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                    />
                </div>

                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        This uses a label to trigger the file input - should work in all browsers.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Debug: {debugInfo}
                    </p>
                    {selectedFile && (
                        <p className="text-sm text-green-600 mt-2">
                            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LabelFileTest;
