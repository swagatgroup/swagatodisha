import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeftIcon, PaperAirplaneIcon, PaperClipIcon, XMarkIcon, DocumentIcon, NoSymbolIcon, UserGroupIcon, ChevronDownIcon, PencilIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx,.xls,.xlsx,.txt';
// Same windows as the server (backend/utils/chatService.js)
const EDIT_WINDOW_MS = 15 * 60 * 1000;
const UNSEND_WINDOW_MS = 24 * 60 * 60 * 1000;

export const ROLE_LABEL = { super_admin: 'Admin', staff: 'Staff', agent: 'Agent', student: 'Student' };

export const formatTime = (iso) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

export const formatLastSeen = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const now = new Date();
    const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return `last seen today at ${time}`;
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return `last seen yesterday at ${time}`;
    return `last seen ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at ${time}`;
};

export const Avatar = ({ name = '?', online = false, size = 'h-10 w-10', group = false }) => (
    <span className={`relative inline-flex ${size} shrink-0 items-center justify-center rounded-full bg-[#D0E9FB] text-sm font-bold text-[#0E1A3D] dark:bg-[#0A1430] dark:text-[#BEC6F5]`}>
        {group ? <UserGroupIcon className="h-1/2 w-1/2" aria-hidden="true" /> : (name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?')}
        {online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-[#122048]" aria-label="Online" />}
    </span>
);

const ChatThread = ({
    me, thread, messages, hasMore, loadingMessages, typingName, online, chatStatus,
    onBack, onSend, onLoadOlder, onTyping, onBlock,
    lastSeen = null, onEdit, onUnsend, onOpenInfo,
}) => {
    const [text, setText] = useState('');
    const [menuFor, setMenuFor] = useState(null); // message id with Edit/Unsend open
    const [editing, setEditing] = useState(null); // message being edited
    const textRef = useRef(null);
    const [attachment, setAttachment] = useState(null); // { name, previewUrl, progress, media?, error? }
    const [lightbox, setLightbox] = useState(null);
    const listRef = useRef(null);
    const fileRef = useRef(null);
    const stickToBottom = useRef(true);
    const lastCount = useRef(0);

    const isStudent = me.role === 'student';
    const isGroup = !!thread.isGroup;
    const suspended = chatStatus?.scope === 'all';
    const blockedHere = chatStatus?.scope === 'admin' && (isGroup
        ? thread.participants.some((p) => p.id === chatStatus.blockedBy)
        : chatStatus.blockedBy === thread.other.id);
    const canWrite = !thread.readOnly && !suspended && !blockedHere;
    const otherIds = thread.participants.map((p) => p.id).filter((id) => id !== me.id);

    // Leave edit mode when switching chats
    useEffect(() => { setEditing(null); setMenuFor(null); }, [thread.conversationId]);

    // Auto-scroll to the newest message unless the person scrolled up to read
    useLayoutEffect(() => {
        const el = listRef.current;
        if (!el) return;
        const grew = messages.length > lastCount.current;
        if (grew && (stickToBottom.current || messages[messages.length - 1]?.sender === me.id)) {
            el.scrollTop = el.scrollHeight;
        }
        lastCount.current = messages.length;
    }, [messages, me.id]);

    useEffect(() => () => { if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl); }, [attachment]);

    const onScroll = () => {
        const el = listRef.current;
        stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    };

    const pickFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (file.size > MAX_BYTES) {
            setAttachment({ name: file.name, error: 'File is larger than 5MB' });
            return;
        }
        const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
        setAttachment({ name: file.name, previewUrl, progress: 0 });
        try {
            const form = new FormData();
            form.append('file', file);
            const res = await api.post('/api/chat/upload', form, {
                silent: true,
                timeout: 120000,
                onUploadProgress: (p) => setAttachment((a) => a && { ...a, progress: p.total ? Math.round((p.loaded / p.total) * 100) : 0 }),
            });
            setAttachment((a) => a && { ...a, progress: 100, media: res.data.data });
        } catch (err) {
            setAttachment((a) => a && { ...a, error: err.response?.data?.message || 'Upload failed' });
        }
    };

    const startEdit = (m) => {
        setMenuFor(null);
        setAttachment(null);
        setEditing(m);
        setText(m.text || '');
        setTimeout(() => textRef.current?.focus(), 0);
    };
    const cancelEdit = () => { setEditing(null); setText(''); };

    const send = (e) => {
        e.preventDefault();
        const body = text.trim();
        if (editing) {
            if (!body && editing.mediaType === 'none') return;
            if (body !== (editing.text || '')) onEdit(editing.id, body);
            cancelEdit();
            return;
        }
        const media = attachment?.media;
        if (!body && !media) return;
        if (attachment && !media && !attachment.error) return; // still uploading
        onSend({ text: body, ...(media || {}) });
        setText('');
        setAttachment(null);
        stickToBottom.current = true;
    };

    const otherOnline = !isGroup && online.has(thread.other.id);
    const memberNames = thread.participants.map((p) => (p.id === me.id ? 'You' : p.name)).join(', ');
    let subtitle;
    if (typingName) subtitle = <span className="text-green-600 dark:text-green-400">{typingName} is typing…</span>;
    else if (thread.readOnly) subtitle = isGroup ? `View only · ${memberNames}` : 'View only';
    else if (isGroup) subtitle = memberNames || 'Group';
    else subtitle = `${ROLE_LABEL[thread.other.role] || ''}${otherOnline ? ' · Online' : lastSeen ? ` · ${formatLastSeen(lastSeen)}` : ''}`;

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-200 px-3 py-2 dark:border-gray-700">
                <button type="button" onClick={onBack} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10" aria-label="Back to chats">
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <Avatar name={thread.other.name} online={otherOnline} group={isGroup} />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {thread.readOnly && !isGroup ? thread.participants.map((p) => p.name).join(' ↔ ') : thread.other.name}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-300">{subtitle}</p>
                </div>
                {isGroup && thread.conversationId && onOpenInfo && (
                    <button type="button" onClick={onOpenInfo} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10" aria-label="Group info">
                        <InformationCircleIcon className="h-5 w-5" />
                    </button>
                )}
                {me.canModerate && !thread.readOnly && !isGroup && thread.other.role !== 'super_admin' && (
                    <button type="button" onClick={() => onBlock(thread.other)} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                        <NoSymbolIcon className="h-4 w-4" /> Block
                    </button>
                )}
            </div>

            {isStudent && (
                <p className="bg-amber-50 px-4 py-1.5 text-center text-[11px] text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                    Messages disappear from your chat after 24 hours.
                </p>
            )}

            {/* Messages */}
            <div ref={listRef} onScroll={onScroll} className="flex-1 space-y-2 overflow-y-auto bg-[#F8F8F8] px-3 py-3 dark:bg-[#0A1430]">
                {hasMore && (
                    <div className="text-center">
                        <button type="button" onClick={onLoadOlder} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm dark:bg-[#122048] dark:text-gray-300">Load older messages</button>
                    </div>
                )}
                {loadingMessages && <p className="py-6 text-center text-sm text-gray-500">Loading…</p>}
                {!loadingMessages && messages.length === 0 && (
                    <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        {thread.conversationId ? 'No recent messages.' : `Say hello to ${thread.other.name}.`}
                    </p>
                )}
                {messages.map((m) => {
                    if (m.system) {
                        return (
                            <div key={m.id} className="flex justify-center">
                                <p className="max-w-[85%] rounded-full bg-white/80 px-3 py-1 text-center text-[11px] text-gray-600 shadow-sm dark:bg-white/10 dark:text-gray-300">{m.text}</p>
                            </div>
                        );
                    }
                    const mine = m.sender === me.id;
                    // Groups: ✓✓ once everyone else has read it
                    const seen = mine && (isGroup && otherIds.length
                        ? otherIds.every((id) => m.readBy?.includes(id))
                        : m.readBy?.some((id) => id !== me.id));
                    const age = Date.now() - new Date(m.createdAt).getTime();
                    const canEdit = mine && canWrite && !m.deleted && !m.pending && !m.failed && age < EDIT_WINDOW_MS;
                    const canUnsend = mine && canWrite && !m.deleted && !m.pending && !m.failed && age < UNSEND_WINDOW_MS;
                    const hasActions = (canEdit || canUnsend) && onEdit && onUnsend;
                    return (
                        <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                            <div className={`group relative max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${mine ? 'rounded-br-sm bg-[#0E1A3D] text-white' : 'rounded-bl-sm bg-white text-gray-900 dark:bg-[#122048] dark:text-gray-100'} ${m.failed ? 'opacity-60 ring-1 ring-red-500' : ''} ${editing?.id === m.id ? 'ring-2 ring-amber-400' : ''} ${hasActions ? 'pr-7' : ''}`}>
                                {hasActions && (
                                    <button type="button" onClick={() => setMenuFor(menuFor === m.id ? null : m.id)} className="absolute right-1 top-1 rounded-full p-0.5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Message options" aria-expanded={menuFor === m.id}>
                                        <ChevronDownIcon className="h-4 w-4" />
                                    </button>
                                )}
                                {(thread.readOnly || (isGroup && !mine)) && <p className="mb-0.5 text-[11px] font-semibold opacity-70">{m.senderName}</p>}
                                {m.deleted && (
                                    <p className="flex items-center gap-1.5 italic opacity-70"><NoSymbolIcon className="h-4 w-4" />{mine ? 'You deleted this message' : 'This message was deleted'}</p>
                                )}
                                {m.mediaType === 'image' && m.mediaUrl && (
                                    <button type="button" onClick={() => setLightbox(m.mediaUrl)} className="mb-1 block overflow-hidden rounded-lg">
                                        <img src={m.mediaUrl} alt={m.fileName || 'Photo'} loading="lazy" className="max-h-60 w-auto object-cover" />
                                    </button>
                                )}
                                {m.mediaType === 'file' && m.mediaUrl && (
                                    <a href={m.mediaUrl} target="_blank" rel="noopener noreferrer" className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-2 underline-offset-2 hover:underline ${mine ? 'bg-white/10' : 'bg-gray-100 dark:bg-white/10'}`}>
                                        <DocumentIcon className="h-5 w-5 shrink-0" />
                                        <span className="truncate">{m.fileName || 'File'}</span>
                                    </a>
                                )}
                                {m.text && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                                <p className={`mt-0.5 text-right text-[10px] ${mine ? 'text-white/60' : 'text-gray-400'}`}>
                                    {m.editedAt && !m.deleted && <span className="mr-1 italic">Edited</span>}
                                    {m.failed ? 'Not sent' : m.pending ? 'Sending…' : formatTime(m.createdAt)}
                                    {mine && !m.pending && !m.failed && !m.deleted && <span className="ml-1">{seen ? '✓✓' : '✓'}</span>}
                                </p>
                            </div>
                            {menuFor === m.id && hasActions && (
                                <div className="mt-1 flex gap-1 rounded-full bg-white p-1 text-xs font-semibold shadow dark:bg-[#122048]">
                                    {canEdit && (
                                        <button type="button" onClick={() => startEdit(m)} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10">
                                            <PencilIcon className="h-3.5 w-3.5" /> Edit
                                        </button>
                                    )}
                                    {canUnsend && (
                                        <button type="button" onClick={() => { setMenuFor(null); if (editing?.id === m.id) cancelEdit(); onUnsend(m.id); }} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                                            <NoSymbolIcon className="h-3.5 w-3.5" /> Unsend
                                        </button>
                                    )}
                                    <button type="button" onClick={() => setMenuFor(null)} className="rounded-full px-2 py-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10" aria-label="Close options">
                                        <XMarkIcon className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Composer */}
            {canWrite ? (
                <form onSubmit={send} className="border-t border-gray-200 p-2 dark:border-gray-700">
                    {editing && (
                        <div className="mb-2 flex items-center gap-2 rounded-lg border-l-4 border-amber-400 bg-amber-50 px-3 py-1.5 text-xs dark:bg-amber-900/20">
                            <PencilIcon className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" />
                            <p className="min-w-0 flex-1 truncate text-amber-900 dark:text-amber-100">Editing: {editing.text || (editing.mediaType === 'image' ? 'Photo' : 'File')}</p>
                            <button type="button" onClick={cancelEdit} className="rounded-full p-1 text-amber-800 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-white/10" aria-label="Cancel editing">
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                    {attachment && (
                        <div className="mb-2 flex items-center gap-2 rounded-lg bg-gray-50 p-2 text-xs dark:bg-white/5">
                            {attachment.previewUrl ? <img src={attachment.previewUrl} alt="" className="h-10 w-10 rounded object-cover" /> : <DocumentIcon className="h-8 w-8 text-gray-400" />}
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-gray-800 dark:text-gray-100">{attachment.name}</p>
                                {attachment.error ? <p className="text-red-600">{attachment.error}</p> : (
                                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                        <div className="h-full bg-[#0E1A3D] transition-all dark:bg-[#60A5FA]" style={{ width: `${attachment.progress || 0}%` }} />
                                    </div>
                                )}
                            </div>
                            <button type="button" onClick={() => setAttachment(null)} className="rounded-full p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10" aria-label="Remove attachment">
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                    <div className="flex items-end gap-2">
                        {!editing && (
                            <button type="button" onClick={() => fileRef.current?.click()} className="rounded-full p-2.5 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10" aria-label="Attach a photo or file">
                                <PaperClipIcon className="h-5 w-5" />
                            </button>
                        )}
                        <input ref={fileRef} type="file" accept={ACCEPT} onChange={pickFile} className="hidden" />
                        <textarea
                            ref={textRef}
                            value={text}
                            onChange={(e) => { setText(e.target.value); onTyping(); }}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape' && editing) { e.preventDefault(); cancelEdit(); return; }
                                if (e.key === 'Enter' && !e.shiftKey && window.matchMedia('(min-width: 768px)').matches) send(e);
                            }}
                            rows={1}
                            maxLength={4000}
                            placeholder="Type a message"
                            aria-label="Message"
                            className="max-h-32 min-h-[42px] flex-1 resize-none rounded-2xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#0E1A3D] focus:outline-none focus:ring-1 focus:ring-[#0E1A3D] dark:border-gray-600 dark:bg-[#0A1430] dark:text-white"
                        />
                        <button type="submit" className="rounded-full bg-[#0E1A3D] p-2.5 text-white hover:bg-[#0A1430] disabled:opacity-50" disabled={editing ? !text.trim() && editing.mediaType === 'none' : !text.trim() && !attachment?.media} aria-label={editing ? 'Save edit' : 'Send'}>
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </div>
                </form>
            ) : (
                <p className="border-t border-gray-200 px-4 py-3 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    {thread.readOnly ? (isGroup ? 'You are viewing this group. Only its members can reply.' : 'You are viewing this conversation. Only the two people in it can reply.')
                        : suspended ? 'Your chat access has been suspended by the admin.' : isGroup ? "You can't message this group." : "You can't message this person."}
                </p>
            )}

            {lightbox && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4" onClick={() => setLightbox(null)} role="dialog" aria-label="Photo">
                    <button type="button" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white" aria-label="Close photo"><XMarkIcon className="h-6 w-6" /></button>
                    <img src={lightbox} alt="" className="max-h-full max-w-full object-contain" />
                </div>
            )}
        </div>
    );
};

export default ChatThread;
