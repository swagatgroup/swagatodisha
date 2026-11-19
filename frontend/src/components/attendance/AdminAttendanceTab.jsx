import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import api from '../../utils/api';
import { fmtDate, fmtTime, hoursBetween, STATUS_STYLE } from './StaffAttendanceTab';

const istToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
const card = 'rounded-xl border border-[#0E1A3D]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#122048]';
const inputCls = 'rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-[#0A1430] dark:text-white';

// "HH:MM" on a YYYY-MM-DD day in India time -> ISO string
const istIso = (date, hhmm) => (hhmm ? new Date(`${date}T${hhmm}:00+05:30`).toISOString() : undefined);
const toHHMM = (iso) => (iso ? new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date(iso)) : '');

// Super admin: daily attendance with selfies, manual corrections, and Face ID management
const AdminAttendanceTab = () => {
    const [section, setSection] = useState('attendance');
    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                {[['attendance', 'Attendance'], ['face', 'Face ID & login']].map(([id, label]) => (
                    <button key={id} type="button" onClick={() => setSection(id)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${section === id ? 'bg-[#0E1A3D] text-white' : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-[#122048] dark:text-gray-200'}`}>
                        {label}
                    </button>
                ))}
            </div>
            {section === 'attendance' ? <AttendanceReport /> : <FaceManagement />}
        </div>
    );
};

const AttendanceReport = () => {
    const [from, setFrom] = useState(istToday);
    const [to, setTo] = useState(istToday);
    const [staffId, setStaffId] = useState('');
    const [report, setReport] = useState(null);
    const [photo, setPhoto] = useState(null);

    const load = useCallback(async () => {
        try {
            const res = await api.get('/api/attendance/admin-report', { silent: true, params: { from, to, ...(staffId ? { userId: staffId } : {}) } });
            setReport(res.data);
        } catch { setReport({ staff: [], data: [] }); }
    }, [from, to, staffId]);
    useEffect(() => { load(); }, [load]);

    const staff = report?.staff || [];
    const nameOf = (id) => staff.find((s) => s.id === String(id))?.name || 'Staff member';
    const singleDay = from === to;

    // One day: every staff member, with "No record" for anyone who didn't check in
    const rows = singleDay
        ? staff.filter((s) => !staffId || s.id === staffId).map((s) => ({ staff: s, record: (report?.data || []).find((r) => String(r.user) === s.id), date: from }))
        : (report?.data || []).map((r) => ({ staff: { id: String(r.user), name: nameOf(r.user) }, record: r, date: r.date }));

    const edit = async (row) => {
        const r = row.record || {};
        const result = await Swal.fire({
            titleText: row.staff.name,
            html: `
                <p style="font-size:14px;margin:0 0 10px">${fmtDate(row.date)}</p>
                <label style="display:block;text-align:left;font-size:13px">Status</label>
                <select id="sw-att-status" class="swal2-select" style="width:100%;margin:4px 0 10px">
                    ${['Present', 'Half-Day', 'Absent'].map((s) => `<option ${r.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
                <div style="display:flex;gap:8px">
                    <label style="flex:1;text-align:left;font-size:13px">Check-in<input id="sw-att-in" type="time" class="swal2-input" style="width:100%;margin:4px 0" value="${toHHMM(r.checkInTime)}"></label>
                    <label style="flex:1;text-align:left;font-size:13px">Check-out<input id="sw-att-out" type="time" class="swal2-input" style="width:100%;margin:4px 0" value="${toHHMM(r.checkOutTime)}"></label>
                </div>
                <textarea id="sw-att-note" class="swal2-textarea" placeholder="Note, e.g. on leave, field visit" maxlength="300" style="width:100%;margin:10px 0 0"></textarea>`,
            didOpen: () => { document.getElementById('sw-att-note').value = r.note || ''; },
            showCancelButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: '#0E1A3D',
            preConfirm: () => ({
                status: document.getElementById('sw-att-status').value,
                checkInTime: istIso(row.date, document.getElementById('sw-att-in').value),
                checkOutTime: istIso(row.date, document.getElementById('sw-att-out').value),
                note: document.getElementById('sw-att-note').value,
            }),
        });
        if (!result.isConfirmed) return;
        try {
            await api.post('/api/attendance/manual-override', { userId: row.staff.id, date: row.date, ...result.value });
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Attendance updated', showConfirmButton: false, timer: 2500 });
            load();
        } catch (e) {
            Swal.fire({ icon: 'error', title: 'Could not save', text: e.response?.data?.message || 'Please try again.' });
        }
    };

    const present = rows.filter((x) => x.record?.status === 'Present').length;
    const half = rows.filter((x) => x.record?.status === 'Half-Day').length;

    return (
        <section className={card}>
            <div className="flex flex-wrap items-end gap-3">
                <label className="text-xs text-gray-500 dark:text-gray-300">From<br /><input type="date" value={from} max={istToday()} onChange={(e) => { setFrom(e.target.value); if (e.target.value > to) setTo(e.target.value); }} className={inputCls} /></label>
                <label className="text-xs text-gray-500 dark:text-gray-300">To<br /><input type="date" value={to} min={from} max={istToday()} onChange={(e) => setTo(e.target.value)} className={inputCls} /></label>
                <label className="text-xs text-gray-500 dark:text-gray-300">Staff<br />
                    <select value={staffId} onChange={(e) => setStaffId(e.target.value)} className={inputCls}>
                        <option value="">All staff</option>
                        {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </label>
                <button type="button" onClick={() => { setFrom(istToday()); setTo(istToday()); }} className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200">Today</button>
            </div>

            {singleDay && report && (
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                    {fmtDate(from)}: <b>{present}</b> present · <b>{half}</b> half-day · <b>{rows.length - present - half}</b> absent or not checked in, out of {rows.length} staff
                </p>
            )}

            {!report ? <p className="py-6 text-center text-sm text-gray-500">Loading…</p> : rows.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">No attendance records for these dates.</p>
            ) : (
                <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="text-xs uppercase text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="py-2 pr-4">Staff</th>{!singleDay && <th className="py-2 pr-4">Date</th>}
                                <th className="py-2 pr-4">In</th><th className="py-2 pr-4">Out</th><th className="py-2 pr-4">Hours</th>
                                <th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Photos</th><th className="py-2" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {rows.map((row) => {
                                const r = row.record;
                                return (
                                    <tr key={`${row.staff.id}-${row.date}`} className="text-gray-800 dark:text-gray-100">
                                        <td className="py-2 pr-4 font-medium">{row.staff.name}{row.staff.employeeId && <span className="block text-xs font-normal text-gray-500">{row.staff.employeeId}</span>}</td>
                                        {!singleDay && <td className="whitespace-nowrap py-2 pr-4">{fmtDate(row.date)}</td>}
                                        <td className="py-2 pr-4">{fmtTime(r?.checkInTime)}</td>
                                        <td className="py-2 pr-4">{fmtTime(r?.checkOutTime)}</td>
                                        <td className="py-2 pr-4">{hoursBetween(r?.checkInTime, r?.checkOutTime)}</td>
                                        <td className="py-2 pr-4">
                                            {r ? <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[r.status] || ''}`}>{r.status}</span> : <span className="text-xs text-gray-500">No record</span>}
                                            {r?.isManual && <span className="ml-1 text-[11px] text-gray-500">(manual)</span>}
                                            {r?.note && <span className="block text-xs text-gray-500">{r.note}</span>}
                                        </td>
                                        <td className="py-2 pr-4">
                                            <div className="flex gap-1">
                                                {[r?.checkInSelfieUrl, r?.checkOutSelfieUrl].filter(Boolean).map((url) => (
                                                    <button key={url} type="button" onClick={() => setPhoto(url)} className="overflow-hidden rounded">
                                                        <img src={url} alt={`${row.staff.name}, Swagat staff attendance photo`} loading="lazy" className="h-10 w-10 object-cover" />
                                                    </button>
                                                ))}
                                                {typeof r?.matchDistance === 'number' && <span className="self-center text-[11px] text-gray-400" title="Face match score (lower is closer)">{r.matchDistance}</span>}
                                            </div>
                                        </td>
                                        <td className="py-2"><button type="button" onClick={() => edit(row)} className="text-xs font-semibold text-[#0E1A3D] underline underline-offset-2 dark:text-[#60A5FA]">Edit</button></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {photo && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4" onClick={() => setPhoto(null)} role="dialog" aria-label="Attendance photo">
                    <img src={photo} alt="" className="max-h-full max-w-full rounded object-contain" />
                </div>
            )}
        </section>
    );
};

const FaceManagement = () => {
    const [people, setPeople] = useState(null);
    const load = () => api.get('/api/face/users', { silent: true }).then((res) => setPeople(res.data.data)).catch(() => setPeople([]));
    useEffect(() => { load(); }, []);

    const toggle = async (p) => {
        try {
            const res = await api.patch(`/api/face/require/${p.id}`, { required: !p.requireFaceLogin });
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: res.data.message, showConfirmButton: false, timer: 2500 });
            load();
        } catch (e) {
            Swal.fire({ icon: 'error', title: 'Could not update', text: e.response?.data?.message || 'Please try again.' });
        }
    };

    const reset = async (p) => {
        const ok = await Swal.fire({
            titleText: `Reset Face ID for ${p.name}?`,
            text: 'Their stored face data is deleted and face login is switched off until they register again.',
            icon: 'warning', showCancelButton: true, confirmButtonText: 'Reset', confirmButtonColor: '#dc2626',
        });
        if (!ok.isConfirmed) return;
        try {
            const res = await api.patch(`/api/face/reset/${p.id}`);
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: res.data.message, showConfirmButton: false, timer: 3000 });
            load();
        } catch (e) {
            Swal.fire({ icon: 'error', title: 'Could not reset', text: e.response?.data?.message || 'Please try again.' });
        }
    };

    if (people === null) return <section className={card}><p className="text-sm text-gray-500">Loading…</p></section>;

    return (
        <section className={card}>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                Staff and agents register their own Face ID from the profile menu. Once registered you can make face login required: they then sign in with their password and then their face.
            </p>
            {people.length === 0 ? <p className="py-6 text-center text-sm text-gray-500">No staff or agents found.</p> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="text-xs uppercase text-gray-500 dark:text-gray-400">
                            <tr><th className="py-2 pr-4">Name</th><th className="py-2 pr-4">Role</th><th className="py-2 pr-4">Face ID</th><th className="py-2 pr-4">Face login required</th><th className="py-2" /></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {people.map((p) => (
                                <tr key={p.id} className="text-gray-800 dark:text-gray-100">
                                    <td className="py-2 pr-4 font-medium">{p.name}<span className="block text-xs font-normal text-gray-500">{p.email}</span></td>
                                    <td className="py-2 pr-4 capitalize">{p.role}</td>
                                    <td className="py-2 pr-4">{p.isFaceRegistered
                                        ? <span className="text-green-700 dark:text-green-400">Registered</span>
                                        : <span className="text-gray-500">Not registered</span>}</td>
                                    <td className="py-2 pr-4">
                                        <button type="button" role="switch" aria-checked={p.requireFaceLogin} aria-label={`Require face login for ${p.name}`}
                                            disabled={!p.isFaceRegistered} onClick={() => toggle(p)}
                                            title={p.isFaceRegistered ? '' : 'They need to register Face ID first'}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${p.requireFaceLogin ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${p.requireFaceLogin ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </button>
                                    </td>
                                    <td className="py-2">{p.isFaceRegistered && <button type="button" onClick={() => reset(p)} className="text-xs font-semibold text-red-600 underline underline-offset-2 dark:text-red-400">Reset Face ID</button>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export default AdminAttendanceTab;
