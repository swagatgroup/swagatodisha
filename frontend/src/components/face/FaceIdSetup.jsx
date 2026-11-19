import { useEffect, useState } from 'react';
import Modal from '../site/Modal';
import FaceCameraModal from './FaceCameraModal';
import api from '../../utils/api';

// "Face ID" from the profile menu (staff, agents, super admin).
// Registration needs consent; once saved, only the super admin can reset it.
const FaceIdSetup = ({ open, onClose }) => {
    const [status, setStatus] = useState(null);
    const [consent, setConsent] = useState(false);
    const [camera, setCamera] = useState(false);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        if (!open) return;
        setConsent(false);
        setLoadError('');
        api.get('/api/face/status', { silent: true })
            .then((res) => setStatus(res.data.data))
            .catch(() => setLoadError('Could not load your Face ID status. Please try again.'));
    }, [open]);

    const registered = status?.isFaceRegistered;

    return (
        <>
            <Modal open={open && !camera} onClose={onClose} title="Face ID" size="sm">
                {loadError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</p>}
                {!status && !loadError && <p className="text-sm text-gray-500">Loading…</p>}
                {status && registered && (
                    <div className="space-y-3 text-sm text-gray-700">
                        <p className="rounded-lg bg-green-50 px-3 py-2 font-semibold text-green-800">
                            Face ID is registered{status.faceRegisteredAt ? ` (since ${new Date(status.faceRegisteredAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })})` : ''}.
                        </p>
                        <p>{status.requireFaceLogin ? 'You sign in with your password and then your face.' : 'Face login is not switched on for your account yet.'}</p>
                        <p className="text-gray-500">To register again, ask the super admin to reset your Face ID.</p>
                    </div>
                )}
                {status && !registered && (
                    <div className="space-y-4 text-sm text-gray-700">
                        <p>Register your face once so you can mark attendance and, if the admin switches it on, add a face check to your sign-in.</p>
                        <ul className="list-disc space-y-1 pl-5 text-gray-600">
                            <li>Your face is turned into 128 numbers on this device. The photo itself is not uploaded during registration.</li>
                            <li>Only those numbers are stored with your account, and the admin can delete them at any time.</li>
                        </ul>
                        <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5" />
                            <span>I agree to Swagat Group of Institutions storing my face data for sign-in and attendance.</span>
                        </label>
                        <button
                            type="button"
                            disabled={!consent}
                            onClick={() => setCamera(true)}
                            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#0E1A3D] px-5 text-sm font-semibold text-white hover:bg-[#0A1430] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Start camera
                        </button>
                    </div>
                )}
            </Modal>

            <FaceCameraModal
                open={open && camera}
                onClose={() => setCamera(false)}
                title="Register Face ID"
                description="Look straight at the camera. We take a few readings."
                samples={3}
                onCapture={async ({ descriptor }) => {
                    const res = await api.post('/api/face/register', { descriptor, consent: true });
                    return { ok: res.data.success, message: res.data.message };
                }}
                onDone={() => {
                    setCamera(false);
                    setStatus((s) => ({ ...s, isFaceRegistered: true, faceRegisteredAt: new Date().toISOString() }));
                }}
                successText="Face ID registered!"
            />
        </>
    );
};

export default FaceIdSetup;
