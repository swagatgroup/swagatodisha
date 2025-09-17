import { useRef, useEffect, useState } from 'react';

const SimpleFileTest = () => {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [debugInfo, setDebugInfo] = useState('');

    useEffect(() => {
        console.log('SimpleFileTest mounted, fileInputRef:', fileInputRef.current);
        setDebugInfo(`File input ref exists: ${!!fileInputRef.current}`);
    }, []);

    const handleClick = () => {
        console.log('Button clicked, file input ref:', fileInputRef.current);
        setDebugInfo(`Button clicked - Ref exists: ${!!fileInputRef.current}`);

        if (fileInputRef.current) {
            console.log('Attempting to click file input');
            try {
                fileInputRef.current.click();
                console.log('File input click triggered');
                setDebugInfo(prev => prev + ' - Click triggered');
            } catch (error) {
                console.error('Error clicking file input:', error);
                setDebugInfo(prev => prev + ` - Error: ${error.message}`);
            }
        } else {
            console.error('File input ref is null');
            setDebugInfo(prev => prev + ' - Ref is null');
        }
    };

    const handleFileChange = (e) => {
        console.log('File changed:', e.target.files);
        if (e.target.files && e.target.files[0]) {
            console.log('File selected:', e.target.files[0].name);
            setSelectedFile(e.target.files[0]);
            setDebugInfo(prev => prev + ` - File selected: ${e.target.files[0].name}`);
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Simple File Input Test</h3>

            <div className="space-y-4">
                <button
                    onClick={handleClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Click to Select File
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                />

                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        This button should open a file dialog when clicked.
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

export default SimpleFileTest;
