import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import api from '../../utils/api';

const DocumentUpload = ({ userRole, onUploadSuccess, maxFiles = 5 }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const documentTypes = {
        student: [
            'academic_certificate', 'identity_proof', 'address_proof',
            'income_certificate', 'caste_certificate', 'photo', 'signature',
            'migration_certificate', 'tc', 'mark_sheet', 'entrance_exam_card'
        ],
        staff: ['identity_proof', 'address_proof', 'qualification_certificate'],
        agent: ['identity_proof', 'address_proof', 'business_registration'],
        admin: ['all'] // Admin can upload any type
    };

    const onDrop = useCallback((acceptedFiles) => {
        const validFiles = acceptedFiles.filter(file => {
            const isValidType = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
                .includes(file.type);
            const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

            if (!isValidType) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid File Type',
                    text: `${file.name} is not a supported file type.`
                });
                return false;
            }

            if (!isValidSize) {
                Swal.fire({
                    icon: 'error',
                    title: 'File Too Large',
                    text: `${file.name} exceeds the 10MB size limit.`
                });
                return false;
            }

            return true;
        });

        setSelectedFiles(prev => [...prev, ...validFiles].slice(0, maxFiles));
    }, [maxFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            'image/webp': ['.webp']
        },
        maxFiles,
        multiple: true
    });

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadFiles = async () => {
        if (selectedFiles.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Files Selected',
                text: 'Please select at least one file to upload.'
            });
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const uploadPromises = selectedFiles.map(async (file, index) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('documentType', file.documentType || 'other');
                formData.append('priority', file.priority || 'medium');

                const response = await api.post('/api/documents/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                setUploadProgress(((index + 1) / selectedFiles.length) * 100);
                return response.data;
            });

            const results = await Promise.all(uploadPromises);
            const successCount = results.filter(r => r.success).length;

            if (successCount === selectedFiles.length) {
                Swal.fire({
                    icon: 'success',
                    title: 'Upload Successful!',
                    text: `All ${successCount} documents uploaded successfully.`
                });
                setSelectedFiles([]);
                onUploadSuccess?.();
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Partial Upload',
                    text: `${successCount} of ${selectedFiles.length} documents uploaded successfully.`
                });
            }
        } catch (e) {
            console.error('Upload error:', e);
            Swal.fire({
                icon: 'error',
                title: 'Upload Failed',
                text: 'Failed to upload documents. Please try again.'
            });
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>

            {/* Drag and Drop Zone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
            >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">
                    {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to browse'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    Supports PDF, JPEG, PNG, WebP (Max: 10MB per file)
                </p>
            </div>

            {/* Selected Files */}
            <AnimatePresence>
                {selectedFiles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4"
                    >
                        <h4 className="font-medium mb-2">Selected Files ({selectedFiles.length})</h4>
                        <div className="space-y-2">
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <FileText className="h-5 w-5 text-blue-500" />
                                        <div>
                                            <p className="text-sm font-medium">{file.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                                        disabled={uploading}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Progress */}
            {uploading && (
                <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span>Uploading...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Upload Button */}
            {selectedFiles.length > 0 && (
                <button
                    onClick={uploadFiles}
                    disabled={uploading}
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        `Upload ${selectedFiles.length} File(s)`
                    )}
                </button>
            )}
        </div>
    );
};

export default DocumentUpload;
