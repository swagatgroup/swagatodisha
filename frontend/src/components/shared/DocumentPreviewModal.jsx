import React, { useEffect } from 'react';

// Shows an uploaded document (image or PDF) inside a modal instead of opening a new tab.
// `doc` = { url, title, mimeType }. Renders nothing when doc is null.
const getKind = (url = '', mimeType = '') => {
    const type = mimeType.toLowerCase();
    const path = url.split('?')[0].toLowerCase();
    if (type.startsWith('image/') || /\.(jpe?g|png|gif|webp|bmp|svg)$/.test(path)) return 'image';
    if (type.includes('pdf') || path.endsWith('.pdf')) return 'pdf';
    return 'other';
};

const DocumentPreviewModal = ({ doc, onClose }) => {
    useEffect(() => {
        if (!doc) return undefined;
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [doc, onClose]);

    if (!doc) return null;
    const kind = getKind(doc.url, doc.mimeType);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-[#231A2E] rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{doc.title || 'Document'}</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100" title="Close">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 min-h-0 bg-gray-100 dark:bg-[#1A1212] flex items-center justify-center">
                    {kind === 'image' && (
                        <img src={doc.url} alt={doc.title || 'Document'} className="max-w-full max-h-full object-contain" />
                    )}
                    {kind === 'pdf' && (
                        <iframe src={doc.url} title={doc.title || 'Document'} className="w-full h-full border-0" />
                    )}
                    {kind === 'other' && (
                        <div className="text-center p-6">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">This file type can't be previewed here.</p>
                            <a href={doc.url} download className="px-4 py-2 rounded-md text-white bg-[#4A1D7A] hover:bg-[#351458] text-sm font-medium">
                                Download File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentPreviewModal;
