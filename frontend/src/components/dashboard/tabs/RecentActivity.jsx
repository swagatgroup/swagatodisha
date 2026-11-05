import { useCallback, useEffect, useState } from 'react';
import { ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';
import api from '../../../utils/api';

const ROLE_OPTIONS = [
    { value: 'all', label: 'Everyone' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'staff', label: 'Staff' },
    { value: 'agent', label: 'Agents' },
    { value: 'student', label: 'Students' },
];
const ROLE_LABELS = { super_admin: 'Super Admin', staff: 'Staff', agent: 'Agent', student: 'Student', user: 'Student' };
const PAGE_SIZE = 30;
const COMPACT_SIZE = 5;

const formatTime = (value) => new Date(value).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
});

const selectClass = 'px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4A1D7A]';
const pagerClass = 'px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700';

// The owner's record of changes made across the website: the full page, or (compact) the latest few on the dashboard
const RecentActivity = ({ compact = false, onViewAll }) => {
    const [rows, setRows] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [role, setRole] = useState('all');
    const [section, setSection] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const load = useCallback(async () => {
        setLoading(true);
        setFailed(false);
        try {
            const params = { page, limit: compact ? COMPACT_SIZE : PAGE_SIZE };
            if (role !== 'all') params.role = role;
            if (section !== 'all') params.section = section;
            if (search) params.search = search;
            const res = await api.get('/api/audit-logs/activity', { params });
            setRows(res.data.data || []);
            setSections(res.data.sections || []);
            setPages(res.data.pagination?.pages || 1);
            setTotal(res.data.pagination?.total || 0);
        } catch (error) {
            console.error('Error loading activity:', error);
            setFailed(true);
        } finally {
            setLoading(false);
        }
    }, [page, role, section, search, compact]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="bg-white dark:bg-[#231A2E] rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        <ClockIcon className="h-5 w-5 shrink-0 text-[#4A1D7A] dark:text-[#9B6FCC]" aria-hidden="true" />
                        Recent Activity
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {compact ? 'The latest changes made across the website.' : `Every change made across the website${total ? ` (${total.toLocaleString('en-IN')})` : ''}.`}
                    </p>
                </div>
                {compact ? (
                    <button type="button" onClick={onViewAll} className="shrink-0 px-3 py-2 bg-[#4A1D7A] text-white text-sm rounded-md hover:bg-[#351458] transition-colors">
                        View all
                    </button>
                ) : (
                    <button type="button" onClick={load} aria-label="Refresh activity" className="shrink-0 p-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <ArrowPathIcon className={`h-5 w-5 ${loading ? 'motion-safe:animate-spin' : ''}`} aria-hidden="true" />
                    </button>
                )}
            </div>

            {!compact && (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <input
                        type="search"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Search by person, student or change..."
                        aria-label="Search activity"
                        className={`${selectClass} flex-1 min-w-0`}
                    />
                    <select value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }} aria-label="Filter by who made the change" className={selectClass}>
                        {ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    <select value={section} onChange={(event) => { setSection(event.target.value); setPage(1); }} aria-label="Filter by section" className={selectClass}>
                        <option value="all">All sections</option>
                        {sections.map((name) => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
            )}

            <div className="mt-4" aria-live="polite">
                {failed ? (
                    <p className="py-8 text-center text-sm text-red-600 dark:text-red-400">Could not load the activity. Please refresh and try again.</p>
                ) : loading && rows.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-300">Loading activity...</p>
                ) : rows.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-300">
                        {search || role !== 'all' || section !== 'all' ? 'No activity matches these filters.' : 'No activity yet. New changes will appear here as they happen.'}
                    </p>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                        {rows.map((row) => (
                            <li key={row.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {row.summary}
                                        {row.target && <span className="font-normal text-gray-600 dark:text-gray-300"> · {row.target}</span>}
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-300">
                                        {row.who}{ROLE_LABELS[row.role] ? ` (${ROLE_LABELS[row.role]})` : ''} · {row.section}
                                    </p>
                                </div>
                                <time dateTime={row.at} className="shrink-0 text-xs text-gray-500 dark:text-gray-300">{formatTime(row.at)}</time>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {!compact && pages > 1 && (
                <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-500 dark:text-gray-300">Page {page} of {pages}</p>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setPage((value) => value - 1)} disabled={page <= 1 || loading} className={pagerClass}>Previous</button>
                        <button type="button" onClick={() => setPage((value) => value + 1)} disabled={page >= pages || loading} className={pagerClass}>Next</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecentActivity;
