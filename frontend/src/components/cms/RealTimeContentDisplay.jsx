import { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../utils/api';

const RealTimeContentDisplay = ({ category, type, limit = 10 }) => {
    const socket = useSocket();
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContents();
    }, [category, type, limit]);

    // Real-time updates
    useEffect(() => {
        if (socket) {
            const handleContentUpdate = (data) => {
                console.log('Real-time content update received:', data);
                loadContents(); // Reload content on any update
            };

            socket.on('contentCreated', handleContentUpdate);
            socket.on('contentUpdated', handleContentUpdate);
            socket.on('contentDeleted', handleContentUpdate);
            socket.on('contentPublished', handleContentUpdate);
            socket.on('contentUnpublished', handleContentUpdate);

            return () => {
                socket.off('contentCreated', handleContentUpdate);
                socket.off('contentUpdated', handleContentUpdate);
                socket.off('contentDeleted', handleContentUpdate);
                socket.off('contentPublished', handleContentUpdate);
                socket.off('contentUnpublished', handleContentUpdate);
            };
        }
    }, [socket]);

    const loadContents = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (category) params.append('category', category);
            if (type) params.append('type', type);
            if (limit) params.append('limit', limit);

            const response = await api.get(`/api/cms/public?${params}`);
            if (response.data.success) {
                setContents(response.data.data);
            }
        } catch (error) {
            console.error('Error loading public content:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (contents.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                No content available
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {contents.map((content) => (
                <div
                    key={content._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                    {content.featuredImage?.url && (
                        <div className="aspect-w-16 aspect-h-9">
                            <img
                                src={content.featuredImage.url}
                                alt={content.featuredImage.alt || content.title}
                                className="w-full h-48 object-cover"
                            />
                        </div>
                    )}

                    <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {content.type}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(content.publishedAt).toLocaleDateString()}
                            </span>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {content.title}
                        </h3>

                        {content.excerpt && (
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {content.excerpt}
                            </p>
                        )}

                        <div
                            className="prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: content.content }}
                        />

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <span>Views: {content.views || 0}</span>
                                {content.likes > 0 && <span>Likes: {content.likes}</span>}
                            </div>

                            <a
                                href={`/${content.slug}`}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
                            >
                                Read More
                            </a>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RealTimeContentDisplay;
