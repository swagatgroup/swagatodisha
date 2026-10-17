import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { showSuccess, showError } from '../../utils/sweetAlert';

// Attaches a document to an existing application (any role; the backend checks access and the
// edit lock). Uses the standard upload endpoint with `studentId`, which stores the file on the
// application as PENDING and replaces any earlier file of the same type.
// With `replaceType` it renders a single "Replace" button for that document type.
const StaffDocumentUploader = ({ applicationId, existingTypes = [], allowedTypes = null, replaceType = null, onUploaded }) => {
    const [documentTypes, setDocumentTypes] = useState([]);
    const [documentType, setDocumentType] = useState(replaceType || '');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (replaceType) return;
        api.get('/api/student-application/document-requirements')
            .then((response) => {
                const reqs = response.data?.data?.requirements;
                if (reqs) setDocumentTypes([...(reqs.required || []), ...(reqs.optional || [])]);
            })
            .catch((error) => console.error('Error fetching document requirements:', error));
    }, []);

    const handleFile = async (file) => {
        if (!file || !documentType || !applicationId) return;
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', documentType);
            formData.append('studentId', applicationId);
            const response = await api.post('/api/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (!response.data?.success) throw new Error(response.data?.message);
            showSuccess('Document uploaded');
            setDocumentType(replaceType || '');
            onUploaded?.(response.data.data);
        } catch (error) {
            showError(error.response?.data?.message || error.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const available = documentTypes.filter(t => !existingTypes.includes(t.key) && (!allowedTypes || allowedTypes.includes(t.key)));

    if (replaceType) {
        return (
            <label className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${uploading ? 'bg-gray-200 text-gray-500 pointer-events-none' : 'bg-[#F0E6FA] text-[#351458] hover:bg-purple-200 cursor-pointer'}`}>
                <i className="fa-solid fa-arrow-up-from-bracket mr-1" aria-hidden="true"></i>
                {uploading ? 'Uploading...' : 'Replace'}
                <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                        handleFile(e.target.files?.[0]);
                        e.target.value = '';
                    }}
                />
            </label>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white"
            >
                <option value="">Select document type...</option>
                {available.map(t => (
                    <option key={t.key} value={t.key}>{t.label || t.key}</option>
                ))}
            </select>
            <label
                className={`flex items-center px-3 py-2 rounded-lg text-sm text-white ${documentType && !uploading ? 'bg-[#4A1D7A] hover:bg-[#351458] cursor-pointer' : 'bg-gray-400 pointer-events-none'}`}
            >
                <i className="fa-solid fa-upload mr-2" aria-hidden="true"></i>
                {uploading ? 'Uploading...' : 'Choose File'}
                <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="hidden"
                    disabled={!documentType || uploading}
                    onChange={(e) => {
                        handleFile(e.target.files?.[0]);
                        e.target.value = '';
                    }}
                />
            </label>
        </div>
    );
};

export default StaffDocumentUploader;
