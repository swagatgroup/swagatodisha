import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';
import { ArrowLeftIcon, EyeIcon, PhotoIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { Avatar, formatTime } from './ChatThread';

const STORY_MS = 6000;
const MAX_BYTES = 5 * 1024 * 1024;
const DEFAULT_COLOURS = ['#0E1A3D', '#1D4ED8', '#047857', '#B45309', '#9D174D', '#6D28D9'];

const errorText = (e, fallback) => e.response?.data?.message || fallback;

// Avatar with a ring: green = something new to see, grey = all seen
const StoryRing = ({ name, unseen }) => (
    <span className={`inline-flex rounded-full p-[2px] ${unseen ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <span className="inline-flex rounded-full bg-white p-[2px] dark:bg-[#122048]">
            <Avatar name={name} size="h-10 w-10" />
        </span>
    </span>
);

// ─── Updates tab ───────────────────────────────────────────────────────────
const StoriesView = ({ me }) => {
    const [state, setState] = useState(null); // { mine, data, colours }
    const [composer, setComposer] = useState(null); // 'text' | 'photo'
    const [viewing, setViewing] = useState(null); // { groups, index }

    const load = useCallback(() => api.get('/api/chat/stories', { silent: true })
        .then((res) => setState({ mine: res.data.mine, data: res.data.data || [], colours: res.data.colours || DEFAULT_COLOURS }))
        .catch(() => setState((s) => s || { mine: null, data: [], colours: DEFAULT_COLOURS })), []);
    useEffect(() => { load(); }, [load]);

    const markSeen = useCallback((storyId) => setState((s) => s && {
        ...s,
        data: s.data.map((g) => {
            const stories = g.stories.map((x) => (x.id === storyId ? { ...x, seen: true } : x));
            return { ...g, stories, allSeen: stories.every((x) => x.seen) };
        }),
    }), []);
    const closeViewer = useCallback(() => { setViewing(null); load(); }, [load]);

    if (composer) {
        return <StoryComposer type={composer} colours={state?.colours || DEFAULT_COLOURS} onClose={() => setComposer(null)} onPosted={() => { setComposer(null); load(); }} />;
    }
    if (state === null) return <p className="px-6 py-8 text-center text-sm text-gray-500">Loading…</p>;

    const recent = state.data.filter((g) => !g.allSeen);
    const viewed = state.data.filter((g) => g.allSeen);
    const myCount = state.mine?.stories.length || 0;

    const row = (g, list) => (
        <li key={g.author.id}>
            <button type="button" onClick={() => setViewing({ groups: list, index: list.indexOf(g) })} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-white/5">
                <StoryRing name={g.author.name} unseen={!g.allSeen} />
                <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">{g.author.name}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">{formatTime(g.latestAt)}</span>
                </span>
            </button>
        </li>
    );

    return (
        <div>
            <div className="flex items-center gap-3 px-4 py-3">
                <button type="button" disabled={!myCount} onClick={() => setViewing({ groups: [state.mine], index: 0 })} className="shrink-0 disabled:cursor-default" aria-label="View my story">
                    {myCount ? <StoryRing name={me.name || 'Me'} unseen={false} /> : <Avatar name={me.name || 'Me'} size="h-11 w-11" />}
                </button>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">My story</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{myCount ? `${myCount} update${myCount > 1 ? 's' : ''} · tap your photo to see who viewed` : 'Share an update. It disappears after 24 hours.'}</p>
                </div>
                <button type="button" onClick={() => setComposer('text')} className="rounded-full bg-gray-100 p-2.5 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-200" aria-label="Write a text story"><PencilIcon className="h-4 w-4" /></button>
                <button type="button" onClick={() => setComposer('photo')} className="rounded-full bg-[#0E1A3D] p-2.5 text-white hover:bg-[#0A1430]" aria-label="Share a photo story"><PhotoIcon className="h-4 w-4" /></button>
            </div>

            {recent.length > 0 && (
                <>
                    <p className="bg-gray-50 px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-white/5 dark:text-gray-400">Recent updates</p>
                    <ul>{recent.map((g) => row(g, recent))}</ul>
                </>
            )}
            {viewed.length > 0 && (
                <>
                    <p className="bg-gray-50 px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-white/5 dark:text-gray-400">Viewed updates</p>
                    <ul>{viewed.map((g) => row(g, viewed))}</ul>
                </>
            )}
            {!state.data.length && (
                <p className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No updates from your contacts right now.</p>
            )}

            {viewing && (
                <StoryViewer
                    me={me}
                    groups={viewing.groups}
                    startIndex={viewing.index}
                    onSeen={markSeen}
                    onClose={closeViewer}
                />
            )}
        </div>
    );
};

// ─── New story ─────────────────────────────────────────────────────────────
const StoryComposer = ({ type, colours, onClose, onPosted }) => {
    const [text, setText] = useState('');
    const [bg, setBg] = useState(colours[0]);
    const [photo, setPhoto] = useState(null); // { previewUrl, progress, mediaUrl?, error? }
    const [posting, setPosting] = useState(false);
    const fileRef = useRef(null);

    useEffect(() => { if (type === 'photo') fileRef.current?.click(); }, [type]);
    useEffect(() => () => { if (photo?.previewUrl) URL.revokeObjectURL(photo.previewUrl); }, [photo?.previewUrl]);

    const pick = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) { setPhoto({ error: 'Please choose a photo' }); return; }
        if (file.size > MAX_BYTES) { setPhoto({ error: 'Photo is larger than 5MB' }); return; }
        setPhoto({ previewUrl: URL.createObjectURL(file), progress: 0 });
        try {
            const form = new FormData();
            form.append('file', file);
            const res = await api.post('/api/chat/upload', form, {
                silent: true,
                timeout: 120000,
                onUploadProgress: (p) => setPhoto((x) => x && { ...x, progress: p.total ? Math.round((p.loaded / p.total) * 100) : 0 }),
            });
            setPhoto((x) => x && { ...x, progress: 100, mediaUrl: res.data.data.mediaUrl });
        } catch (err) {
            setPhoto((x) => x && { ...x, error: errorText(err, 'Upload failed') });
        }
    };

    const isPhoto = type === 'photo';
    const ready = isPhoto ? !!photo?.mediaUrl : !!text.trim();

    const post = async () => {
        if (!ready || posting) return;
        setPosting(true);
        try {
            await api.post('/api/chat/stories', isPhoto
                ? { text: text.trim(), mediaType: 'image', mediaUrl: photo.mediaUrl }
                : { text: text.trim(), bg }, { silent: true });
            onPosted();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Could not post', text: errorText(err, 'Please try again.') });
            setPosting(false);
        }
    };

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 border-b border-gray-200 px-3 py-2 dark:border-gray-700">
                <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10" aria-label="Back to updates">
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <p className="flex-1 text-sm font-semibold text-gray-900 dark:text-white">{isPhoto ? 'Photo story' : 'Text story'}</p>
                <button type="button" onClick={post} disabled={!ready || posting} className="rounded-full bg-[#0E1A3D] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
                    {posting ? 'Posting…' : 'Post'}
                </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-3">
                {isPhoto ? (
                    <>
                        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className="hidden" />
                        {photo?.previewUrl ? (
                            <div className="overflow-hidden rounded-xl bg-black">
                                <img src={photo.previewUrl} alt="Story preview" className="mx-auto max-h-80 object-contain" />
                                {!photo.mediaUrl && !photo.error && (
                                    <div className="h-1.5 w-full bg-gray-700"><div className="h-full bg-green-500 transition-all" style={{ width: `${photo.progress || 0}%` }} /></div>
                                )}
                            </div>
                        ) : (
                            <button type="button" onClick={() => fileRef.current?.click()} className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
                                <PhotoIcon className="h-8 w-8" /> Choose a photo
                            </button>
                        )}
                        {photo?.error && <p className="text-sm text-red-600">{photo.error}</p>}
                        {photo?.previewUrl && <button type="button" onClick={() => fileRef.current?.click()} className="text-xs font-semibold text-[#0E1A3D] dark:text-[#60A5FA]">Choose a different photo</button>}
                        <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={700} rows={2} placeholder="Add a caption (optional)" aria-label="Caption"
                            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0E1A3D] focus:outline-none dark:border-gray-600 dark:bg-[#0A1430] dark:text-white" />
                    </>
                ) : (
                    <>
                        <div className="flex min-h-[16rem] items-center justify-center rounded-xl p-4" style={{ backgroundColor: bg }}>
                            <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={700} rows={5} autoFocus placeholder="Type a status" aria-label="Story text"
                                className="w-full resize-none border-0 bg-transparent text-center text-xl font-semibold text-white placeholder-white/60 focus:outline-none focus:ring-0" />
                        </div>
                        <div className="flex justify-center gap-2">
                            {colours.map((c) => (
                                <button key={c} type="button" onClick={() => setBg(c)} className={`h-8 w-8 rounded-full ${bg === c ? 'ring-2 ring-offset-2 ring-gray-500 dark:ring-offset-[#122048]' : ''}`} style={{ backgroundColor: c }} aria-label="Background colour" aria-pressed={bg === c} />
                            ))}
                        </div>
                    </>
                )}
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">Your contacts on Swagat chat can see this for 24 hours.</p>
            </div>
        </div>
    );
};

// ─── Full-screen viewer ────────────────────────────────────────────────────
const StoryViewer = ({ me, groups, startIndex = 0, onSeen, onClose }) => {
    const [gi, setGi] = useState(startIndex);
    const [si, setSi] = useState(() => {
        // Start at the first story not seen yet
        const first = (groups[startIndex]?.stories || []).findIndex((s) => !s.seen);
        return first === -1 ? 0 : first;
    });
    const [elapsed, setElapsed] = useState(0);
    const [viewers, setViewers] = useState(null); // list when the viewers panel is open
    const [deleted, setDeleted] = useState(() => new Set());

    const group = groups[gi];
    const stories = (group?.stories || []).filter((s) => !deleted.has(s.id));
    const story = stories[si];
    const mine = group?.author.id === me.id;
    const paused = viewers !== null;

    const next = useCallback(() => {
        setElapsed(0);
        if (si < stories.length - 1) { setSi(si + 1); return; }
        if (gi < groups.length - 1) { setGi(gi + 1); setSi(0); return; }
        onClose();
    }, [si, stories.length, gi, groups.length, onClose]);

    const prev = () => {
        setElapsed(0);
        if (si > 0) { setSi(si - 1); return; }
        if (gi > 0) { setGi(gi - 1); setSi(0); }
    };

    // Nothing left to show (e.g. the last one was deleted)
    useEffect(() => { if (!story) onClose(); }, [story, onClose]);

    // Record a view once per story
    const recorded = useRef(new Set());
    const storyId = story?.id;
    const storySeen = story?.seen;
    useEffect(() => {
        if (!storyId || mine || storySeen || recorded.current.has(storyId)) return;
        recorded.current.add(storyId);
        api.post(`/api/chat/stories/${storyId}/view`, {}, { silent: true }).catch(() => {});
        onSeen(storyId);
    }, [storyId, storySeen, mine, onSeen]);

    useEffect(() => {
        if (paused || !story) return undefined;
        const t = setInterval(() => setElapsed((e) => e + 100), 100);
        return () => clearInterval(t);
    }, [paused, story]);
    useEffect(() => { if (elapsed >= STORY_MS) next(); }, [elapsed, next]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowRight') next();
            else if (e.key === 'ArrowLeft') prev();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    if (!story) return null;

    const showViewers = async () => {
        setViewers([]);
        try {
            const res = await api.get(`/api/chat/stories/${story.id}/viewers`, { silent: true });
            setViewers(res.data.data || []);
        } catch { setViewers([]); }
    };

    const remove = async () => {
        setViewers([]); // pause while asking
        const ok = await Swal.fire({ titleText: 'Delete this story?', showCancelButton: true, confirmButtonText: 'Delete', confirmButtonColor: '#dc2626' });
        setViewers(null);
        if (!ok.isConfirmed) return;
        try {
            await api.delete(`/api/chat/stories/${story.id}`, { silent: true });
            setDeleted((d) => new Set(d).add(story.id));
            setElapsed(0);
            if (si >= stories.length - 1) setSi(Math.max(0, si - 1));
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Could not delete', text: errorText(err, 'Please try again.') });
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[10095] flex items-center justify-center bg-black" role="dialog" aria-label={`${group.author.name}'s story`}>
            <div className="relative flex h-full w-full max-w-md flex-col">
                {/* Progress */}
                <div className="absolute inset-x-0 top-0 z-20 flex gap-1 px-2 pt-2">
                    {stories.map((s, i) => (
                        <span key={s.id} className="h-0.5 flex-1 overflow-hidden rounded bg-white/30">
                            <span className="block h-full bg-white" style={{ width: i < si ? '100%' : i === si ? `${Math.min(100, (elapsed / STORY_MS) * 100)}%` : '0%' }} />
                        </span>
                    ))}
                </div>
                {/* Header */}
                <div className="absolute inset-x-0 top-3 z-20 flex items-center gap-3 px-3 pt-2">
                    <Avatar name={group.author.name} size="h-9 w-9" />
                    <div className="min-w-0 flex-1 text-white">
                        <p className="truncate text-sm font-semibold">{mine ? 'My story' : group.author.name}</p>
                        <p className="text-xs text-white/70">{formatTime(story.createdAt)}</p>
                    </div>
                    {(mine || me.role === 'super_admin') && (
                        <button type="button" onClick={remove} className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Delete story"><TrashIcon className="h-5 w-5" /></button>
                    )}
                    <button type="button" onClick={onClose} className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Close story"><XMarkIcon className="h-6 w-6" /></button>
                </div>

                {/* Content */}
                {story.mediaType === 'image' ? (
                    <div className="flex flex-1 items-center justify-center bg-black">
                        <img src={story.mediaUrl} alt={story.text || `Story from ${group.author.name}`} className="max-h-full max-w-full object-contain" />
                    </div>
                ) : (
                    <div className="flex flex-1 items-center justify-center p-8" style={{ backgroundColor: story.bg }}>
                        <p className="whitespace-pre-wrap break-words text-center text-2xl font-semibold text-white">{story.text}</p>
                    </div>
                )}
                {story.mediaType === 'image' && story.text && (
                    <p className="absolute inset-x-0 bottom-16 z-10 whitespace-pre-wrap break-words bg-black/50 px-4 py-2 text-center text-sm text-white">{story.text}</p>
                )}

                {/* Tap zones: left third goes back, the rest goes forward */}
                <button type="button" onClick={prev} className="absolute bottom-16 left-0 top-16 z-10 w-1/3" aria-label="Previous story" />
                <button type="button" onClick={next} className="absolute bottom-16 right-0 top-16 z-10 w-2/3" aria-label="Next story" />

                {mine && (
                    <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center p-4">
                        <button type="button" onClick={showViewers} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
                            <EyeIcon className="h-4 w-4" /> {story.viewCount || 0} view{story.viewCount === 1 ? '' : 's'}
                        </button>
                    </div>
                )}

                {viewers !== null && mine && (
                    <div className="absolute inset-x-0 bottom-0 z-30 max-h-[60%] overflow-y-auto rounded-t-2xl bg-white p-4 dark:bg-[#122048]">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Viewed by {viewers.length}</p>
                            <button type="button" onClick={() => setViewers(null)} className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10" aria-label="Close viewers"><XMarkIcon className="h-5 w-5" /></button>
                        </div>
                        {!viewers.length && <p className="py-4 text-center text-sm text-gray-500">No views yet.</p>}
                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                            {viewers.map((v) => (
                                <li key={v.id} className="flex items-center gap-3 py-2">
                                    <Avatar name={v.name} size="h-8 w-8" />
                                    <p className="flex-1 truncate text-sm text-gray-900 dark:text-white">{v.name}</p>
                                    <span className="text-xs text-gray-500">{formatTime(v.at)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default StoriesView;
