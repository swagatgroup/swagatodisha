import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import api from '../../utils/api';

const FaceCameraModal = lazy(() => import('../face/FaceCameraModal'));
const FaceIdSetup = lazy(() => import('../face/FaceIdSetup'));

export const fmtTime = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : '—');
export const fmtDate = (ymd) => new Date(`${ymd}T00:00:00+05:30`).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
export const hoursBetween = (a, b) => (a && b ? ((new Date(b) - new Date(a)) / 3600000).toFixed(1) : '—');

export const STATUS_STYLE = {
    Present: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    'Half-Day': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    Absent: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const currentMonth = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()).slice(0, 7);

// Staff and agents: mark attendance with Face ID, see today's status and the monthly log
const StaffAttendanceTab = () => {
    const [today, setToday] = useState(null);
    const [registered, setRegistered] = useState(true);
    const [month, setMonth] = useState(currentMonth);
    const [logs, setLogs] = useState([]);
    const [camera, setCamera] = useState(null); // 'in' | 'out'
    const [faceSetup, setFaceSetup] = useState(false);

    const loadToday = useCallback(async () => {
        try {
            const res = await api.get('/api/attendance/today', { silent: true });
            setToday(res.data.data || false);
            setRegistered(res.data.isFaceRegistered);
        } catch { setToday(false); }
    }, []);

    const loadLogs = useCallback(async () => {
        try {
            const res = await api.get('/api/attendance/my-logs', { silent: true, params: { month } });
            setLogs(res.data.data || []);
        } catch { setLogs([]); }
    }, [month]);

    useEffect(() => { loadToday(); }, [loadToday]);
    useEffect(() => { loadLogs(); }, [loadLogs]);
    // Stay current when attendance is marked from the reminder pop-up, or the tab is reopened on a new day
    useEffect(() => {
        const refresh = () => { if (document.visibilityState !== 'hidden') { loadToday(); loadLogs(); } };
        window.addEventListener('attendance:updated', refresh);
        document.addEventListener('visibilitychange', refresh);
        return () => {
            window.removeEventListener('attendance:updated', refresh);
            document.removeEventListener('visibilitychange', refresh);
        };
    }, [loadToday, loadLogs]);

    const capture = async ({ descriptor, blob }) => {
        const form = new FormData();
        form.append('descriptor', JSON.stringify(descriptor));
        if (blob) form.append('selfie', blob, 'selfie.jpg');
        try {
            const res = await api.post(`/api/attendance/check-${camera}`, form, { timeout: 60000 });
            return { ok: res.data.success, message: res.data.message };
        } catch (err) {
            const message = err.response?.data?.message || 'Could not mark attendance. Please try again.';
            // Already checked in/out: close the camera and refresh instead of retrying
            if (err.response?.status === 409 || err.response?.status === 400) {
                setCamera(null);
                loadToday();
                Swal.fire({ icon: 'info', title: message, confirmButtonColor: '#0E1A3D' });
            }
            return { ok: false, message };
        }
    };

    const checkedIn = today && today.checkInTime;
    const checkedOut = today && today.checkOutTime;

    return (
        <div className="space-y-6">
            {/* Today */}
            <section className="rounded-xl border border-[#0E1A3D]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#122048]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's attendance</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-300">{fmtDate(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()))}</p>
                    </div>
                    {today && <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[today.status] || ''}`}>{today.status}{today.isManual ? ' (set by admin)' : ''}</span>}
                </div>

                <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                    {[['Check-in', fmtTime(today?.checkInTime)], ['Check-out', fmtTime(today?.checkOutTime)], ['Hours', hoursBetween(today?.checkInTime, today?.checkOutTime)]].map(([label, value]) => (
                        <div key={label} className="rounded-lg bg-gray-50 p-3 dark:bg-white/5">
                            <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
                            <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{value}</dd>
                        </div>
                    ))}
                </dl>

                <div className="mt-4">
                    {today === null && <p className="text-sm text-gray-500">Loading…</p>}
                    {today !== null && !registered && (
                        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                            Register your Face ID once to start marking attendance.
                            <button type="button" onClick={() => setFaceSetup(true)} className="ml-2 font-semibold underline underline-offset-2">Register Face ID</button>
                        </div>
                    )}
                    {today !== null && registered && !checkedIn && (
                        <button type="button" onClick={() => setCamera('in')} className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#0E1A3D] px-6 text-sm font-semibold text-white hover:bg-[#0A1430] sm:w-auto">
                            Check in with Face ID
                        </button>
                    )}
                    {today !== null && registered && checkedIn && !checkedOut && (
                        <button type="button" onClick={() => setCamera('out')} className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#0E1A3D] px-6 text-sm font-semibold text-white hover:bg-[#0A1430] sm:w-auto">
                            Check out with Face ID
                        </button>
                    )}
                    {checkedOut && <p className="text-sm text-green-700 dark:text-green-400">You're done for today. See you tomorrow!</p>}
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">A small photo is saved with each check-in and check-out so the admin can confirm attendance.</p>
                </div>
            </section>

            {/* Monthly log */}
            <section className="rounded-xl border border-[#0E1A3D]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#122048]">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My attendance log</h2>
                    <input type="month" value={month} max={currentMonth()} onChange={(e) => setMonth(e.target.value || currentMonth())} aria-label="Month"
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-[#0A1430] dark:text-white" />
                </div>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                    Present: <b>{logs.filter((l) => l.status === 'Present').length}</b> · Half-day: <b>{logs.filter((l) => l.status === 'Half-Day').length}</b> · Absent (marked): <b>{logs.filter((l) => l.status === 'Absent').length}</b>
                </p>
                {logs.length === 0 ? <p className="py-6 text-center text-sm text-gray-500">No attendance recorded for this month.</p> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="text-xs uppercase text-gray-500 dark:text-gray-400">
                                <tr><th className="py-2 pr-4">Date</th><th className="py-2 pr-4">In</th><th className="py-2 pr-4">Out</th><th className="py-2 pr-4">Hours</th><th className="py-2">Status</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {logs.map((l) => (
                                    <tr key={l._id} className="text-gray-800 dark:text-gray-100">
                                        <td className="whitespace-nowrap py-2 pr-4">{fmtDate(l.date)}</td>
                                        <td className="py-2 pr-4">{fmtTime(l.checkInTime)}</td>
                                        <td className="py-2 pr-4">{fmtTime(l.checkOutTime)}</td>
                                        <td className="py-2 pr-4">{hoursBetween(l.checkInTime, l.checkOutTime)}</td>
                                        <td className="py-2"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[l.status] || ''}`}>{l.status}</span>{l.note && <span className="ml-2 text-xs text-gray-500">{l.note}</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <Suspense fallback={null}>
                {camera && (
                    <FaceCameraModal
                        open={!!camera}
                        onClose={() => setCamera(null)}
                        title={camera === 'in' ? 'Check in' : 'Check out'}
                        description="Look at the camera to confirm it's you."
                        onCapture={capture}
                        onDone={() => { setCamera(null); window.dispatchEvent(new Event('attendance:updated')); }}
                        successText={camera === 'in' ? 'Checked in!' : 'Checked out!'}
                    />
                )}
                {faceSetup && <FaceIdSetup open={faceSetup} onClose={() => { setFaceSetup(false); loadToday(); }} />}
            </Suspense>
        </div>
    );
};

export default StaffAttendanceTab;
