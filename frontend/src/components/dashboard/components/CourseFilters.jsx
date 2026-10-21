import { useEffect, useState } from 'react';
import { useSession } from '../../../contexts/SessionContext';
import api from '../../../utils/api';

const selectClass = 'form-select block py-1.5 pl-3 pr-8 text-sm border-gray-300 dark:border-gray-600 dark:bg-[#231A2E] dark:text-white focus:outline-none focus:ring-[#4A1D7A] focus:border-[#4A1D7A] rounded-md';

// Category / Session (BOARD) / Semester (UNIVERSITY) filters shown next to the year Session filter.
// Session and semester options come from the courses set up under Website Management.
const CourseFilters = () => {
    const { courseFilters, setCourseFilters, clearCourseFilters, courseFilterKey } = useSession();
    const [boardSessions, setBoardSessions] = useState([]);
    const [maxSemesters, setMaxSemesters] = useState(0);

    useEffect(() => {
        api.get('/api/colleges/public').then(res => {
            const courses = (res.data?.data || []).flatMap(c => c.courses || []);
            setBoardSessions([...new Set(courses.filter(c => c.category === 'BOARD').flatMap(c => c.sessions || []))]);
            setMaxSemesters(Math.max(0, ...courses.filter(c => c.category === 'UNIVERSITY').map(c => c.semesters || 0)));
        }).catch(() => {});
    }, []);

    return (
        <div className="flex items-center space-x-2">
            <select
                value={courseFilters.courseCategory}
                onChange={(e) => setCourseFilters({ courseCategory: e.target.value })}
                className={selectClass}
                aria-label="Category"
            >
                <option value="ALL">ALL CATEGORIES</option>
                <option value="BOARD">BOARD</option>
                <option value="UNIVERSITY">UNIVERSITY</option>
            </select>
            {courseFilters.courseCategory === 'BOARD' && (
                <select
                    value={courseFilters.courseSession}
                    onChange={(e) => setCourseFilters({ courseSession: e.target.value })}
                    className={selectClass}
                    aria-label="Board session"
                >
                    <option value="">ALL SESSIONS</option>
                    {boardSessions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            )}
            {courseFilters.courseCategory === 'UNIVERSITY' && (
                <select
                    value={courseFilters.semester}
                    onChange={(e) => setCourseFilters({ semester: e.target.value })}
                    className={selectClass}
                    aria-label="Semesters"
                >
                    <option value="">ALL SEMESTERS</option>
                    {Array.from({ length: maxSemesters }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'SEMESTER' : 'SEMESTERS'}</option>
                    ))}
                </select>
            )}
            {courseFilterKey && (
                <button
                    type="button"
                    onClick={clearCourseFilters}
                    className="text-sm font-medium text-[#4A1D7A] dark:text-[#C084FC] hover:underline whitespace-nowrap"
                >
                    CLEAR FILTERS
                </button>
            )}
        </div>
    );
};

export default CourseFilters;
