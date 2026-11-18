import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../utils/api';
import { showError, showDeleteConfirm, showSuccessToast, showErrorToast } from '../../utils/sweetAlert';
import { GALLERY_CATEGORIES, GALLERY_CAMPUSES } from '../../data/gallery';

const MAX_FILES = 20;
const MAX_SIZE = 10 * 1024 * 1024;
const BATCH_SIZE = 4; // photos per request, so a slow connection never hits the request timeout

const inputClass = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0E1A3D] focus:border-transparent dark:bg-gray-700 dark:text-white text-sm';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';
const cardClass = 'bg-white dark:bg-[#122048] rounded-lg shadow border border-gray-200 dark:border-gray-700';

const emptyForm = { category: 'Campus', campus: '', title: '', description: '', isFeatured: false };

const campusLabel = (value) => GALLERY_CAMPUSES.find((c) => c.value === value)?.label || value || 'Swagat Group';

const GalleryManagement = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Upload panel
    const [files, setFiles] = useState([]); // { file, preview }
    const [form, setForm] = useState(emptyForm);
    const [dragging, setDragging] = useState(false);
    const [progress, setProgress] = useState(null); // { done, total, percent }
    const fileInput = useRef(null);

    // Library
    const [filterCategory, setFilterCategory] = useState('');
    const [filterCampus, setFilterCampus] = useState('all');
    const [search, setSearch] = useState('');

    // Edit dialog
    const [editing, setEditing] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [editFile, setEditFile] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchItems = async () => {
        try {
            const res = await api.get('/api/gallery', { params: { limit: 500 } });
            if (res.data.success) setItems(res.data.data.galleryItems || []);
        } catch (error) {
            console.error('Error fetching gallery:', error);
            showError('Error', error.response?.data?.message || 'Could not load the gallery');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, []);

    // Free any queued preview URLs when the tab closes
    const filesRef = useRef(files);
    filesRef.current = files;
    useEffect(() => () => filesRef.current.forEach((f) => URL.revokeObjectURL(f.preview)), []);

    const editPreview = useMemo(() => (editFile ? URL.createObjectURL(editFile) : null), [editFile]);
    useEffect(() => () => { if (editPreview) URL.revokeObjectURL(editPreview); }, [editPreview]);

    const addFiles = (list) => {
        const incoming = Array.from(list || []);
        const rejected = [];
        const accepted = [];
        incoming.forEach((file) => {
            if (!file.type.startsWith('image/')) rejected.push(`${file.name}: not an image`);
            else if (file.size > MAX_SIZE) rejected.push(`${file.name}: larger than 10MB`);
            else accepted.push({ file, preview: URL.createObjectURL(file) });
        });
        setFiles((current) => {
            const room = MAX_FILES - current.length;
            if (accepted.length > room) rejected.push(`Only ${MAX_FILES} photos can be queued at once`);
            accepted.slice(room).forEach((f) => URL.revokeObjectURL(f.preview));
            return [...current, ...accepted.slice(0, Math.max(room, 0))];
        });
        if (rejected.length) showErrorToast('Some files were skipped', rejected.slice(0, 3).join(' • '), 5000);
    };

    const removeQueued = (index) => {
        setFiles((current) => {
            URL.revokeObjectURL(current[index].preview);
            return current.filter((_, i) => i !== index);
        });
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (files.length === 0) {
            showError('No photos selected', 'Choose or drop at least one photo first.');
            return;
        }

        const batches = [];
        for (let i = 0; i < files.length; i += BATCH_SIZE) batches.push(files.slice(i, i + BATCH_SIZE));

        let done = 0;
        let failed = 0;
        setProgress({ done: 0, total: files.length, percent: 0 });

        for (const batch of batches) {
            const data = new FormData();
            batch.forEach(({ file }) => data.append('images', file));
            data.append('category', form.category);
            data.append('campus', form.campus);
            data.append('title', form.title);
            data.append('description', form.description);
            data.append('isFeatured', form.isFeatured ? 'true' : 'false');
            data.append('isActive', 'true');

            try {
                await api.post('/api/gallery', data, {
                    timeout: 180000,
                    onUploadProgress: (evt) => {
                        const share = evt.total ? evt.loaded / evt.total : 0;
                        setProgress({ done, total: files.length, percent: Math.round(((done + share * batch.length) / files.length) * 100) });
                    },
                });
                done += batch.length;
            } catch (error) {
                failed += batch.length;
                console.error('Gallery upload error:', error);
                showErrorToast('Upload failed', error.response?.data?.message || 'Please check the connection and try again', 5000);
            }
            setProgress({ done, total: files.length, percent: Math.round(((done + failed) / files.length) * 100) });
        }

        setProgress(null);
        if (done > 0) {
            showSuccessToast(done === 1 ? 'Photo added to the gallery' : `${done} photos added to the gallery`);
            files.forEach((f) => URL.revokeObjectURL(f.preview));
            setFiles([]);
            setForm((f) => ({ ...f, title: '', description: '', isFeatured: false }));
            fetchItems();
        }
    };

    const quickUpdate = async (item, changes, message) => {
        try {
            const res = await api.put(`/api/gallery/${item._id}`, changes);
            if (res.data.success) {
                setItems((list) => list.map((i) => (i._id === item._id ? { ...i, ...res.data.data } : i)));
                showSuccessToast(message);
            }
        } catch (error) {
            showError('Error', error.response?.data?.message || 'Could not update the photo');
        }
    };

    const handleDelete = async (item) => {
        const result = await showDeleteConfirm('Delete this photo?', `"${item.title}" will be removed from the website. This cannot be undone.`);
        if (!result.isConfirmed) return;
        try {
            await api.delete(`/api/gallery/${item._id}`);
            setItems((list) => list.filter((i) => i._id !== item._id));
            showSuccessToast('Photo deleted');
        } catch (error) {
            showError('Error', error.response?.data?.message || 'Could not delete the photo');
        }
    };

    const openEdit = (item) => {
        setEditing(item);
        setEditFile(null);
        setEditForm({
            title: item.title || '',
            description: item.description || '',
            alt: item.alt || '',
            category: item.category || 'General',
            campus: item.campus || '',
            displayOrder: item.displayOrder || 0,
            isFeatured: !!item.isFeatured,
            isActive: item.isActive !== false,
        });
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        if (!editForm.title.trim()) {
            showError('Caption needed', 'Please give the photo a caption.');
            return;
        }
        setSaving(true);
        try {
            const data = new FormData();
            Object.entries(editForm).forEach(([key, value]) => data.append(key, typeof value === 'boolean' ? String(value) : value));
            if (editFile) data.append('image', editFile);
            const res = await api.put(`/api/gallery/${editing._id}`, data, { timeout: 120000 });
            if (res.data.success) {
                setItems((list) => list.map((i) => (i._id === editing._id ? { ...i, ...res.data.data } : i)));
                showSuccessToast('Photo updated');
                setEditing(null);
            }
        } catch (error) {
            showError('Error', error.response?.data?.message || 'Could not save the changes');
        } finally {
            setSaving(false);
        }
    };

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        return items.filter((item) =>
            (!filterCategory || item.category === filterCategory) &&
            (filterCampus === 'all' || (item.campus || '') === filterCampus) &&
            (!q || `${item.title} ${item.description || ''}`.toLowerCase().includes(q))
        );
    }, [items, filterCategory, filterCampus, search]);

    const liveCount = items.filter((i) => i.isActive !== false).length;
    const uploading = progress !== null;

    return (
        <div className="space-y-6">
            {/* How it works */}
            <div className="bg-[#D0E9FB] dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-900 dark:text-blue-100">
                <p className="font-semibold mb-1"><i className="fa-solid fa-circle-info mr-2" />How the gallery works</p>
                <ul className="space-y-0.5 text-blue-800 dark:text-blue-200">
                    <li>• Photos appear on the website&apos;s Gallery page straight after upload. Up to {MAX_FILES} at a time, 10MB each (JPG, PNG, WebP).</li>
                    <li>• Pick a school as the campus and the photo also shows on that school&apos;s own page.</li>
                    <li>• Photos keep their shape and are compressed automatically. Starred photos show first and larger.</li>
                    <li>• Leave the caption empty to use each file&apos;s name. A short caption such as &quot;Annual Day 2025&quot; helps Google show the photo.</li>
                </ul>
            </div>

            {/* Upload */}
            <form onSubmit={handleUpload} className={`${cardClass} p-6 space-y-5`}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    <i className="fa-solid fa-cloud-arrow-up mr-2 text-[#004D98]" />Upload photos
                </h2>

                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInput.current?.click()}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.current?.click(); } }}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors ${dragging
                        ? 'border-[#004D98] bg-[#D0E9FB]/60 dark:bg-blue-900/30'
                        : 'border-gray-300 dark:border-gray-600 hover:border-[#004D98] hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                    <i className="fa-solid fa-images text-4xl text-[#004D98] dark:text-[#60A5FA]" />
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Drop photos here, or click to choose</p>
                    <p className="text-xs text-gray-500 dark:text-gray-300">{files.length}/{MAX_FILES} selected · phones can pick several photos at once</p>
                    <input
                        ref={fileInput}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
                    />
                </div>

                {files.length > 0 && (
                    <ul className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3">
                        {files.map((f, index) => (
                            <li key={f.preview} className="relative group">
                                <img src={f.preview} alt={f.file.name} className="h-24 w-full object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
                                <button
                                    type="button"
                                    onClick={() => removeQueued(index)}
                                    disabled={uploading}
                                    aria-label={`Remove ${f.file.name}`}
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-600 text-white text-xs shadow hover:bg-red-700 disabled:opacity-50"
                                >
                                    <i className="fa-solid fa-xmark" />
                                </button>
                                <p className="mt-1 truncate text-[11px] text-gray-500 dark:text-gray-300">{f.file.name}</p>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="g-category" className={labelClass}>Category</label>
                        <select id="g-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                            {GALLERY_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="g-campus" className={labelClass}>Campus / school</label>
                        <select id="g-campus" value={form.campus} onChange={(e) => setForm({ ...form, campus: e.target.value })} className={inputClass}>
                            {GALLERY_CAMPUSES.map((c) => <option key={c.value || 'all'} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="g-title" className={labelClass}>Caption <span className="font-normal text-gray-400">(optional, used for every photo in this upload)</span></label>
                        <input id="g-title" type="text" maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Independence Day 2025" className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="g-desc" className={labelClass}>Short description <span className="font-normal text-gray-400">(optional)</span></label>
                        <input id="g-desc" type="text" maxLength={300} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Flag hoisting and cultural programme" className={inputClass} />
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-[#0E1A3D] focus:ring-[#0E1A3D]" />
                        <i className="fa-solid fa-star text-amber-500" /> Star these photos (show first)
                    </label>
                    <button
                        type="submit"
                        disabled={uploading || files.length === 0}
                        className="px-5 py-2.5 bg-[#0E1A3D] text-white rounded-lg font-semibold hover:bg-[#0A1430] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading
                            ? <><i className="fa-solid fa-spinner fa-spin mr-2" />Uploading {progress.done}/{progress.total}…</>
                            : <><i className="fa-solid fa-upload mr-2" />Upload {files.length || ''} {files.length === 1 ? 'photo' : 'photos'}</>}
                    </button>
                </div>

                {uploading && (
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}>
                        <div className="h-full bg-[#004D98] transition-all" style={{ width: `${progress.percent}%` }} />
                    </div>
                )}
            </form>

            {/* Library */}
            <section className={`${cardClass} p-6`}>
                <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Gallery photos <span className="text-sm font-normal text-gray-500 dark:text-gray-300">({liveCount} live of {items.length})</span>
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search captions" aria-label="Search captions" className={`${inputClass} w-44`} />
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} aria-label="Filter by category" className={`${inputClass} w-40`}>
                            <option value="">All categories</option>
                            {GALLERY_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <select value={filterCampus} onChange={(e) => setFilterCampus(e.target.value)} aria-label="Filter by campus" className={`${inputClass} w-56`}>
                            <option value="all">All campuses</option>
                            {GALLERY_CAMPUSES.map((c) => <option key={c.value || 'group'} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0E1A3D] dark:border-white" />
                    </div>
                ) : visible.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-300 text-center py-10">
                        {items.length === 0 ? 'No photos yet. Upload the first ones above and they will appear on the website.' : 'No photos match these filters.'}
                    </p>
                ) : (
                    <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {visible.map((item) => {
                            const live = item.isActive !== false;
                            return (
                                <li key={item._id} className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col ${live ? '' : 'opacity-60'}`}>
                                    <div className="relative">
                                        <img src={item.thumbnailUrl || item.imageUrl} alt={item.alt || item.title} loading="lazy" className="w-full aspect-[4/3] object-cover bg-gray-100 dark:bg-gray-800" />
                                        {item.isFeatured && (
                                            <span className="absolute top-2 left-2 rounded bg-amber-400 px-2 py-0.5 text-xs font-semibold text-[#0E1A3D]"><i className="fa-solid fa-star mr-1" />Starred</span>
                                        )}
                                        {!live && (
                                            <span className="absolute top-2 right-2 rounded bg-gray-800 px-2 py-0.5 text-xs text-white">Hidden</span>
                                        )}
                                    </div>
                                    <div className="p-3 flex flex-1 flex-col gap-2">
                                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2">{item.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-300">
                                            {item.category} · {campusLabel(item.campus)}
                                        </p>
                                        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                                            <button type="button" onClick={() => quickUpdate(item, { isActive: !live }, live ? 'Photo hidden from the website' : 'Photo is live on the website')}
                                                className={`px-2 py-1 rounded text-xs ${live ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                <i className={`fa-solid ${live ? 'fa-eye' : 'fa-eye-slash'} mr-1`} />{live ? 'Live' : 'Hidden'}
                                            </button>
                                            <button type="button" onClick={() => quickUpdate(item, { isFeatured: !item.isFeatured }, item.isFeatured ? 'Star removed' : 'Photo starred')}
                                                aria-label={item.isFeatured ? 'Remove star' : 'Star photo'}
                                                className="px-2 py-1 rounded text-xs bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                                <i className={`${item.isFeatured ? 'fa-solid' : 'fa-regular'} fa-star`} />
                                            </button>
                                            <button type="button" onClick={() => openEdit(item)} className="px-2 py-1 bg-blue-100 text-[#003B75] dark:bg-blue-900 dark:text-blue-300 rounded text-xs">Edit</button>
                                            <button type="button" onClick={() => handleDelete(item)} className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded text-xs">Delete</button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            {/* Edit dialog */}
            {editing && editForm && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="gallery-edit-title" onClick={() => !saving && setEditing(null)}>
                    <form onSubmit={saveEdit} onClick={(e) => e.stopPropagation()} className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4`}>
                        <div className="flex items-center justify-between">
                            <h3 id="gallery-edit-title" className="text-lg font-bold text-gray-900 dark:text-gray-100">Edit photo</h3>
                            <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="text-gray-500 hover:text-gray-800 dark:text-gray-300"><i className="fa-solid fa-xmark text-lg" /></button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <img src={editPreview || editing.thumbnailUrl || editing.imageUrl} alt="" className="sm:w-48 h-36 object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
                            <div className="flex-1">
                                <label className={labelClass} htmlFor="edit-file">Replace photo <span className="font-normal text-gray-400">(optional)</span></label>
                                <input id="edit-file" type="file" accept="image/*" onChange={(e) => {
                                    const f = e.target.files[0];
                                    if (f && (!f.type.startsWith('image/') || f.size > MAX_SIZE)) { showError('Invalid file', 'Choose an image under 10MB.'); return; }
                                    setEditFile(f || null);
                                }} className="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-[#D0E9FB] file:text-[#0A1430]" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className={labelClass} htmlFor="edit-title">Caption</label>
                                <input id="edit-title" type="text" maxLength={120} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className={inputClass} required />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass} htmlFor="edit-desc">Short description</label>
                                <input id="edit-desc" type="text" maxLength={300} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className={inputClass} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass} htmlFor="edit-alt">What is in the photo? <span className="font-normal text-gray-400">(for blind visitors and Google)</span></label>
                                <input id="edit-alt" type="text" maxLength={200} value={editForm.alt} onChange={(e) => setEditForm({ ...editForm, alt: e.target.value })} placeholder="e.g. Students performing a folk dance on stage" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass} htmlFor="edit-cat">Category</label>
                                <select id="edit-cat" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className={inputClass}>
                                    {GALLERY_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass} htmlFor="edit-campus">Campus / school</label>
                                <select id="edit-campus" value={editForm.campus} onChange={(e) => setEditForm({ ...editForm, campus: e.target.value })} className={inputClass}>
                                    {GALLERY_CAMPUSES.map((c) => <option key={c.value || 'group'} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass} htmlFor="edit-order">Display order <span className="font-normal text-gray-400">(lower shows first)</span></label>
                                <input id="edit-order" type="number" min="0" value={editForm.displayOrder} onChange={(e) => setEditForm({ ...editForm, displayOrder: parseInt(e.target.value, 10) || 0 })} className={inputClass} />
                            </div>
                            <div className="flex flex-col justify-end gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <label className="flex items-center gap-2"><input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} className="h-4 w-4 rounded" /> Live on the website</label>
                                <label className="flex items-center gap-2"><input type="checkbox" checked={editForm.isFeatured} onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })} className="h-4 w-4 rounded" /> Starred</label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setEditing(null)} disabled={saving} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg">Cancel</button>
                            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#0E1A3D] text-white rounded-lg hover:bg-[#0A1430] disabled:opacity-50">
                                {saving ? 'Saving…' : 'Save changes'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default GalleryManagement;
