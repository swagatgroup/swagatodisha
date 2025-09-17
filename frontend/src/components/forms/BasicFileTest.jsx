import { useState } from 'react';

const BasicFileTest = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [debugInfo, setDebugInfo] = useState('');

    const handleFileChange = (e) => {
        console.log('File changed:', e.target.files);
        setDebugInfo('File input triggered');

        if (e.target.files && e.target.files[0]) {
            console.log('File selected:', e.target.files[0].name);
            setSelectedFile(e.target.files[0]);
            setDebugInfo(`File selected: ${e.target.files[0].name}`);
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Basic File Input Test (No Refs)</h3>

            <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        This is a basic file input without any JavaScript tricks.
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

export default BasicFileTest;
