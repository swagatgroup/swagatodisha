import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { showSuccess, showError } from '../../utils/sweetAlert';

// Lets staff attach a document to an existing application (e.g. when the student's own
// upload was never saved). Uses the standard upload endpoint with `studentId`, which stores
// the file on the application as PENDING and replaces any earlier file of the same type.
const StaffDocumentUploader = ({ applicationId, existingTypes = [], onUploaded }) => {
    const [documentTypes, setDocumentTypes] = useState([]);
    const [documentType, setDocumentType] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
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
            setDocumentType('');
            onUploaded?.(response.data.data);
        } catch (error) {
            showError(error.response?.data?.message || error.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const available = documentTypes.filter(t => !existingTypes.includes(t.key));

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
