import {useState, useEffect} from 'react';
import { useSocket } from '../../contexts/SocketContext';

const RealTimeActivityFeed = () => {
    const [activities, setActivities] = useState([]);
    const { socket } = useSocket();

    useEffect(() => {
        if (socket) {
            // Listen for various real-time events
            const handleDocumentUpload = (data) => {
                addActivity({
                    id: Date.now(),
                    type: 'upload',
                    message: `New document uploaded: ${data.documentName}`,
                    timestamp: new Date(),
                    user: data.studentName
                });
            };

            const handleDocumentReview = (data) => {
                addActivity({
                    id: Date.now(),
                    type: 'review',
                    message: `Document reviewed: ${data.status}`,
                    timestamp: new Date(),
                    user: data.reviewedBy
                });
            };

            const handleDocumentStatusChange = (data) => {
                addActivity({
                    id: Date.now(),
                    type: 'status_change',
                    message: `Document status changed to: ${data.status}`,
                    timestamp: new Date(),
                    user: data.reviewedBy
                });
            };

            socket.on('new_document_uploaded', handleDocumentUpload);
            socket.on('document_reviewed', handleDocumentReview);
            socket.on('document_status_changed', handleDocumentStatusChange);

            return () => {
                socket.off('new_document_uploaded', handleDocumentUpload);
                socket.off('document_reviewed', handleDocumentReview);
                socket.off('document_status_changed', handleDocumentStatusChange);
            };
        }
    }, [socket]);

    const addActivity = (activity) => {
        setActivities(prev => [activity, ...prev.slice(0, 19)]); // Keep last 20 activities
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'upload':
                return (
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                );
            case 'review':
                return (
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'status_change':
                return (
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    if (activities.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Real-time Activity</h3>
                <div className="text-center text-gray-500 py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p className="mt-2">No recent activity</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Real-time Activity</h3>
                <p className="text-sm text-gray-500">Live updates from the system</p>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {activities.map((activity) => (
                    <div key={activity.id} className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900">{activity.message}</p>
                                <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                                    <span>{activity.user}</span>
                                    <span>•</span>
                                    <span>{new Date(activity.timestamp).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RealTimeActivityFeed;
