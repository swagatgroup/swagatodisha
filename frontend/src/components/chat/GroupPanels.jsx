import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { ArrowLeftIcon, MagnifyingGlassIcon, PencilIcon, PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { Avatar, ROLE_LABEL, formatLastSeen } from './ChatThread';

const errorText = (e, fallback) => e.response?.data?.message || fallback;

// Search + tick boxes. `exclude` hides people already in the group.
const MultiContactPicker = ({ selected, onToggle, exclude = [] }) => {
    const [q, setQ] = useState('');
    const [contacts, setContacts] = useState(null);
    useEffect(() => {
        const t = setTimeout(() => {
            api.get('/api/chat/contacts', { silent: true, params: q ? { q } : {} })
                .then((res) => setContacts(res.data.data || []))
                .catch(() => setContacts([]));
        }, q ? 300 : 0);
        return () => clearTimeout(t);
    }, [q]);

    const visible = (contacts || []).filter((c) => !exclude.includes(c.id));
    const groups = ['super_admin', 'staff', 'agent', 'student']
        .map((role) => [role, visible.filter((c) => c.role === role)])
        .filter(([, list]) => list.length);

    return (
        <div>
            <div className="sticky top-0 z-10 bg-white p-3 dark:bg-[#122048]">
                <label className="relative block">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" aria-label="Search people"
                        className="w-full rounded-full border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-[#0E1A3D] focus:outline-none dark:border-gray-600 dark:bg-[#0A1430] dark:text-white" />
                </label>
            </div>
            {contacts === null && <p className="px-6 py-8 text-center text-sm text-gray-500">Loading…</p>}
            {contacts && !visible.length && <p className="px-6 py-8 text-center text-sm text-gray-500">No one found.</p>}
            {groups.map(([role, list]) => (
                <div key={role}>
                    <p className="bg-gray-50 px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-white/5 dark:text-gray-400">{ROLE_LABEL[role]}</p>
                    <ul>
                        {list.map((c) => {
                            const checked = selected.some((s) => s.id === c.id);
                            return (
                                <li key={c.id}>
                                    <label className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5">
                                        <input type="checkbox" checked={checked} onChange={() => onToggle(c)} className="h-4 w-4 rounded border-gray-300 text-[#0E1A3D] focus:ring-[#0E1A3D]" />
                                        <Avatar name={c.name} online={c.online} size="h-9 w-9" />
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">{c.name}</span>
                                            <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{c.email}</span>
                                        </span>
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </div>
    );
};

const toggleIn = (list, person) => (list.some((p) => p.id === person.id) ? list.filter((p) => p.id !== person.id) : [...list, person]);

const SelectedChips = ({ selected, onRemove }) => (
    selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3 pb-2">
            {selected.map((p) => (
                <button key={p.id} type="button" onClick={() => onRemove(p)} className="inline-flex items-center gap-1 rounded-full bg-[#D0E9FB] px-2.5 py-1 text-xs font-medium text-[#0E1A3D] dark:bg-[#0A1430] dark:text-[#BEC6F5]" aria-label={`Remove ${p.name}`}>
                    {p.name} <XMarkIcon className="h-3.5 w-3.5" />
                </button>
            ))}
        </div>
    )
);

// ─── New group ─────────────────────────────────────────────────────────────
export const GroupCreator = ({ onCreated }) => {
    const [name, setName] = useState('');
    const [selected, setSelected] = useState([]);
    const [saving, setSaving] = useState(false);

    const create = async (e) => {
        e.preventDefault();
        if (!name.trim() || !selected.length || saving) return;
        setSaving(true);
        try {
            const res = await api.post('/api/chat/groups', { name: name.trim(), memberIds: selected.map((p) => p.id) }, { silent: true });
            onCreated(res.data.conversationId);
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Could not create the group', text: errorText(err, 'Please try again.') });
            setSaving(false);
        }
    };

    return (
        <form onSubmit={create} className="flex min-h-full flex-col">
            <div className="space-y-2 border-b border-gray-200 p-3 dark:border-gray-700">
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Group name, e.g. Bhubaneswar admissions team" aria-label="Group name"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0E1A3D] focus:outline-none dark:border-gray-600 dark:bg-[#0A1430] dark:text-white" />
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{selected.length ? `${selected.length} selected` : 'Pick the people to add'}</p>
                    <button type="submit" disabled={!name.trim() || !selected.length || saving}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#0E1A3D] px-4 text-xs font-semibold text-white disabled:opacity-50">
                        <CheckIcon className="h-4 w-4" /> {saving ? 'Creating…' : 'Create group'}
                    </button>
                </div>
            </div>
            <div className="pt-2"><SelectedChips selected={selected} onRemove={(p) => setSelected((s) => toggleIn(s, p))} /></div>
            <MultiContactPicker selected={selected} onToggle={(p) => setSelected((s) => toggleIn(s, p))} />
        </form>
    );
};

// ─── Group info: members, rename, add, remove, leave ───────────────────────
export const GroupInfo = ({ me, thread, online, lastSeen = {}, onBack, onLeft }) => {
    const group = thread.group || { name: thread.other.name, admins: [] };
    const isMember = thread.participants.some((p) => p.id === me.id) && !thread.readOnly;
    const canManage = isMember && (group.admins.includes(me.id) || me.role === 'super_admin');

    const [renaming, setRenaming] = useState(false);
    const [newName, setNewName] = useState(group.name);
    const [adding, setAdding] = useState(false);
    const [toAdd, setToAdd] = useState([]);
    const [busy, setBusy] = useState(false);

    const run = async (fn, failTitle) => {
        setBusy(true);
        try { await fn(); return true; } catch (err) {
            Swal.fire({ icon: 'error', title: failTitle, text: errorText(err, 'Please try again.') });
            return false;
        } finally { setBusy(false); }
    };

    const rename = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        if (await run(() => api.patch(`/api/chat/groups/${thread.conversationId}`, { name: newName.trim() }, { silent: true }), 'Could not rename')) setRenaming(false);
    };

    const addPeople = async () => {
        if (!toAdd.length) return;
        const ok = await run(() => api.post(`/api/chat/groups/${thread.conversationId}/members`, { memberIds: toAdd.map((p) => p.id) }, { silent: true }), 'Could not add people');
        if (ok) { setToAdd([]); setAdding(false); }
    };

    const remove = async (person) => {
        const leaving = person.id === me.id;
        const confirm = await Swal.fire({
            titleText: leaving ? `Leave "${group.name}"?` : `Remove ${person.name}?`,
            text: leaving ? "You won't get messages from this group any more." : `${person.name} will no longer see or send messages in this group.`,
            showCancelButton: true,
            confirmButtonText: leaving ? 'Leave' : 'Remove',
            confirmButtonColor: '#dc2626',
        });
        if (!confirm.isConfirmed) return;
        const ok = await run(() => api.delete(`/api/chat/groups/${thread.conversationId}/members/${person.id}`, { silent: true }), leaving ? 'Could not leave' : 'Could not remove');
        if (ok && leaving) onLeft();
    };

    const members = [...thread.participants].sort((a, b) => (a.id === me.id ? -1 : b.id === me.id ? 1 : a.name.localeCompare(b.name)));

    if (adding) {
        return (
            <div className="flex h-full flex-col">
                <div className="flex items-center gap-3 border-b border-gray-200 px-3 py-2 dark:border-gray-700">
                    <button type="button" onClick={() => { setAdding(false); setToAdd([]); }} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10" aria-label="Back to group info">
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <p className="flex-1 text-sm font-semibold text-gray-900 dark:text-white">Add people</p>
                    <button type="button" onClick={addPeople} disabled={!toAdd.length || busy} className="rounded-full bg-[#0E1A3D] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
                        {busy ? 'Adding…' : `Add${toAdd.length ? ` (${toAdd.length})` : ''}`}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="pt-2"><SelectedChips selected={toAdd} onRemove={(p) => setToAdd((s) => toggleIn(s, p))} /></div>
                    <MultiContactPicker selected={toAdd} onToggle={(p) => setToAdd((s) => toggleIn(s, p))} exclude={thread.participants.map((p) => p.id)} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 border-b border-gray-200 px-3 py-2 dark:border-gray-700">
                <button type="button" onClick={onBack} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10" aria-label="Back to chat">
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Group info</p>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col items-center gap-2 border-b border-gray-200 px-4 py-5 dark:border-gray-700">
                    <Avatar name={group.name} group size="h-16 w-16" />
                    {renaming ? (
                        <form onSubmit={rename} className="flex w-full items-center gap-2">
                            <input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={60} autoFocus aria-label="Group name"
                                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0E1A3D] focus:outline-none dark:border-gray-600 dark:bg-[#0A1430] dark:text-white" />
                            <button type="submit" disabled={busy || !newName.trim()} className="rounded-full bg-[#0E1A3D] p-2 text-white disabled:opacity-50" aria-label="Save name"><CheckIcon className="h-4 w-4" /></button>
                            <button type="button" onClick={() => { setRenaming(false); setNewName(group.name); }} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10" aria-label="Cancel"><XMarkIcon className="h-4 w-4" /></button>
                        </form>
                    ) : (
                        <div className="flex items-center gap-1">
                            <p className="text-center text-base font-semibold text-gray-900 dark:text-white">{group.name}</p>
                            {canManage && (
                                <button type="button" onClick={() => { setNewName(group.name); setRenaming(true); }} className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10" aria-label="Rename group">
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">Group · {thread.participants.length} people</p>
                </div>

                {canManage && (
                    <button type="button" onClick={() => setAdding(true)} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-[#0E1A3D] hover:bg-gray-50 dark:text-[#60A5FA] dark:hover:bg-white/5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0E1A3D] text-white"><PlusIcon className="h-5 w-5" /></span>
                        Add people
                    </button>
                )}

                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                    {members.map((p) => {
                        const isOnline = online.has(p.id);
                        const seen = lastSeen[p.id] || p.lastSeen;
                        return (
                            <li key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                                <Avatar name={p.name} online={isOnline} size="h-9 w-9" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{p.id === me.id ? 'You' : p.name}</p>
                                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                        {ROLE_LABEL[p.role] || ''}{p.id !== me.id && (isOnline ? ' · Online' : seen ? ` · ${formatLastSeen(seen)}` : '')}
                                    </p>
                                </div>
                                {group.admins.includes(p.id) && <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">Group admin</span>}
                                {canManage && p.id !== me.id && (
                                    <button type="button" onClick={() => remove(p)} disabled={busy} className="rounded-full px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">Remove</button>
                                )}
                            </li>
                        );
                    })}
                </ul>

                {isMember && (
                    <div className="p-4">
                        <button type="button" onClick={() => remove({ id: me.id, name: 'You' })} disabled={busy}
                            className="w-full rounded-full border border-red-200 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20">
                            Leave group
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
