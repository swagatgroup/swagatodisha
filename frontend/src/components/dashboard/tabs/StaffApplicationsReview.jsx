import {useEffect, useState} from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';
import { useSocket } from '../../../contexts/SocketContext';

const StaffApplicationsReview = () => {
    const { socket } = useSocket();
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [statusFilter, setStatusFilter] = useState('SUBMITTED');
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const load = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/student-application/applications?status=${statusFilter}`);
            if (res.data?.success) {
                setApplications(res.data.data.applications || res.data.data || []);
            } else {
                setApplications([]);
            }
        } catch (e) {
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [statusFilter]);

    useEffect(() => {
        if (!socket) return;
        const onUpdate = () => load();
        socket.on('application_submitted', onUpdate);
        socket.on('application_approved', onUpdate);
        socket.on('application_rejected', onUpdate);
        return () => {
            socket.off('application_submitted', onUpdate);
            socket.off('application_approved', onUpdate);
            socket.off('application_rejected', onUpdate);
        };
    }, [socket]);

    const approve = async (app) => {
        try {
            setActionLoadingId(app.applicationId);
            await api.put(`/api/student-application/${app.applicationId}/approve`, { remarks: 'Approved by staff' });
            await load();
        } finally {
            setActionLoadingId(null);
        }
    };

    const reject = async (app) => {
        const reason = window.prompt('Enter rejection reason');
        if (!reason) return;
        try {
            setActionLoadingId(app.applicationId);
            await api.put(`/api/student-application/${app.applicationId}/reject`, { rejectionReason: reason, remarks: 'Rejected by staff' });
            await load();
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Applications Review</h3>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-md">
                    {['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : applications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 border rounded">No applications</div>
            ) : (
                <div className="space-y-3">
                    {applications.map((app, idx) => (
                        <motion.div key={app._id || idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border rounded p-4 bg-white flex items-center justify-between">
                            <div>
                                <div className="font-medium text-gray-900">{app.user?.fullName || 'Student'}</div>
                                <div className="text-xs text-gray-500">{app.applicationId} • {new Date(app.updatedAt || app.createdAt).toLocaleString()}</div>
                                <div className="text-xs text-gray-600 mt-1">Stage: {app.currentStage} • Status: {app.status}</div>
                            </div>
                            <div className="flex items-center space-x-3">
                                {statusFilter === 'SUBMITTED' || statusFilter === 'UNDER_REVIEW' ? (
                                    <>
                                        <button onClick={() => approve(app)} disabled={actionLoadingId === app.applicationId} className="px-3 py-2 bg-green-600 text-white rounded disabled:opacity-50">{actionLoadingId === app.applicationId ? 'Working...' : 'Approve'}</button>
                                        <button onClick={() => reject(app)} disabled={actionLoadingId === app.applicationId} className="px-3 py-2 bg-red-600 text-white rounded disabled:opacity-50">Reject</button>
                                    </>
                                ) : (
                                    <span className="text-sm text-gray-500">No actions</span>
                                )}
                            </div>
                        </motion.div>))}
                </div>
            )}
        </div>
    );
};

export default StaffApplicationsReview;


