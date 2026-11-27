import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Modal from '../site/Modal';
import api from '../../utils/api';
import { fmtDate } from './StaffAttendanceTab';

const FaceCameraModal = lazy(() => import('../face/FaceCameraModal'));
const FaceIdSetup = lazy(() => import('../face/FaceIdSetup'));

// How long "Remind me later" hides the pop-up
const SNOOZE_MS = 30 * 60 * 1000;
const TICK_MS = 60 * 1000;

// Calendar day in India time; a new day starts at midnight
const istDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
const snoozeKey = (userId) => `attendance_snooze_${userId}`;

const readSnooze = (userId) => {
    try {
        const s = JSON.parse(localStorage.getItem(snoozeKey(userId)) || 'null');
        return s && s.date === istDate() ? s.until : 0;
    } catch { return 0; }
};

// Staff and agents: asks for today's attendance when they open the dashboard,
// and again every 30 minutes until it is marked. Once marked, it stays quiet until midnight.
const AttendanceReminder = ({ user }) => {
    const userId = user?._id || user?.id;
    const [open, setOpen] = useState(false);
    const [registered, setRegistered] = useState(true);
    const [camera, setCamera] = useState(false);
    const [faceSetup, setFaceSetup] = useState(false);
    const markedDay = useRef(null); // the day we know attendance is marked
    const busy = useRef(false);

    const check = useCallback(async () => {
        if (!userId || busy.current || document.visibilityState === 'hidden') return;
        const day = istDate();
        if (markedDay.current === day || readSnooze(userId) > Date.now()) return;
        busy.current = true;
        try {
            const res = await api.get('/api/attendance/today', { silent: true });
            if (res.data.data) {
                markedDay.current = res.data.date || day;
                setOpen(false);
            } else {
                setRegistered(!!res.data.isFaceRegistered);
                setOpen(true);
            }
        } catch {
            // Network or server trouble: try again on the next tick
        } finally {
            busy.current = false;
        }
    }, [userId]);

    useEffect(() => {
        check();
        const timer = setInterval(check, TICK_MS);
        const onVisible = () => { if (document.visibilityState === 'visible') check(); };
        const onUpdated = () => { markedDay.current = null; check(); };
        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('attendance:updated', onUpdated);
        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('attendance:updated', onUpdated);
        };
    }, [check]);

    const snooze = () => {
        try { localStorage.setItem(snoozeKey(userId), JSON.stringify({ date: istDate(), until: Date.now() + SNOOZE_MS })); } catch { /* reminder just comes back sooner */ }
        setOpen(false);
    };

    const capture = async ({ descriptor, blob }) => {
        const form = new FormData();
        form.append('descriptor', JSON.stringify(descriptor));
        if (blob) form.append('selfie', blob, 'selfie.jpg');
        try {
            const res = await api.post('/api/attendance/check-in', form, { timeout: 60000 });
            return { ok: res.data.success, message: res.data.message };
        } catch (err) {
            // Already checked in today (another tab or device): nothing more to do
            if (err.response?.status === 409) {
                setCamera(false);
                window.dispatchEvent(new Event('attendance:updated'));
            }
            return { ok: false, message: err.response?.data?.message || 'Could not mark attendance. Please try again.' };
        }
    };

    return (
        <>
            <Modal open={open && !camera && !faceSetup} onClose={snooze} closeLabel="Remind me later" title="Mark today's attendance" size="sm">
                <p className="text-sm text-gray-700 dark:text-gray-200">
                    Good to see you! You haven't marked your attendance for <b>{fmtDate(istDate())}</b> yet. It takes a few seconds with Face ID.
                </p>
                {!registered && (
                    <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                        First, register your Face ID once. After that you can mark attendance every day.
                    </p>
                )}
                <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
                    <button type="button" onClick={() => (registered ? setCamera(true) : setFaceSetup(true))}
                        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0E1A3D] px-6 text-sm font-semibold text-white hover:bg-[#0A1430]">
                        {registered ? 'Mark attendance now' : 'Register Face ID'}
                    </button>
                    <button type="button" onClick={snooze}
                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-gray-300 px-6 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-white/5">
                        Remind me in 30 minutes
                    </button>
                </div>
            </Modal>
            <Suspense fallback={null}>
                {camera && (
                    <FaceCameraModal
                        open={camera}
                        onClose={() => setCamera(false)}
                        title="Check in"
                        description="Look at the camera to confirm it's you."
                        onCapture={capture}
                        onDone={() => { setCamera(false); window.dispatchEvent(new Event('attendance:updated')); }}
                        successText="Checked in!"
                    />
                )}
                {faceSetup && <FaceIdSetup open={faceSetup} onClose={() => { setFaceSetup(false); markedDay.current = null; check(); }} />}
            </Suspense>
        </>
    );
};

export default AttendanceReminder;
