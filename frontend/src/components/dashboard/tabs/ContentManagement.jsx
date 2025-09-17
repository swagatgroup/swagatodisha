import {useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';

const ContentManagement = () => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [uploadData, setUploadData] = useState({
        title: '',
        description: '',
        course: '',
        subject: '',
        type: 'study_material',
        file: null
    });

    const courses = [
        "B.Tech Computer Science", "B.Tech Mechanical Engineering", "B.Tech Electrical Engineering",
        "B.Tech Civil Engineering", "B.Tech Electronics & Communication", "B.Tech Information Technology",
        "MBA", "BCA", "MCA", "B.Com", "M.Com", "BA", "MA English", "BSc Mathematics", "MSc Physics"
    ];

    const contentTypes = [
        { id: 'study_material', name: 'Study Material', icon: '📚' },
        { id: 'assignment', name: 'Assignment', icon: '📝' },
        { id: 'video_lecture', name: 'Video Lecture', icon: '🎥' },
        { id: 'question_paper', name: 'Question Paper', icon: '📄' },
        { id: 'reference_book', name: 'Reference Book', icon: '📖' },
        { id: 'presentation', name: 'Presentation', icon: '📊' }
    ];

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/staff/content');
            if (response.data.success) {
                setContent(response.data.data);
            }
        } catch (error) {
            console.error('Error loading content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();

        if (!uploadData.file || !uploadData.course) {
            alert('Please select a file and course');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', uploadData.file);
            formData.append('title', uploadData.title);
            formData.append('description', uploadData.description);
            formData.append('course', uploadData.course);
            formData.append('subject', uploadData.subject);
            formData.append('type', uploadData.type);

            const response = await api.post('/api/staff/content/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                alert('Content uploaded successfully!');
                setShowUploadModal(false);
                setUploadData({
                    title: '',
                    description: '',
                    course: '',
                    subject: '',
                    type: 'study_material',
                    file: null
                });
                loadContent();
            }
        } catch (error) {
            console.error('Error uploading content:', error);
            alert('Error uploading content. Please try again.');
        }
    };

    const handleDelete = async (contentId) => {
        if (!window.confirm('Are you sure you want to delete this content?')) {
            return;
        }

        try {
            const response = await api.delete(`/api/staff/content/${contentId}`);
            if (response.data.success) {
                alert('Content deleted successfully!');
                loadContent();
            }
        } catch (error) {
            console.error('Error deleting content:', error);
            alert('Error deleting content. Please try again.');
        }
    };

    const getContentTypeIcon = (type) => {
        const contentType = contentTypes.find(ct => ct.id === type);
        return contentType ? contentType.icon : '📄';
    };

    const getContentTypeName = (type) => {
        const contentType = contentTypes.find(ct => ct.id === type);
        return contentType ? contentType.name : 'Unknown';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const groupedContent = content.reduce((acc, item) => {
        if (!acc[item.course]) {
            acc[item.course] = [];
        }
        acc[item.course].push(item);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Upload Button */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Academic Content Management</h3>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Upload Content</span>
                </button>
            </div>

            {/* Content by Course */}
            {Object.keys(groupedContent).length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No content uploaded</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by uploading your first piece of content.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedContent).map(([course, courseContent]) => (
                        <motion.div
                            key={course}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-lg shadow"
                        >
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h4 className="text-lg font-semibold text-gray-900">{course}</h4>
                                <p className="text-sm text-gray-500">{courseContent.length} items</p>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {courseContent.map((item) => (
                                        <motion.div
                                            key={item._id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-2xl">{getContentTypeIcon(item.type)}</span>
                                                    <div>
                                                        <h5 className="font-medium text-gray-900">{item.title}</h5>
                                                        <p className="text-sm text-gray-500">{getContentTypeName(item.type)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex space-x-1">
                                                    <button
                                                        onClick={() => {
                                                            // Download file
                                                            window.open(`/api/staff/content/${item._id}/download`, '_blank');
                                                        }}
                                                        className="p-1 text-blue-600 hover:text-blue-800"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        className="p-1 text-red-600 hover:text-red-800"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            {item.description && (
                                                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                                            )}

                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>{formatFileSize(item.fileSize)}</span>
                                                <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                                            </div>

                                            {item.subject && (
                                                <div className="mt-2">
                                                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                        {item.subject}
                                                    </span>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Upload Content</h3>
                        </div>

                        <form onSubmit={handleFileUpload} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={uploadData.title}
                                    onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter content title"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={uploadData.description}
                                    onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    rows="3"
                                    placeholder="Enter content description"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
                                    <select
                                        value={uploadData.course}
                                        onChange={(e) => setUploadData(prev => ({ ...prev, course: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map(course => (
                                            <option key={course} value={course}>{course}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        value={uploadData.subject}
                                        onChange={(e) => setUploadData(prev => ({ ...prev, subject: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter subject (optional)"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type *</label>
                                <select
                                    value={uploadData.type}
                                    onChange={(e) => setUploadData(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                >
                                    {contentTypes.map(type => (
                                        <option key={type.id} value={type.id}>
                                            {type.icon} {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">File *</label>
                                <input
                                    type="file"
                                    onChange={(e) => setUploadData(prev => ({ ...prev, file: e.target.files[0] }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov,.jpg,.jpeg,.png"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Supported formats: PDF, DOC, DOCX, PPT, PPTX, MP4, AVI, MOV, JPG, JPEG, PNG
                                </p>
                            </div>

                            <div className="flex justify-end space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Upload
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentManagement;
