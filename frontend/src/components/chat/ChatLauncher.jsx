import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';
import { ChatBubbleLeftRightIcon, XMarkIcon, PencilSquareIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { API_BASE_URL } from '../../config/environment';
import ChatThread, { Avatar, ROLE_LABEL, formatTime } from './ChatThread';

const SOCKET_URL = API_BASE_URL || undefined; // dev: same origin through the Vite proxy

const previewOf = (m) => (m ? (m.text || (m.mediaType === 'image' ? '📷 Photo' : '📎 File')) : '');

// Chat button for the dashboard top bar plus the chat drawer. Loaded only inside dashboards.
const ChatLauncher = ({ user }) => {
    // The server says who we are: for students the stored user.id is the Student profile id, not the account id
    const [serverMe, setServerMe] = useState(null);
    const me = useMemo(() => serverMe || { id: String(user.id || user._id), role: user.role === 'user' ? 'student' : user.role }, [serverMe, user]);
    const isAdmin = me.role === 'super_admin';

    const [open, setOpen] = useState(false);
    const [view, setView] = useState('chats'); // chats | new | students | blocks
    const [conversations, setConversations] = useState([]);
    const [chatStatus, setChatStatus] = useState(null);
    const [online, setOnline] = useState(() => new Set());
    const [thread, setThread] = useState(null); // { conversationId, other, participants, readOnly }
    const [messages, setMessages] = useState({}); // conversationId -> list
    const [hasMore, setHasMore] = useState({});
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [typing, setTyping] = useState({}); // conversationId -> name
    const [connected, setConnected] = useState(false);

    const socketRef = useRef(null);
    const threadRef = useRef(null);
    const openRef = useRef(false);
    threadRef.current = thread;
    openRef.current = open;

    const loadConversations = useCallback(async () => {
        try {
            const res = await api.get('/api/chat/conversations', { silent: true });
            setConversations(res.data.data || []);
            setChatStatus(res.data.chatStatus || null);
            if (res.data.me) setServerMe((prev) => (prev && prev.id === res.data.me.id ? prev : res.data.me));
        } catch { /* shown as an empty list */ }
    }, []);

    // List and unread badge load even while the live connection is still starting
    useEffect(() => { loadConversations(); }, [loadConversations]);

    // ─── Live connection ───────────────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return undefined;
        const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket', 'polling'], reconnectionDelayMax: 10000 });
        socketRef.current = socket;

        socket.on('connect', () => { setConnected(true); loadConversations(); });
        socket.on('disconnect', () => setConnected(false));
        socket.on('online_users', (ids) => setOnline(new Set(ids)));
        socket.on('user_online', ({ userId }) => setOnline((s) => new Set(s).add(userId)));
        socket.on('user_offline', ({ userId }) => setOnline((s) => { const n = new Set(s); n.delete(userId); return n; }));
        socket.on('chat_status', (status) => setChatStatus(status));

        socket.on('receive_message', (m) => {
            setMessages((all) => {
                if (!all[m.conversationId]) return all;
                const list = all[m.conversationId];
                if (list.some((x) => x.id === m.id)) return all;
                return { ...all, [m.conversationId]: [...list, m] };
            });
            const viewing = openRef.current && threadRef.current?.conversationId === m.conversationId;
            if (viewing && m.sender !== me.id) socket.emit('mark_read', { conversationId: m.conversationId });
            setConversations((list) => {
                const idx = list.findIndex((c) => c.id === m.conversationId);
                if (idx === -1) { loadConversations(); return list; }
                const c = list[idx];
                const updated = { ...c, lastMessage: m, lastMessageAt: m.createdAt, unread: viewing || m.sender === me.id ? 0 : (c.unread || 0) + 1 };
                return [updated, ...list.slice(0, idx), ...list.slice(idx + 1)];
            });
            setTyping((t) => { if (!t[m.conversationId]) return t; const n = { ...t }; delete n[m.conversationId]; return n; });
        });

        socket.on('messages_read', ({ conversationId, readerId }) => {
            setMessages((all) => all[conversationId]
                ? { ...all, [conversationId]: all[conversationId].map((x) => (x.readBy?.includes(readerId) ? x : { ...x, readBy: [...(x.readBy || []), readerId] })) }
                : all);
        });

        const typingTimers = {};
        socket.on('typing', ({ conversationId, name }) => {
            setTyping((t) => ({ ...t, [conversationId]: name }));
            clearTimeout(typingTimers[conversationId]);
            typingTimers[conversationId] = setTimeout(() => setTyping((t) => { const n = { ...t }; delete n[conversationId]; return n; }), 4000);
        });
        socket.on('stop_typing', ({ conversationId }) => setTyping((t) => { const n = { ...t }; delete n[conversationId]; return n; }));

        return () => {
            Object.values(typingTimers).forEach(clearTimeout);
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
        };
    }, [loadConversations, me.id]);

    // ─── Threads ───────────────────────────────────────────────────────────
    const fetchMessages = useCallback(async (conversationId, before) => {
        const res = await api.get(`/api/chat/messages/${conversationId}`, { silent: true, params: before ? { before } : {} });
        setHasMore((h) => ({ ...h, [conversationId]: res.data.hasMore }));
        setMessages((all) => ({ ...all, [conversationId]: before ? [...res.data.data, ...(all[conversationId] || [])] : res.data.data }));
        return res.data;
    }, []);

    const openConversation = async (c, readOnly = false) => {
        setThread({ conversationId: c.id, other: c.other, participants: c.participants, readOnly: readOnly || !c.isParticipant });
        setConversations((list) => list.map((x) => (x.id === c.id ? { ...x, unread: 0 } : x)));
        setLoadingMessages(true);
        try { await fetchMessages(c.id); } catch { /* empty thread */ }
        setLoadingMessages(false);
    };

    const openContact = (contact) => {
        const existing = conversations.find((c) => c.other.id === contact.id);
        if (existing) { openConversation(existing); return; }
        setThread({ conversationId: null, other: contact, participants: [], readOnly: false });
    };

    const send = (payload) => {
        const current = threadRef.current;
        if (!current) return;
        const tempId = `tmp-${Date.now()}`;
        const key = current.conversationId || `new-${current.other.id}`;
        const optimistic = { id: tempId, conversationId: key, sender: me.id, text: payload.text, mediaUrl: payload.mediaUrl, mediaType: payload.mediaType || 'none', fileName: payload.fileName, readBy: [me.id], createdAt: new Date().toISOString(), pending: true };
        setMessages((all) => ({ ...all, [key]: [...(all[key] || []), optimistic] }));

        const body = { ...payload, ...(current.conversationId ? { conversationId: current.conversationId } : { recipientId: current.other.id }) };
        const done = (res) => {
            if (!res?.success) {
                setMessages((all) => ({ ...all, [key]: (all[key] || []).map((x) => (x.id === tempId ? { ...x, pending: false, failed: true } : x)) }));
                Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: res?.message || 'Message not sent', showConfirmButton: false, timer: 3500 });
                return;
            }
            const realId = res.conversationId;
            setMessages((all) => {
                const list = (all[key] || []).filter((x) => x.id !== tempId);
                const target = all[realId] && realId !== key ? all[realId] : list;
                const merged = target.some((x) => x.id === res.message.id) ? target : [...target, res.message];
                const next = { ...all, [realId]: merged };
                if (realId !== key) delete next[key];
                return next;
            });
            if (!current.conversationId) {
                setThread((t) => (t && t.other.id === current.other.id ? { ...t, conversationId: realId } : t));
                loadConversations();
            }
        };

        const socket = socketRef.current;
        if (socket?.connected) {
            socket.timeout(15000).emit('send_message', body, (err, res) => done(err ? { success: false, message: 'Connection lost. Please try again.' } : res));
            if (current.conversationId) socket.emit('stop_typing', { conversationId: current.conversationId });
        } else {
            api.post('/api/chat/send', body, { silent: true })
                .then((r) => done(r.data))
                .catch((e) => done({ success: false, message: e.response?.data?.message || 'Message not sent' }));
        }
    };

    const lastTypingEmit = useRef(0);
    const onTyping = () => {
        const id = threadRef.current?.conversationId;
        if (!id || !socketRef.current?.connected) return;
        if (Date.now() - lastTypingEmit.current > 2000) {
            lastTypingEmit.current = Date.now();
            socketRef.current.emit('typing', { conversationId: id });
        }
    };

    // Mark read when a thread is opened while new messages are waiting
    useEffect(() => {
        if (open && thread?.conversationId && !thread.readOnly) socketRef.current?.emit('mark_read', { conversationId: thread.conversationId });
    }, [open, thread?.conversationId, thread?.readOnly]);

    // ─── Admin: block ──────────────────────────────────────────────────────
    const blockPerson = async (person) => {
        const result = await Swal.fire({
            titleText: `Block ${person.name}?`,
            html: `
                <label style="display:block;text-align:left;font-size:14px;margin-bottom:6px">What should the block do?</label>
                <select id="sw-block-scope" class="swal2-select" style="width:100%;margin:0 0 12px">
                    <option value="admin">Stop them messaging me</option>
                    <option value="all">Suspend them from all chat</option>
                </select>
                <textarea id="sw-block-reason" class="swal2-textarea" placeholder="Reason (optional)" maxlength="300" style="width:100%;margin:0"></textarea>`,
            showCancelButton: true,
            confirmButtonText: 'Block',
            confirmButtonColor: '#dc2626',
            preConfirm: () => ({
                scope: document.getElementById('sw-block-scope').value,
                reason: document.getElementById('sw-block-reason').value,
            }),
        });
        if (!result.isConfirmed) return;
        try {
            const res = await api.post('/api/chat/blocks', { userId: person.id, ...result.value });
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: res.data.message, showConfirmButton: false, timer: 3000 });
        } catch (e) {
            Swal.fire({ icon: 'error', title: 'Could not block', text: e.response?.data?.message || 'Please try again.' });
        }
    };

    const totalUnread = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-800"
                aria-label={totalUnread ? `Messages, ${totalUnread} unread` : 'Messages'}
            >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                {totalUnread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-0.5 text-[10px] font-bold text-white dark:border-[#122048]">
                        {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                )}
            </button>

            {/* Portalled to <body>: inside the top bar (z-20 + backdrop-blur) the drawer was trapped under the sidebar and page.
                z-[10090] sits above every dashboard layer and modal, just under SweetAlert (10100) so block dialogs and toasts still show on top. */}
            {open && createPortal(
                <div className="fixed inset-0 z-[10090] flex justify-end bg-black/40" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
                    <aside className="flex h-[100dvh] w-full max-w-md flex-col bg-white shadow-xl dark:bg-[#122048]" role="dialog" aria-label="Messages">
                        {thread ? (
                            <ChatThread
                                me={me}
                                thread={thread}
                                messages={messages[thread.conversationId || `new-${thread.other.id}`] || []}
                                hasMore={!!(thread.conversationId && hasMore[thread.conversationId])}
                                loadingMessages={loadingMessages}
                                typingName={thread.conversationId ? typing[thread.conversationId] : null}
                                online={online}
                                chatStatus={chatStatus}
                                onBack={() => { setThread(null); loadConversations(); }}
                                onSend={send}
                                onTyping={onTyping}
                                onBlock={blockPerson}
                                onLoadOlder={() => {
                                    const first = (messages[thread.conversationId] || [])[0];
                                    if (first) fetchMessages(thread.conversationId, first.createdAt).catch(() => {});
                                }}
                            />
                        ) : (
                            <ChatHome
                                me={me}
                                isAdmin={isAdmin}
                                view={view}
                                setView={setView}
                                conversations={conversations}
                                online={online}
                                typing={typing}
                                connected={connected}
                                chatStatus={chatStatus}
                                onClose={() => setOpen(false)}
                                onOpenConversation={openConversation}
                                onOpenContact={openContact}
                            />
                        )}
                    </aside>
                </div>,
                document.body
            )}
        </>
    );
};

// ─── List screens ──────────────────────────────────────────────────────────
const ChatHome = ({ me, isAdmin, view, setView, conversations, online, typing, connected, chatStatus, onClose, onOpenConversation, onOpenContact }) => {
    const tabs = [['chats', 'Chats'], ['new', 'New chat'], ...(isAdmin ? [['students', 'Student chats'], ['blocks', 'Blocked']] : [])];
    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Messages</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-300">{connected ? 'Connected' : 'Connecting… messages still send'}</p>
                </div>
                <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10" aria-label="Close messages">
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
            <div className="flex gap-1 overflow-x-auto border-b border-gray-200 px-2 py-2 dark:border-gray-700">
                {tabs.map(([id, label]) => (
                    <button key={id} type="button" onClick={() => setView(id)}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${view === id ? 'bg-[#0E1A3D] text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'}`}>
                        {label}
                    </button>
                ))}
            </div>
            {chatStatus?.scope === 'all' && (
                <p className="bg-red-50 px-4 py-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300">Your chat access has been suspended by the admin.</p>
            )}
            {me.role === 'student' && view === 'chats' && (
                <p className="bg-amber-50 px-4 py-1.5 text-[11px] text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">Messages disappear from your chat after 24 hours.</p>
            )}
            <div className="flex-1 overflow-y-auto">
                {view === 'chats' && <ConversationList list={conversations} online={online} typing={typing} onOpen={(c) => onOpenConversation(c)} empty={<EmptyChats onNew={() => setView('new')} />} />}
                {view === 'new' && <ContactPicker onPick={onOpenContact} />}
                {view === 'students' && <StudentChats onOpen={(c) => onOpenConversation(c, true)} online={online} />}
                {view === 'blocks' && <BlockedList />}
            </div>
        </div>
    );
};

const EmptyChats = ({ onNew }) => (
    <div className="px-6 py-12 text-center">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Talk to your Swagat team here</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">Questions about admission, documents or fees? Message the right person directly, no WhatsApp needed.</p>
        <button type="button" onClick={onNew} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0E1A3D] px-5 text-sm font-semibold text-white">
            <PencilSquareIcon className="h-4 w-4" /> Start a chat
        </button>
    </div>
);

const ConversationList = ({ list, online, typing = {}, onOpen, empty, showBoth = false }) => {
    if (!list.length) return empty || <p className="px-6 py-12 text-center text-sm text-gray-500">No conversations yet.</p>;
    return (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {list.map((c) => (
                <li key={c.id}>
                    <button type="button" onClick={() => onOpen(c)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5">
                        <Avatar name={c.other.name} online={!showBoth && online.has(c.other.id)} />
                        <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                    {showBoth ? c.participants.map((p) => p.name).join(' ↔ ') : c.other.name}
                                </p>
                                {c.lastMessageAt && <span className="shrink-0 text-[11px] text-gray-400">{formatTime(c.lastMessageAt)}</span>}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-xs text-gray-500 dark:text-gray-300">
                                    {typing[c.id] ? <span className="text-green-600">typing…</span> : previewOf(c.lastMessage) || (showBoth ? '' : ROLE_LABEL[c.other.role])}
                                </p>
                                {c.unread > 0 && <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-green-600 px-1.5 text-[11px] font-bold text-white">{c.unread}</span>}
                            </div>
                        </div>
                    </button>
                </li>
            ))}
        </ul>
    );
};

const ContactPicker = ({ onPick }) => {
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

    const groups = ['super_admin', 'staff', 'agent', 'student']
        .map((role) => [role, (contacts || []).filter((c) => c.role === role)])
        .filter(([, list]) => list.length);

    return (
        <div>
            <div className="sticky top-0 bg-white p-3 dark:bg-[#122048]">
                <label className="relative block">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" aria-label="Search people"
                        className="w-full rounded-full border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-[#0E1A3D] focus:outline-none dark:border-gray-600 dark:bg-[#0A1430] dark:text-white" />
                </label>
            </div>
            {contacts === null && <p className="px-6 py-8 text-center text-sm text-gray-500">Loading…</p>}
            {contacts && !contacts.length && <p className="px-6 py-8 text-center text-sm text-gray-500">No one found.</p>}
            {groups.map(([role, list]) => (
                <div key={role}>
                    <p className="bg-gray-50 px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-white/5 dark:text-gray-400">{ROLE_LABEL[role]}</p>
                    <ul>
                        {list.map((c) => (
                            <li key={c.id}>
                                <button type="button" onClick={() => onPick(c)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-white/5">
                                    <Avatar name={c.name} online={c.online} size="h-9 w-9" />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{c.name}</p>
                                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">{c.email}</p>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

// Super admin: every conversation that involves a student, full history
const StudentChats = ({ onOpen, online }) => {
    const [list, setList] = useState(null);
    const [more, setMore] = useState(false);
    const load = (skip = 0) => api.get('/api/chat/oversight', { silent: true, params: { skip } })
        .then((res) => { setList((l) => (skip ? [...(l || []), ...res.data.data] : res.data.data)); setMore(res.data.data.length === 50); })
        .catch(() => setList((l) => l || []));
    useEffect(() => { load(0); }, []);
    if (list === null) return <p className="px-6 py-8 text-center text-sm text-gray-500">Loading…</p>;
    return (
        <>
            <p className="px-4 pt-3 text-xs text-gray-500 dark:text-gray-400">Full history of every chat with a student, including messages students no longer see.</p>
            <ConversationList list={list} online={online} onOpen={onOpen} showBoth empty={<p className="px-6 py-12 text-center text-sm text-gray-500">No student conversations yet.</p>} />
            {more && <div className="p-3 text-center"><button type="button" onClick={() => load(list.length)} className="text-sm font-semibold text-[#0E1A3D] dark:text-[#60A5FA]">Load more</button></div>}
        </>
    );
};

const BlockedList = () => {
    const [list, setList] = useState(null);
    const load = () => api.get('/api/chat/blocks', { silent: true }).then((res) => setList(res.data.data)).catch(() => setList([]));
    useEffect(() => { load(); }, []);
    const unblock = async (b) => {
        try { await api.delete(`/api/chat/blocks/${b.userId}`); load(); } catch { Swal.fire({ icon: 'error', title: 'Could not unblock' }); }
    };
    if (list === null) return <p className="px-6 py-8 text-center text-sm text-gray-500">Loading…</p>;
    if (!list.length) return <p className="px-6 py-12 text-center text-sm text-gray-500">No one is blocked. To block someone, open your chat with them and tap Block.</p>;
    return (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {list.map((b) => (
                <li key={b.userId} className="flex items-start gap-3 px-4 py-3">
                    <Avatar name={b.name} size="h-9 w-9" />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{b.name} <span className="font-normal text-gray-500">· {ROLE_LABEL[b.role] || b.role}</span></p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{b.scope === 'all' ? 'Suspended from all chat' : "Can't message you"} · {new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        {b.reason && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">“{b.reason}”</p>}
                    </div>
                    <button type="button" onClick={() => unblock(b)} className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200">Unblock</button>
                </li>
            ))}
        </ul>
    );
};

export default ChatLauncher;
